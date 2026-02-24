import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { apiClient } from '../services/api';
import { ReportRequest } from '../types/api';

const OFFLINE_STORAGE_KEY = 'simccs_offline_reports';

export function OfflineSync() {
    const [syncing, setSyncing] = useState(false);
    const [count, setCount] = useState(0);

    // Check for offline items on mount to update the UI count
    useEffect(() => {
        const checkOfflineItems = () => {
            const raw = localStorage.getItem(OFFLINE_STORAGE_KEY);
            if (raw) {
                try {
                    const items = JSON.parse(raw);
                    setCount(Array.isArray(items) ? items.length : 0);
                } catch (e) {
                    setCount(0);
                }
            }
        };
        checkOfflineItems();
        // Optional: Listen for storage events if other tabs might update this
        window.addEventListener('storage', checkOfflineItems);
        return () => window.removeEventListener('storage', checkOfflineItems);
    }, []);

    const handleSync = async () => {
        // 1. Read from Local Storage
        const rawData = localStorage.getItem(OFFLINE_STORAGE_KEY);

        if (!rawData) {
            alert("No offline reports to sync.");
            return;
        }

        let storedReports: ReportRequest[] = [];
        try {
            storedReports = JSON.parse(rawData);
        } catch (e) {
            console.error("Failed to parse offline data", e);
            alert("Corrupted offline data found.");
            return;
        }

        if (storedReports.length === 0) {
            alert("No offline reports to sync.");
            return;
        }

        setSyncing(true);
        try {
            // 2. Send Batch to Backend
            await apiClient.syncBatch(storedReports);

            // 3. Clear Local Storage on Success
            localStorage.removeItem(OFFLINE_STORAGE_KEY);
            setCount(0);
            alert(`Successfully synced ${storedReports.length} reports!`);
        } catch (error) {
            console.error(error);
            alert('Sync failed. Please check your connection and try again.');
        } finally {
            setSyncing(false);
        }
    };

    if (count === 0) return null; // Don't show button if nothing to sync

    return (
        <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center space-x-2 text-sm font-medium text-orange-600 hover:text-orange-800 bg-orange-50 px-3 py-1 rounded-full border border-orange-200"
        >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Syncing...' : `Sync ${count} Offline Reports`}</span>
        </button>
    );
}