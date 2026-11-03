import React, { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // 1. Check online / offline status
    const updateOnlineStatus = () => setIsOffline(!navigator.onLine);
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);
    setIsOffline(!navigator.onLine);

    // 2. Check if already running in standalone mode (PWA installed)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      return () => {
        window.removeEventListener("online", updateOnlineStatus);
        window.removeEventListener("offline", updateOnlineStatus);
      };
    }

    // 3. Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;
    if (isIosDevice) {
      setIsIOS(true);
      const dismissed = localStorage.getItem("orven_pwa_prompt_dismissed");
      if (!dismissed) {
        setShowPrompt(true);
      }
    }

    // 4. Standard W3C PWA Install Prompt (Android / Chrome / Desktop)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      const dismissed = localStorage.getItem("orven_pwa_prompt_dismissed");
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("orven_pwa_prompt_dismissed", "true");
  };

  return (
    <>
      {/* Offline Alert Badge */}
      {isOffline && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            background: "#B42B14",
            color: "#fff",
            padding: "6px 16px",
            textAlign: "center",
            fontSize: "12px",
            fontFamily: "var(--mono)",
            letterSpacing: "0.06em",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <span style={{ fontSize: "14px" }}>⚡</span>
          <span>OFFLINE MODE · Serving cached state from local post-quantum keystore</span>
        </div>
      )}

      {/* PWA Install Promotion Banner */}
      {showPrompt && !isOffline && (
        <aside
          className="pwa-banner"
          aria-label="Install Orven Application"
          style={{
            position: "fixed",
            bottom: "calc(var(--bottom-nav-height, 64px) + var(--sab, 0px) + 12px)",
            left: "50%",
            transform: "translateX(-50%)",
            width: "min(420px, calc(100vw - 32px))",
            zIndex: 79,
            background: "rgba(21, 23, 26, 0.94)",
            backdropFilter: "blur(14px)",
            color: "#fff",
            borderRadius: "12px",
            padding: "12px 14px",
            boxShadow: "0 12px 32px rgba(0, 0, 0, 0.24)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "10px",
            animation: "bannerSlideUp 0.3s cubic-bezier(0.2, 0.7, 0.1, 1)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
            <img
              src="/icons/icon-192.svg"
              alt="Orven"
              style={{ width: "36px", height: "36px", borderRadius: "8px", flexShrink: 0 }}
            />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: "700", fontSize: "13.5px", letterSpacing: "-0.01em" }}>
                Install Orven App
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#A1A4A9",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {isIOS
                  ? "Tap Share ⎋ & 'Add to Home Screen'"
                  : "Fast launch · 0-gas trades · Offline vaults"}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
            {deferredPrompt && (
              <button
                type="button"
                onClick={handleInstallClick}
                className="pill small"
                style={{
                  minHeight: "32px",
                  padding: "0 12px",
                  fontSize: "12px",
                  background: "#fff",
                  color: "#15171A",
                  borderColor: "#fff",
                }}
              >
                Install
              </button>
            )}
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Dismiss banner"
              style={{
                background: "transparent",
                border: "0",
                color: "#767B82",
                cursor: "pointer",
                padding: "6px",
                display: "grid",
                placeItems: "center",
                fontSize: "15px",
              }}
            >
              ✕
            </button>
          </div>
        </aside>
      )}
    </>
  );
}
