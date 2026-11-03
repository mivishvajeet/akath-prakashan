import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  ShoppingBag,
  Menu,
  X,
  BookOpen,
  Feather,
  ArrowUpRight,
  Globe,
  User,
  Shield,
  LogOut,
} from 'lucide-react';
import { useLanguage } from '../i18n/translations';
import { AppLanguage } from '../utils/validation';
import { AnimatedTortoiseEmblem } from './SarvamIllustrations';
import { PublicUserProfile } from '../types/publishing';

interface NavbarProps {
  currentPath: string;
  cartCount: number;
  onNavigate: (path: string) => void;
  onOpenSearch: () => void;
  user?: PublicUserProfile | null;
  onLogout?: () => Promise<void>;
  onQuickPersonaSwitch?: (
    persona: 'reader' | 'author' | 'admin' | 'guest',
    targetPath?: string
  ) => Promise<void>;
  immersiveHidden?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPath,
  cartCount,
  onNavigate,
  onOpenSearch,
  user,
  onLogout,
  immersiveHidden = false,
}) => {
  const { lang, setLang, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu if immersive reading hides the navbar
  useEffect(() => {
    if (immersiveHidden && mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  }, [immersiveHidden, mobileMenuOpen]);

  // Close mobile drawer on Escape key and lock background scroll while open
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const navItems = [
    { label: lang === 'mr' ? 'मुख्यपृष्ठ' : 'Home', path: '/' },
    { label: t.nav.books, path: '/books' },
    { label: t.nav.vachankatta, path: '/vachankatta' },
    { label: t.nav.firstPage, path: '/vachankatta/first-page' },
    { label: t.nav.authors, path: '/authors' },
    { label: t.nav.about, path: '/about' },
    { label: t.nav.submitManuscript, path: '/submit-manuscript' },
    { label: t.nav.contact, path: '/contact' },
  ];

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

  const handleLanguageChange = (nextLang: AppLanguage) => {
    setLang(nextLang);
  };

  const roleBadgeLabel =
    user?.role === 'admin'
      ? lang === 'mr'
        ? 'प्रशासक'
        : 'Admin'
      : user?.role === 'author'
      ? lang === 'mr'
        ? 'लेखक'
        : 'Author'
      : lang === 'mr'
      ? 'वाचक'
      : 'Reader';

  return (
    <>
      <header
        data-testid="primary-navbar"
        data-immersive-hidden={immersiveHidden ? 'true' : 'false'}
        aria-hidden={immersiveHidden ? true : undefined}
        className={`sticky top-0 z-50 bg-[#243B8A] text-[#FFFDF7] border-b border-[#1B2D6B] shadow-[0_6px_24px_-10px_rgba(36,59,138,0.45)] w-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          immersiveHidden
            ? '-translate-y-full opacity-0 pointer-events-none'
            : 'opacity-100'
        }`}
      >
        {/* Top Butter-Yellow & Coral-Red Editorial Hairline */}
        <div
          className="h-1 w-full"
          style={{
            background:
              'linear-gradient(90deg, #243B8A 0%, #FFD966 38%, #EF6855 68%, #243B8A 100%)',
          }}
        />

        <div className="max-w-[1280px] mx-auto px-3 sm:px-6 lg:px-8">
          {/* =================================================================
              TIER 1: BRAND IDENTITY + SEARCH + LANGUAGE + ACCOUNT + CART + MENU
              ================================================================= */}
          <div className="min-h-[60px] sm:min-h-[68px] py-2 flex items-center justify-between gap-1.5 sm:gap-3">
            {/* 1. Brand Identity: Animated Tortoise + Open Book Emblem + Devanagari Logotype */}
            <button
              type="button"
              onClick={() => handleNav('/')}
              className="group flex items-center gap-2 sm:gap-3 text-left focus:outline-none shrink min-w-0 cursor-pointer"
              aria-label={
                lang === 'mr'
                  ? 'अकथ प्रकाशन — मुख्यपृष्ठ'
                  : 'Akath Prakashan — Home'
              }
            >
              <AnimatedTortoiseEmblem
                className="w-9 h-9 sm:w-11 sm:h-11 shrink-0"
                variant="light"
                animate={true}
              />
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-serif text-[17px] sm:text-[21px] font-bold text-[#FFFDF7] group-hover:text-[#FFD966] transition-colors leading-tight truncate">
                    अकथ प्रकाशन
                  </span>
                  <span className="hidden xl:inline-block text-[11px] font-medium px-2 py-0.5 rounded-md bg-[#FFD966] text-[#252832] whitespace-nowrap">
                    {lang === 'mr' ? 'नांदेड' : 'Nanded'}
                  </span>
                </div>
                <span className="hidden min-[360px]:block text-[10px] sm:text-[11px] text-[#FFD966]/90 font-medium tracking-wide truncate">
                  {lang === 'mr'
                    ? 'Akath Prakashan · मराठी साहित्य'
                    : 'Akath Prakashan · Marathi Literature'}
                </span>
              </div>
            </button>

            {/* 2. Right Action Cluster: Search, Language, Role/Account, Cart, Drawer Toggle */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Search Trigger */}
              <button
                type="button"
                onClick={onOpenSearch}
                aria-label={t.nav.searchAria}
                data-testid="navbar-search-btn"
                className="inline-flex items-center justify-center gap-2 min-h-[40px] px-2.5 sm:px-3.5 py-2 rounded-xl bg-[#1B2D6B] hover:bg-[#152354] border border-white/15 text-[#FFFDF7] text-[13px] font-medium transition-all shrink-0 cursor-pointer"
              >
                <Search className="w-4 h-4 text-[#FFD966] shrink-0" />
                <span className="hidden md:inline max-w-[130px] lg:max-w-[170px] truncate text-[#FFFDF7]/90">
                  {t.nav.search}
                </span>
                <kbd className="hidden xl:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-[#243B8A] rounded border border-white/20 text-[#FFD966]">
                  ⌘K
                </kbd>
              </button>

              {/* Language Switcher — Contained Segmented Pill (Visible on sm+ in Tier 1, and in Tier 2 / Drawer on <sm) */}
              <div
                role="group"
                aria-label={lang === 'mr' ? 'भाषा निवडा' : 'Select language'}
                data-testid="desktop-lang-switcher"
                className="hidden sm:inline-flex items-center rounded-xl bg-[#1B2D6B] p-0.5 border border-white/15 shrink-0"
              >
                <Globe
                  className="w-3.5 h-3.5 text-[#FFD966] ml-2 mr-1 hidden lg:block shrink-0"
                  aria-hidden="true"
                />
                {(
                  [
                    { code: 'mr', label: 'मराठी' },
                    { code: 'en', label: 'EN' },
                  ] as const
                ).map((item) => {
                  const active = lang === item.code;
                  return (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => handleLanguageChange(item.code)}
                      aria-pressed={active}
                      data-testid={`lang-btn-${item.code}`}
                      className={`relative px-2.5 py-1 rounded-lg text-[12px] font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                        active
                          ? 'bg-[#FFD966] text-[#252832] shadow-2xs'
                          : 'text-[#FFFDF7]/85 hover:text-[#FFD966]'
                      }`}
                    >
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Authenticated Role Workspace Pill or Sign-In Button (Visible on md+ in Tier 1, and in Tier 2 + Drawer on <md) */}
              {user ? (
                <div className="hidden md:flex items-center gap-1.5 shrink-0">
                  {user.role === 'admin' && (
                    <button
                      type="button"
                      data-testid="navbar-admin-link"
                      onClick={() => handleNav('/admin')}
                      className={`px-2.5 py-2 rounded-xl text-[12px] font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        currentPath.startsWith('/admin')
                          ? 'bg-[#FFD966] text-[#252832]'
                          : 'bg-[#1B2D6B] hover:bg-[#152354] text-[#FFD966] border border-[#FFD966]/40'
                      }`}
                    >
                      <Shield className="w-3.5 h-3.5 shrink-0" />
                      <span className="hidden lg:inline">
                        {lang === 'mr' ? 'प्रशासक कक्ष' : 'Admin Console'}
                      </span>
                    </button>
                  )}

                  {(user.role === 'author' || user.role === 'admin') && (
                    <button
                      type="button"
                      data-testid="navbar-author-link"
                      onClick={() => handleNav('/author/dashboard')}
                      className={`px-2.5 py-2 rounded-xl text-[12px] font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        currentPath.startsWith('/author')
                          ? 'bg-[#FFD966] text-[#252832]'
                          : 'bg-[#1B2D6B] hover:bg-[#152354] text-[#FFFDF7] border border-white/15'
                      }`}
                    >
                      <Feather className="w-3.5 h-3.5 text-[#FFD966] shrink-0" />
                      <span className="hidden xl:inline">
                        {lang === 'mr' ? 'लेखक दालन' : 'Author Studio'}
                      </span>
                    </button>
                  )}

                  <button
                    type="button"
                    data-testid="navbar-account-btn"
                    onClick={() => handleNav('/account')}
                    className={`px-2.5 py-2 rounded-xl text-[12px] font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      currentPath.startsWith('/account')
                        ? 'bg-[#FFD966] text-[#252832]'
                        : 'bg-[#1B2D6B] hover:bg-[#152354] text-[#FFFDF7] border border-white/15'
                    }`}
                  >
                    <User className="w-3.5 h-3.5 text-[#FFD966] shrink-0" />
                    <span className="max-w-[96px] truncate">
                      {user.name.split(' ')[0]}
                    </span>
                    <span className="hidden xl:inline-block px-1.5 py-0.5 rounded bg-white/15 text-[10px] uppercase tracking-wider text-[#FFD966]">
                      {roleBadgeLabel}
                    </span>
                  </button>

                  {onLogout && (
                    <button
                      type="button"
                      data-testid="navbar-logout-btn"
                      onClick={() => onLogout()}
                      title={lang === 'mr' ? 'लॉगआउट' : 'Sign Out'}
                      aria-label={lang === 'mr' ? 'लॉगआउट' : 'Sign Out'}
                      className="p-2 rounded-xl bg-[#1B2D6B] hover:bg-[#EF6855] text-[#FFFDF7] border border-white/15 transition-colors shrink-0 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  data-testid="navbar-signin-btn"
                  onClick={() => handleNav('/login')}
                  className={`hidden md:inline-flex px-3 py-2 rounded-xl text-[12.5px] font-semibold items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    currentPath === '/login' || currentPath === '/register'
                      ? 'bg-[#FFD966] text-[#252832]'
                      : 'bg-[#1B2D6B] hover:bg-[#FFD966] text-[#FFFDF7] hover:text-[#252832] border border-[#FFD966]/45'
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-[#FFD966] shrink-0" />
                  <span>{lang === 'mr' ? 'लॉगिन / खाते' : 'Sign In'}</span>
                </button>
              )}

              {/* Cart Button — Coral Red (#EF6855) Purchase CTA */}
              <button
                type="button"
                onClick={() => handleNav('/cart')}
                aria-label={`${t.nav.cart} (${cartCount})`}
                data-testid="navbar-cart-btn"
                className="relative inline-flex items-center gap-1.5 min-h-[40px] px-2.5 sm:px-3.5 py-2 rounded-xl bg-[#EF6855] hover:bg-[#DE5542] text-[#FFFDF7] text-[13px] font-semibold transition-all shadow-xs whitespace-nowrap shrink-0 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-[#FFFDF7] shrink-0" />
                <span className="hidden sm:inline">{t.nav.cart}</span>
                <span
                  data-testid="navbar-cart-count"
                  className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold tabular-nums bg-[#FFD966] text-[#252832]"
                >
                  {cartCount}
                </span>
              </button>

              {/* Mobile & Tablet Menu Toggle (Visible below xl so 375px, 768px & 1024px viewports have full menu access) */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                aria-expanded={mobileMenuOpen}
                aria-controls="akath-mobile-drawer"
                aria-label={
                  mobileMenuOpen
                    ? lang === 'mr'
                      ? 'मेनू बंद करा'
                      : 'Close navigation menu'
                    : lang === 'mr'
                    ? 'मेनू उघडा'
                    : 'Open navigation menu'
                }
                data-testid="navbar-mobile-menu-btn"
                className={`xl:hidden inline-flex items-center gap-1.5 min-h-[40px] px-2.5 py-2 rounded-xl border transition-colors shrink-0 cursor-pointer ${
                  mobileMenuOpen
                    ? 'bg-[#FFD966] text-[#252832] border-[#FFD966]'
                    : 'bg-[#1B2D6B] border-white/20 text-[#FFFDF7] hover:bg-[#152354]'
                }`}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-[#252832]" />
                ) : (
                  <Menu className="w-5 h-5 text-[#FFD966]" />
                )}
                <span className="hidden sm:inline text-[12px] font-semibold">
                  {lang === 'mr' ? 'मेनू' : 'Menu'}
                </span>
              </button>
            </div>
          </div>

          {/* =================================================================
              TIER 2 (DESKTOP xl+): PRIMARY NAVIGATION LINKS
              ================================================================= */}
          <div className="hidden xl:flex items-center justify-between gap-3 py-2 border-t border-white/12">
            <nav
              aria-label={
                lang === 'mr' ? 'मुख्य नेव्हिगेशन' : 'Primary Navigation'
              }
              className="flex items-center gap-1 flex-wrap"
            >
              {navItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => handleNav(item.path)}
                    aria-current={active ? 'page' : undefined}
                    className={`relative px-3 py-1.5 rounded-xl text-[13.5px] font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      active
                        ? 'text-[#252832] font-semibold'
                        : 'text-[#FFFDF7]/90 hover:text-[#FFD966] hover:bg-white/5'
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="akath-active-nav-pill"
                        className="absolute inset-0 rounded-xl bg-[#FFD966] -z-10"
                        transition={{
                          type: 'spring',
                          stiffness: 380,
                          damping: 32,
                        }}
                      />
                    )}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Editorial Submission CTA on Desktop Tier 2 */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleNav('/submit-manuscript')}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#1B2D6B] hover:bg-[#152354] border border-[#FFD966]/30 text-[#FFD966] text-[12px] font-semibold transition-colors whitespace-nowrap cursor-pointer"
              >
                <Feather className="w-3.5 h-3.5 text-[#EF6855]" />
                <span>{t.nav.submitManuscript}</span>
              </button>
            </div>
          </div>

          {/* =================================================================
              TIER 2 (TABLET & MOBILE <xl): SCROLLABLE QUICK ACCESS & UTILITY BAR
              ================================================================= */}
          <div className="xl:hidden flex items-center justify-between gap-2 py-2 border-t border-white/12">
            {/* Mobile (<sm) Language Switcher + Sign In / Account Quick Pill */}
            <div className="flex sm:hidden items-center gap-1.5 shrink-0">
              <div
                role="group"
                aria-label={lang === 'mr' ? 'भाषा निवडा' : 'Select language'}
                className="inline-flex items-center rounded-lg bg-[#1B2D6B] p-0.5 border border-white/15"
              >
                {(
                  [
                    { code: 'mr', label: 'मराठी' },
                    { code: 'en', label: 'EN' },
                  ] as const
                ).map((item) => {
                  const active = lang === item.code;
                  return (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => handleLanguageChange(item.code)}
                      aria-pressed={active}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#FFD966] text-[#252832]'
                          : 'text-[#FFFDF7]/85'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {user ? (
                <button
                  type="button"
                  onClick={() => handleNav('/account')}
                  className="px-2 py-1 rounded-lg bg-[#1B2D6B] text-[#FFD966] border border-white/15 text-[11px] font-semibold truncate max-w-[88px] cursor-pointer"
                >
                  {user.name.split(' ')[0]}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleNav('/login')}
                  className="px-2 py-1 rounded-lg bg-[#1B2D6B] text-[#FFFDF7] border border-[#FFD966]/40 text-[11px] font-semibold whitespace-nowrap cursor-pointer"
                >
                  {lang === 'mr' ? 'लॉगिन' : 'Sign In'}
                </button>
              )}
            </div>

            {/* Horizontal Swipeable Quick Navigation Links for Mobile & Tablet */}
            <nav
              aria-label={
                lang === 'mr' ? 'द्रुत दुवे' : 'Quick Navigation'
              }
              data-testid="mobile-tablet-quick-nav"
              className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 min-w-0 flex-1 justify-start md:justify-end"
            >
              {navItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => handleNav(item.path)}
                    className={`px-2.5 py-1 rounded-lg text-[11.5px] sm:text-[12px] font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      active
                        ? 'bg-[#FFD966] text-[#252832] font-semibold'
                        : 'bg-[#1B2D6B]/70 text-[#FFFDF7]/90 hover:text-[#FFD966]'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* =====================================================================
          MOBILE & TABLET SLIDE-IN DRAWER (RENDERED OUTSIDE <header> AT z-[100]
          SO FIXED POSITIONING IS NEVER CLIPPED BY HEADER TRANSFORM CONTEXT)
          ===================================================================== */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div
            data-testid="navbar-mobile-drawer-overlay"
            className="fixed inset-0 z-[100] xl:hidden"
            role="dialog"
            aria-modal="true"
            aria-label={lang === 'mr' ? 'मोबाईल नेव्हिगेशन मेनू' : 'Navigation Menu'}
          >
            {/* Archival Paper Frosted-Glass Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 archival-frosted-overlay"
              aria-hidden="true"
            />

            {/* Right-to-Left Slide-In Archival Paper Drawer */}
            <motion.nav
              id="akath-mobile-drawer"
              data-testid="navbar-mobile-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{
                type: 'spring',
                stiffness: 340,
                damping: 34,
                mass: 0.9,
              }}
              className="fixed top-0 right-0 bottom-0 h-[100dvh] max-h-[100dvh] w-[88vw] max-w-[360px] archival-drawer-surface bg-[#FFFDF7] text-[#252832] flex flex-col justify-between overflow-y-auto overscroll-contain z-10 shadow-2xl"
            >
              {/* Drawer Header */}
              <div className="p-4 sm:p-5 border-b border-[#E6E1D6] flex items-center justify-between bg-[#243B8A] text-[#FFFDF7] sticky top-0 z-20">
                <div className="flex items-center gap-2.5 min-w-0">
                  <AnimatedTortoiseEmblem
                    className="w-9 h-9 shrink-0"
                    variant="light"
                    animate={true}
                  />
                  <div className="min-w-0">
                    <span className="font-serif text-[18px] font-bold text-[#FFFDF7] block leading-tight truncate">
                      अकथ प्रकाशन
                    </span>
                    <span className="text-[11px] text-[#FFD966] font-medium block truncate">
                      {lang === 'mr'
                        ? 'कासव मुद्रा · नांदेड'
                        : 'Tortoise Imprint · Nanded'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  data-testid="navbar-mobile-drawer-close"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label={lang === 'mr' ? 'मेनू बंद करा' : 'Close menu'}
                  className="p-2 rounded-xl bg-[#1B2D6B] border border-white/15 text-[#FFD966] hover:bg-[#152354] transition-colors shrink-0 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body: Language Switcher + Nav Links + Secondary Actions */}
              <div className="p-4 sm:p-5 space-y-4 flex-1">
                {/* Language Switcher inside Drawer */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F7F3E8] border border-[#E6E1D6]">
                  <span className="text-[12.5px] font-semibold text-[#252832] inline-flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-[#243B8A]" />
                    <span>{lang === 'mr' ? 'भाषा निवडा' : 'Select Language'}</span>
                  </span>
                  <div className="inline-flex rounded-xl bg-white p-0.5 border border-[#E6E1D6]">
                    {(
                      [
                        { code: 'mr', label: 'मराठी' },
                        { code: 'en', label: 'English' },
                      ] as const
                    ).map((item) => {
                      const active = lang === item.code;
                      return (
                        <button
                          key={item.code}
                          type="button"
                          onClick={() => handleLanguageChange(item.code)}
                          className={`px-3 py-1 rounded-lg text-[12px] font-semibold transition-colors cursor-pointer ${
                            active
                              ? 'bg-[#243B8A] text-[#FFFDF7]'
                              : 'text-[#525665] hover:text-[#243B8A]'
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Primary Navigation Links */}
                <div className="space-y-1">
                  {navItems.map((item, idx) => {
                    const active = isActive(item.path);
                    return (
                      <motion.button
                        key={item.path}
                        type="button"
                        data-testid={`mobile-drawer-link-${item.path}`}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.025 * idx, duration: 0.18 }}
                        onClick={() => handleNav(item.path)}
                        aria-current={active ? 'page' : undefined}
                        className={`w-full px-4 py-3 rounded-xl text-left text-[15px] font-medium flex items-center justify-between transition-colors cursor-pointer ${
                          active
                            ? 'bg-[#243B8A] text-[#FFFDF7] font-semibold shadow-xs'
                            : 'text-[#252832] hover:bg-[#FFD966]/30'
                        }`}
                      >
                        <span>{item.label}</span>
                        {active && (
                          <span className="w-2 h-2 rounded-full bg-[#FFD966]" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Secondary Actions: Track Order + Account / Auth */}
                <div className="pt-3 border-t border-[#E6E1D6] grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => handleNav('/track-order')}
                    className="px-3.5 py-2.5 rounded-xl bg-white border border-[#E6E1D6] text-[13.5px] font-medium text-[#252832] hover:border-[#243B8A] flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="inline-flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-[#243B8A]" />
                      <span>{t.nav.trackOrder}</span>
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-[#243B8A]" />
                  </button>

                  {user ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleNav('/account')}
                        className="px-3.5 py-2.5 rounded-xl bg-[#243B8A] text-[#FFFDF7] text-[13.5px] font-semibold flex items-center justify-between cursor-pointer"
                      >
                        <span className="inline-flex items-center gap-2">
                          <User className="w-4 h-4 text-[#FFD966]" />
                          <span>
                            {user.name} ({roleBadgeLabel})
                          </span>
                        </span>
                        <ArrowUpRight className="w-4 h-4 text-[#FFD966]" />
                      </button>

                      {(user.role === 'author' || user.role === 'admin') && (
                        <button
                          type="button"
                          onClick={() => handleNav('/author/dashboard')}
                          className="px-3.5 py-2.5 rounded-xl bg-white border border-[#E6E1D6] text-[13.5px] font-semibold text-[#243B8A] flex items-center justify-between cursor-pointer"
                        >
                          <span className="inline-flex items-center gap-2">
                            <Feather className="w-4 h-4 text-[#EF6855]" />
                            <span>
                              {lang === 'mr' ? 'लेखक दालन' : 'Author Studio'}
                            </span>
                          </span>
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                      )}

                      {user.role === 'admin' && (
                        <button
                          type="button"
                          onClick={() => handleNav('/admin')}
                          className="px-3.5 py-2.5 rounded-xl bg-[#FFD966] text-[#252832] text-[13.5px] font-bold flex items-center justify-between cursor-pointer"
                        >
                          <span className="inline-flex items-center gap-2">
                            <Shield className="w-4 h-4 text-[#243B8A]" />
                            <span>
                              {lang === 'mr'
                                ? 'प्रशासक नियंत्रण कक्ष'
                                : 'Admin Console'}
                            </span>
                          </span>
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                      )}
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleNav('/login')}
                      className="px-3.5 py-2.5 rounded-xl bg-[#EF6855] text-[#FFFDF7] text-[14px] font-semibold flex items-center justify-between cursor-pointer"
                    >
                      <span className="inline-flex items-center gap-2">
                        <User className="w-4 h-4 text-[#FFFDF7]" />
                        <span>
                          {lang === 'mr'
                            ? 'लॉगिन / नवीन वाचक नोंदणी'
                            : 'Sign In / Create Account'}
                        </span>
                      </span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Drawer Footer Colophon */}
              <div className="p-4 border-t border-[#E6E1D6] bg-[#FFFDF7] text-[12px] text-[#525665] flex items-center justify-between">
                <span>© अकथ प्रकाशन</span>
                <span className="text-[#243B8A] font-semibold">
                  {lang === 'mr' ? 'मराठी साहित्य विश्व' : 'Marathi Literary Imprint'}
                </span>
              </div>
            </motion.nav>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
