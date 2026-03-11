import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '../services/api';
import { JwtResponse, UserRole } from '../types/api';

interface AuthContextType {
  user: JwtResponse | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<JwtResponse>;
  logout: () => void;
  verifyMfaLogin: (code: string) => Promise<JwtResponse>;
  hasRole: (role: UserRole) => boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<JwtResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [mfaPreAuthToken, setMfaPreAuthToken] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
        apiClient.setToken(token);
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<JwtResponse> => {
    try {
      const response = await apiClient.login({ email, password });
      const userData = response.data;

      setUser(userData);
      apiClient.setToken(userData.token);
      localStorage.setItem('user', JSON.stringify(userData));

      return userData;
    } catch (error: any) {
      if (error.message && (error.message.includes('MFA_REQUIRED') || error.message.includes('MFA required'))) {
        // The backend should send the pre-auth token in the data field or a specific property
        // We'll store it so we can use it in verifyMfaLogin
        if (error.data && typeof error.data === 'string') {
          setMfaPreAuthToken(error.data);
        } else if (error.token) {
          setMfaPreAuthToken(error.token);
        }
        throw new Error('MFA_REQUIRED');
      }
      throw new Error(error.message || 'Authentication failed');
    }
  };

  const verifyMfaLogin = async (code: string): Promise<JwtResponse> => {
    try {
      // Temporarily set the pre-auth token to make the API call
      if (mfaPreAuthToken) {
        apiClient.setToken(mfaPreAuthToken);
      }

      const response = await apiClient.verifyMfa({ code });

      // If successful, the backend should return the final JWT response
      const userData = response.data as unknown as JwtResponse;

      setUser(userData);
      apiClient.setToken(userData.token);
      localStorage.setItem('user', JSON.stringify(userData));
      setMfaPreAuthToken(null); // Clear the pre-auth token

      return userData;
    } catch (error: any) {
      // Restore the previous token state if it fails
      setMfaPreAuthToken(null);
      apiClient.setToken(null);
      throw new Error(error.message || 'MFA verification failed');
    }
  };

  const logout = () => {
    setUser(null);
    apiClient.setToken(null);
    setMfaPreAuthToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const hasRole = (role: UserRole): boolean => {
    return user?.roles?.includes(role) || false;
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, verifyMfaLogin, hasRole, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
