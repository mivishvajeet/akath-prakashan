import React, { useState, useEffect, useCallback } from 'react';
import {
  BookRecord,
  AuthorRecord,
  EditorialArticle,
  FirstPageExcerpt,
  ReadingList,
  CartItemInput,
  CartQuoteResponse,
  OrderRecord,
  ManuscriptSubmission,
  PublicUserProfile,
} from './types/publishing';
import { LanguageContext, TRANSLATIONS } from './i18n/translations';
import { AppLanguage } from './utils/validation';
import { getGitHubPagesBasePath } from './utils/githubPagesAdapter';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SearchModal } from './components/SearchModal';
import { HomeView } from './views/HomeView';
import { BooksCatalogueView, BookDetailView } from './views/BooksAndStoreView';
import { VachankattaHubView, ArticleDetailView } from './views/VachankattaView';
import {
  AuthorsListView,
  AuthorDetailView,
  AboutAkathView,
  SubmitManuscriptView,
  ContactView,
} from './views/PublishingHouseViews';
import {
  CartView,
  CheckoutView,
  OrderTrackingView,
  PolicyDocumentView,
} from './views/CommerceAndPolicyViews';
import { AdminDashboardView, TechnicalAuditView } from './views/AdminAndAuditViews';
import {
  AuthPageView,
  ReaderAccountView,
  AuthorPortalView,
  authFetch,
  setAuthSessionTokens,
} from './views/AuthAndRoleViews';

const CART_STORAGE_KEY = 'akath_cart_v1';
const LANG_STORAGE_KEY = 'akath_lang_v1';

function loadInitialCart(): CartItemInput[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) =>
        item &&
        typeof item.bookId === 'string' &&
        typeof item.quantity === 'number' &&
        item.quantity >= 1
    );
  } catch {
    return [];
  }
}

function loadInitialLang(): AppLanguage {
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    return saved === 'en' ? 'en' : 'mr';
  } catch {
    return 'mr';
  }
}

export default function App() {
  const [lang, setLangState] = useState<AppLanguage>(loadInitialLang);
  const [currentPath, setCurrentPath] = useState<string>(() => {
    const base = getGitHubPagesBasePath();
    const rawPath = window.location.pathname || '/';
    if (base && rawPath.startsWith(base)) {
      return rawPath.slice(base.length) || '/';
    }
    return rawPath;
  });
  const [searchOpen, setSearchOpen] = useState(false);

  // Authentication & Session state
  const [authUser, setAuthUser] = useState<PublicUserProfile | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  const [books, setBooks] = useState<BookRecord[]>([]);
  const [authors, setAuthors] = useState<AuthorRecord[]>([]);
  const [articles, setArticles] = useState<EditorialArticle[]>([]);
  const [excerpts, setExcerpts] = useState<FirstPageExcerpt[]>([]);
  const [readingLists, setReadingLists] = useState<ReadingList[]>([]);
  const [loadingBootstrap, setLoadingBootstrap] = useState(true);

  const [cartItems, setCartItems] = useState<CartItemInput[]>(loadInitialCart);
  const [cartQuote, setCartQuote] = useState<CartQuoteResponse | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [recentlyAddedBookId, setRecentlyAddedBookId] = useState<string | null>(null);
  const [isImmersiveNavHidden, setIsImmersiveNavHidden] = useState(false);

  // Sync HTML lang attribute and localStorage when language changes
  const setLang = useCallback((nextLang: AppLanguage) => {
    setLangState(nextLang);
    document.documentElement.lang = nextLang;
    try {
      localStorage.setItem(LANG_STORAGE_KEY, nextLang);
    } catch {
      // Ignore storage quota errors
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // History popstate listener
  useEffect(() => {
    const onPopState = () => {
      const base = getGitHubPagesBasePath();
      const rawPath = window.location.pathname || '/';
      if (base && rawPath.startsWith(base)) {
        setCurrentPath(rawPath.slice(base.length) || '/');
      } else {
        setCurrentPath(rawPath);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = useCallback((path: string) => {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const base = getGitHubPagesBasePath();
    const fullHistoryPath =
      base && cleanPath === '/'
        ? `${base}/`
        : base
          ? `${base}${cleanPath}`
          : cleanPath;
    window.history.pushState({}, '', fullHistoryPath);
    const [pathnameOnly] = cleanPath.split('?');
    setCurrentPath(pathnameOnly || '/');
    setIsImmersiveNavHidden(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Fetch initial publishing bootstrap data
  const fetchBootstrap = useCallback(async () => {
    try {
      const res = await fetch('/api/bootstrap');
      if (res.ok) {
        const data = await res.json();
        setBooks(data.books || []);
        setAuthors(data.authors || []);
        setArticles(data.articles || []);
        setExcerpts(data.excerpts || []);
        setReadingLists(data.readingLists || []);
      }
    } finally {
      setLoadingBootstrap(false);
    }
  }, []);

  // Fetch current authenticated user session on mount
  const fetchAuthSession = useCallback(async () => {
    try {
      const res = await authFetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setAuthUser(data.user || null);
        if (data.csrfToken) {
          setCsrfToken(data.csrfToken);
        }
      }
    } catch {
      // Ignore network error
    }
  }, []);

  useEffect(() => {
    fetchBootstrap();
    fetchAuthSession();
  }, [fetchBootstrap, fetchAuthSession]);

  const handleAuthSuccess = useCallback(
    (payload: {
      user: PublicUserProfile;
      sessionToken?: string | null;
      csrfToken: string | null;
      mergedCart?: CartItemInput[];
      redirectTo?: string;
    }) => {
      if (payload.sessionToken !== undefined) {
        setAuthSessionTokens(payload.sessionToken, payload.csrfToken);
      }
      setAuthUser(payload.user);
      setCsrfToken(payload.csrfToken);
      if (Array.isArray(payload.mergedCart) && payload.mergedCart.length > 0) {
        setCartItems(payload.mergedCart);
      }
      navigate(payload.redirectTo || '/account');
    },
    [navigate]
  );

  const handleQuickPersonaSwitch = useCallback(
    async (
      persona: 'reader' | 'author' | 'admin' | 'guest',
      targetPath?: string
    ) => {
      if (persona === 'guest') {
        setAuthSessionTokens(null, null);
        setAuthUser(null);
        setCsrfToken(null);
        navigate(targetPath || '/');
        return;
      }
      try {
        const res = await fetch('/api/auth/sandbox-persona', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ persona }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setAuthSessionTokens(
              data.sessionToken || null,
              data.csrfToken || null
            );
            setAuthUser(data.user);
            setCsrfToken(data.csrfToken || null);
            if (Array.isArray(data.mergedCart) && data.mergedCart.length > 0) {
              setCartItems(data.mergedCart);
            }
            navigate(targetPath || data.redirectTo || '/account');
          }
        }
      } catch {
        // Ignore network error
      }
    },
    [navigate]
  );

  const handleLogout = useCallback(async () => {
    try {
      await authFetch(
        '/api/auth/logout',
        {
          method: 'POST',
        },
        csrfToken
      );
    } finally {
      setAuthSessionTokens(null, null);
      setAuthUser(null);
      setCsrfToken(null);
      navigate('/');
    }
  }, [csrfToken, navigate]);

  // Persist cartItems to localStorage and fetch authoritative server quote
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      // Ignore storage errors
    }

    let cancelled = false;
    const syncCartQuote = async () => {
      setLoadingQuote(true);
      try {
        const res = await fetch('/api/cart/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: cartItems, lang }),
        });
        if (res.ok && !cancelled) {
          const quote: CartQuoteResponse = await res.json();
          setCartQuote(quote);
        }
      } finally {
        if (!cancelled) setLoadingQuote(false);
      }
    };

    syncCartQuote();
    return () => {
      cancelled = true;
    };
  }, [cartItems, lang, books]);

  // Add to cart (merges quantities if already present, respects available stock)
  const handleAddToCart = useCallback(
    (bookId: string, addQty = 1) => {
      const qtyToAdd = Math.max(1, Math.floor(addQty));
      setCartItems((prev) => {
        const existingIndex = prev.findIndex((item) => item.bookId === bookId);
        const book = books.find((b) => b.id === bookId);
        const maxStock = book ? Math.min(book.stock, 20) : 20;
        if (maxStock <= 0) return prev;

        if (existingIndex > -1) {
          const updated = [...prev];
          const nextQty = Math.min(maxStock, updated[existingIndex].quantity + qtyToAdd);
          updated[existingIndex] = { bookId, quantity: nextQty };
          return updated;
        }
        return [...prev, { bookId, quantity: Math.min(maxStock, qtyToAdd) }];
      });

      setRecentlyAddedBookId(bookId);
      setTimeout(() => {
        setRecentlyAddedBookId((curr) => (curr === bookId ? null : curr));
      }, 1600);
    },
    [books]
  );

  // Update quantity in cart (strictly >= 1; removal uses handleRemoveCartItem)
  const handleUpdateCartQuantity = useCallback(
    (bookId: string, newQuantity: number) => {
      if (newQuantity < 1) return;
      setCartItems((prev) =>
        prev.map((item) =>
          item.bookId === bookId
            ? { ...item, quantity: Math.max(1, Math.floor(newQuantity)) }
            : item
        )
      );
    },
    []
  );

  const handleRemoveCartItem = useCallback((bookId: string) => {
    setCartItems((prev) => prev.filter((item) => item.bookId !== bookId));
  }, []);

  const handleClearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  // Excerpt reaction handler
  const handleReactExcerpt = async (
    excerptId: string,
    reactionType: 'readMore' | 'struckByLine' | 'wantContext'
  ) => {
    const res = await fetch(`/api/excerpts/${excerptId}/react`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reactionType }),
    });
    if (res.ok) {
      const data = await res.json();
      setExcerpts((prev) =>
        prev.map((ex) =>
          ex.id === excerptId ? { ...ex, reactions: data.reactions } : ex
        )
      );
    }
  };

  // Place Order handler
  const handlePlaceOrder = async (payload: {
    idempotencyKey: string;
    customer: OrderRecord['customer'];
    paymentMethod: OrderRecord['paymentMethod'];
  }) => {
    const res = await authFetch(
      '/api/orders',
      {
        method: 'POST',
        body: JSON.stringify({
          ...payload,
          items: cartItems,
          lang,
        }),
      },
      csrfToken
    );
    const data = await res.json();
    if (!res.ok) {
      return {
        ok: false,
        error: data.error,
        fieldErrors: data.fieldErrors,
      };
    }
    return { ok: true, order: data.order as OrderRecord };
  };

  // Verify Order Payment handler (calls server-side ownership-verified & HMAC-signed checkout endpoint)
  const handleVerifyPayment = async (
    orderId: string,
    outcome: 'success' | 'failed',
    guestAccessToken?: string
  ) => {
    const res = await authFetch(
      `/api/orders/${orderId}/checkout-payment`,
      {
        method: 'POST',
        headers: {
          ...(guestAccessToken
            ? { 'X-Guest-Access-Token': guestAccessToken }
            : {}),
        },
        body: JSON.stringify({ outcome, lang, guestAccessToken }),
      },
      csrfToken
    );
    const data = await res.json();
    if (!res.ok) {
      return { ok: false, error: data.error };
    }
    if (outcome === 'success') {
      setCartItems([]);
      await fetchBootstrap();
    }
    return { ok: true, order: data.order as OrderRecord };
  };

  // Order lookup handler
  const handleLookupOrder = async (orderNumber: string, contact: string) => {
    const params = new URLSearchParams({ orderNumber, contact, lang });
    const res = await fetch(`/api/orders/lookup?${params.toString()}`);
    const data = await res.json();
    if (!res.ok) {
      return { ok: false, error: data.error };
    }
    return { ok: true, order: data.order as OrderRecord };
  };

  // Newsletter subscription handler
  const handleSubscribeNewsletter = async (email: string, name?: string) => {
    const res = await fetch('/api/newsletter/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        name,
        consentConfirmed: true,
        source: currentPath,
        lang,
      }),
    });
    const data = await res.json();
    return {
      ok: res.ok,
      message: data.message || data.error || '',
    };
  };

  // Manuscript submission handler
  const handleSubmitManuscript = async (payload: Record<string, unknown>) => {
    const res = await fetch('/api/manuscripts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, lang }),
    });
    const data = await res.json();
    if (!res.ok) {
      return {
        ok: false,
        error: data.error,
        fieldErrors: data.fieldErrors,
      };
    }
    return { ok: true, submission: data.submission as ManuscriptSubmission };
  };

  // Contact submission handler
  const handleSubmitContact = async (payload: Record<string, unknown>) => {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, lang }),
    });
    const data = await res.json();
    if (!res.ok) {
      return {
        ok: false,
        error: data.error,
        fieldErrors: data.fieldErrors,
      };
    }
    return { ok: true, message: data.message, inquiry: data.inquiry };
  };

  const totalCartCount = cartQuote
    ? cartQuote.items.reduce((sum, l) => sum + l.approvedQuantity, 0)
    : cartItems.reduce((sum, i) => sum + i.quantity, 0);

  // Route matching
  const renderMainView = () => {
    if (loadingBootstrap && books.length === 0) {
      return (
        <div className="max-w-[1200px] mx-auto px-4 py-20 text-center text-[#706D65]">
          {lang === 'mr' ? 'अकथ प्रकाशन लोड होत आहे...' : 'Loading Akath Prakashan...'}
        </div>
      );
    }

    // 1. Authentication Views (/login, /register, /forgot-password, /reset-password, /verify-email)
    const authModes: Record<
      string,
      'login' | 'register' | 'forgot-password' | 'reset-password' | 'verify-email'
    > = {
      '/login': 'login',
      '/register': 'register',
      '/forgot-password': 'forgot-password',
      '/reset-password': 'reset-password',
      '/verify-email': 'verify-email',
    };

    if (authModes[currentPath]) {
      const searchParams = new URLSearchParams(window.location.search);
      const redirectParam = searchParams.get('redirect') || undefined;
      return (
        <AuthPageView
          initialMode={authModes[currentPath]}
          redirectPath={redirectParam}
          guestCart={cartItems}
          onAuthSuccess={handleAuthSuccess}
          onNavigate={navigate}
        />
      );
    }

    // 2. Reader Account Routes (/account, /account/orders, /account/wishlist, /account/addresses, /account/security)
    if (currentPath === '/account' || currentPath.startsWith('/account/')) {
      if (!authUser) {
        return (
          <AuthPageView
            initialMode="login"
            redirectPath={currentPath}
            guestCart={cartItems}
            onAuthSuccess={handleAuthSuccess}
            onNavigate={navigate}
          />
        );
      }
      const sub = currentPath.replace('/account', '').replace(/^\//, '');
      const validTabs = ['profile', 'orders', 'wishlist', 'addresses', 'security'];
      const tab = (validTabs.includes(sub) ? sub : 'profile') as
        | 'profile'
        | 'orders'
        | 'wishlist'
        | 'addresses'
        | 'security';

      return (
        <ReaderAccountView
          user={authUser}
          csrfToken={csrfToken}
          activeSubTab={tab}
          books={books}
          authors={authors}
          onUserUpdated={setAuthUser}
          onLogout={handleLogout}
          onNavigate={navigate}
          onAddToCart={(id, qty) => handleAddToCart(id, qty || 1)}
        />
      );
    }

    // 3. Author Portal & Author Application Routes (/author/apply, /author/dashboard, /author/books)
    if (currentPath === '/author' || currentPath.startsWith('/author/')) {
      if (!authUser) {
        return (
          <AuthPageView
            initialMode="login"
            redirectPath={currentPath}
            guestCart={cartItems}
            onAuthSuccess={handleAuthSuccess}
            onNavigate={navigate}
          />
        );
      }
      const sub = currentPath.replace('/author', '').replace(/^\//, '');
      const mode: 'apply' | 'dashboard' | 'books' =
        sub === 'apply' ? 'apply' : sub === 'books' ? 'books' : 'dashboard';

      return (
        <AuthorPortalView
          user={authUser}
          csrfToken={csrfToken}
          subRoute={mode}
          onNavigate={navigate}
          onRefreshCatalog={fetchBootstrap}
        />
      );
    }

    // 4. Administrator Routes (/admin, /admin/users, /admin/books, /admin/orders)
    if (currentPath === '/admin' || currentPath.startsWith('/admin/')) {
      const sub = currentPath.replace('/admin', '').replace(/^\//, '');
      const validAdminRoutes = [
        'overview',
        'users',
        'authors',
        'books',
        'orders',
        'audit',
      ];
      const adminSubRoute = (
        validAdminRoutes.includes(sub) ? sub : 'overview'
      ) as 'overview' | 'users' | 'authors' | 'books' | 'orders' | 'audit';

      return (
        <AdminDashboardView
          user={authUser}
          csrfToken={csrfToken}
          activeSubRoute={adminSubRoute}
          onNavigate={navigate}
          onRefreshBootstrap={fetchBootstrap}
          onQuickPersonaSwitch={handleQuickPersonaSwitch}
        />
      );
    }

    if (currentPath === '/' || currentPath === '') {
      return (
        <HomeView
          books={books}
          authors={authors}
          articles={articles}
          excerpts={excerpts}
          onNavigate={navigate}
          onAddToCart={(id) => handleAddToCart(id, 1)}
          recentlyAddedBookId={recentlyAddedBookId}
        />
      );
    }

    if (currentPath === '/books') {
      return (
        <BooksCatalogueView
          books={books}
          authors={authors}
          onNavigate={navigate}
          onAddToCart={handleAddToCart}
          recentlyAddedBookId={recentlyAddedBookId}
        />
      );
    }

    if (currentPath.startsWith('/books/')) {
      const slug = currentPath.replace('/books/', '').trim();
      const book = books.find((b) => b.slug === slug || b.id === slug);
      if (book) {
        const author = authors.find((a) => a.id === book.authorId);
        return (
          <BookDetailView
            book={book}
            author={author}
            allBooks={books}
            allAuthors={authors}
            excerpts={excerpts}
            articles={articles}
            onNavigate={navigate}
            onAddToCart={handleAddToCart}
            recentlyAddedBookId={recentlyAddedBookId}
            user={authUser}
            csrfToken={csrfToken}
            onUpdateUser={setAuthUser}
          />
        );
      }
      // Category fallback
      return (
        <BooksCatalogueView
          books={books}
          authors={authors}
          initialCategory={slug}
          onNavigate={navigate}
          onAddToCart={handleAddToCart}
          recentlyAddedBookId={recentlyAddedBookId}
        />
      );
    }

    if (currentPath === '/vachankatta' || currentPath.startsWith('/vachankatta/')) {
      const sub = currentPath.replace('/vachankatta', '').replace(/^\//, '');
      const categorySlugs = [
        'articles',
        'reviews',
        'interviews',
        'first-page',
        'reading-lists',
        'literary-world',
      ];
      if (!sub || categorySlugs.includes(sub)) {
        return (
          <VachankattaHubView
            articles={articles}
            excerpts={excerpts}
            readingLists={readingLists}
            books={books}
            authors={authors}
            activeSubRoute={sub || 'all'}
            onNavigate={navigate}
            onAddToCart={(id) => handleAddToCart(id, 1)}
            onReactExcerpt={handleReactExcerpt}
            recentlyAddedBookId={recentlyAddedBookId}
          />
        );
      }

      const matchedArticle = articles.find((a) => a.slug === sub || a.id === sub);
      if (matchedArticle) {
        return (
          <ArticleDetailView
            article={matchedArticle}
            allBooks={books}
            allAuthors={authors}
            allArticles={articles}
            onNavigate={navigate}
            onAddToCart={(id) => handleAddToCart(id, 1)}
            onImmersiveChange={setIsImmersiveNavHidden}
          />
        );
      }
    }

    if (currentPath === '/authors') {
      return <AuthorsListView authors={authors} books={books} onNavigate={navigate} />;
    }

    if (currentPath.startsWith('/authors/')) {
      const slug = currentPath.replace('/authors/', '').trim();
      const author = authors.find((a) => a.slug === slug || a.id === slug);
      if (author) {
        return (
          <AuthorDetailView
            author={author}
            books={books}
            articles={articles}
            onNavigate={navigate}
            onAddToCart={(id) => handleAddToCart(id, 1)}
            recentlyAddedBookId={recentlyAddedBookId}
          />
        );
      }
    }

    if (currentPath === '/about') {
      return <AboutAkathView onNavigate={navigate} />;
    }

    if (currentPath === '/submit-manuscript') {
      return <SubmitManuscriptView onSubmitManuscript={handleSubmitManuscript} />;
    }

    if (currentPath === '/contact') {
      return <ContactView onSubmitContact={handleSubmitContact} onNavigate={navigate} />;
    }

    if (currentPath === '/cart') {
      return (
        <CartView
          cartQuote={cartQuote}
          loadingQuote={loadingQuote}
          allBooks={books}
          allAuthors={authors}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveCartItem}
          onClearCart={handleClearCart}
          onAddToCart={handleAddToCart}
          onNavigate={navigate}
        />
      );
    }

    if (currentPath === '/checkout') {
      return (
        <CheckoutView
          cartQuote={cartQuote}
          onPlaceOrder={handlePlaceOrder}
          onVerifyPayment={handleVerifyPayment}
          onNavigate={navigate}
        />
      );
    }

    if (currentPath === '/track-order') {
      return <OrderTrackingView onLookupOrder={handleLookupOrder} />;
    }

    if (currentPath.startsWith('/policies/')) {
      const pType = currentPath.replace('/policies/', '') as
        | 'privacy'
        | 'terms'
        | 'shipping-returns';
      return <PolicyDocumentView policyType={pType} onNavigate={navigate} />;
    }

    if (currentPath === '/audit') {
      return <TechnicalAuditView />;
    }

    // 404 Not Found
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="type-page-heading text-[#252832]">
          {lang === 'mr' ? 'हे पान सापडले नाही (४०४)' : 'Page Not Found (404)'}
        </h1>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="px-6 py-3 rounded-xl bg-[#EF6855] hover:bg-[#DE5542] text-[#FFFDF7] text-[15px] font-semibold transition-colors"
        >
          {lang === 'mr' ? 'मुख्यपृष्ठावर जा' : 'Return Home'}
        </button>
      </div>
    );
  };

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        t: TRANSLATIONS[lang],
      }}
    >
      <div className="min-h-screen flex flex-col bg-[#FFFDF7] text-[#252832]">
        <Navbar
          currentPath={currentPath}
          onNavigate={navigate}
          cartCount={totalCartCount}
          onOpenSearch={() => setSearchOpen(true)}
          user={authUser}
          onLogout={handleLogout}
          onQuickPersonaSwitch={handleQuickPersonaSwitch}
          immersiveHidden={isImmersiveNavHidden}
        />

        <main id="main-content" className="flex-1">
          {renderMainView()}
        </main>

        <Footer
          onNavigate={navigate}
          onSubscribeNewsletter={handleSubscribeNewsletter}
        />

        <SearchModal
          isOpen={searchOpen}
          onClose={() => setSearchOpen(false)}
          books={books}
          authors={authors}
          articles={articles}
          onNavigate={navigate}
        />
      </div>
    </LanguageContext.Provider>
  );
}
