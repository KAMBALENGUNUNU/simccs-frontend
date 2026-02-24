import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { UserRole } from './types/api';

import { Welcome } from './pages/Welcome';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { MfaSetup } from './pages/MfaSetup';
import { MfaVerify } from './pages/MfaVerify';
import { Dashboard } from './pages/Dashboard';
import { Reports } from './pages/Reports';
import { ReportForm } from './pages/ReportForm';
import { ReviewQueue } from './pages/ReviewQueue';
import { Analytics } from './pages/Analytics';
import { UserManagement } from './pages/UserManagement';
import { AdminPanel } from './pages/AdminPanel';
import { Unauthorized } from './pages/Unauthorized';
import { ReportDetails } from './pages/ReportDetails';
import { ResetPassword } from './pages/ResetPassword';
import { FlaggedReports } from './pages/FlaggedReports';
import { Chat } from './pages/Chat';
import { Settings } from './pages/Settings';

function App() {
    return (
        <BrowserRouter>
            <SettingsProvider>
                <AuthProvider>
                    <Routes>
                        <Route path="/" element={<Welcome />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/mfa-verify" element={<MfaVerify />} />
                        <Route path="/unauthorized" element={<Unauthorized />} />

                        <Route
                            path="/mfa-setup"
                            element={
                                <ProtectedRoute>
                                    <MfaSetup />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/reports"
                            element={
                                <ProtectedRoute>
                                    <Reports />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/reports/new"
                            element={
                                <ProtectedRoute requiredRoles={[UserRole.JOURNALIST]}>
                                    <ReportForm />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/review-queue"
                            element={
                                <ProtectedRoute requiredRoles={[UserRole.EDITOR, UserRole.ADMIN]}>
                                    <ReviewQueue />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/analytics"
                            element={
                                <ProtectedRoute requiredRoles={[UserRole.EDITOR, UserRole.ADMIN]}>
                                    <Analytics />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/users"
                            element={
                                <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
                                    <UserManagement />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/admin"
                            element={
                                <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
                                    <AdminPanel />
                                </ProtectedRoute>
                            }
                        />

                        {/* New Routes for Chat */}
                        <Route
                            path="/chat"
                            element={
                                <ProtectedRoute>
                                    <Chat />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/chat/:channelId"
                            element={
                                <ProtectedRoute>
                                    <Chat />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/settings"
                            element={
                                <ProtectedRoute>
                                    <Settings />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/reports/:id"
                            element={
                                <ProtectedRoute>
                                    <ReportDetails />
                                </ProtectedRoute>
                            }
                        />

                        <Route path="/reset-password" element={<ResetPassword />} />

                        <Route
                            path="/flagged"
                            element={
                                <ProtectedRoute requiredRoles={[UserRole.EDITOR, UserRole.ADMIN]}>
                                    <FlaggedReports />
                                </ProtectedRoute>
                            }
                        />

                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </AuthProvider>
            </SettingsProvider>
        </BrowserRouter>
    );
}

export default App;