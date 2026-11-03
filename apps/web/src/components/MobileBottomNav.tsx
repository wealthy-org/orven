import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";

interface NavItem {
  href: string;
  label: string;
  icon: (active: boolean) => React.ReactNode;
}

export function MobileBottomNav() {
  const router = useRouter();

  const isActive = (path: string) => {
    if (path === "/vault") {
      return router.pathname === "/vault" || router.pathname === "/";
    }
    return router.pathname.startsWith(path);
  };

  const items: NavItem[] = [
    {
      href: "/vault",
      label: "Vault",
      icon: (active) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? "#D9381E" : "currentColor"} strokeWidth={active ? "2.2" : "1.8"}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="12" cy="12" r="4" />
          <line x1="12" y1="8" x2="12" y2="12" />
        </svg>
      ),
    },
    {
      href: "/swap",
      label: "Swap",
      icon: (active) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? "#D9381E" : "currentColor"} strokeWidth={active ? "2.2" : "1.8"}>
          <path d="M7 10h14l-4-4" />
          <path d="M17 14H3l4 4" />
        </svg>
      ),
    },
    {
      href: "/pad",
      label: "Pad",
      icon: (active) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? "#D9381E" : "currentColor"} strokeWidth={active ? "2.2" : "1.8"}>
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      ),
    },
    {
      href: "/tide",
      label: "Tide",
      icon: (active) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? "#D9381E" : "currentColor"} strokeWidth={active ? "2.2" : "1.8"}>
          <path d="M12 2v20" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
    },
    {
      href: "/lock",
      label: "Lock",
      icon: (active) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? "#D9381E" : "currentColor"} strokeWidth={active ? "2.2" : "1.8"}>
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      <div className="mobile-bottom-nav-inner">
        {items.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mobile-nav-item ${active ? "active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <div className="mobile-nav-icon">{item.icon(active)}</div>
              <span className="mobile-nav-label">{item.label}</span>
              {active && <span className="mobile-nav-dot" aria-hidden="true" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
