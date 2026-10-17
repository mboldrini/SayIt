export default function Header({ page, onNavigate, xp, streak, onOpenStats }) {
  const navItem = (id, label) => {
    const active = page === id
    return (
      <button
        onClick={() => onNavigate(id)}
        className={`px-space-lg py-space-xs rounded-full text-label-lg transition-all ${
          active
            ? 'bg-primary-container text-on-primary-container font-bold shadow-[0_2px_0_0_#5a00c6]'
            : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
        }`}
      >
        {label}
      </button>
    )
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(124,58,237,0.06)]">
      <div className="h-20 max-w-7xl mx-auto px-margin md:px-8 lg:px-margin-desktop flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-space-sm">
          <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              mic
            </span>
          </span>
          <span className="text-headline-sm text-primary tracking-tight font-bold">SayIt</span>
        </div>

        {/* Nav */}
        <nav className="flex items-center gap-space-sm bg-surface-container-low p-1.5 rounded-full">
          {navItem('catalog', 'Choose Words')}
          {navItem('training', 'Quick Train')}
        </nav>

        {/* XP + streak pill */}
        <div className="flex items-center gap-space-sm">
          <button
            onClick={onOpenStats}
            className="hidden sm:flex items-center gap-1.5 px-space-md py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-label-sm font-bold hover:bg-primary-container transition-all"
          >
            <span className="material-symbols-outlined text-[14px] text-primary">local_fire_department</span>
            {streak}d
            <span className="w-px h-3 bg-outline-variant mx-0.5" />
            <span className="material-symbols-outlined text-[14px] text-tertiary">star</span>
            {xp} XP
          </button>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
          </div>
        </div>
      </div>
    </header>
  )
}
