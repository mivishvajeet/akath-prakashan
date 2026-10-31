import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  ShoppingBag,
  Menu,
  X,
  Globe,
  PackageCheck,
  Sparkles,
  ArrowRight,
  Feather,
  User,
  LogOut,
  Shield,
} from 'lucide-react';
import { useLanguage } from '../i18n/translations';
import { AnimatedTortoiseEmblem } from './SarvamIllustrations';
import { PublicUserProfile } from '../types/publishing';

interface NavbarProps {
  currentPath: string;
  cartCount: number;
  onNavigate: (path: string) => void;
  onOpenSearch: () => void;
  user?: PublicUserProfile | null;
  onLogout?: () => void;
  onQuickPersonaSwitch?: (
    persona: 'reader' | 'author' | 'admin',
    targetPath?: string
  ) => Promise<void> | void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPath,
  cartCount,
  onNavigate,
  onOpenSearch,
  user,
  onLogout,
  onQuickPersonaSwitch,
}) => {
  const { lang, setLang, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [switchingRole, setSwitchingRole] = useState<string | null>(null);

  const primaryLinks = [
    { label: lang === 'mr' ? 'मुखपृष्ठ' : 'Home', path: '/' },
    { label: t.nav.books, path: '/books' },
    { label: t.nav.vachankatta, path: '/vachankatta' },
    { label: t.nav.firstPage, path: '/vachankatta/first-page' },
    { label: t.nav.authors, path: '/authors' },
    { label: t.nav.about, path: '/about' },
    { label: t.nav.submitManuscript, path: '/submit-manuscript' },
    { label: t.nav.trackOrder, path: '/track-order' },
  ];

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [currentPath]);

  // Lock body scroll and listen for Escape key while mobile slide-in drawer is open
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    if (path === '/vachankatta') {
      return (
        currentPath === '/vachankatta' ||
        (currentPath.startsWith('/vachankatta/') &&
          currentPath !== '/vachankatta/first-page')
      );
    }
    return currentPath === path || currentPath.startsWith(`${path}/`);
  };

  const handleNav = (path: string) => {
    setMobileMenuOpen(false);
    onNavigate(path);
  };

  const handleRoleSwitch = async (
    persona: 'reader' | 'author' | 'admin',
    targetPath: string
  ) => {
    setMobileMenuOpen(false);
    if (user?.role === persona) {
      onNavigate(targetPath);
      return;
    }
    if (onQuickPersonaSwitch) {
      setSwitchingRole(persona);
      try {
        await onQuickPersonaSwitch(persona, targetPath);
      } finally {
        setSwitchingRole(null);
      }
    } else {
      onNavigate(targetPath);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 px-2.5 sm:px-5 lg:px-8 pt-2 pb-2 bg-[#FFFDF7]/95 backdrop-blur-md border-b border-[#E6E1D6]">
        <div className="max-w-[1280px] mx-auto">
          {/* Two-Tier Architectural Header in Midnight Cobalt (#243B8A) — Zero Horizontal Overflow Across All Devices */}
          <div className="bg-[#243B8A] text-[#FFFDF7] border border-[#1B2D6B] rounded-2xl shadow-[0_10px_30px_-10px_rgba(36,59,138,0.28)] overflow-hidden">
            {/* TIER 1: Brand Identity + Right Action Cluster (Search, Language Selector, Admin Console Demo, Sign In/Account, Cart, Mobile Menu) */}
            <div className="px-3 sm:px-5 py-2.5 min-h-[60px] flex items-center justify-between gap-2 sm:gap-3">
              {/* 1. Left Brand Identity: Animated Akath Tortoise + Open Book Emblem */}
              <button
                type="button"
                onClick={() => handleNav('/')}
                className="group flex items-center gap-2.5 sm:gap-3 text-left focus:outline-none min-w-0 shrink-0"
                aria-label="अकथ प्रकाशन — मुख्यपृष्ठ (Akath Prakashan Home)"
              >
                <span className="inline-flex items-center justify-center shrink-0">
                  <AnimatedTortoiseEmblem
                    className="w-9 h-9 sm:w-10 sm:h-10 shrink-0"
                    variant="light"
                    animate={true}
                  />
                </span>

                <div className="flex flex-col min-w-0">
                  <span className="font-serif text-[17px] sm:text-[20px] font-bold text-[#FFFDF7] leading-tight group-hover:text-[#FFD966] transition-colors whitespace-nowrap">
                    अकथ प्रकाशन
                  </span>
                  <span className="text-[10.5px] sm:text-[11px] font-medium text-[#FFFDF7]/80 whitespace-nowrap flex items-center gap-1.5">
                    <span className="text-[#FFD966] font-semibold">
                      Akath Prakashan
                    </span>
                    <span aria-hidden="true" className="hidden md:inline">
                      ·
                    </span>
                    <span className="hidden md:inline">नांदेड / पुणे</span>
                  </span>
                </div>
              </button>

              {/* 2. Right Action Cluster: Search, Language Toggle, Admin Demo CTA, Sign In / Account, Cart, Hamburger */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {/* Search Trigger */}
                <button
                  type="button"
                  onClick={onOpenSearch}
                  aria-label={t.nav.searchAria}
                  className="inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-2 min-h-[40px] rounded-xl text-[12.5px] font-medium text-[#FFFDF7]/90 hover:text-[#FFD966] bg-[#1B2D6B]/85 hover:bg-[#1B2D6B] border border-white/15 transition-colors whitespace-nowrap shrink-0"
                >
                  <Search className="w-4 h-4 text-[#FFD966] shrink-0" />
                  <span className="hidden md:inline">{t.nav.search}</span>
                  <kbd className="hidden xl:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#243B8A] text-[#FFD966] border border-white/20">
                    ⌘K
                  </kbd>
                </button>

                {/* Bilingual Language Toggle (Desktop & Tablet in Tier 1; Mobile in Tier 2 below) */}
                <div
                  role="group"
                  aria-label="Language selector"
                  data-testid="navbar-lang-selector"
                  className="hidden sm:inline-flex items-center rounded-xl bg-[#1B2D6B]/90 p-0.5 border border-white/15 shrink-0"
                >
                  <Globe
                    className="w-3.5 h-3.5 text-[#FFD966] ml-1.5 mr-1 hidden md:inline shrink-0"
                    aria-hidden="true"
                  />
                  <button
                    type="button"
                    onClick={() => setLang('mr')}
                    aria-pressed={lang === 'mr'}
                    className={`px-2 py-1 rounded-lg text-[12px] font-semibold transition-all whitespace-nowrap ${
                      lang === 'mr'
                        ? 'bg-[#FFD966] text-[#252832] shadow-2xs'
                        : 'text-[#FFFDF7]/85 hover:text-[#FFD966]'
                    }`}
                  >
                    मराठी
                  </button>
                  <button
                    type="button"
                    onClick={() => setLang('en')}
                    aria-pressed={lang === 'en'}
                    className={`px-2 py-1 rounded-lg text-[12px] font-semibold transition-all whitespace-nowrap ${
                      lang === 'en'
                        ? 'bg-[#FFD966] text-[#252832] shadow-2xs'
                        : 'text-[#FFFDF7]/85 hover:text-[#FFD966]'
                    }`}
                  >
                    EN
                  </button>
                </div>

                {/* Prominent 1-Click Admin Console Demo Button (Visible on Desktop & Tablet in Tier 1) */}
                <button
                  type="button"
                  data-testid="navbar-admin-link"
                  disabled={switchingRole === 'admin'}
                  onClick={() => handleRoleSwitch('admin', '/admin')}
                  className={`hidden md:inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-xl text-[12.5px] font-bold transition-all whitespace-nowrap shrink-0 border ${
                    currentPath.startsWith('/admin')
                      ? 'bg-[#FFD966] text-[#252832] border-[#FFD966] shadow-2xs'
                      : 'bg-[#1B2D6B] text-[#FFD966] hover:bg-[#FFD966] hover:text-[#252832] border-[#FFD966]/45'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {lang === 'mr' ? 'प्रशासक कक्ष (Admin)' : 'Admin Console'}
                  </span>
                </button>

                {/* Role-Aware Account / Sign In Button (Always visible on Desktop, Tablet, and Mobile) */}
                {user ? (
                  <div className="inline-flex items-center gap-1 shrink-0">
                    {user.role === 'author' && (
                      <button
                        type="button"
                        data-testid="navbar-author-link"
                        onClick={() => handleNav('/author/dashboard')}
                        className={`hidden lg:inline-flex items-center gap-1.5 px-2.5 py-2 min-h-[40px] rounded-xl text-[12px] font-semibold transition-colors whitespace-nowrap shrink-0 border ${
                          currentPath.startsWith('/author')
                            ? 'bg-[#FFD966] text-[#252832] border-[#FFD966]'
                            : 'bg-[#1B2D6B]/85 text-[#FFD966] hover:bg-[#1B2D6B] border-white/15'
                        }`}
                      >
                        <Feather className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          {lang === 'mr' ? 'लेखक दालन' : 'Author Studio'}
                        </span>
                      </button>
                    )}

                    <button
                      type="button"
                      data-testid="navbar-account-link"
                      onClick={() => handleNav('/account')}
                      className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 min-h-[40px] rounded-xl text-[12.5px] font-semibold transition-colors whitespace-nowrap shrink-0 border ${
                        currentPath.startsWith('/account')
                          ? 'bg-[#FFD966] text-[#252832] border-[#FFD966]'
                          : 'bg-[#1B2D6B]/85 text-[#FFFDF7] hover:text-[#FFD966] border-white/15'
                      }`}
                    >
                      <User className="w-3.5 h-3.5 text-[#FFD966] shrink-0" />
                      <span className="max-w-[72px] sm:max-w-[100px] truncate">
                        {user.name.split(' ')[0]}
                      </span>
                      <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-[#243B8A] text-[#FFD966] text-[10px] font-bold uppercase">
                        {user.role}
                      </span>
                    </button>

                    {onLogout && (
                      <button
                        type="button"
                        onClick={onLogout}
                        title={lang === 'mr' ? 'बाहेर पडा' : 'Sign Out'}
                        aria-label={lang === 'mr' ? 'बाहेर पडा' : 'Sign Out'}
                        className="hidden sm:inline-flex items-center justify-center w-9 h-10 rounded-xl bg-[#1B2D6B]/85 hover:bg-[#EF6855] text-[#FFFDF7] border border-white/15 transition-colors shrink-0"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    data-testid="navbar-login-btn"
                    onClick={() => handleNav('/login')}
                    className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 min-h-[40px] rounded-xl text-[12.5px] font-semibold transition-colors whitespace-nowrap shrink-0 border ${
                      currentPath === '/login' || currentPath === '/register'
                        ? 'bg-[#FFD966] text-[#252832] border-[#FFD966]'
                        : 'bg-[#1B2D6B]/85 text-[#FFFDF7] hover:text-[#FFD966] border-white/15'
                    }`}
                  >
                    <User className="w-3.5 h-3.5 text-[#FFD966] shrink-0" />
                    <span>{lang === 'mr' ? 'लॉगिन' : 'Sign In'}</span>
                  </button>
                )}

                {/* Cart CTA Button in Coral Red (#EF6855) with Butter Yellow (#FFD966) Counter Badge (Always Visible) */}
                <button
                  type="button"
                  data-testid="navbar-cart-btn"
                  onClick={() => handleNav('/cart')}
                  aria-label={`${t.nav.cart} (${cartCount})`}
                  className={`relative inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-2 min-h-[40px] rounded-xl text-[12.5px] sm:text-[13px] font-semibold transition-all whitespace-nowrap shrink-0 shadow-2xs ${
                    currentPath === '/cart' || currentPath === '/checkout'
                      ? 'bg-[#FFD966] text-[#252832]'
                      : 'bg-[#EF6855] text-[#FFFDF7] hover:bg-[#DE5542]'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">{t.nav.cart}</span>
                  <span
                    data-testid="navbar-cart-count"
                    className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full text-[11px] font-bold bg-[#FFD966] text-[#252832] tabular-nums"
                  >
                    {cartCount}
                  </span>
                </button>

                {/* Mobile & Tablet Hamburger Trigger (40x40px+ accessible target) */}
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen((prev) => !prev)}
                  aria-expanded={mobileMenuOpen}
                  aria-controls="akath-mobile-drawer"
                  aria-label={
                    mobileMenuOpen
                      ? 'Close navigation menu'
                      : 'Open navigation menu'
                  }
                  className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl text-[#FFD966] bg-[#1B2D6B] hover:bg-[#152354] border border-white/15 transition-colors shrink-0"
                >
                  {mobileMenuOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* TIER 2: Primary Navigation Links (Desktop) & Quick Role/Admin Console Demo Switcher (All Devices) */}
            <div className="border-t border-white/12 bg-[#1B2D6B]/75 px-3 sm:px-5 py-1.5 flex flex-wrap items-center justify-between gap-2">
              {/* Desktop Primary Navigation Links (lg+) */}
              <nav
                aria-label="Primary Navigation"
                className="hidden lg:flex flex-wrap items-center gap-1"
              >
                {primaryLinks.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => handleNav(item.path)}
                      aria-current={active ? 'page' : undefined}
                      className={`relative px-2.5 xl:px-3 py-1 rounded-lg text-[12.5px] xl:text-[13px] font-semibold whitespace-nowrap transition-colors duration-150 ${
                        active
                          ? 'text-[#252832]'
                          : 'text-[#FFFDF7]/85 hover:text-[#FFD966]'
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="sarvam-gnb-pill"
                          className="absolute inset-0 bg-[#FFD966] rounded-lg shadow-2xs"
                          transition={{
                            type: 'spring',
                            stiffness: 420,
                            damping: 34,
                          }}
                        />
                      )}
                      <span className="relative z-10">{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Mobile Language Selector (<sm) + Tablet Quick Links (sm..lg) */}
              <div className="flex lg:hidden items-center gap-2">
                <div
                  role="group"
                  aria-label="Mobile language selector"
                  className="inline-flex sm:hidden items-center rounded-lg bg-[#243B8A] p-0.5 border border-white/15 shrink-0"
                >
                  <button
                    type="button"
                    onClick={() => setLang('mr')}
                    aria-pressed={lang === 'mr'}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all whitespace-nowrap ${
                      lang === 'mr'
                        ? 'bg-[#FFD966] text-[#252832]'
                        : 'text-[#FFFDF7]/85'
                    }`}
                  >
                    मराठी
                  </button>
                  <button
                    type="button"
                    onClick={() => setLang('en')}
                    aria-pressed={lang === 'en'}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all whitespace-nowrap ${
                      lang === 'en'
                        ? 'bg-[#FFD966] text-[#252832]'
                        : 'text-[#FFFDF7]/85'
                    }`}
                  >
                    EN
                  </button>
                </div>

                <div className="hidden sm:flex lg:hidden items-center gap-1">
                  {primaryLinks.slice(0, 4).map((item) => {
                    const active = isActive(item.path);
                    return (
                      <button
                        key={item.path}
                        type="button"
                        onClick={() => handleNav(item.path)}
                        className={`px-2.5 py-1 rounded-lg text-[12px] font-semibold whitespace-nowrap transition-colors ${
                          active
                            ? 'bg-[#FFD966] text-[#252832]'
                            : 'text-[#FFFDF7]/85 hover:text-[#FFD966]'
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Live 1-Click Role & Admin Console Demo Switcher (Visible on Desktop, Tablet, and Mobile) */}
              <div
                data-testid="role-demo-switcher-bar"
                className="flex items-center gap-1.5 ml-auto flex-wrap"
              >
                <span className="hidden xl:inline-flex items-center gap-1 text-[11px] font-semibold text-[#FFD966]/90 mr-0.5">
                  <Sparkles className="w-3 h-3" />
                  <span>{lang === 'mr' ? 'डेमो मोड:' : 'Demo Role:'}</span>
                </span>

                <button
                  type="button"
                  data-testid="quick-demo-reader"
                  disabled={switchingRole === 'reader'}
                  onClick={() => handleRoleSwitch('reader', '/account')}
                  className={`px-2 py-1 rounded-lg text-[11px] sm:text-[11.5px] font-semibold whitespace-nowrap transition-colors border ${
                    user?.role === 'reader' && currentPath.startsWith('/account')
                      ? 'bg-[#FFD966] text-[#252832] border-[#FFD966]'
                      : 'bg-[#243B8A]/90 text-[#FFFDF7]/90 hover:text-[#FFD966] border-white/15'
                  }`}
                >
                  {lang === 'mr' ? 'वाचक डेमो' : 'Reader Demo'}
                </button>

                <button
                  type="button"
                  data-testid="quick-demo-author"
                  disabled={switchingRole === 'author'}
                  onClick={() =>
                    handleRoleSwitch('author', '/author/dashboard')
                  }
                  className={`px-2 py-1 rounded-lg text-[11px] sm:text-[11.5px] font-semibold whitespace-nowrap transition-colors border ${
                    user?.role === 'author' && currentPath.startsWith('/author')
                      ? 'bg-[#FFD966] text-[#252832] border-[#FFD966]'
                      : 'bg-[#243B8A]/90 text-[#FFFDF7]/90 hover:text-[#FFD966] border-white/15'
                  }`}
                >
                  {lang === 'mr' ? 'लेखक डेमो' : 'Author Demo'}
                </button>

                <button
                  type="button"
                  data-testid="quick-demo-admin"
                  disabled={switchingRole === 'admin'}
                  onClick={() => handleRoleSwitch('admin', '/admin')}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] sm:text-[11.5px] font-bold whitespace-nowrap transition-colors border ${
                    currentPath.startsWith('/admin')
                      ? 'bg-[#FFD966] text-[#252832] border-[#FFD966]'
                      : 'bg-[#FFD966]/20 text-[#FFD966] hover:bg-[#FFD966] hover:text-[#252832] border-[#FFD966]/50'
                  }`}
                >
                  <Shield className="w-3 h-3 shrink-0" />
                  <span>
                    {lang === 'mr' ? 'अॅडमिन कक्ष डेमो' : 'Admin Console Demo'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile & Tablet Navigation Slide-Over Drawer & Frosted Archival Paper Backdrop Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-50 lg:hidden flex justify-end"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Drawer"
          >
            {/* Clean Frosted-Glass Archival Paper Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
              className="fixed inset-0 archival-frosted-overlay cursor-pointer"
            />

            {/* Right-to-Left Slide-In Archival Paper Drawer */}
            <motion.nav
              id="akath-mobile-drawer"
              aria-label="Mobile Navigation"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{
                type: 'spring',
                stiffness: 350,
                damping: 34,
                mass: 0.9,
              }}
              className="relative z-10 w-full max-w-[380px] h-full archival-drawer-surface border-l border-[#E6E1D6] flex flex-col justify-between overflow-y-auto"
            >
              {/* Top Accent Bar: Midnight Cobalt + Butter Yellow + Coral Red */}
              <div>
                <div
                  className="h-1.5 w-full"
                  style={{
                    background:
                      'linear-gradient(90deg, #243B8A 0%, #FFD966 60%, #EF6855 100%)',
                  }}
                />

                {/* Drawer Header with Floating Tortoise Emblem & Close Button */}
                <div className="px-5 pt-4 pb-3.5 border-b border-[#E6E1D6] flex items-center justify-between gap-3 bg-[#243B8A] text-[#FFFDF7] sticky top-0 z-10">
                  <button
                    type="button"
                    onClick={() => handleNav('/')}
                    className="group flex items-center gap-3 text-left focus:outline-none"
                  >
                    <AnimatedTortoiseEmblem
                      className="w-10 h-10 shrink-0"
                      variant="light"
                      animate={true}
                    />
                    <div>
                      <span className="font-serif text-[18px] font-bold text-[#FFFDF7] group-hover:text-[#FFD966] block leading-tight">
                        अकथ प्रकाशन
                      </span>
                      <span className="text-[11px] font-semibold text-[#FFD966]">
                        कासव मुद्रा · नांदेड / पुणे
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    aria-label="Close navigation menu"
                    className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-[#1B2D6B] hover:bg-[#152354] text-[#FFD966] border border-white/15 transition-colors shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Instant 1-Click Role & Admin Console Demo Card in Mobile Drawer */}
                <div className="mx-5 mt-4 p-3.5 rounded-2xl bg-[#243B8A] text-[#FFFDF7] space-y-2.5">
                  <div className="flex items-center justify-between text-[11.5px] font-bold text-[#FFD966]">
                    <span className="inline-flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>
                        {lang === 'mr'
                          ? '१-क्लिक डेमो कक्ष (Role Demo)'
                          : '1-Click Role & Admin Demo'}
                      </span>
                    </span>
                    <span className="uppercase text-[10px] px-1.5 py-0.5 rounded bg-white/10">
                      {user ? user.role : 'guest'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleRoleSwitch('admin', '/admin')}
                      className="px-2 py-2 rounded-xl bg-[#FFD966] text-[#252832] text-[11.5px] font-bold text-center"
                    >
                      {lang === 'mr' ? 'अॅडमिन डेमो' : 'Admin Demo'}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleRoleSwitch('author', '/author/dashboard')
                      }
                      className="px-2 py-2 rounded-xl bg-[#1B2D6B] text-[#FFFDF7] border border-white/15 text-[11.5px] font-semibold text-center"
                    >
                      {lang === 'mr' ? 'लेखक डेमो' : 'Author Demo'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRoleSwitch('reader', '/account')}
                      className="px-2 py-2 rounded-xl bg-[#1B2D6B] text-[#FFFDF7] border border-white/15 text-[11.5px] font-semibold text-center"
                    >
                      {lang === 'mr' ? 'वाचक डेमो' : 'Reader Demo'}
                    </button>
                  </div>
                </div>

                {/* Primary Navigation Links */}
                <div className="px-5 py-4 space-y-1.5">
                  <div className="px-1 pb-1 text-[11px] font-mono uppercase text-[#525665]">
                    {lang === 'mr' ? 'प्रमुख विभाग' : 'Directory'}
                  </div>
                  {primaryLinks.map((item, index) => {
                    const active = isActive(item.path);
                    return (
                      <motion.button
                        key={item.path}
                        type="button"
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: 0.03 + index * 0.02,
                          duration: 0.2,
                        }}
                        onClick={() => handleNav(item.path)}
                        aria-current={active ? 'page' : undefined}
                        className={`w-full min-h-[44px] text-left px-4 py-2.5 rounded-xl text-[14.5px] font-semibold flex items-center justify-between transition-colors ${
                          active
                            ? 'bg-[#243B8A] text-[#FFFDF7] shadow-2xs'
                            : 'text-[#252832] hover:bg-white hover:text-[#243B8A] border border-transparent hover:border-[#E6E1D6]'
                        }`}
                      >
                        <span>{item.label}</span>
                        <ArrowRight
                          className={`w-4 h-4 transition-transform ${
                            active
                              ? 'text-[#FFD966] translate-x-0.5'
                              : 'text-[#525665]'
                          }`}
                        />
                      </motion.button>
                    );
                  })}
                </div>

                {/* Secondary Utility Links */}
                <div className="px-5 pt-2 pb-4 border-t border-[#E6E1D6]/80 space-y-1.5">
                  {user ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleNav('/account')}
                        className={`w-full min-h-[44px] text-left px-4 py-2.5 rounded-xl text-[14px] font-semibold flex items-center justify-between transition-colors ${
                          currentPath.startsWith('/account')
                            ? 'bg-[#FFD966]/35 text-[#243B8A]'
                            : 'text-[#252832] hover:bg-white'
                        }`}
                      >
                        <span className="inline-flex items-center gap-2.5">
                          <User className="w-4 h-4 text-[#243B8A]" />
                          <span>
                            {lang === 'mr' ? 'माझे खाते' : 'My Account'} ({user.name})
                          </span>
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#525665]" />
                      </button>

                      {user.role === 'author' && (
                        <button
                          type="button"
                          onClick={() => handleNav('/author/dashboard')}
                          className="w-full min-h-[44px] text-left px-4 py-2.5 rounded-xl text-[14px] font-semibold flex items-center justify-between text-[#243B8A] hover:bg-white"
                        >
                          <span className="inline-flex items-center gap-2.5">
                            <Feather className="w-4 h-4 text-[#243B8A]" />
                            <span>
                              {lang === 'mr' ? 'लेखक कार्यशाळा' : 'Author Portal'}
                            </span>
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#525665]" />
                        </button>
                      )}

                      {user.role === 'admin' && (
                        <button
                          type="button"
                          onClick={() => handleNav('/admin')}
                          className="w-full min-h-[44px] text-left px-4 py-2.5 rounded-xl text-[14px] font-semibold flex items-center justify-between text-[#243B8A] hover:bg-white"
                        >
                          <span className="inline-flex items-center gap-2.5">
                            <Shield className="w-4 h-4 text-[#243B8A]" />
                            <span>
                              {lang === 'mr' ? 'प्रशासक पटल' : 'Admin Dashboard'}
                            </span>
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#525665]" />
                        </button>
                      )}

                      {onLogout && (
                        <button
                          type="button"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            onLogout();
                          }}
                          className="w-full min-h-[44px] text-left px-4 py-2.5 rounded-xl text-[14px] font-semibold flex items-center justify-between text-[#EF6855] hover:bg-white"
                        >
                          <span className="inline-flex items-center gap-2.5">
                            <LogOut className="w-4 h-4 text-[#EF6855]" />
                            <span>{lang === 'mr' ? 'बाहेर पडा' : 'Sign Out'}</span>
                          </span>
                        </button>
                      )}
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleNav('/login')}
                      className="w-full min-h-[44px] text-left px-4 py-2.5 rounded-xl text-[14px] font-semibold flex items-center justify-between text-[#243B8A] bg-[#FFD966]/30 hover:bg-[#FFD966]/50"
                    >
                      <span className="inline-flex items-center gap-2.5">
                        <User className="w-4 h-4 text-[#243B8A]" />
                        <span>
                          {lang === 'mr' ? 'लॉगिन / नोंदणी' : 'Sign In / Register'}
                        </span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#243B8A]" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleNav('/contact')}
                    className={`w-full min-h-[44px] text-left px-4 py-2.5 rounded-xl text-[14px] font-semibold flex items-center justify-between transition-colors ${
                      currentPath === '/contact'
                        ? 'bg-[#FFD966]/35 text-[#243B8A]'
                        : 'text-[#252832] hover:bg-white'
                    }`}
                  >
                    <span className="inline-flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 text-[#243B8A]" />
                      <span>{t.nav.contact}</span>
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#525665]" />
                  </button>
                </div>
              </div>

              {/* Drawer Footer CTA in Coral Red (#EF6855) & Midnight Cobalt (#243B8A) */}
              <div className="p-5 border-t border-[#E6E1D6] bg-white/85 backdrop-blur-sm space-y-2.5">
                <button
                  type="button"
                  onClick={() => handleNav('/books')}
                  className="w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-[#EF6855] hover:bg-[#DE5542] text-[#FFFDF7] text-[14px] font-semibold flex items-center justify-between transition-colors shadow-xs"
                >
                  <span className="inline-flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4" />
                    <span>
                      {lang === 'mr'
                        ? 'पुस्तक दालन पाहा'
                        : 'Explore Book Catalogue'}
                    </span>
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.nav>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
