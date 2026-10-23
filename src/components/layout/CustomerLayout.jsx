export function CustomerLayout({ children }) {
  return (
    <div className="h-dvh overflow-hidden bg-bg">
      <div className="mobile-shell mx-auto flex h-dvh max-w-6xl flex-col">{children}</div>
    </div>
  )
}