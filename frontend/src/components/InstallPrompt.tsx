/**
 * InstallPrompt - PWA install prompt component
 */
import { useState } from "react";
import { usePWA } from "../lib/usePWA";

export default function InstallPrompt() {
  const {
    isInstallable,
    isInstalled,
    swUpdateAvailable,
    installApp,
    updateServiceWorker,
  } = usePWA();
  const [isInstalling, setIsInstalling] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (isInstalled || dismissed) {
    return null;
  }

  // Show update notification
  if (swUpdateAvailable) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50">
        <p className="font-medium mb-2">Update Available!</p>
        <p className="text-sm mb-3">
          A new version of NutriShare is available.
        </p>
        <div className="flex gap-2">
          <button
            onClick={updateServiceWorker}
            className="flex-1 bg-white text-blue-600 px-3 py-2 rounded font-medium hover:bg-blue-50"
          >
            Update
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="px-3 py-2 text-blue-100 hover:text-white"
          >
            Later
          </button>
        </div>
      </div>
    );
  }

  // Show install prompt
  if (!isInstallable) {
    return null;
  }

  const handleInstall = async () => {
    setIsInstalling(true);
    await installApp();
    setIsInstalling(false);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-emerald-600 text-white p-4 rounded-lg shadow-lg z-50">
      <p className="font-medium mb-2">Install NutriShare</p>
      <p className="text-sm mb-3">
        Install the app for faster access and donation notifications.
      </p>
      <div className="flex gap-2">
        <button
          onClick={handleInstall}
          disabled={isInstalling}
          className="flex-1 bg-white text-primary-orange px-3 py-2 rounded font-medium hover:bg-primary-orange-bg disabled:opacity-50"
        >
          {isInstalling ? "Installing..." : "Install"}
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="px-3 py-2 text-emerald-100 hover:text-white"
        >
          Later
        </button>
      </div>
    </div>
  );
}
