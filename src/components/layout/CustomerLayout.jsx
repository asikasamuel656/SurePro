export function CustomerLayout({ children }) {
  return (
    <div className="min-h-dvh bg-bg">
      <div className="mobile-shell flex min-h-dvh flex-col">{children}</div>
    </div>
  )
}