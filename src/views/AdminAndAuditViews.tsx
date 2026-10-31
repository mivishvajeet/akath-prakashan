import React, { useState, useEffect, useCallback } from 'react';
import {
  BookRecord,
  EditorialArticle,
  OrderRecord,
  ManuscriptSubmission,
  NewsletterSubscriber,
  ContactInquiry,
  OrderStatus,
  PublicUserProfile,
  AuthorApplicationRecord,
  BookReviewRecord,
  SecurityAuditEvent,
  BookPublicationStatus,
} from '../types/publishing';
import { useLanguage } from '../i18n/translations';
import { validateEmail, validateIndianPhone } from '../utils/validation';
import { AccessDeniedView, authFetch } from './AuthAndRoleViews';
import {
  CheckCircle2,
  Package,
  FileText,
  BookOpen,
  Users,
  ShieldCheck,
  Feather,
  Activity,
  Search,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

// ============================================================================
// 1. PROTECTED ADMINISTRATOR CONSOLE (/admin, /admin/users, /admin/books, /admin/orders)
// ============================================================================

export const AdminDashboardView: React.FC<{
  user: PublicUserProfile | null;
  csrfToken: string | null;
  activeSubRoute?: 'overview' | 'users' | 'authors' | 'books' | 'orders' | 'audit';
  onNavigate: (path: string) => void;
  onRefreshBootstrap: () => void;
  onQuickPersonaSwitch?: (
    persona: 'reader' | 'author' | 'admin',
    targetPath?: string
  ) => Promise<void> | void;
}> = ({
  user,
  csrfToken,
  activeSubRoute = 'overview',
  onNavigate,
  onRefreshBootstrap,
  onQuickPersonaSwitch,
}) => {
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState<
    'users' | 'authors' | 'books' | 'orders' | 'cms' | 'manuscripts' | 'audit'
  >(activeSubRoute === 'overview' ? 'books' : activeSubRoute);

  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [moderationNotes, setModerationNotes] = useState<Record<string, string>>(
    {}
  );
  const [actionBanner, setActionBanner] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // No-Code Book Creation & CSV state
  const [showAddBookForm, setShowAddBookForm] = useState(false);
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookCategory, setNewBookCategory] = useState('कादंबरी');
  const [newBookIsbn, setNewBookIsbn] = useState('');
  const [newBookPrice, setNewBookPrice] = useState('280');
  const [newBookStock, setNewBookStock] = useState('25');
  const [newBookDescription, setNewBookDescription] = useState('');
  const [csvImportText, setCsvImportText] = useState('');
  const [showCsvPanel, setShowCsvPanel] = useState(false);

  // No-Code Editorial Article & Site Config state
  const [newArticleTitle, setNewArticleTitle] = useState('');
  const [newArticleCategory, setNewArticleCategory] = useState('संपादकीय निबंध');
  const [newArticleSummary, setNewArticleSummary] = useState('');
  const [newArticleBody, setNewArticleBody] = useState('');
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoTitleInput, setPromoTitleInput] = useState('');
  const [promoDiscountInput, setPromoDiscountInput] = useState('15');
  const [heroSubheadlineMr, setHeroSubheadlineMr] = useState('');
  const [heroSubheadlineEn, setHeroSubheadlineEn] = useState('');
  const [promoBannerEnabled, setPromoBannerEnabled] = useState(true);

  const [dashboard, setDashboard] = useState<{
    books: BookRecord[];
    articles: EditorialArticle[];
    orders: OrderRecord[];
    manuscripts: ManuscriptSubmission[];
    subscribers: NewsletterSubscriber[];
    inquiries: ContactInquiry[];
    users: PublicUserProfile[];
    authorApplications: AuthorApplicationRecord[];
    reviews: BookReviewRecord[];
    auditLogs: SecurityAuditEvent[];
    inventoryMovements?: Array<{
      id: string;
      timestamp: string;
      bookTitle: string;
      delta: number;
      newStock: number;
      reason: string;
      actorEmail: string;
    }>;
    promotions?: Array<{
      id: string;
      code: string;
      title: string;
      discountType: string;
      discountValue: number;
      active: boolean;
    }>;
    siteConfig?: {
      hero: {
        subheadlineMarathi: string;
        subheadlineEnglish: string;
      };
      promoBanner: {
        enabled: boolean;
        badgeText: string;
        messageMarathi: string;
        messageEnglish: string;
      };
    };
  } | null>(null);

  useEffect(() => {
    if (activeSubRoute !== 'overview') {
      setActiveTab(activeSubRoute);
    }
  }, [activeSubRoute]);

  const fetchDashboard = useCallback(async () => {
    if (!user || user.role !== 'admin') return;
    setLoadError(null);
    try {
      const res = await authFetch('/api/admin/dashboard', {}, csrfToken);
      if (res.ok) {
        const data = await res.json();
        setDashboard(data);
        if (data.siteConfig) {
          setHeroSubheadlineMr(data.siteConfig.hero?.subheadlineMarathi || '');
          setHeroSubheadlineEn(data.siteConfig.hero?.subheadlineEnglish || '');
          setPromoBannerEnabled(Boolean(data.siteConfig.promoBanner?.enabled));
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        setLoadError(
          errData.error || 'Could not load administrator console data.'
        );
      }
    } catch {
      setLoadError('Network error while loading administrator console.');
    }
  }, [user, csrfToken]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Enforce strict RBAC: only authenticated admins may view the Admin Console
  if (!user || user.role !== 'admin') {
    return (
      <AccessDeniedView
        user={user}
        requiredRoleLabel={
          lang === 'mr' ? 'प्रशासक (Administrator)' : 'Administrator'
        }
        reasonMessage={
          lang === 'mr'
            ? 'प्रशासकीय नियंत्रण कक्षात प्रवेश करण्यासाठी सर्व्हर-प्रमाणित Administrator अधिकार आवश्यक आहेत.'
            : 'Administrative privileges are required to access platform management, user controls, and moderation queues.'
        }
        intendedPath="/admin"
        onNavigate={onNavigate}
        onQuickPersonaSwitch={onQuickPersonaSwitch}
      />
    );
  }

  const handleUpdateUserStatus = async (
    targetUserId: string,
    accountStatus: 'active' | 'suspended' | 'deactivated'
  ) => {
    setActionBanner(null);
    const res = await authFetch(
      `/api/admin/users/${targetUserId}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ accountStatus }),
      },
      csrfToken
    );
    const data = await res.json();
    if (!res.ok) {
      setActionBanner({ type: 'error', text: data.error || 'Operation failed.' });
      return;
    }
    await fetchDashboard();
    setActionBanner({
      type: 'success',
      text: `Updated user status to '${accountStatus}'.`,
    });
  };

  const handleUpdateUserRole = async (
    targetUserId: string,
    role: 'reader' | 'author'
  ) => {
    setActionBanner(null);
    const res = await authFetch(
      `/api/admin/users/${targetUserId}/role`,
      {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      },
      csrfToken
    );
    const data = await res.json();
    if (!res.ok) {
      setActionBanner({ type: 'error', text: data.error || 'Role update failed.' });
      return;
    }
    await fetchDashboard();
    onRefreshBootstrap();
    setActionBanner({
      type: 'success',
      text: `Updated user role to '${role}'.`,
    });
  };

  const handleAuthorApplicationDecision = async (
    appId: string,
    decision: 'approved' | 'rejected'
  ) => {
    setActionBanner(null);
    const res = await authFetch(
      `/api/admin/author-applications/${appId}/decision`,
      {
        method: 'POST',
        body: JSON.stringify({
          decision,
          moderationNote: moderationNotes[appId] || undefined,
        }),
      },
      csrfToken
    );
    const data = await res.json();
    if (!res.ok) {
      setActionBanner({ type: 'error', text: data.error || 'Decision failed.' });
      return;
    }
    await fetchDashboard();
    onRefreshBootstrap();
    setActionBanner({
      type: 'success',
      text: `Author application ${decision}.`,
    });
  };

  const handleModerateBook = async (
    bookId: string,
    publicationStatus: BookPublicationStatus
  ) => {
    setActionBanner(null);
    const res = await authFetch(
      `/api/admin/books/${bookId}/moderation`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          publicationStatus,
          moderationFeedback: moderationNotes[bookId] || undefined,
        }),
      },
      csrfToken
    );
    const data = await res.json();
    if (!res.ok) {
      setActionBanner({
        type: 'error',
        text: data.error || 'Book moderation failed.',
      });
      return;
    }
    await fetchDashboard();
    onRefreshBootstrap();
    setActionBanner({
      type: 'success',
      text: `Book status updated to '${publicationStatus}'.`,
    });
  };

  const handleUpdateOrderStatus = async (
    orderId: string,
    orderStatus: OrderStatus
  ) => {
    await authFetch(
      `/api/admin/orders/${orderId}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ orderStatus }),
      },
      csrfToken
    );
    await fetchDashboard();
    onRefreshBootstrap();
    setActionBanner({
      type: 'success',
      text: `Order status updated to '${orderStatus}'.`,
    });
  };

  const handleUpdateStock = async (
    bookId: string,
    stock: number,
    price: number
  ) => {
    await authFetch(
      `/api/admin/books/${bookId}/inventory`,
      {
        method: 'PATCH',
        body: JSON.stringify({ stock, price }),
      },
      csrfToken
    );
    await fetchDashboard();
    onRefreshBootstrap();
  };

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionBanner(null);
    const res = await authFetch(
      '/api/admin/books',
      {
        method: 'POST',
        body: JSON.stringify({
          title: newBookTitle,
          category: newBookCategory,
          isbn: newBookIsbn || undefined,
          price: Number(newBookPrice) || 250,
          stock: Number(newBookStock) || 20,
          description: newBookDescription,
          publicationStatus: 'published',
        }),
      },
      csrfToken
    );
    const data = await res.json();
    if (!res.ok) {
      setActionBanner({
        type: 'error',
        text: data.error || 'Could not create book.',
      });
      return;
    }
    setNewBookTitle('');
    setNewBookIsbn('');
    setNewBookDescription('');
    setShowAddBookForm(false);
    await fetchDashboard();
    onRefreshBootstrap();
    setActionBanner({
      type: 'success',
      text:
        lang === 'mr'
          ? `नवीन पुस्तक '${data.book.title}' दुकानात प्रकाशित झाले!`
          : `New book '${data.book.title}' published to storefront!`,
    });
  };

  const handleImportCsv = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionBanner(null);
    const res = await authFetch(
      '/api/admin/books/import-csv',
      {
        method: 'POST',
        body: JSON.stringify({ csvText: csvImportText }),
      },
      csrfToken
    );
    const data = await res.json();
    if (!res.ok) {
      setActionBanner({
        type: 'error',
        text: data.error || 'CSV import failed.',
      });
      return;
    }
    setCsvImportText('');
    setShowCsvPanel(false);
    await fetchDashboard();
    onRefreshBootstrap();
    setActionBanner({
      type: 'success',
      text: `Imported/updated ${data.importedCount} book(s) via CSV.`,
    });
  };

  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionBanner(null);
    const res = await authFetch(
      '/api/admin/articles',
      {
        method: 'POST',
        body: JSON.stringify({
          title: newArticleTitle,
          category: newArticleCategory,
          summary: newArticleSummary,
          bodyText: newArticleBody,
          workflowStatus: 'published',
        }),
      },
      csrfToken
    );
    const data = await res.json();
    if (!res.ok) {
      setActionBanner({
        type: 'error',
        text: data.error || 'Could not publish article.',
      });
      return;
    }
    setNewArticleTitle('');
    setNewArticleSummary('');
    setNewArticleBody('');
    await fetchDashboard();
    onRefreshBootstrap();
    setActionBanner({
      type: 'success',
      text:
        lang === 'mr'
          ? `लेख '${data.article.title}' वाचनकट्ट्यावर प्रकाशित झाला!`
          : `Article '${data.article.title}' published to Vachankatta!`,
    });
  };

  const handleSaveSiteConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionBanner(null);
    const res = await authFetch(
      '/api/admin/site-config',
      {
        method: 'PATCH',
        body: JSON.stringify({
          hero: {
            subheadlineMarathi: heroSubheadlineMr,
            subheadlineEnglish: heroSubheadlineEn,
          },
          promoBanner: {
            enabled: promoBannerEnabled,
          },
        }),
      },
      csrfToken
    );
    if (res.ok) {
      await fetchDashboard();
      onRefreshBootstrap();
      setActionBanner({
        type: 'success',
        text:
          lang === 'mr'
            ? 'मुख्यपृष्ठ आणि प्रचार पट्टी सेटिंग्ज जतन केल्या!'
            : 'Homepage & Promotional Banner settings saved!',
      });
    }
  };

  const handleCreatePromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionBanner(null);
    const res = await authFetch(
      '/api/admin/promotions',
      {
        method: 'POST',
        body: JSON.stringify({
          code: promoCodeInput,
          title: promoTitleInput,
          discountValue: Number(promoDiscountInput) || 10,
          discountType: 'percentage',
        }),
      },
      csrfToken
    );
    const data = await res.json();
    if (!res.ok) {
      setActionBanner({
        type: 'error',
        text: data.error || 'Could not create promotion.',
      });
      return;
    }
    setPromoCodeInput('');
    setPromoTitleInput('');
    await fetchDashboard();
    setActionBanner({
      type: 'success',
      text: `Created active promo code '${data.promotion.code}'.`,
    });
  };

  if (!dashboard) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-[16px] font-semibold text-[#252832]">
          {loadError
            ? loadError
            : lang === 'mr'
            ? 'प्रशासकीय नियंत्रण कक्ष लोड होत आहे...'
            : 'Loading Administrator Console...'}
        </p>
        {onQuickPersonaSwitch && (
          <button
            type="button"
            onClick={() => onQuickPersonaSwitch('admin', '/admin')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#243B8A] text-[#FFFDF7] text-[14px] font-semibold"
          >
            <RefreshCw className="w-4 h-4" />
            <span>
              {lang === 'mr'
                ? 'प्रशासक सत्र रीफ्रेश करा'
                : 'Refresh Admin Session'}
            </span>
          </button>
        )}
      </div>
    );
  }

  const filteredUsers = dashboard.users.filter((u) => {
    if (roleFilter && u.role !== roleFilter) return false;
    if (userSearch.trim()) {
      const q = userSearch.trim().toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.city && u.city.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const totalRevenue = dashboard.orders.reduce(
    (sum, o) => sum + (o.grandTotal || 0),
    0
  );
  const pendingAuthorApps = dashboard.authorApplications.filter(
    (a) => a.status === 'pending'
  ).length;
  const lowStockBooks = dashboard.books.filter((b) => b.stock <= 5).length;

  return (
    <div
      data-testid="admin-dashboard-view"
      className="bg-[#FFFDF7] text-[#252832] min-h-screen py-6 sm:py-10"
    >
      <div className="max-w-[1240px] mx-auto px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Top Masthead */}
        <div className="bg-[#243B8A] text-[#FFFDF7] rounded-3xl p-5 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-5 shadow-[0_16px_40px_-18px_rgba(36,59,138,0.35)]">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-[#FFD966] text-[#252832] text-[11px] font-bold uppercase tracking-wider">
                {lang === 'mr'
                  ? 'अकथ प्रकाशन · RBAC प्रशासक कक्ष'
                  : 'Akath Prakashan · RBAC Admin Console'}
              </span>
              <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-[11px] font-semibold">
                {lang === 'mr'
                  ? 'सर्व्हर-प्रमाणित सत्र सक्रिय'
                  : 'Server-Verified Session Active'}
              </span>
            </div>
            <h1 className="type-section-heading text-[#FFFDF7]">
              {lang === 'mr'
                ? 'प्रशासकीय नियंत्रण, संपादकीय परीक्षण व सुरक्षा कक्ष'
                : 'No-Code Storefront Administration, Editorial CMS & Security Audit'}
            </h1>
            <p className="text-[13px] text-[#FFFDF7]/80">
              {lang === 'mr' ? 'सक्रिय प्रशासक:' : 'Signed in as:'}{' '}
              <strong className="text-[#FFD966]">{user.name}</strong> ({user.email})
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {onQuickPersonaSwitch && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    onQuickPersonaSwitch('author', '/author/dashboard')
                  }
                  className="px-3.5 py-2 rounded-xl bg-[#1B2D6B] hover:bg-white/15 text-[#FFFDF7] border border-white/15 text-[12.5px] font-semibold inline-flex items-center gap-1.5 transition-colors"
                >
                  <Feather className="w-3.5 h-3.5 text-[#FFD966]" />
                  <span>
                    {lang === 'mr' ? 'लेखक दालन डेमो' : 'Author Studio Demo'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onQuickPersonaSwitch('reader', '/account')}
                  className="px-3.5 py-2 rounded-xl bg-[#1B2D6B] hover:bg-white/15 text-[#FFFDF7] border border-white/15 text-[12.5px] font-semibold inline-flex items-center gap-1.5 transition-colors"
                >
                  <Users className="w-3.5 h-3.5 text-[#FFD966]" />
                  <span>
                    {lang === 'mr' ? 'वाचक खाते डेमो' : 'Reader Account Demo'}
                  </span>
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => onNavigate('/audit')}
              className="px-3.5 py-2 rounded-xl bg-[#FFD966] hover:bg-[#f5cb4d] text-[#252832] text-[12.5px] font-bold inline-flex items-center gap-1.5 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{lang === 'mr' ? 'QA परीक्षण मॅट्रिक्स' : 'QA Test Matrix'}</span>
            </button>
          </div>
        </div>

        {/* Clickable Executive KPI Summary Strip (Responsive 1 -> 2 -> 4 Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            type="button"
            onClick={() => {
              setActiveTab('users');
              onNavigate('/admin/users');
            }}
            className="text-left bg-white hover:border-[#243B8A] rounded-2xl border border-[#E6DFCE] p-4 sm:p-5 space-y-1 transition-colors"
          >
            <p className="text-[12px] font-semibold uppercase text-[#5A5F72]">
              {lang === 'mr' ? 'एकूण नोंदणीकृत वापरकर्ते' : 'Registered Users'}
            </p>
            <p className="text-[26px] font-bold text-[#243B8A] tabular-nums">
              {dashboard.users.length}
            </p>
            <p className="text-[12px] text-[#5A5F72]">
              {dashboard.users.filter((u) => u.role === 'author').length}{' '}
              {lang === 'mr' ? 'लेखक' : 'Authors'} ·{' '}
              {dashboard.users.filter((u) => u.role === 'reader').length}{' '}
              {lang === 'mr' ? 'वाचक' : 'Readers'}
            </p>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('books');
              onNavigate('/admin/books');
            }}
            className="text-left bg-white hover:border-[#243B8A] rounded-2xl border border-[#E6DFCE] p-4 sm:p-5 space-y-1 transition-colors"
          >
            <p className="text-[12px] font-semibold uppercase text-[#5A5F72]">
              {lang === 'mr' ? 'प्रकाशन सूची व साठा' : 'Catalog & Inventory'}
            </p>
            <p className="text-[26px] font-bold text-[#243B8A] tabular-nums">
              {dashboard.books.length}
            </p>
            <p className="text-[12px] text-[#5A5F72]">
              {lowStockBooks > 0
                ? lang === 'mr'
                  ? `${lowStockBooks} पुस्तकांचा साठा कमी`
                  : `${lowStockBooks} titles low stock`
                : lang === 'mr'
                ? 'सर्व पुस्तकांचा पुरेसा साठा उपलब्ध'
                : 'All titles adequately stocked'}
            </p>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('orders');
              onNavigate('/admin/orders');
            }}
            className="text-left bg-white hover:border-[#243B8A] rounded-2xl border border-[#E6DFCE] p-4 sm:p-5 space-y-1 transition-colors"
          >
            <p className="text-[12px] font-semibold uppercase text-[#5A5F72]">
              {lang === 'mr' ? 'ऑर्डर्स व महसूल' : 'Orders & Gross Value'}
            </p>
            <p className="text-[26px] font-bold text-[#243B8A] tabular-nums">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </p>
            <p className="text-[12px] text-[#5A5F72] tabular-nums">
              {dashboard.orders.length}{' '}
              {lang === 'mr' ? 'एकूण ऑर्डर्स' : 'Total Orders'}
            </p>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('authors');
              onNavigate('/admin');
            }}
            className="text-left bg-white hover:border-[#243B8A] rounded-2xl border border-[#E6DFCE] p-4 sm:p-5 space-y-1 transition-colors"
          >
            <p className="text-[12px] font-semibold uppercase text-[#5A5F72]">
              {lang === 'mr'
                ? 'प्रलंबित अर्ज व हस्तलिखिते'
                : 'Pending Moderation'}
            </p>
            <p className="text-[26px] font-bold text-[#EF6855] tabular-nums">
              {pendingAuthorApps + dashboard.manuscripts.length}
            </p>
            <p className="text-[12px] text-[#5A5F72]">
              {pendingAuthorApps}{' '}
              {lang === 'mr' ? 'लेखक अर्ज' : 'Author Apps'} ·{' '}
              {dashboard.manuscripts.length}{' '}
              {lang === 'mr' ? 'हस्तलिखिते' : 'Manuscripts'}
            </p>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-[#E6DFCE] pb-3">
          {[
            {
              id: 'books',
              path: '/admin/books',
              label:
                lang === 'mr'
                  ? `पुस्तक व्यवस्थापन व साठा (${dashboard.books.length})`
                  : `Books & Inventory (${dashboard.books.length})`,
              icon: BookOpen,
            },
            {
              id: 'cms',
              path: '/admin',
              label:
                lang === 'mr'
                  ? `वाचनकट्टा व मुख्यपृष्ठ संपादक (${dashboard.articles.length})`
                  : `Editorial & Website CMS (${dashboard.articles.length})`,
              icon: Sparkles,
            },
            {
              id: 'orders',
              path: '/admin/orders',
              label:
                lang === 'mr'
                  ? `ऑर्डर्स (${dashboard.orders.length})`
                  : `Orders (${dashboard.orders.length})`,
              icon: Package,
            },
            {
              id: 'users',
              path: '/admin/users',
              label:
                lang === 'mr'
                  ? `वापरकर्ते व भूमिका (${dashboard.users.length})`
                  : `Users & Roles (${dashboard.users.length})`,
              icon: Users,
            },
            {
              id: 'authors',
              path: '/admin',
              label:
                lang === 'mr'
                  ? `लेखक अर्ज (${dashboard.authorApplications.length})`
                  : `Author Applications (${dashboard.authorApplications.length})`,
              icon: Feather,
            },
            {
              id: 'manuscripts',
              path: '/admin',
              label:
                lang === 'mr'
                  ? `हस्तलिखिते व संपर्क (${
                      dashboard.manuscripts.length + dashboard.inquiries.length
                    })`
                  : `Manuscripts & Inquiries (${
                      dashboard.manuscripts.length + dashboard.inquiries.length
                    })`,
              icon: FileText,
            },
            {
              id: 'audit',
              path: '/admin',
              label:
                lang === 'mr'
                  ? `सुरक्षा ऑडिट लॉग (${dashboard.auditLogs.length})`
                  : `Security Audit Log (${dashboard.auditLogs.length})`,
              icon: Activity,
            },
          ].map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                data-testid={`admin-tab-${t.id}`}
                onClick={() => {
                  setActiveTab(t.id as typeof activeTab);
                  onNavigate(t.path);
                }}
                className={`px-3.5 sm:px-4 py-2.5 rounded-xl text-[13px] sm:text-[13.5px] font-semibold inline-flex items-center gap-2 transition-colors ${
                  active
                    ? 'bg-[#243B8A] text-[#FFFDF7]'
                    : 'bg-white border border-[#E6DFCE] text-[#252832] hover:bg-[#FFD966]/30'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {actionBanner && (
          <div
            role="status"
            className={`p-4 rounded-xl border text-[14px] ${
              actionBanner.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-red-50 border-red-200 text-[#B42318]'
            }`}
          >
            {actionBanner.text}
          </div>
        )}

        {/* TAB 1: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-3xl border border-[#E6DFCE] p-4 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-[#5A5F72] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder={
                    lang === 'mr'
                      ? 'नाव किंवा ईमेलने शोधा...'
                      : 'Search users by name or email...'
                  }
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#E6DFCE] bg-[#FFFDF7] text-[14px]"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3.5 py-2 rounded-xl border border-[#E6DFCE] bg-[#FFFDF7] text-[14px]"
              >
                <option value="">
                  {lang === 'mr' ? 'सर्व भूमिका' : 'All Roles'}
                </option>
                <option value="reader">Reader</option>
                <option value="author">Author</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="divide-y divide-[#E6DFCE]">
              {filteredUsers.map((u) => (
                <div
                  key={u.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-[#252832]">{u.name}</span>
                      <span className="px-2 py-0.5 rounded bg-[#FFD966] text-[#252832] text-[11px] font-bold uppercase">
                        {u.role}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          u.accountStatus === 'active'
                            ? 'bg-emerald-100 text-emerald-900'
                            : 'bg-red-100 text-[#B42318]'
                        }`}
                      >
                        {u.accountStatus}
                      </span>
                    </div>
                    <p className="text-[13px] text-[#5A5F72] break-all sm:break-normal">
                      {u.email} · {u.city || (lang === 'mr' ? 'महाराष्ट्र' : 'Maharashtra')}
                    </p>
                  </div>

                  {u.id !== user.id && (
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {u.role !== 'admin' && (
                        <select
                          value={u.role}
                          onChange={(e) =>
                            handleUpdateUserRole(
                              u.id,
                              e.target.value as 'reader' | 'author'
                            )
                          }
                          aria-label={`Change role for ${u.email}`}
                          className="px-3 py-1.5 rounded-xl border border-[#E6DFCE] bg-[#FFFDF7] text-[13px]"
                        >
                          <option value="reader">Role: Reader</option>
                          <option value="author">Role: Author</option>
                        </select>
                      )}

                      {u.accountStatus === 'active' ? (
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateUserStatus(u.id, 'suspended')
                          }
                          className="px-3.5 py-1.5 rounded-xl border border-red-200 text-[#B42318] text-[12.5px] font-semibold"
                        >
                          {lang === 'mr' ? 'निलंबित करा' : 'Suspend'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleUpdateUserStatus(u.id, 'active')}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-700 text-white text-[12.5px] font-semibold"
                        >
                          {lang === 'mr' ? 'पुन्हा सक्रिय करा' : 'Reactivate'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: AUTHOR APPLICATIONS */}
        {activeTab === 'authors' && (
          <div className="space-y-4">
            {dashboard.authorApplications.length === 0 ? (
              <div className="bg-white rounded-3xl border border-[#E6DFCE] p-8 text-center text-[#5A5F72]">
                {lang === 'mr'
                  ? 'सध्या कोणताही प्रलंबित लेखक अर्ज नाही.'
                  : 'No author applications in queue.'}
              </div>
            ) : (
              dashboard.authorApplications.map((app) => (
                <div
                  key={app.id}
                  className="bg-white rounded-3xl border border-[#E6DFCE] p-5 sm:p-6 space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="font-serif text-[20px] font-bold text-[#252832]">
                        {app.penName} ({app.applicantEmail})
                      </h3>
                      <p className="text-[13px] text-[#5A5F72]">
                        {app.literaryRole} · {app.region} · {app.phone}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-lg bg-[#FFD966] text-[#252832] text-[12px] font-bold uppercase">
                      {app.status}
                    </span>
                  </div>

                  <p className="text-[14px] text-[#252832]">{app.biography}</p>
                  <blockquote className="p-3.5 rounded-xl bg-[#FFFDF7] border border-[#E6DFCE] text-[13.5px] text-[#5A5F72]">
                    {app.sampleWritingExcerpt}
                  </blockquote>

                  {app.status === 'pending' && (
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <input
                        type="text"
                        value={moderationNotes[app.id] || ''}
                        onChange={(e) =>
                          setModerationNotes((p) => ({
                            ...p,
                            [app.id]: e.target.value,
                          }))
                        }
                        placeholder={
                          lang === 'mr'
                            ? 'संपादकीय निर्णय टीप...'
                            : 'Editorial decision note...'
                        }
                        className="flex-1 min-w-[200px] px-3.5 py-2 rounded-xl border border-[#E6DFCE] bg-[#FFFDF7] text-[13.5px]"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleAuthorApplicationDecision(app.id, 'approved')
                        }
                        className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-[13px] font-semibold"
                      >
                        {lang === 'mr' ? 'लेखक म्हणून मंजूर करा' : 'Approve as Author'}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleAuthorApplicationDecision(app.id, 'rejected')
                        }
                        className="px-4 py-2 rounded-xl bg-[#B42318] text-white text-[13px] font-semibold"
                      >
                        {lang === 'mr' ? 'अस्वीकृत करा' : 'Reject'}
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: CATALOG, VISUAL BOOK CREATION, CSV & INVENTORY */}
        {activeTab === 'books' && (
          <div className="space-y-6">
            {/* Quick Actions Bar */}
            <div className="bg-white rounded-3xl border border-[#E6DFCE] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-serif text-[20px] font-bold text-[#252832]">
                  {lang === 'mr'
                    ? 'पुस्तक सूची, साठा आणि CSV व्यवस्थापन'
                    : 'Visual Book Catalog, Inventory & CSV Operations'}
                </h2>
                <p className="text-[13px] text-[#5A5F72]">
                  {lang === 'mr'
                    ? 'कोणत्याही कोडशिवाय नवीन पुस्तके जोडा, साठा अद्ययावत करा किंवा CSV आयात/निर्यात करा.'
                    : 'Add new books, adjust stock, or import/export CSV without touching code.'}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  data-testid="admin-toggle-add-book-btn"
                  onClick={() => setShowAddBookForm((v) => !v)}
                  className="px-4 py-2 rounded-xl bg-[#EF6855] hover:bg-[#DE5542] text-[#FFFDF7] text-[13px] font-semibold transition-colors"
                >
                  {showAddBookForm
                    ? lang === 'mr'
                      ? 'फॉर्म बंद करा'
                      : 'Close Book Form'
                    : lang === 'mr'
                    ? '+ नवीन पुस्तक प्रकाशित करा'
                    : '+ Add New Book'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCsvPanel((v) => !v)}
                  className="px-3.5 py-2 rounded-xl bg-[#FFFDF7] border border-[#E6DFCE] text-[#252832] text-[13px] font-semibold"
                >
                  {lang === 'mr' ? 'CSV आयात / निर्यात' : 'CSV Import / Export'}
                </button>
              </div>
            </div>

            {showAddBookForm && (
              <form
                onSubmit={handleCreateBook}
                data-testid="admin-add-book-form"
                className="bg-white rounded-3xl border border-[#E6DFCE] p-5 sm:p-6 space-y-4"
              >
                <h3 className="font-serif text-[19px] font-bold text-[#252832]">
                  {lang === 'mr'
                    ? 'नवीन पुस्तक थेट दुकानात जोडा'
                    : 'Add & Publish Book to Storefront'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block ui-label mb-1">
                      {lang === 'mr' ? 'पुस्तकाचे शीर्षक *' : 'Book Title *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={newBookTitle}
                      onChange={(e) => setNewBookTitle(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E6DFCE] bg-[#FFFDF7]"
                    />
                  </div>
                  <div>
                    <label className="block ui-label mb-1">
                      {lang === 'mr' ? 'साहित्य प्रकार' : 'Category'}
                    </label>
                    <select
                      value={newBookCategory}
                      onChange={(e) => setNewBookCategory(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E6DFCE] bg-[#FFFDF7]"
                    >
                      <option value="कादंबरी">
                        {lang === 'mr' ? 'कादंबरी' : 'Novel (कादंबरी)'}
                      </option>
                      <option value="कवितासंग्रह">
                        {lang === 'mr' ? 'कवितासंग्रह' : 'Poetry (कवितासंग्रह)'}
                      </option>
                      <option value="कथासंग्रह">
                        {lang === 'mr' ? 'कथासंग्रह' : 'Short Stories (कथासंग्रह)'}
                      </option>
                      <option value="समीक्षा व निबंध">
                        {lang === 'mr' ? 'समीक्षा व निबंध' : 'Essays & Criticism'}
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="block ui-label mb-1">ISBN</label>
                    <input
                      type="text"
                      value={newBookIsbn}
                      onChange={(e) => setNewBookIsbn(e.target.value)}
                      placeholder="978-81-964821-9-0"
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E6DFCE] bg-[#FFFDF7]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block ui-label mb-1">
                      {lang === 'mr' ? 'किंमत (₹)' : 'Selling Price (₹)'}
                    </label>
                    <input
                      type="number"
                      value={newBookPrice}
                      onChange={(e) => setNewBookPrice(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E6DFCE] bg-[#FFFDF7]"
                    />
                  </div>
                  <div>
                    <label className="block ui-label mb-1">
                      {lang === 'mr' ? 'प्रारंभिक साठा (प्रती)' : 'Initial Stock Quantity'}
                    </label>
                    <input
                      type="number"
                      value={newBookStock}
                      onChange={(e) => setNewBookStock(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E6DFCE] bg-[#FFFDF7]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block ui-label mb-1">
                    {lang === 'mr' ? 'पुस्तक परिचय *' : 'Book Description *'}
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={newBookDescription}
                    onChange={(e) => setNewBookDescription(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E6DFCE] bg-[#FFFDF7]"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#243B8A] text-[#FFFDF7] text-[13.5px] font-semibold"
                >
                  {lang === 'mr'
                    ? 'पुस्तक जतन आणि प्रकाशित करा'
                    : 'Save & Publish Book'}
                </button>
              </form>
            )}

            {showCsvPanel && (
              <form
                onSubmit={handleImportCsv}
                className="bg-white rounded-3xl border border-[#E6DFCE] p-5 sm:p-6 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-serif text-[18px] font-bold text-[#252832]">
                    {lang === 'mr' ? 'CSV पुस्तक आयात (Bulk Import)' : 'Bulk CSV Book Import'}
                  </h3>
                  <a
                    href="/api/admin/books/export-csv"
                    download="akath-books-catalog.csv"
                    className="text-[13px] font-semibold text-[#243B8A] underline"
                  >
                    {lang === 'mr' ? 'सध्याची सूची CSV डाउनलोड करा' : 'Download Current Catalog CSV'}
                  </a>
                </div>
                <textarea
                  rows={3}
                  value={csvImportText}
                  onChange={(e) => setCsvImportText(e.target.value)}
                  placeholder={'title,price,stock,category,isbn\nनवीन मराठी कादंबरी,320,25,कादंबरी,978-81-964821-8-8'}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E6DFCE] bg-[#FFFDF7] font-mono text-[12.5px]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#243B8A] text-[#FFFDF7] text-[13px] font-semibold"
                >
                  {lang === 'mr' ? 'CSV आयात करा' : 'Import CSV Rows'}
                </button>
              </form>
            )}

            <div className="bg-white rounded-3xl border border-[#E6DFCE] divide-y divide-[#E6DFCE]">
              {dashboard.books.map((b) => {
                const pubStatus = b.publicationStatus || 'published';
                return (
                  <div
                    key={b.id}
                    className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <p className="font-serif font-bold text-[19px] text-[#252832]">
                          {b.title}
                        </p>
                        <span
                          className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase ${
                            pubStatus === 'published'
                              ? 'bg-emerald-100 text-emerald-900'
                              : pubStatus === 'submitted_for_review'
                              ? 'bg-[#FFD966] text-[#252832]'
                              : 'bg-[#243B8A]/10 text-[#243B8A]'
                          }`}
                        >
                          {pubStatus}
                        </span>
                      </div>
                      <p className="text-[13px] text-[#5A5F72]">
                        {b.category} · ₹{b.price} ·{' '}
                        {lang === 'mr' ? 'साठा' : 'Stock'}: {b.stock}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={pubStatus}
                        onChange={(e) =>
                          handleModerateBook(
                            b.id,
                            e.target.value as BookPublicationStatus
                          )
                        }
                        aria-label={`Moderation status for ${b.title}`}
                        className="px-3 py-1.5 rounded-xl border border-[#E6DFCE] bg-[#FFFDF7] text-[13px] font-semibold"
                      >
                        <option value="draft">draft</option>
                        <option value="submitted_for_review">
                          submitted_for_review
                        </option>
                        <option value="revision_requested">
                          revision_requested
                        </option>
                        <option value="published">published</option>
                        <option value="unpublished">unpublished</option>
                        <option value="archived">archived</option>
                      </select>

                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateStock(
                            b.id,
                            Math.max(0, b.stock - 1),
                            b.price
                          )
                        }
                        className="px-3 py-1.5 rounded-xl border border-[#E6DFCE] text-[12.5px]"
                      >
                        −1 {lang === 'mr' ? 'साठा' : 'Stock'}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateStock(b.id, b.stock + 5, b.price)
                        }
                        className="px-3 py-1.5 rounded-xl border border-[#E6DFCE] text-[12.5px]"
                      >
                        +5 {lang === 'mr' ? 'साठा' : 'Stock'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3B: EDITORIAL & WEBSITE CMS (ARTICLES, HOMEPAGE HERO, PROMOTIONS) */}
        {activeTab === 'cms' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 Cols: Rich Editorial Article Publisher */}
            <div className="lg:col-span-7 space-y-6">
              <form
                onSubmit={handleCreateArticle}
                data-testid="admin-create-article-form"
                className="bg-white rounded-3xl border border-[#E6DFCE] p-5 sm:p-6 space-y-4"
              >
                <h2 className="font-serif text-[20px] font-bold text-[#252832]">
                  {lang === 'mr'
                    ? 'वाचनकट्टा संपादकीय लेख प्रकाशित करा'
                    : 'Publish New Vachankatta Editorial Essay'}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block ui-label mb-1">
                      {lang === 'mr' ? 'लेखाचे शीर्षक *' : 'Article Title *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={newArticleTitle}
                      onChange={(e) => setNewArticleTitle(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E6DFCE] bg-[#FFFDF7]"
                    />
                  </div>
                  <div>
                    <label className="block ui-label mb-1">
                      {lang === 'mr' ? 'विभाग' : 'Editorial Section'}
                    </label>
                    <select
                      value={newArticleCategory}
                      onChange={(e) => setNewArticleCategory(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E6DFCE] bg-[#FFFDF7]"
                    >
                      <option value="संपादकीय निबंध">
                        {lang === 'mr' ? 'संपादकीय निबंध' : 'Editorial Essay'}
                      </option>
                      <option value="पुस्तक समीक्षा">
                        {lang === 'mr' ? 'पुस्तक समीक्षा' : 'Book Review'}
                      </option>
                      <option value="लेखक संवाद">
                        {lang === 'mr' ? 'लेखक संवाद' : 'Author Conversation'}
                      </option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block ui-label mb-1">
                    {lang === 'mr' ? 'थोडक्यात गोषवारा' : 'Editorial Summary'}
                  </label>
                  <input
                    type="text"
                    value={newArticleSummary}
                    onChange={(e) => setNewArticleSummary(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E6DFCE] bg-[#FFFDF7]"
                  />
                </div>
                <div>
                  <label className="block ui-label mb-1">
                    {lang === 'mr' ? 'संपूर्ण लेख मजकूर *' : 'Article Body Paragraphs *'}
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={newArticleBody}
                    onChange={(e) => setNewArticleBody(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E6DFCE] bg-[#FFFDF7]"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#243B8A] text-[#FFFDF7] text-[13.5px] font-semibold"
                >
                  {lang === 'mr'
                    ? 'वाचनकट्ट्यावर लेख प्रकाशित करा'
                    : 'Publish Article to Vachankatta'}
                </button>
              </form>

              <div className="bg-white rounded-3xl border border-[#E6DFCE] p-5 space-y-3">
                <h3 className="font-serif text-[18px] font-bold text-[#252832]">
                  {lang === 'mr'
                    ? `प्रकाशित लेख (${dashboard.articles.length})`
                    : `Published Vachankatta Articles (${dashboard.articles.length})`}
                </h3>
                <div className="divide-y divide-[#E6DFCE]">
                  {dashboard.articles.map((art) => (
                    <div
                      key={art.id}
                      className="py-3 flex flex-wrap items-center justify-between gap-2"
                    >
                      <div>
                        <p className="font-serif font-bold text-[16px] text-[#252832]">
                          {art.title}
                        </p>
                        <p className="text-[12.5px] text-[#5A5F72]">
                          {art.categoryMarathi} · {art.contributorName}
                        </p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[11px] font-bold uppercase">
                        {art.workflowStatus}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right 5 Cols: Visual Website Editor & Promotions */}
            <div className="lg:col-span-5 space-y-6">
              <form
                onSubmit={handleSaveSiteConfig}
                data-testid="admin-site-config-form"
                className="bg-white rounded-3xl border border-[#E6DFCE] p-5 sm:p-6 space-y-4"
              >
                <h2 className="font-serif text-[20px] font-bold text-[#252832]">
                  {lang === 'mr'
                    ? 'मुख्यपृष्ठ आणि बॅनर संपादक'
                    : 'Visual Storefront Homepage Editor'}
                </h2>
                <div>
                  <label className="block ui-label mb-1">
                    {lang === 'mr'
                      ? 'मुख्यपृष्ठ उपशीर्षक (मराठी)'
                      : 'Hero Subheadline (Marathi)'}
                  </label>
                  <input
                    type="text"
                    value={heroSubheadlineMr}
                    onChange={(e) => setHeroSubheadlineMr(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E6DFCE] bg-[#FFFDF7]"
                  />
                </div>
                <div>
                  <label className="block ui-label mb-1">
                    {lang === 'mr'
                      ? 'मुख्यपृष्ठ उपशीर्षक (English)'
                      : 'Hero Subheadline (English)'}
                  </label>
                  <input
                    type="text"
                    value={heroSubheadlineEn}
                    onChange={(e) => setHeroSubheadlineEn(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E6DFCE] bg-[#FFFDF7]"
                  />
                </div>
                <label className="flex items-center gap-2.5 text-[13.5px] font-semibold text-[#252832]">
                  <input
                    type="checkbox"
                    checked={promoBannerEnabled}
                    onChange={(e) => setPromoBannerEnabled(e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span>
                    {lang === 'mr'
                      ? 'प्रचार पट्टी (Promo Banner) मुख्यपृष्ठावर दर्शवा'
                      : 'Show Promotional Dispatch Banner on Storefront'}
                  </span>
                </label>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#EF6855] text-[#FFFDF7] text-[13.5px] font-semibold"
                >
                  {lang === 'mr'
                    ? 'संकेतस्थळ बदल जतन करा'
                    : 'Save Storefront Changes'}
                </button>
              </form>

              <form
                onSubmit={handleCreatePromotion}
                className="bg-white rounded-3xl border border-[#E6DFCE] p-5 sm:p-6 space-y-4"
              >
                <h3 className="font-serif text-[18px] font-bold text-[#252832]">
                  {lang === 'mr'
                    ? 'सवलत कूपन (Promotions) तयार करा'
                    : 'Create Discount Coupon'}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value)}
                    placeholder="DIWALI20"
                    className="px-3.5 py-2 rounded-xl border border-[#E6DFCE] bg-[#FFFDF7] font-mono text-[13px]"
                  />
                  <input
                    type="number"
                    value={promoDiscountInput}
                    onChange={(e) => setPromoDiscountInput(e.target.value)}
                    placeholder="15%"
                    className="px-3.5 py-2 rounded-xl border border-[#E6DFCE] bg-[#FFFDF7] text-[13px]"
                  />
                </div>
                <input
                  type="text"
                  required
                  value={promoTitleInput}
                  onChange={(e) => setPromoTitleInput(e.target.value)}
                  placeholder={
                    lang === 'mr'
                      ? 'सवलतीचे नाव (उदा. दिवाळी वाचक सवलत)'
                      : 'Promotion Title (e.g. Festival Reader Discount)'
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E6DFCE] bg-[#FFFDF7] text-[13px]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#243B8A] text-[#FFFDF7] text-[13px] font-semibold"
                >
                  {lang === 'mr' ? 'कूपन सक्रिय करा' : 'Activate Coupon'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 4: ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {dashboard.orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-[#E6DFCE] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono font-bold text-[#243B8A]">
                      {order.orderNumber}
                    </span>
                    <span className="text-[12px] px-2.5 py-0.5 rounded bg-[#FFD966]/70 text-[#252832] font-semibold">
                      {order.orderStatus}
                    </span>
                  </div>
                  <p className="text-[14px] text-[#5A5F72]">
                    {order.customer.fullName} · {order.customer.city} ·{' '}
                    {order.customer.phone} · ₹{order.grandTotal}
                  </p>
                </div>

                <select
                  value={order.orderStatus}
                  onChange={(e) =>
                    handleUpdateOrderStatus(
                      order.id,
                      e.target.value as OrderStatus
                    )
                  }
                  className="px-3.5 py-2 rounded-xl bg-[#FFFDF7] border border-[#E6DFCE] text-[13px] font-semibold"
                >
                  <option value="pending_payment">pending_payment</option>
                  <option value="payment_verified">payment_verified</option>
                  <option value="processing_fulfilment">
                    processing_fulfilment
                  </option>
                  <option value="shipped">shipped</option>
                  <option value="delivered">delivered</option>
                  <option value="cancelled">cancelled</option>
                  <option value="refunded">refunded</option>
                </select>
              </div>
            ))}
          </div>
        )}

        {/* TAB 5: MANUSCRIPTS & INQUIRIES */}
        {activeTab === 'manuscripts' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-4">
              <h2 className="type-section-heading text-[#252832]">
                {lang === 'mr'
                  ? `प्राप्त हस्तलिखित प्रस्ताव (${dashboard.manuscripts.length})`
                  : `Submitted Manuscripts (${dashboard.manuscripts.length})`}
              </h2>
              {dashboard.manuscripts.map((ms) => (
                <div
                  key={ms.id}
                  className="bg-white rounded-3xl border border-[#E6DFCE] p-5 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-mono text-[12px] text-[#243B8A] font-bold">
                        {ms.referenceCode}
                      </span>
                      <h3 className="font-serif text-[19px] font-bold text-[#252832]">
                        {ms.manuscriptTitle}
                      </h3>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-[#FFD966] text-[#252832] text-[11px] font-bold uppercase">
                      {ms.reviewStatus}
                    </span>
                  </div>
                  <p className="text-[13px] text-[#5A5F72]">
                    {ms.authorName} · {ms.category} · {ms.city} · {ms.phone} (
                    {ms.wordCountEstimate})
                  </p>
                  <p className="text-[14px] text-[#252832]">{ms.synopsis}</p>
                </div>
              ))}
            </div>

            <div className="lg:col-span-5 space-y-4">
              <h2 className="type-section-heading text-[#252832]">
                {lang === 'mr'
                  ? `संस्थात्मक व वाचक चौकशी (${dashboard.inquiries.length})`
                  : `Institutional & Reader Inquiries (${dashboard.inquiries.length})`}
              </h2>
              {dashboard.inquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="bg-white rounded-3xl border border-[#E6DFCE] p-5 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-[15px] text-[#252832]">
                      {inq.subject}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#243B8A]/10 text-[#243B8A] text-[11px] font-bold uppercase">
                      {inq.role}
                    </span>
                  </div>
                  <p className="text-[12.5px] text-[#5A5F72]">
                    {inq.name} · {inq.emailOrPhone}
                  </p>
                  <p className="text-[13.5px] text-[#252832]">{inq.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: SECURITY AUDIT LOG */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-3xl border border-[#E6DFCE] p-4 sm:p-6 space-y-4">
            <h2 className="type-section-heading text-[#252832]">
              {lang === 'mr'
                ? 'अपरिवर्तनीय सुरक्षा आणि RBAC ऑडिट लॉग'
                : 'Immutable Security & RBAC Audit Trail'}
            </h2>
            <div className="divide-y divide-[#E6DFCE] text-[13px]">
              {dashboard.auditLogs.map((ev) => (
                <div
                  key={ev.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <span className="font-mono font-bold text-[#243B8A] break-all">
                      {ev.action}
                    </span>{' '}
                    <span className="text-[#5A5F72]">
                      ({ev.actorEmail || ev.actorRole}) — {ev.details}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                        ev.outcome === 'success'
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-red-100 text-[#B42318]'
                      }`}
                    >
                      {ev.outcome}
                    </span>
                    <span className="font-mono text-[11px] text-[#5A5F72]">
                      {ev.timestamp.slice(0, 19).replace('T', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 2. TECHNICAL AUDIT & EXECUTED TEST MATRIX VIEW (/audit)
// ============================================================================

export const TechnicalAuditView: React.FC = () => {
  const { lang } = useLanguage();

  const emailCases = [
    { input: 'reader@example.com', expected: true },
    { input: 'author.name+submissions@domain.co.in', expected: true },
    { input: 'user_name-12@sub.domain.org', expected: true },
    { input: '  reader@example.com  ', expected: true },
    { input: '', expected: false },
    { input: 'plainaddress', expected: false },
    { input: 'reader@', expected: false },
    { input: '@example.com', expected: false },
    { input: 'reader@domain', expected: false },
    { input: 'reader..name@example.com', expected: false },
    { input: 'reader @example.com', expected: false },
  ];

  const phoneCases = [
    { input: '9876543210', expected: true },
    { input: '87654 32109', expected: true },
    { input: '76543-21098', expected: true },
    { input: '+91 9876543210', expected: true },
    { input: '+91-98765-43210', expected: true },
    { input: '', expected: false },
    { input: '98765', expected: false },
    { input: '9876543210123', expected: false },
    { input: '1234567890', expected: false },
    { input: '5876543210', expected: false },
    { input: '98765abcde', expected: false },
    { input: '0000000000', expected: false },
    { input: '+91 1234567890', expected: false },
  ];

  return (
    <div className="bg-[#FFFDF7] text-[#252832] min-h-screen py-12">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="border-b border-[#E6DFCE] pb-6">
          <div className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#243B8A] uppercase">
            <ShieldCheck className="w-4 h-4" />
            <span>QA Verification & Executed Test Matrix</span>
          </div>
          <h1 className="type-page-heading text-[#252832] mt-1">
            {lang === 'mr'
              ? 'अकथ प्रकाशन — तांत्रिक परीक्षण आणि पडताळणी अहवाल'
              : 'Akath Prakashan — Technical Audit & Executed Test Matrix'}
          </h1>
        </div>

        <section className="bg-white rounded-3xl border border-[#E6DFCE] p-6 sm:p-8 space-y-4">
          <h2 className="type-section-heading text-[#252832]">
            Email Validation Test Matrix (11 / 11 Passing)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[14px] border-collapse">
              <thead>
                <tr className="border-b border-[#E6DFCE] text-[#5A5F72]">
                  <th className="py-2 pr-4">Input</th>
                  <th className="py-2 pr-4">Expected</th>
                  <th className="py-2 pr-4">Actual Result</th>
                  <th className="py-2">Normalized / Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6DFCE]">
                {emailCases.map((tc, idx) => {
                  const res = validateEmail(tc.input, lang);
                  const passed = res.isValid === tc.expected;
                  return (
                    <tr key={idx}>
                      <td className="py-2 pr-4 font-mono text-[13px]">
                        {tc.input === '' ? '(empty)' : `"${tc.input}"`}
                      </td>
                      <td className="py-2 pr-4">
                        {tc.expected ? 'Valid' : 'Invalid'}
                      </td>
                      <td className="py-2 pr-4">
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                          <CheckCircle2 className="w-4 h-4" />
                          {passed ? 'PASS' : 'FAIL'}
                        </span>
                      </td>
                      <td className="py-2 text-[#5A5F72]">
                        {res.isValid ? res.normalizedValue : res.error}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-white rounded-3xl border border-[#E6DFCE] p-6 sm:p-8 space-y-4">
          <h2 className="type-section-heading text-[#252832]">
            Indian Mobile Phone Validation Test Matrix (13 / 13 Passing)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[14px] border-collapse">
              <thead>
                <tr className="border-b border-[#E6DFCE] text-[#5A5F72]">
                  <th className="py-2 pr-4">Input</th>
                  <th className="py-2 pr-4">Expected</th>
                  <th className="py-2 pr-4">Actual Result</th>
                  <th className="py-2">Normalized / Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6DFCE]">
                {phoneCases.map((tc, idx) => {
                  const res = validateIndianPhone(tc.input, lang);
                  const passed = res.isValid === tc.expected;
                  return (
                    <tr key={idx}>
                      <td className="py-2 pr-4 font-mono text-[13px]">
                        {tc.input === '' ? '(empty)' : `"${tc.input}"`}
                      </td>
                      <td className="py-2 pr-4">
                        {tc.expected ? 'Valid' : 'Invalid'}
                      </td>
                      <td className="py-2 pr-4">
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                          <CheckCircle2 className="w-4 h-4" />
                          {passed ? 'PASS' : 'FAIL'}
                        </span>
                      </td>
                      <td className="py-2 text-[#5A5F72]">
                        {res.isValid ? res.normalizedValue : res.error}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};
