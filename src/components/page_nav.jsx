// components/page_nav.jsx

import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function getInitials(name = "User") {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function getProfileImage(user) {
  return (
    user?.avatarUrl ||
    user?.profileImageUrl ||
    user?.imageUrl ||
    user?.photoURL ||
    ""
  );
}

function HomeIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10Z"
      />
    </svg>
  );
}

function RequestIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 5v14M5 12h14"
      />
    </svg>
  );
}

function FeedIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6h16M4 12h16M4 18h10"
      />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="m6 6 12 12M18 6 6 18"
      />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"
      />
    </svg>
  );
}

export default function PageNav({
  view = "dashboard",
  onChangeView,
  onOpenProfile,
}) {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  if (!user) {
    return null;
  }

  if (user.role === "admin") {
    return null;
  }

  const isProvider = user.role === "provider";

  const links = isProvider
    ? [
        {
          key: "dashboard",
          label: "Job feed",
          icon: <HomeIcon />,
        },
        {
          key: "feed",
          label: "Social feed",
          icon: <FeedIcon />,
        },
      ]
    : [
        {
          key: "dashboard",
          label: "My requests",
          icon: <HomeIcon />,
        },
        {
          key: "request",
          label: "Request a service",
          icon: <RequestIcon />,
        },
        {
          key: "feed",
          label: "Social feed",
          icon: <FeedIcon />,
        },
      ];

  const displayName =
    user.fullName ||
    user.name ||
    user.displayName ||
    user.email ||
    "User";

  const imageUrl = getProfileImage(user);

  function handleChangeView(nextView) {
    onChangeView?.(nextView);
    setMobileOpen(false);
  }

  async function handleLogout() {
    setLoggingOut(true);

    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
      setLoggingOut(false);
    }
  }

  function renderAvatar(size = "md") {
    const dimensions =
      size === "lg" ? "h-11 w-11 text-sm" : "h-8 w-8 text-xs";

    if (imageUrl) {
      return (
        <img
          src={imageUrl}
          alt={`${displayName} profile`}
          className={`${dimensions} rounded-full border-2 border-emerald-200 object-cover`}
          onError={(event) => {
            event.currentTarget.style.display = "none";
            event.currentTarget.nextElementSibling?.classList.remove(
              "hidden"
            );
          }}
        />
      );
    }

    return (
      <div
        className={`${dimensions} flex items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-800`}
      >
        {getInitials(displayName)}
      </div>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 flex-shrink-0 items-center border-b border-gray-200 bg-white px-4 sm:px-5">
        <div className="flex min-w-0 items-center gap-6">
          <button
            type="button"
            onClick={() => handleChangeView("dashboard")}
            className="flex-shrink-0 text-base font-semibold tracking-tight text-gray-900"
          >
            Sure<span className="text-emerald-600">Pro</span>
          </button>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((link) => {
              const active = view === link.key;

              return (
                <button
                  key={link.key}
                  type="button"
                  onClick={() => handleChangeView(link.key)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    active
                      ? "bg-emerald-50 text-emerald-800"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {link.icon}
                  {link.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden text-right sm:block">
            <div className="max-w-[150px] truncate text-xs font-medium text-gray-800">
              {displayName}
            </div>

            <div className="text-[10px] capitalize text-gray-400">
              {user.role}
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenProfile}
            className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-emerald-600 bg-emerald-50 transition-colors hover:bg-emerald-100"
            aria-label="Open profile"
          >
            {renderAvatar("md")}
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50 md:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-30 md:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-black/20"
            aria-label="Close navigation"
          />

          <div className="absolute right-3 top-[62px] w-64 rounded-xl border border-gray-200 bg-white p-2 shadow-xl">
            <div className="mb-2 flex items-center gap-3 border-b border-gray-100 px-3 py-3">
              {renderAvatar("lg")}

              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-gray-900">
                  {displayName}
                </div>

                <div className="text-xs capitalize text-gray-400">
                  {user.role}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              {links.map((link) => {
                const active = view === link.key;

                return (
                  <button
                    key={link.key}
                    type="button"
                    onClick={() => handleChangeView(link.key)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs font-medium ${
                      active
                        ? "bg-emerald-50 text-emerald-800"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {link.icon}
                    {link.label}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                <LogoutIcon />
                {loggingOut ? "Signing out..." : "Sign out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}