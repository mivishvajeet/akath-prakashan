import React, { useState, useEffect, useRef } from 'react';
import {
  motion,
  AnimatePresence,
  type PanInfo,
} from 'motion/react';
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
  ChevronDown,
  FileText,
  Sparkles,
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
  const [openDesktopDropdown, setOpenDesktopDropdown] = useState<
    null | '/books' | '/vachankatta'
  >(null);
  const prevCartCountRef = useRef<number>(cartCount);
  const [isCartPopping, setIsCartPopping] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);
  const quickNavRef = useRef<HTMLElement | null>(null);
  const dropdownTimerRef = useRef<number | null>(null);

  const drawerTouchRef = useRef<{
    startX: number;
    startY: number;
    startTime: number;
    trackingHorizontal: boolean | null;
  } | null>(null);
  const edgeSwipeRef = useRef<{
    startX: number;
    startY: number;
    startTime: number;
  } | null>(null);

  // Synchronized state transition variants for smooth mobile menu open/close
  const drawerBackdropVariants = {
    closed: {
      opacity: 0,
      transition: {
        duration: 0.24,
        ease: [0.32, 0.72, 0, 1] as [number, number, number, number],
      },
    },
    open: {
      opacity: 1,
      transition: {
        duration: 0.28,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      },
    },
  };

  const drawerPanelVariants = {
    closed: {
      x: 380,
      opacity: 0,
      transition: {
        duration: 0.26,
        ease: [0.32, 0.72, 0, 1] as [number, number, number, number],
      },
    },
    open: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 340,
        damping: 34,
        mass: 0.85,
        staggerChildren: 0.03,
        delayChildren: 0.04,
      },
    },
  };

  const drawerItemVariants = {
    closed: {
      opacity: 0,
      x: 16,
      transition: { duration: 0.16 },
    },
    open: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.24,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      },
    },
  };

  // Trigger a subtle 'pop' animation on the cart counter whenever a book is added
  useEffect(() => {
    if (cartCount > prevCartCountRef.current) {
      setIsCartPopping(true);
      const timer = window.setTimeout(() => {
        setIsCartPopping(false);
      }, 380);
      prevCartCountRef.current = cartCount;
      return () => window.clearTimeout(timer);
    }
    prevCartCountRef.current = cartCount;
  }, [cartCount]);

  // Close mobile menu if immersive reading hides the navbar
  useEffect(() => {
    if (immersiveHidden && mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  }, [immersiveHidden, mobileMenuOpen]);

  // Lock body scroll cleanly when mobile drawer is open
  useEffect(() => {
    if (!mobileMenuOpen) {
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    const originalOverflow = document.body.style.overflow;
    const originalOverscroll = document.body.style.overscrollBehavior;
    document.body.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'contain';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.overscrollBehavior = originalOverscroll;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  // Track subtle page scroll via rAF + direct DOM attribute (zero React re-renders on scroll)
  useEffect(() => {
    let rafId: number | null = null;
    let lastScrolled: boolean | null = null;

    const applyScrollState = () => {
      rafId = null;
      const next = window.scrollY > 18;
      if (next !== lastScrolled) {
        lastScrolled = next;
        headerRef.current?.setAttribute('data-scrolled', next ? 'true' : 'false');
      }
    };

    const onScroll = () => {
      if (rafId === null) {
        rafId = window.requestAnimationFrame(applyScrollState);
      }
    };

    applyScrollState();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, []);

  // Center the active tab in the mobile/tablet quick-navigation rail on route transitions
  useEffect(() => {
    setOpenDesktopDropdown(null);
    const container = quickNavRef.current;
    if (!container) return;
    const activeChip = container.querySelector<HTMLElement>(
      '[data-active-quick-link="true"]'
    );
    if (activeChip && container.scrollWidth > container.clientWidth) {
      const targetLeft =
        activeChip.offsetLeft -
        container.clientWidth / 2 +
        activeChip.offsetWidth / 2;
      container.scrollTo({
        left: Math.max(0, targetLeft),
        behavior: 'auto',
      });
    }
  }, [currentPath]);

  const handleOpenDropdown = (path: '/books' | '/vachankatta') => {
    if (dropdownTimerRef.current !== null) {
      window.clearTimeout(dropdownTimerRef.current);
      dropdownTimerRef.current = null;
    }
    setOpenDesktopDropdown(path);
  };

  const handleScheduleCloseDropdown = () => {
    if (dropdownTimerRef.current !== null) {
      window.clearTimeout(dropdownTimerRef.current);
    }
    dropdownTimerRef.current = window.setTimeout(() => {
      setOpenDesktopDropdown(null);
    }, 140);
  };

  const handleDrawerDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (info.offset.x > 68 || info.velocity.x > 360) {
      setMobileMenuOpen(false);
    }
  };

  const handleDrawerTouchStart = (e: React.TouchEvent<HTMLElement>) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    drawerTouchRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
      trackingHorizontal: null,
    };
  };

  const handleDrawerTouchMove = (e: React.TouchEvent<HTMLElement>) => {
    const state = drawerTouchRef.current;
    if (!state || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - state.startX;
    const deltaY = touch.clientY - state.startY;

    if (state.trackingHorizontal === null) {
      if (Math.abs(deltaX) < 8 && Math.abs(deltaY) < 8) return;
      state.trackingHorizontal = Math.abs(deltaX) > Math.abs(deltaY) * 1.2;
    }
  };

  const handleDrawerTouchEnd = (e: React.TouchEvent<HTMLElement>) => {
    const state = drawerTouchRef.current;
    drawerTouchRef.current = null;
    if (!state || e.changedTouches.length === 0) return;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - state.startX;
    const deltaY = touch.clientY - state.startY;
    const elapsed = Math.max(1, Date.now() - state.startTime);
    const velocityX = (deltaX / elapsed) * 1000;

    if (
      state.trackingHorizontal &&
      Math.abs(deltaX) > Math.abs(deltaY) * 1.15 &&
      (deltaX > 68 || velocityX > 380)
    ) {
      setMobileMenuOpen(false);
    }
  };

  const handleEdgeSwipeStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 1 || immersiveHidden || mobileMenuOpen) return;
    const touch = e.touches[0];
    edgeSwipeRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
    };
  };

  const handleEdgeSwipeEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const state = edgeSwipeRef.current;
    edgeSwipeRef.current = null;
    if (!state || e.changedTouches.length === 0) return;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - state.startX;
    const deltaY = touch.clientY - state.startY;
    const elapsed = Math.max(1, Date.now() - state.startTime);
    const velocityX = (deltaX / elapsed) * 1000;

    if (
      deltaX < -36 &&
      Math.abs(deltaX) > Math.abs(deltaY) * 1.25 &&
      (deltaX < -48 || velocityX < -280)
    ) {
      setMobileMenuOpen(true);
    }
  };

  const navItems = [
    { label: lang === 'mr' ? 'मुख्यपृष्ठ' : 'Home', path: '/' },
    { label: t.nav.books, path: '/books' },
    { label: t.nav.vachankatta, path: '/vachankatta' },
    { label: t.nav.authors, path: '/authors' },
    { label: t.nav.about, path: '/about' },
    { label: t.nav.submitManuscript, path: '/submit-manuscript' },
    { label: t.nav.contact, path: '/contact' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/';
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
        ref={headerRef}
        data-testid="primary-navbar"
        data-scrolled="false"
        data-immersive-hidden={immersiveHidden ? 'true' : 'false'}
        aria-hidden={immersiveHidden ? true : undefined}
        className={`akath-navbar-header sticky top-0 z-50 text-[#1C1917] w-full bg-[#FAF9FF]/98 border-b border-[#E5DEC9]/75 transition-[background-color,box-shadow,transform,opacity] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          immersiveHidden
            ? '-translate-y-full opacity-0 pointer-events-none'
            : 'opacity-100'
        }`}
      >
        <div className="max-w-[1380px] mx-auto px-3 sm:px-6 lg:px-8">
          {/* =================================================================
              MAIN LIGHTWEIGHT GLASSMORPHIC HEADER ROW (DESKTOP lg+)
              Zone 1: Brand Identity | Zone 2: Nav Links + Mega-Popovers | Zone 3: Utilities
              ================================================================= */}
          <div className="min-h-[58px] sm:min-h-[64px] py-1.5 flex items-center justify-between gap-2 sm:gap-3 lg:gap-5">
            {/* ZONE 1: Brand Identity */}
            <button
              type="button"
              onClick={() => handleNav('/')}
              className="group flex items-center gap-2.5 text-left focus:outline-none shrink-0 cursor-pointer"
              aria-label={
                lang === 'mr'
                  ? 'अकथ प्रकाशन — मुख्यपृष्ठ'
                  : 'Akath Prakashan — Home'
              }
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 border border-[#DCD4C0] group-hover:border-[#243B8A] group-hover:scale-105 flex items-center justify-center p-0.5 transition-all duration-200 shrink-0 shadow-xs">
                <AnimatedTortoiseEmblem
                  className="w-8 h-8 sm:w-9 sm:h-9 shrink-0"
                  variant="indigo"
                  animate={true}
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif not-italic text-[17.5px] sm:text-[19.5px] font-semibold text-[#1C1917] group-hover:text-[#243B8A] transition-colors leading-none tracking-tight whitespace-nowrap">
                  अकथ प्रकाशन
                </span>
                <span className="mt-1 text-[9px] sm:text-[9.5px] font-mono uppercase tracking-[0.16em] text-[#57534E] whitespace-nowrap">
                  {lang === 'mr'
                    ? 'मराठी प्रकाशन संस्था'
                    : 'PUBLISHING HOUSE'}
                </span>
              </div>
            </button>

            {/* ZONE 2 (DESKTOP lg+): Clean Lightweight Navigation + Interactive Mega-Dropdowns */}
            <nav
              aria-label={
                lang === 'mr' ? 'मुख्य नेव्हिगेशन' : 'Primary Navigation'
              }
              className="hidden lg:flex items-center gap-0.5 xl:gap-1 relative"
            >
              {navItems.map((item) => {
                const active = isActive(item.path);
                const hasDropdown =
                  item.path === '/books' || item.path === '/vachankatta';
                const isDropdownOpen = openDesktopDropdown === item.path;

                if (hasDropdown) {
                  return (
                    <div
                      key={item.path}
                      className="relative"
                      onMouseEnter={() =>
                        handleOpenDropdown(
                          item.path as '/books' | '/vachankatta'
                        )
                      }
                      onMouseLeave={handleScheduleCloseDropdown}
                    >
                      <button
                        type="button"
                        onClick={() => handleNav(item.path)}
                        aria-current={active ? 'page' : undefined}
                        aria-expanded={isDropdownOpen}
                        className={`relative px-2.5 xl:px-3 py-1.5 rounded-full text-[13px] xl:text-[13.5px] transition-colors whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center gap-1 ${
                          active || isDropdownOpen
                            ? 'text-[#243B8A] font-semibold bg-[#243B8A]/[0.06]'
                            : 'text-[#292524] font-medium hover:text-[#243B8A] hover:bg-[#243B8A]/[0.04]'
                        }`}
                      >
                        <span>{item.label}</span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 opacity-65 transition-transform duration-200 ${
                            isDropdownOpen ? 'rotate-180 text-[#243B8A]' : ''
                          }`}
                        />
                        {active && (
                          <motion.span
                            layoutId="akath-active-nav-pill"
                            className="absolute left-3 right-3 bottom-0.5 h-[2px] rounded-full bg-[#243B8A]"
                            transition={{
                              type: 'spring',
                              stiffness: 400,
                              damping: 34,
                            }}
                          />
                        )}
                      </button>

                      {/* Smooth Frosted Glass Mega-Popover */}
                      <AnimatePresence>
                        {isDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 8, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 6, scale: 0.98 }}
                            transition={{
                              duration: 0.18,
                              ease: [0.16, 1, 0.3, 1],
                            }}
                            onMouseEnter={() =>
                              handleOpenDropdown(
                                item.path as '/books' | '/vachankatta'
                              )
                            }
                            onMouseLeave={handleScheduleCloseDropdown}
                            className="absolute left-0 top-full mt-2 w-[310px] rounded-2xl bg-[#FFFDF7] border border-[#DCD4C0] shadow-[0_24px_48px_-14px_rgba(36,59,138,0.18)] p-3 z-50 space-y-1.5"
                          >
                            {item.path === '/books' ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleNav('/books')}
                                  className="w-full px-3 py-2.5 rounded-xl hover:bg-[#FAF6EC] text-left flex items-center justify-between transition-colors cursor-pointer group"
                                >
                                  <div>
                                    <p className="text-xs font-semibold text-[#243B8A]">
                                      {lang === 'mr'
                                        ? 'संपूर्ण ग्रंथसूची पहा'
                                        : 'Explore Full Catalogue'}
                                    </p>
                                    <p className="text-[11px] text-[#57534E]">
                                      {lang === 'mr'
                                        ? 'सर्व प्रकाशित आवृत्त्या व तपशील'
                                        : 'All published editions & details'}
                                    </p>
                                  </div>
                                  <ArrowUpRight className="w-4 h-4 text-[#243B8A] opacity-60 group-hover:opacity-100" />
                                </button>
                                <div className="h-px bg-[#E5DEC9]" />
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleNav('/books/scholar-juice')
                                  }
                                  className="w-full px-3 py-2 rounded-xl hover:bg-[#FAF6EC] text-left flex items-center gap-2.5 transition-colors cursor-pointer"
                                >
                                  <BookOpen className="w-3.5 h-3.5 text-[#EF6855] shrink-0" />
                                  <span className="text-xs font-medium text-[#1C1917] truncate">
                                    {lang === 'mr'
                                      ? 'स्कॉलर ज्यूस · जी. के. ऐनापुरे'
                                      : 'Scholar Juice · G. K. Ainapure'}
                                  </span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleNav('/books/dhukyachi-dulai')
                                  }
                                  className="w-full px-3 py-2 rounded-xl hover:bg-[#FAF6EC] text-left flex items-center gap-2.5 transition-colors cursor-pointer"
                                >
                                  <BookOpen className="w-3.5 h-3.5 text-[#174D3A] shrink-0" />
                                  <span className="text-xs font-medium text-[#1C1917] truncate">
                                    {lang === 'mr'
                                      ? 'धुक्याची दुलई · अनुरत्न वाघमारे'
                                      : 'Dhukyachi Dulai · Anuratna Waghmare'}
                                  </span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleNav(
                                      '/books/lokshahimadhye-samajmadhyamancha-vapar'
                                    )
                                  }
                                  className="w-full px-3 py-2 rounded-xl hover:bg-[#FAF6EC] text-left flex items-center gap-2.5 transition-colors cursor-pointer"
                                >
                                  <BookOpen className="w-3.5 h-3.5 text-[#243B8A] shrink-0" />
                                  <span className="text-xs font-medium text-[#1C1917] truncate">
                                    {lang === 'mr'
                                      ? 'लोकशाहीमध्ये समाजमाध्यमांचा वापर'
                                      : 'Social Media in Democracy'}
                                  </span>
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleNav('/vachankatta/first-page')
                                  }
                                  className="w-full px-3 py-2 rounded-xl hover:bg-[#FAF6EC] text-left flex items-center justify-between transition-colors cursor-pointer"
                                >
                                  <div className="flex items-center gap-2.5">
                                    <Sparkles className="w-3.5 h-3.5 text-[#EF6855]" />
                                    <span className="text-xs font-medium text-[#1C1917]">
                                      {lang === 'mr'
                                        ? 'पहिलं पान · उतारे व PDF'
                                        : 'First Page Excerpts & PDFs'}
                                    </span>
                                  </div>
                                  <ArrowUpRight className="w-3.5 h-3.5 text-[#57534E]" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleNav('/vachankatta/articles')
                                  }
                                  className="w-full px-3 py-2 rounded-xl hover:bg-[#FAF6EC] text-left flex items-center justify-between transition-colors cursor-pointer"
                                >
                                  <div className="flex items-center gap-2.5">
                                    <FileText className="w-3.5 h-3.5 text-[#243B8A]" />
                                    <span className="text-xs font-medium text-[#1C1917]">
                                      {lang === 'mr'
                                        ? 'संपादकीय लेख'
                                        : 'Editorial Essays'}
                                    </span>
                                  </div>
                                  <ArrowUpRight className="w-3.5 h-3.5 text-[#57534E]" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleNav('/vachankatta/reading-lists')
                                  }
                                  className="w-full px-3 py-2 rounded-xl hover:bg-[#FAF6EC] text-left flex items-center justify-between transition-colors cursor-pointer"
                                >
                                  <div className="flex items-center gap-2.5">
                                    <BookOpen className="w-3.5 h-3.5 text-[#174D3A]" />
                                    <span className="text-xs font-medium text-[#1C1917]">
                                      {lang === 'mr'
                                        ? 'वाचन याद्या'
                                        : 'Curated Reading Lists'}
                                    </span>
                                  </div>
                                  <ArrowUpRight className="w-3.5 h-3.5 text-[#57534E]" />
                                </button>
                              </>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }

                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => handleNav(item.path)}
                    aria-current={active ? 'page' : undefined}
                    className={`relative px-2.5 xl:px-3 py-1.5 rounded-full text-[13px] xl:text-[13.5px] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      active
                        ? 'text-[#243B8A] font-semibold bg-[#243B8A]/[0.06]'
                        : 'text-[#292524] font-medium hover:text-[#243B8A] hover:bg-[#243B8A]/[0.04]'
                    }`}
                  >
                    <span>{item.label}</span>
                    {active && (
                      <motion.span
                        layoutId="akath-active-nav-pill"
                        className="absolute left-3 right-3 bottom-0.5 h-[2px] rounded-full bg-[#243B8A]"
                        transition={{
                          type: 'spring',
                          stiffness: 400,
                          damping: 34,
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* ZONE 3: Right Utility & Action Cluster (Lightweight Pill Controls) */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Search Trigger */}
              <button
                type="button"
                onClick={onOpenSearch}
                aria-label={t.nav.searchAria}
                data-testid="navbar-search-btn"
                className="inline-flex items-center justify-center gap-1.5 min-h-[36px] px-2.5 py-1.5 rounded-full bg-white/80 hover:bg-[#FAF6EC] border border-[#DCD4C0] hover:border-[#243B8A] text-[#1C1917] text-[12px] font-medium transition-colors shrink-0 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5 text-[#243B8A] shrink-0" />
                <span className="hidden xl:inline max-w-[96px] truncate text-[#57534E]">
                  {t.nav.search}
                </span>
                <kbd className="hidden 2xl:inline-block px-1.5 py-0.5 rounded-full text-[9.5px] font-mono bg-[#FAF6EC] border border-[#DCD4C0] text-[#57534E]">
                  ⌘K
                </kbd>
              </button>

              {/* Language Switcher — Smooth Archival Segmented Toggle */}
              <div
                role="group"
                aria-label={lang === 'mr' ? 'भाषा निवडा' : 'Select language'}
                data-testid="desktop-lang-switcher"
                className="hidden sm:inline-flex items-center rounded-lg bg-[#FAF6EC] p-0.5 border border-[#DCD4C0] shrink-0"
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
                      data-testid={`lang-btn-${item.code}`}
                      className={`px-2 py-1 rounded-md text-[11px] font-mono font-bold transition-colors whitespace-nowrap cursor-pointer ${
                        active
                          ? 'bg-[#243B8A] text-[#FFFDF7]'
                          : 'text-[#57534E] hover:text-[#1C1917]'
                      }`}
                    >
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Sign In / Auth Pill Button */}
              {user ? (
                <div className="hidden md:flex items-center gap-1.5 shrink-0">
                  {user.role === 'admin' && (
                    <button
                      type="button"
                      data-testid="navbar-admin-link"
                      onClick={() => handleNav('/admin')}
                      className={`px-2.5 py-1.5 rounded-full text-[11.5px] font-semibold inline-flex items-center gap-1.5 border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        currentPath.startsWith('/admin')
                          ? 'bg-[#243B8A] text-[#FFFDF7] border-[#243B8A]'
                          : 'bg-white/80 hover:border-[#243B8A] text-[#243B8A] border-[#DCD4C0]'
                      }`}
                    >
                      <Shield className="w-3.5 h-3.5 shrink-0" />
                      <span className="hidden xl:inline">
                        {lang === 'mr' ? 'प्रशासक' : 'Admin'}
                      </span>
                    </button>
                  )}

                  {(user.role === 'author' || user.role === 'admin') && (
                    <button
                      type="button"
                      data-testid="navbar-author-link"
                      onClick={() => handleNav('/author/dashboard')}
                      className={`px-2.5 py-1.5 rounded-full text-[11.5px] font-semibold inline-flex items-center gap-1.5 border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        currentPath.startsWith('/author')
                          ? 'bg-[#243B8A] text-[#FFFDF7] border-[#243B8A]'
                          : 'bg-white/80 hover:border-[#243B8A] text-[#1C1917] border-[#DCD4C0]'
                      }`}
                    >
                      <Feather className="w-3.5 h-3.5 text-[#EF6855] shrink-0" />
                      <span className="hidden 2xl:inline">
                        {lang === 'mr' ? 'लेखक दालन' : 'Studio'}
                      </span>
                    </button>
                  )}

                  <button
                    type="button"
                    data-testid="navbar-account-btn"
                    onClick={() => handleNav('/account')}
                    className={`px-2.5 py-1.5 rounded-full text-[11.5px] font-semibold inline-flex items-center gap-1.5 border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      currentPath.startsWith('/account')
                        ? 'bg-[#243B8A] text-[#FFFDF7] border-[#243B8A]'
                        : 'bg-white/80 hover:border-[#243B8A] text-[#1C1917] border-[#DCD4C0]'
                    }`}
                  >
                    <User className="w-3.5 h-3.5 text-[#243B8A] shrink-0" />
                    <span className="max-w-[76px] truncate">
                      {user.name.split(' ')[0]}
                    </span>
                  </button>

                  {onLogout && (
                    <button
                      type="button"
                      data-testid="navbar-logout-btn"
                      onClick={() => onLogout()}
                      title={lang === 'mr' ? 'लॉगआउट' : 'Sign Out'}
                      aria-label={lang === 'mr' ? 'लॉगआउट' : 'Sign Out'}
                      className="p-1.5 rounded-full bg-white/80 hover:bg-[#EF6855] text-[#1C1917] hover:text-[#FFFDF7] border border-[#DCD4C0] transition-colors shrink-0 cursor-pointer"
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
                  className={`hidden md:inline-flex min-h-[36px] px-3 py-1.5 rounded-full text-[12px] font-medium items-center gap-1.5 border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    currentPath === '/login' || currentPath === '/register'
                      ? 'bg-[#1C1917] text-[#FFFDF7] border-[#1C1917]'
                      : 'bg-white/80 hover:border-[#243B8A] text-[#1C1917] hover:text-[#243B8A] border-[#DCD4C0]'
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-[#243B8A] shrink-0" />
                  <span>{lang === 'mr' ? 'लॉगिन' : 'Sign In'}</span>
                </button>
              )}

              {/* Cart Button — Lightweight Rounded Pill Primary Button */}
              <button
                type="button"
                onClick={() => handleNav('/cart')}
                aria-label={`${t.nav.cart} (${cartCount})`}
                data-testid="navbar-cart-btn"
                className="relative inline-flex items-center gap-1.5 min-h-[36px] px-3.5 py-1.5 rounded-full bg-[#243B8A] hover:bg-[#1B2D6B] text-[#FFFDF7] text-[12px] font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-[#FFD966] shrink-0" />
                <span className="hidden sm:inline">{t.nav.cart}</span>
                <motion.span
                  data-testid="navbar-cart-count"
                  data-cart-pop={isCartPopping ? 'true' : 'false'}
                  animate={
                    isCartPopping
                      ? { scale: [1, 1.34, 0.92, 1.06, 1], y: [0, -2, 0] }
                      : { scale: 1, y: 0 }
                  }
                  transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
                  className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-mono font-bold tabular-nums transition-colors ${
                    isCartPopping
                      ? 'bg-[#EF6855] text-[#FFFDF7]'
                      : 'bg-[#FFD966] text-[#1C1917]'
                  }`}
                >
                  {cartCount}
                </motion.span>
              </button>

              {/* Mobile & Tablet Menu Toggle (<lg) with Smooth Icon State Transition */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                aria-expanded={mobileMenuOpen}
                aria-controls="akath-mobile-drawer"
                data-menu-state={mobileMenuOpen ? 'open' : 'closed'}
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
                className={`lg:hidden inline-flex items-center gap-1.5 min-h-[36px] px-2.5 py-1.5 rounded-lg border transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] shrink-0 cursor-pointer ${
                  mobileMenuOpen
                    ? 'bg-[#1C1917] text-[#FFFDF7] border-[#1C1917]'
                    : 'bg-[#FAF6EC] border-[#DCD4C0] text-[#1C1917] hover:border-[#243B8A]'
                }`}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {mobileMenuOpen ? (
                    <motion.span
                      key="menu-close-icon"
                      initial={{ rotate: -65, opacity: 0, scale: 0.8 }}
                      animate={{ rotate: 0, opacity: 1, scale: 1 }}
                      exit={{ rotate: 65, opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                      className="inline-flex items-center justify-center"
                    >
                      <X className="w-4 h-4 text-[#FFD966]" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="menu-open-icon"
                      initial={{ rotate: 65, opacity: 0, scale: 0.8 }}
                      animate={{ rotate: 0, opacity: 1, scale: 1 }}
                      exit={{ rotate: -65, opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                      className="inline-flex items-center justify-center"
                    >
                      <Menu className="w-4 h-4 text-[#243B8A]" />
                    </motion.span>
                  )}
                </AnimatePresence>
                <span className="hidden sm:inline text-[11.5px] font-semibold">
                  {lang === 'mr' ? 'मेनू' : 'Menu'}
                </span>
              </button>
            </div>
          </div>

          {/* =================================================================
              MOBILE & TABLET (<lg) COMPACT SWIPEABLE QUICK-NAV RAIL
              ================================================================= */}
          <div className="lg:hidden flex items-center justify-between gap-2 py-1.5 border-t border-[#E5DEC9]">
            {/* Mobile (<sm) Language Switcher */}
            <div className="flex sm:hidden items-center gap-1 shrink-0">
              <div
                role="group"
                aria-label={lang === 'mr' ? 'भाषा निवडा' : 'Select language'}
                className="inline-flex items-center rounded-lg bg-[#FAF6EC] p-0.5 border border-[#DCD4C0]"
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
                      className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#243B8A] text-[#FFFDF7]'
                          : 'text-[#57534E]'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Horizontal Swipeable Quick Navigation Links */}
            <nav
              ref={quickNavRef}
              aria-label={
                lang === 'mr' ? 'द्रुत दुवे' : 'Quick Navigation'
              }
              data-testid="mobile-tablet-quick-nav"
              className="akath-swipe-rail snap-x snap-mandatory flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 min-w-0 flex-1 justify-start md:justify-end"
            >
              {navItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <button
                    key={item.path}
                    type="button"
                    data-active-quick-link={active ? 'true' : 'false'}
                    onClick={() => handleNav(item.path)}
                    className={`snap-center px-2.5 py-1 rounded-md text-[11px] sm:text-[11.5px] transition-colors whitespace-nowrap shrink-0 cursor-pointer border ${
                      active
                        ? 'bg-[#243B8A] text-[#FFFDF7] border-[#243B8A] font-semibold'
                        : 'bg-[#FAF6EC] text-[#292524] border-[#E5DEC9] hover:border-[#243B8A]'
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

      {/* Right-Edge Touch Swipe-to-Open Sensor Strip on Mobile & Tablet */}
      {!mobileMenuOpen && !immersiveHidden && (
        <div
          data-testid="mobile-edge-swipe-zone"
          aria-hidden="true"
          onTouchStart={handleEdgeSwipeStart}
          onTouchEnd={handleEdgeSwipeEnd}
          className="fixed top-20 right-0 bottom-16 w-3 z-40 lg:hidden touch-pan-y select-none"
        />
      )}

      {/* =====================================================================
          MOBILE & TABLET SLIDE-IN ARCHIVAL DRAWER (RENDERED OUTSIDE <header>)
          Uses synchronized Motion variants (drawerBackdropVariants & drawerPanelVariants)
          and a decoupled inner scroll container so open/close transitions are smooth.
          ===================================================================== */}
      <AnimatePresence mode="wait">
        {mobileMenuOpen && (
          <div
            key="akath-mobile-drawer-layer"
            data-testid="navbar-mobile-drawer-overlay"
            data-state={mobileMenuOpen ? 'open' : 'closed'}
            className="fixed inset-0 z-[100] lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label={lang === 'mr' ? 'मोबाईल नेव्हिगेशन मेनू' : 'Navigation Menu'}
          >
            {/* Archival Paper Frosted-Glass Backdrop Overlay (Smooth Fade In/Out) */}
            <motion.div
              variants={drawerBackdropVariants}
              initial="closed"
              animate="open"
              exit="closed"
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 archival-frosted-overlay"
              aria-hidden="true"
            />

            {/* Right-to-Left Slide-In Archival Paper Drawer */}
            <motion.nav
              id="akath-mobile-drawer"
              data-testid="navbar-mobile-drawer"
              data-touch-gesture="swipe-right-to-close"
              variants={drawerPanelVariants}
              initial="closed"
              animate="open"
              exit="closed"
              drag="x"
              dragConstraints={{ left: 0, right: 380 }}
              dragDirectionLock={true}
              dragElastic={{ left: 0.02, right: 0.45 }}
              onDragEnd={handleDrawerDragEnd}
              className="fixed top-0 right-0 bottom-0 h-[100dvh] max-h-[100dvh] w-[90vw] max-w-[360px] rounded-l-xl archival-drawer-surface bg-[#FAF6EC] text-[#1C1917] border-l border-[#DCD4C0] flex flex-col overflow-hidden z-10 shadow-2xl"
            >
              {/* Left-Edge Tactile Grab Handle */}
              <div
                data-testid="mobile-drawer-drag-handle"
                aria-hidden="true"
                onTouchStart={handleDrawerTouchStart}
                onTouchMove={handleDrawerTouchMove}
                onTouchEnd={handleDrawerTouchEnd}
                title={
                  lang === 'mr'
                    ? 'मेनू बंद करण्यासाठी उजवीकडे स्वाइप करा'
                    : 'Swipe right to close drawer'
                }
                className="absolute left-1.5 top-1/2 -translate-y-1/2 z-30 flex items-center justify-center w-3 h-16 pointer-events-auto"
              >
                <span className="w-1 h-12 rounded-full bg-[#243B8A]/25" />
              </div>

              {/* Pinned Drawer Header */}
              <div className="shrink-0 p-4 sm:p-5 border-b border-[#DCD4C0] flex items-center justify-between bg-[#FFFDF7] text-[#1C1917] z-20">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#FAF6EC] border border-[#DCD4C0] flex items-center justify-center p-0.5 shrink-0">
                    <AnimatedTortoiseEmblem
                      className="w-8 h-8 shrink-0"
                      variant="indigo"
                      animate={true}
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="font-serif not-italic text-[18px] font-extrabold text-[#1C1917] block leading-tight truncate">
                      अकथ प्रकाशन
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#57534E] block truncate">
                      {lang === 'mr'
                        ? 'मराठी प्रकाशन संस्था · नांदेड'
                        : 'AKATH PRAKASHAN · NANDED'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  data-testid="navbar-mobile-drawer-close"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label={lang === 'mr' ? 'मेनू बंद करा' : 'Close menu'}
                  className="p-2 rounded-lg bg-[#FAF6EC] border border-[#DCD4C0] text-[#1C1917] hover:border-[#243B8A] transition-colors shrink-0 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Drawer Body (Decoupled from outer drag container for smooth touch scrolling) */}
              <div className="shrink-0 p-4 sm:p-5 space-y-4 flex-1 overflow-y-auto overscroll-contain">
                {/* Language Switcher inside Drawer */}
                <motion.div
                  variants={drawerItemVariants}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#FFFDF7] border border-[#DCD4C0]"
                >
                  <span className="text-[12px] font-semibold text-[#1C1917] inline-flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-[#243B8A]" />
                    <span>{lang === 'mr' ? 'भाषा निवडा' : 'Language'}</span>
                  </span>
                  <div className="inline-flex rounded-lg bg-[#FAF6EC] p-0.5 border border-[#DCD4C0]">
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
                          className={`px-3 py-1 rounded-md text-[11.5px] font-semibold transition-colors cursor-pointer ${
                            active
                              ? 'bg-[#243B8A] text-[#FFFDF7]'
                              : 'text-[#57534E] hover:text-[#1C1917]'
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>

                {/* Primary Navigation Links (Smooth Staggered Items) */}
                <motion.div variants={drawerItemVariants} className="space-y-2">
                  {navItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                      <button
                        key={item.path}
                        type="button"
                        data-testid={`mobile-drawer-link-${item.path}`}
                        onClick={() => handleNav(item.path)}
                        aria-current={active ? 'page' : undefined}
                        className={`w-full px-4 py-3 rounded-lg text-left text-[14.5px] flex items-center justify-between border transition-colors cursor-pointer ${
                          active
                            ? 'bg-[#243B8A] text-[#FFFDF7] border-[#243B8A] font-semibold'
                            : 'bg-[#FFFDF7] text-[#1C1917] border-[#E5DEC9] hover:border-[#243B8A]'
                        }`}
                      >
                        <span>{item.label}</span>
                        <ArrowUpRight className="w-4 h-4 opacity-70 shrink-0" />
                      </button>
                    );
                  })}
                </motion.div>

                {/* Secondary Actions: Track Order + Account / Auth */}
                <motion.div
                  variants={drawerItemVariants}
                  className="pt-3 border-t border-[#DCD4C0] grid grid-cols-1 gap-2"
                >
                  <button
                    type="button"
                    onClick={() => handleNav('/track-order')}
                    className="px-4 py-2.5 rounded-lg bg-[#FFFDF7] border border-[#DCD4C0] text-[13.5px] font-medium text-[#1C1917] hover:border-[#243B8A] flex items-center justify-between transition-colors cursor-pointer"
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
                        className="px-4 py-2.5 rounded-lg bg-[#243B8A] text-[#FFFDF7] text-[13.5px] font-semibold flex items-center justify-between cursor-pointer"
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
                          className="px-4 py-2.5 rounded-lg bg-[#FFFDF7] border border-[#DCD4C0] text-[13.5px] font-semibold text-[#243B8A] flex items-center justify-between cursor-pointer"
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
                          className="px-4 py-2.5 rounded-lg bg-[#FFD966] text-[#1C1917] text-[13.5px] font-bold flex items-center justify-between cursor-pointer"
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
                      className="px-4 py-2.5 rounded-lg bg-[#EF6855] text-[#FFFDF7] text-[13.5px] font-semibold flex items-center justify-between cursor-pointer"
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
                </motion.div>
              </div>

              {/* Pinned Drawer Footer Colophon */}
              <div className="shrink-0 p-4 border-t border-[#DCD4C0] bg-[#FFFDF7] text-[11.5px] font-mono text-[#57534E] flex items-center justify-between z-20">
                <span>© अकथ प्रकाशन</span>
                <span className="text-[#243B8A] font-semibold">
                  {lang === 'mr' ? 'मराठी साहित्य विश्व' : 'Marathi Publishing House'}
                </span>
              </div>
            </motion.nav>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
