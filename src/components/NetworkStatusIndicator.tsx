import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function NetworkStatusIndicator() {
  const { addToast } = useToast();
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isWeakConnection, setIsWeakConnection] = useState<boolean>(false);
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setIsWeakConnection(false);
      setShowNotification(true);
      addToast({
        title: 'Connection Restored ⚡',
        description: 'You are back online. Progress auto-synced with CME cloud servers.',
        type: 'success'
      });
      // Auto dismiss banner after 5 seconds if back online
      setTimeout(() => setShowNotification(false), 5000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowNotification(true);
      addToast({
        title: 'You are Offline 📡',
        description: 'Progress is saved locally. Will re-sync once internet connection is restored.',
        type: 'warning'
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic ping latency check to detect weak connection
    const interval = setInterval(async () => {
      if (!navigator.onLine) {
        setIsOnline(false);
        return;
      }

      const startTime = Date.now();
      try {
        // Fetch favicon or light HEAD request
        const res = await fetch('/favicon.ico', { method: 'HEAD', cache: 'no-store' });
        const latency = Date.now() - startTime;
        if (res.ok) {
          setIsOnline(true);
          // If latency > 1200ms, mark as weak connection
          if (latency > 1200) {
            setIsWeakConnection(true);
          } else {
            setIsWeakConnection(false);
          }
        }
      } catch (e) {
        // Fetch error might indicate offline or firewall drop
        setIsWeakConnection(true);
      }
    }, 15000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [addToast]);

  const handleManualRetry = async () => {
    setIsSyncing(true);
    const startTime = Date.now();

    try {
      const res = await fetch('/favicon.ico', { method: 'HEAD', cache: 'no-store' });
      const latency = Date.now() - startTime;

      if (res.ok) {
        setIsOnline(true);
        setIsWeakConnection(latency > 1200);
        setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        
        addToast({
          title: 'Re-sync Successful! 🎉',
          description: `Synced all local test progress, study plans & notes at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
          type: 'success'
        });
        
        // Hide notification banner if connection is healthy now
        if (latency <= 1200) {
          setTimeout(() => setShowNotification(false), 3000);
        }
      } else {
        throw new Error('Sync ping failed');
      }
    } catch (err) {
      setIsOnline(false);
      addToast({
        title: 'Re-sync Failed',
        description: 'Still unable to reach CME server. Local progress remains safe.',
        type: 'error'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // If online & strong connection and user hasn't explicitly triggered notification, show minimal floating pill or hide
  if (isOnline && !isWeakConnection && !showNotification) {
    return (
      <div className="fixed bottom-4 left-4 z-40 hidden md:block">
        <button
          onClick={() => setShowNotification(true)}
          className="bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 backdrop-blur-md text-[#061F48] dark:text-gray-200 text-[10px] font-bold px-2.5 py-1 rounded-full border border-[#061F48]/10 dark:border-gray-700 shadow-sm flex items-center gap-1.5 transition-all opacity-70 hover:opacity-100 cursor-pointer"
          title={`Network Connected • Last synced ${lastSyncedTime}`}
        >
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-extrabold uppercase tracking-wider">Cloud Synced</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:right-auto sm:left-6 z-50 max-w-sm">
      <div className={`p-3.5 rounded-2xl shadow-xl border backdrop-blur-md transition-all duration-300 flex items-center justify-between gap-3 ${
        !isOnline 
          ? 'bg-red-900/90 text-white border-red-700 dark:bg-red-950 dark:border-red-800' 
          : isWeakConnection 
          ? 'bg-amber-900/90 text-white border-amber-700 dark:bg-amber-950 dark:border-amber-800'
          : 'bg-[#061F48]/95 text-white border-[#D09515]/40 dark:bg-gray-900 dark:border-gray-700'
      }`}>
        <div className="flex items-center gap-2.5">
          {!isOnline ? (
            <div className="p-2 rounded-xl bg-red-800 text-red-200 shrink-0">
              <WifiOff className="h-4 w-4 animate-bounce" />
            </div>
          ) : isWeakConnection ? (
            <div className="p-2 rounded-xl bg-amber-800 text-amber-200 shrink-0">
              <AlertTriangle className="h-4 w-4" />
            </div>
          ) : (
            <div className="p-2 rounded-xl bg-emerald-800 text-emerald-200 shrink-0">
              <CheckCircle className="h-4 w-4" />
            </div>
          )}

          <div>
            <p className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <span>
                {!isOnline 
                  ? 'You are Offline' 
                  : isWeakConnection 
                  ? 'Weak Connection Detected' 
                  : 'Cloud Connection Restored'}
              </span>
            </p>
            <p className="text-[10px] text-white/80 font-semibold leading-tight mt-0.5">
              {!isOnline
                ? 'Progress saved locally on device.'
                : isWeakConnection
                ? 'Slower response. Progress cached.'
                : `All data synced • ${lastSyncedTime}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleManualRetry}
            disabled={isSyncing}
            className="bg-white/15 hover:bg-white/25 active:scale-95 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Attempt to re-sync local progress with CME Cloud"
          >
            <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Retry'}</span>
          </button>

          {isOnline && !isWeakConnection && (
            <button
              onClick={() => setShowNotification(false)}
              className="p-1 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
              title="Dismiss"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
