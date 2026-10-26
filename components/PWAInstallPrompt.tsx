'use client';

import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowInstall(false);
    }

    setDeferredPrompt(null);
  };

  if (!showInstall) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-auto z-50">
      <div className="bg-zinc-800 border border-cyan-500 rounded-lg p-4 shadow-xl max-w-md">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-cyan-400 mb-1">Install WA & SPV</h3>
            <p className="text-sm text-zinc-300">
              Install this app on your device for offline access and a native app experience.
            </p>
          </div>
          <button
            onClick={handleInstall}
            className="bg-cyan-700 hover:bg-cyan-600 px-4 py-2 rounded text-sm flex items-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            Install
          </button>
        </div>
        <button
          onClick={() => setShowInstall(false)}
          className="text-xs text-zinc-500 hover:text-zinc-300 mt-2 cursor-pointer"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
