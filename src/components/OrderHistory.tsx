import React, { useState, useEffect, useMemo } from 'react';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ShoppingBag,
  ArrowUpRight,
  MapPin,
  FileText,
} from 'lucide-react';
import {
  OrderRecord,
  OrderStatus,
  BookRecord,
  AuthorRecord,
  PublicUserProfile,
} from '../types/publishing';
import {
  FirestoreCloudOrderDoc,
  subscribeToUserOrdersFromFirestore,
  syncOrderToCloud,
  cancelOrderInCloud,
} from '../firebase/client';
import { BookCoverArt } from './BookCoverArt';
import { useLanguage } from '../i18n/translations';

export interface OrderHistoryProps {
  user: PublicUserProfile;
  orders: OrderRecord[];
  books: BookRecord[];
  authors: AuthorRecord[];
  onRefreshOrders: () => Promise<void>;
  onCancelOrder: (orderId: string) => Promise<void>;
  onLinkGuestOrder: (
    orderNumber: string,
    guestAccessToken: string
  ) => Promise<void>;
  onAddToCart: (bookId: string, qty?: number) => void;
  onNavigate: (path: string) => void;
}

type OrderFilterTab = 'all' | 'active' | 'delivered' | 'cancelled';

function mapCloudStatusToOrderStatus(
  cloudStatus: FirestoreCloudOrderDoc['status'],
  fallbackStatus?: OrderStatus
): OrderStatus {
  if (cloudStatus === 'delivered') return 'delivered';
  if (cloudStatus === 'shipped') return 'shipped';
  if (cloudStatus === 'cancelled') return 'cancelled';
  if (cloudStatus === 'processing') return 'processing_fulfilment';
  if (fallbackStatus && fallbackStatus !== 'pending_payment') {
    return fallbackStatus;
  }
  return 'payment_verified';
}

function getDeliveryStageIndex(status: OrderStatus): number {
  switch (status) {
    case 'pending_payment':
    case 'payment_verified':
      return 1;
    case 'processing_fulfilment':
      return 2;
    case 'shipped':
      return 3;
    case 'delivered':
      return 4;
    case 'cancelled':
    case 'returned':
    case 'refunded':
    case 'payment_failed':
      return 0;
    default:
      return 1;
  }
}

export const OrderHistory: React.FC<OrderHistoryProps> = ({
  user,
  orders,
  books,
  authors,
  onRefreshOrders,
  onCancelOrder,
  onLinkGuestOrder,
  onAddToCart,
  onNavigate,
}) => {
  const { lang } = useLanguage();
  const [cloudOrders, setCloudOrders] = useState<FirestoreCloudOrderDoc[]>([]);
  const [realtimeMeta, setRealtimeMeta] = useState<{
    active: boolean;
    uid: string | null;
    syncedAt: string;
  }>({
    active: false,
    uid: null,
    syncedAt: new Date().toISOString(),
  });
  const [filterTab, setFilterTab] = useState<OrderFilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrderIds, setExpandedOrderIds] = useState<
    Record<string, boolean>
  >({});
  const [copiedTrackingId, setCopiedTrackingId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Guest order link inputs
  const [linkOrderNumber, setLinkOrderNumber] = useState('');
  const [linkGuestToken, setLinkGuestToken] = useState('');
  const [isLinking, setIsLinking] = useState(false);

  // 1. Subscribe to real-time Firestore `/orders` collection via onSnapshot
  useEffect(() => {
    const unsubscribe = subscribeToUserOrdersFromFirestore(
      (liveDocs, connectionMeta) => {
        setCloudOrders(liveDocs);
        setRealtimeMeta(connectionMeta);
      }
    );
    return () => {
      unsubscribe();
    };
  }, [user.id]);

  // 2. Sync any server-loaded orders into Cloud Firestore when Firebase Auth is active
  useEffect(() => {
    if (!realtimeMeta.active || orders.length === 0) return;
    orders.forEach((ord) => {
      void syncOrderToCloud(ord).catch(() => {});
    });
  }, [orders, realtimeMeta.active]);

  // 3. Merge server OrderRecords with real-time Firestore documents
  const mergedOrders = useMemo<OrderRecord[]>(() => {
    const byId = new Map<string, OrderRecord>();

    for (const srvOrd of orders) {
      byId.set(srvOrd.id, {
        ...srvOrd,
        fulfilment: { ...srvOrd.fulfilment },
        auditTrail: [...(srvOrd.auditTrail || [])],
      });
    }

    for (const cloudDoc of cloudOrders) {
      const existing =
        byId.get(cloudDoc.id) ||
        Array.from(byId.values()).find(
          (o) => o.orderNumber === cloudDoc.orderNumber
        );

      if (existing) {
        const updatedStatus = mapCloudStatusToOrderStatus(
          cloudDoc.status,
          existing.orderStatus
        );
        existing.orderStatus = updatedStatus;
        existing.updatedAt = cloudDoc.updatedAt || existing.updatedAt;
        if (cloudDoc.courierPartner) {
          existing.fulfilment.courierPartner = cloudDoc.courierPartner;
        }
        if (cloudDoc.trackingNumber) {
          existing.fulfilment.trackingNumber = cloudDoc.trackingNumber;
        }
        if (cloudDoc.dispatchedAt) {
          existing.fulfilment.dispatchedAt = cloudDoc.dispatchedAt;
        }
        if (cloudDoc.deliveredAt) {
          existing.fulfilment.deliveredAt = cloudDoc.deliveredAt;
        }
      } else {
        // Construct a complete OrderRecord from a Firestore-native order document
        const parsedItems = (cloudDoc.itemsSummary || '')
          .split('|')
          .map((part) => part.trim())
          .filter(Boolean)
          .map((entry, idx) => ({
            bookId: `cloud-item-${idx}`,
            slug: 'books',
            title: entry.split('×')[0]?.trim() || entry,
            authorName: 'अकथ प्रकाशन',
            format: 'पेपरबॅक',
            unitPrice: cloudDoc.subtotal,
            requestedQuantity: 1,
            approvedQuantity: 1,
            lineTotal: cloudDoc.subtotal,
            availableStock: 10,
          }));

        byId.set(cloudDoc.id, {
          id: cloudDoc.id,
          orderNumber: cloudDoc.orderNumber,
          idempotencyKey: `cloud-${cloudDoc.id}`,
          userId: cloudDoc.userId,
          createdAt: cloudDoc.createdAt,
          updatedAt: cloudDoc.updatedAt,
          customer: {
            fullName: cloudDoc.customerName || user.name,
            phone: cloudDoc.customerPhone || user.phone || '',
            email: cloudDoc.customerEmail || user.email,
            addressLine1:
              cloudDoc.shippingAddress || user.city || 'नांदेड, महाराष्ट्र',
            city: user.city || 'नांदेड',
            district: user.city || 'नांदेड',
            state: 'महाराष्ट्र',
            postalCode: '431605',
            isInstitutionalOrder: false,
          },
          items:
            parsedItems.length > 0
              ? parsedItems
              : [
                  {
                    bookId: 'book-scholar-juice',
                    slug: 'scholar-juice',
                    title: 'अकथ प्रकाशन ग्रंथ संच',
                    authorName: 'अकथ प्रकाशन',
                    format: 'पेपरबॅक',
                    unitPrice: cloudDoc.subtotal,
                    requestedQuantity: 1,
                    approvedQuantity: 1,
                    lineTotal: cloudDoc.subtotal,
                    availableStock: 20,
                  },
                ],
          subtotal: cloudDoc.subtotal,
          shippingCost: cloudDoc.shippingCost,
          grandTotal: cloudDoc.grandTotal,
          currency: 'INR',
          paymentMethod:
            (cloudDoc.paymentMethod as OrderRecord['paymentMethod']) ||
            'upi_verified',
          paymentStatus:
            (cloudDoc.paymentStatus as OrderRecord['paymentStatus']) ||
            'verified',
          orderStatus: mapCloudStatusToOrderStatus(cloudDoc.status),
          fulfilment: {
            courierPartner: cloudDoc.courierPartner,
            trackingNumber: cloudDoc.trackingNumber,
            dispatchedAt: cloudDoc.dispatchedAt,
            deliveredAt: cloudDoc.deliveredAt,
          },
          auditTrail: [
            {
              timestamp: cloudDoc.createdAt,
              actor: 'Cloud Firestore',
              action: 'ORDER_SYNCED',
              note:
                lang === 'mr'
                  ? 'फायरस्टोअर रिअल-टाइम डेटाबेसमधून समक्रमित.'
                  : 'Synced in real time from Cloud Firestore.',
            },
          ],
        });
      }
    }

    return Array.from(byId.values()).sort((a, b) =>
      String(b.createdAt || '').localeCompare(String(a.createdAt || ''))
    );
  }, [orders, cloudOrders, user, lang]);

  // Default-expand the most recent order so tracking details are immediately visible
  useEffect(() => {
    if (mergedOrders.length > 0 && Object.keys(expandedOrderIds).length === 0) {
      setExpandedOrderIds({ [mergedOrders[0].id]: true });
    }
  }, [mergedOrders, expandedOrderIds]);

  const filteredOrders = useMemo(() => {
    return mergedOrders.filter((ord) => {
      if (filterTab === 'active') {
        if (
          ![
            'pending_payment',
            'payment_verified',
            'processing_fulfilment',
            'shipped',
          ].includes(ord.orderStatus)
        ) {
          return false;
        }
      } else if (filterTab === 'delivered') {
        if (ord.orderStatus !== 'delivered') return false;
      } else if (filterTab === 'cancelled') {
        if (
          !['cancelled', 'returned', 'refunded', 'payment_failed'].includes(
            ord.orderStatus
          )
        ) {
          return false;
        }
      }

      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;

      const matchesOrderNo = ord.orderNumber.toLowerCase().includes(q);
      const matchesTracking = (ord.fulfilment?.trackingNumber || '')
        .toLowerCase()
        .includes(q);
      const matchesBook = ord.items.some(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.authorName.toLowerCase().includes(q)
      );
      return matchesOrderNo || matchesTracking || matchesBook;
    });
  }, [mergedOrders, filterTab, searchQuery]);

  const handleCopyTracking = (trackingNumber: string, orderId: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(trackingNumber).catch(() => {});
    }
    setCopiedTrackingId(orderId);
    window.setTimeout(() => setCopiedTrackingId(null), 2000);
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefreshOrders();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCancelOrderClick = async (ord: OrderRecord) => {
    setCancellingId(ord.id);
    try {
      await onCancelOrder(ord.id);
      await cancelOrderInCloud(ord.id).catch(() => {});
    } finally {
      setCancellingId(null);
    }
  };

  const handleSubmitGuestLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkOrderNumber.trim()) return;
    setIsLinking(true);
    try {
      await onLinkGuestOrder(linkOrderNumber.trim(), linkGuestToken.trim());
      setLinkOrderNumber('');
      setLinkGuestToken('');
    } finally {
      setIsLinking(false);
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case 'pending_payment':
        return lang === 'mr' ? 'पेमेंट प्रलंबित' : 'Pending Payment';
      case 'payment_verified':
        return lang === 'mr' ? 'ऑर्डर निश्चित (पेमेंट पूर्ण)' : 'Order Confirmed';
      case 'processing_fulfilment':
        return lang === 'mr'
          ? 'पॅकिंग व संपादकीय तपासणीत'
          : 'Packing at Nanded Desk';
      case 'shipped':
        return lang === 'mr' ? 'कुरिअरने रवाना (In Transit)' : 'Shipped & In Transit';
      case 'delivered':
        return lang === 'mr' ? 'वितरित (Delivered)' : 'Delivered';
      case 'cancelled':
        return lang === 'mr' ? 'रद्द केलेली ऑर्डर' : 'Cancelled';
      case 'returned':
        return lang === 'mr' ? 'परत केलेली ऑर्डर' : 'Returned';
      case 'refunded':
        return lang === 'mr' ? 'परतावा पूर्ण' : 'Refunded';
      case 'payment_failed':
        return lang === 'mr' ? 'पेमेंट अयशस्वी' : 'Payment Failed';
      default:
        return status;
    }
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrderIds((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  return (
    <div
      data-testid="account-order-history"
      data-firestore-realtime={realtimeMeta.active ? 'live' : 'hybrid'}
      className="space-y-8"
    >
      {/* Top Order History Header, Real-Time Firestore Status & Filter Controls */}
      <div className="bg-white rounded-3xl border border-[#E6DFCE] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E6DFCE] pb-5">
          <div className="space-y-1">
            <div
              data-testid="order-history-sync-status"
              className="flex flex-wrap items-center gap-2 text-[12px] text-[#5A5F72] font-medium"
            >
              <span className="font-semibold text-[#243B8A]">
                {realtimeMeta.active
                  ? lang === 'mr'
                    ? 'क्लाउड फायरस्टोअर · रिअल-टाइम सिंक सक्रिय'
                    : 'Cloud Firestore · Real-Time Sync Active'
                  : lang === 'mr'
                  ? 'अकथ खाते भांडार · रिअल-टाइम ऑर्डर ट्रॅकिंग'
                  : 'Akath Account Ledger · Live Order Tracking'}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                {mergedOrders.length}{' '}
                {lang === 'mr'
                  ? 'नोंदणीकृत ऑर्डर्स'
                  : mergedOrders.length === 1
                  ? 'Order'
                  : 'Orders'}
              </span>
            </div>
            <h2 className="type-section-heading text-[#252832]">
              {lang === 'mr'
                ? 'तुमचा ऑर्डर इतिहास आणि वितरण ट्रॅकिंग'
                : 'Your Order History & Delivery Tracking'}
            </h2>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto">
            <button
              type="button"
              data-testid="order-history-refresh-btn"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="px-3.5 py-2 rounded-xl bg-[#FFFDF7] hover:bg-[#FFD966]/25 border border-[#E6DFCE] text-[#243B8A] text-[13px] font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              <span>{lang === 'mr' ? 'ताजे करा' : 'Refresh'}</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/track-order')}
              className="px-3.5 py-2 rounded-xl bg-[#243B8A] hover:bg-[#1B2D6B] text-[#FFFDF7] text-[13px] font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Truck className="w-3.5 h-3.5 text-[#FFD966]" />
              <span>
                {lang === 'mr' ? 'थेट पार्सल ट्रॅकर' : 'Parcel Lookup'}
              </span>
            </button>
          </div>
        </div>

        {/* Filter Tabs + Search Input */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div
            role="tablist"
            aria-label={lang === 'mr' ? 'ऑर्डर स्थिती फिल्टर' : 'Filter orders by status'}
            data-testid="order-history-filter-tabs"
            className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#F7F3E8] border border-[#E6DFCE]"
          >
            {(
              [
                {
                  id: 'all',
                  label:
                    lang === 'mr'
                      ? `सर्व (${mergedOrders.length})`
                      : `All Orders (${mergedOrders.length})`,
                },
                {
                  id: 'active',
                  label:
                    lang === 'mr'
                      ? 'प्रक्रियेत / रवाना'
                      : 'In Progress & Shipped',
                },
                {
                  id: 'delivered',
                  label: lang === 'mr' ? 'वितरित' : 'Delivered',
                },
                {
                  id: 'cancelled',
                  label: lang === 'mr' ? 'रद्द / परतावा' : 'Cancelled',
                },
              ] as const
            ).map((item) => {
              const active = filterTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  data-testid={`order-filter-${item.id}`}
                  onClick={() => setFilterTab(item.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-[13px] font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#243B8A] text-[#FFFDF7] shadow-2xs'
                      : 'text-[#5A5F72] hover:text-[#252832]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-[#5A5F72] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              data-testid="order-history-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                lang === 'mr'
                  ? 'ऑर्डर क्र., पुस्तक किंवा ट्रॅकिंग शोधा...'
                  : 'Search order #, book, or tracking ID...'
              }
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-[#E6DFCE] bg-[#FFFDF7] text-[13.5px] text-[#252832] placeholder:text-[#5A5F72]/70"
            />
          </div>
        </div>

        {/* Orders List or Empty State */}
        {filteredOrders.length === 0 ? (
          <div
            data-testid="order-history-empty"
            className="py-10 px-4 text-center space-y-3 rounded-2xl bg-[#FFFDF7] border border-[#E6DFCE]"
          >
            <Package className="w-9 h-9 text-[#243B8A] mx-auto opacity-80" />
            <p className="text-[15px] font-medium text-[#252832]">
              {searchQuery || filterTab !== 'all'
                ? lang === 'mr'
                  ? 'या निवडीशी जुळणारी कोणतीही ऑर्डर सापडली नाही.'
                  : 'No orders match your current filter or search query.'
                : lang === 'mr'
                ? 'तुमच्या खात्यावर अद्याप कोणतीही ऑर्डर नाही.'
                : 'No orders found for your account yet.'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              {(searchQuery || filterTab !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setFilterTab('all');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 rounded-xl bg-white border border-[#E6DFCE] text-[#243B8A] text-[13px] font-semibold cursor-pointer"
                >
                  {lang === 'mr' ? 'सर्व ऑर्डर्स दाखवा' : 'Show All Orders'}
                </button>
              )}
              <button
                type="button"
                onClick={() => onNavigate('/books')}
                className="px-4 py-2 rounded-xl bg-[#EF6855] hover:bg-[#DE5542] text-[#FFFDF7] text-[13px] font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>
                  {lang === 'mr' ? 'प्रकाशित पुस्तके पाहा' : 'Browse Published Books'}
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredOrders.map((ord) => {
              const stageIdx = getDeliveryStageIndex(ord.orderStatus);
              const isTerminalCancelled = stageIdx === 0;
              const isExpanded = Boolean(expandedOrderIds[ord.id]);
              const canCancel =
                ord.orderStatus === 'pending_payment' ||
                ord.orderStatus === 'payment_verified' ||
                ord.orderStatus === 'processing_fulfilment';

              const deliverySteps = [
                {
                  step: 1,
                  label: lang === 'mr' ? 'ऑर्डर निश्चित' : 'Order Confirmed',
                  sub: ord.createdAt.slice(0, 10),
                  icon: CheckCircle2,
                },
                {
                  step: 2,
                  label: lang === 'mr' ? 'पॅकिंग व तपासणी' : 'Editorial Packing',
                  sub: lang === 'mr' ? 'नांदेड वितरण कक्ष' : 'Nanded Dispatch Desk',
                  icon: Package,
                },
                {
                  step: 3,
                  label: lang === 'mr' ? 'कुरिअरने रवाना' : 'Dispatched',
                  sub:
                    ord.fulfilment?.dispatchedAt?.slice(0, 10) ||
                    ord.fulfilment?.courierPartner ||
                    (lang === 'mr' ? 'भारतीय पोस्ट / कुरिअर' : 'India Post / Courier'),
                  icon: Truck,
                },
                {
                  step: 4,
                  label: lang === 'mr' ? 'वितरित' : 'Delivered',
                  sub:
                    ord.fulfilment?.deliveredAt?.slice(0, 10) ||
                    (ord.orderStatus === 'delivered'
                      ? lang === 'mr'
                        ? 'पोहोचले'
                        : 'Completed'
                      : lang === 'mr'
                      ? '३–५ कार्यदिवस'
                      : '3–5 Business Days'),
                  icon: CheckCircle2,
                },
              ];

              return (
                <article
                  key={ord.id}
                  data-testid="order-history-card"
                  data-order-number={ord.orderNumber}
                  data-order-status={ord.orderStatus}
                  className="rounded-2xl bg-[#FFFDF7] border border-[#E6DFCE] overflow-hidden transition-colors"
                >
                  {/* Card Top Summary Bar */}
                  <div className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E6DFCE] bg-white">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2 text-[13px] text-[#5A5F72]">
                        <span className="font-mono text-[15px] font-bold text-[#243B8A] tabular-nums">
                          {ord.orderNumber}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-semibold text-[#252832]">
                          {getStatusLabel(ord.orderStatus)}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono text-[12.5px] tabular-nums">
                          {ord.createdAt.slice(0, 10)}
                        </span>
                      </div>

                      <p className="text-[14.5px] font-medium text-[#252832]">
                        {ord.items
                          .map((i) => `${i.title} (×${i.approvedQuantity})`)
                          .join(', ')}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between lg:justify-end gap-4 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#E6DFCE]">
                      <div className="text-left lg:text-right">
                        <span className="text-[11.5px] text-[#5A5F72] block">
                          {lang === 'mr' ? 'एकूण रक्कम' : 'Order Total'}
                        </span>
                        <span className="font-mono text-[17px] font-bold text-[#252832] tabular-nums">
                          ₹{ord.grandTotal}
                        </span>
                      </div>

                      <button
                        type="button"
                        data-testid="order-details-toggle"
                        aria-expanded={isExpanded}
                        onClick={() => toggleExpand(ord.id)}
                        className="px-3.5 py-2 rounded-xl bg-[#F7F3E8] hover:bg-[#FFD966]/40 border border-[#E6DFCE] text-[#243B8A] text-[13px] font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <span>
                          {isExpanded
                            ? lang === 'mr'
                              ? 'तपशील लपवा'
                              : 'Hide Details'
                            : lang === 'mr'
                            ? 'ट्रॅकिंग व तपशील'
                            : 'Track & Details'}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* 4-Stage Visual Delivery Tracking Progress Bar */}
                  <div
                    data-testid="order-delivery-tracker"
                    className="px-5 sm:px-6 py-4 bg-[#FFFDF7] border-b border-[#E6DFCE]"
                  >
                    {isTerminalCancelled ? (
                      <div className="flex items-center gap-2.5 text-[13.5px] text-[#B42318] font-medium">
                        <XCircle className="w-4 h-4 shrink-0" />
                        <span>
                          {lang === 'mr'
                            ? `ही ऑर्डर (${getStatusLabel(ord.orderStatus)}) स्थितीत आहे.`
                            : `This order is marked as ${getStatusLabel(ord.orderStatus)}.`}
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {deliverySteps.map((stepObj) => {
                            const StepIcon = stepObj.icon;
                            const isCompleted = stageIdx >= stepObj.step;
                            const isCurrent = stageIdx === stepObj.step;
                            return (
                              <div
                                key={stepObj.step}
                                data-step-completed={isCompleted ? 'true' : 'false'}
                                className={`p-3 rounded-xl border transition-colors ${
                                  isCurrent
                                    ? 'bg-white border-[#243B8A] shadow-2xs'
                                    : isCompleted
                                    ? 'bg-white/70 border-[#E6DFCE]'
                                    : 'bg-transparent border-[#E6DFCE]/60 opacity-60'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <StepIcon
                                    className={`w-4 h-4 shrink-0 ${
                                      isCompleted
                                        ? 'text-[#243B8A]'
                                        : 'text-[#5A5F72]'
                                    }`}
                                  />
                                  <span className="text-[12.5px] font-bold text-[#252832] truncate">
                                    {stepObj.label}
                                  </span>
                                </div>
                                <p className="text-[11.5px] text-[#5A5F72] mt-1 truncate font-mono tabular-nums">
                                  {stepObj.sub}
                                </p>
                              </div>
                            );
                          })}
                        </div>

                        {/* Courier & Consignment Tracking Strip */}
                        {ord.fulfilment?.trackingNumber && (
                          <div
                            data-testid="order-courier-tracking-bar"
                            className="p-3.5 rounded-xl bg-white border border-[#E6DFCE] flex flex-wrap items-center justify-between gap-3"
                          >
                            <div className="flex flex-wrap items-center gap-2 text-[13px] text-[#252832]">
                              <Truck className="w-4 h-4 text-[#243B8A] shrink-0" />
                              <span className="font-semibold">
                                {ord.fulfilment.courierPartner ||
                                  (lang === 'mr'
                                    ? 'भारतीय स्पीड पोस्ट'
                                    : 'India Post Registered Parcel')}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span className="text-[#5A5F72]">
                                {lang === 'mr' ? 'ट्रॅकिंग क्र.:' : 'Tracking ID:'}
                              </span>
                              <code className="font-mono font-bold text-[#243B8A] bg-[#F7F3E8] px-2 py-0.5 rounded border border-[#E6DFCE] tabular-nums">
                                {ord.fulfilment.trackingNumber}
                              </code>
                            </div>

                            <button
                              type="button"
                              data-testid="copy-tracking-btn"
                              onClick={() =>
                                handleCopyTracking(
                                  ord.fulfilment.trackingNumber!,
                                  ord.id
                                )
                              }
                              className="px-3 py-1.5 rounded-lg bg-[#F7F3E8] hover:bg-[#FFD966]/45 text-[#243B8A] text-[12px] font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              {copiedTrackingId === ord.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                                  <span>
                                    {lang === 'mr' ? 'कॉपी झाले' : 'Copied'}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>
                                    {lang === 'mr'
                                      ? 'ट्रॅकिंग क्र. कॉपी करा'
                                      : 'Copy Tracking ID'}
                                  </span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Expandable Order Details: Book Editions, Delivery Address, Payment Breakdown & Status Timeline */}
                  {isExpanded && (
                    <div
                      data-testid="order-expanded-details"
                      className="p-5 sm:p-6 space-y-6 bg-white"
                    >
                      {/* Ordered Book Editions */}
                      <div className="space-y-3">
                        <h3 className="text-[13.5px] font-bold text-[#243B8A]">
                          {lang === 'mr'
                            ? 'ऑर्डर केलेले ग्रंथ (Ordered Editions)'
                            : 'Ordered Editions'}
                        </h3>
                        <div className="divide-y divide-[#E6DFCE] border border-[#E6DFCE] rounded-2xl bg-[#FFFDF7] px-4">
                          {ord.items.map((item, idx) => {
                            const matchedBook = books.find(
                              (b) =>
                                b.id === item.bookId || b.slug === item.slug
                            );
                            const matchedAuthor = matchedBook
                              ? authors.find(
                                  (a) => a.id === matchedBook.authorId
                                )
                              : undefined;

                            return (
                              <div
                                key={`${ord.id}-item-${idx}`}
                                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                              >
                                <div className="flex items-center gap-3.5 min-w-0">
                                  {matchedBook && (
                                    <div className="w-12 shrink-0">
                                      <BookCoverArt
                                        book={matchedBook}
                                        author={matchedAuthor}
                                        size="sm"
                                        onClick={() =>
                                          onNavigate(
                                            `/books/${matchedBook.slug}`
                                          )
                                        }
                                      />
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        matchedBook
                                          ? onNavigate(
                                              `/books/${matchedBook.slug}`
                                            )
                                          : onNavigate('/books')
                                      }
                                      className="font-serif text-[16px] font-bold text-[#252832] hover:text-[#243B8A] text-left truncate block cursor-pointer"
                                    >
                                      {item.title}
                                    </button>
                                    <p className="text-[12.5px] text-[#5A5F72]">
                                      {item.authorName} · {item.format} ·{' '}
                                      <span className="font-mono tabular-nums">
                                        ₹{item.unitPrice} × {item.approvedQuantity}
                                      </span>
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                                  <span className="font-mono text-[14.5px] font-bold text-[#252832] tabular-nums">
                                    ₹{item.lineTotal}
                                  </span>
                                  {matchedBook && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        onAddToCart(matchedBook.id, 1)
                                      }
                                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#FFD966]/35 border border-[#E6DFCE] text-[#243B8A] text-[12px] font-semibold transition-colors cursor-pointer whitespace-nowrap"
                                    >
                                      {lang === 'mr'
                                        ? '+ पुन्हा खरेदी करा'
                                        : '+ Buy Again'}
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Shipping Address + Financial Summary + Status Timeline Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* 1. Delivery Address */}
                        <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#E6DFCE] space-y-2">
                          <div className="flex items-center gap-1.5 text-[12.5px] font-bold text-[#243B8A]">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>
                              {lang === 'mr'
                                ? 'वितरण पत्ता'
                                : 'Delivery Address'}
                            </span>
                          </div>
                          <p className="text-[13.5px] font-semibold text-[#252832]">
                            {ord.customer.fullName}
                          </p>
                          <p className="text-[13px] text-[#5A5F72] leading-relaxed">
                            {ord.customer.addressLine1}
                            {ord.customer.addressLine2
                              ? `, ${ord.customer.addressLine2}`
                              : ''}
                            <br />
                            {ord.customer.city}, {ord.customer.district} —{' '}
                            <span className="font-mono tabular-nums">
                              {ord.customer.postalCode}
                            </span>
                            <br />
                            {ord.customer.state}
                          </p>
                        </div>

                        {/* 2. Payment & Invoice Breakdown */}
                        <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#E6DFCE] space-y-2">
                          <div className="flex items-center gap-1.5 text-[12.5px] font-bold text-[#243B8A]">
                            <FileText className="w-3.5 h-3.5" />
                            <span>
                              {lang === 'mr'
                                ? 'बिल व पेमेंट तपशील'
                                : 'Receipt & Payment'}
                            </span>
                          </div>
                          <div className="space-y-1 text-[13px] text-[#5A5F72]">
                            <div className="flex justify-between">
                              <span>
                                {lang === 'mr' ? 'पुस्तक रक्कम' : 'Subtotal'}
                              </span>
                              <span className="font-mono tabular-nums text-[#252832]">
                                ₹{ord.subtotal}
                              </span>
                            </div>
                            {ord.discountAmount ? (
                              <div className="flex justify-between text-emerald-700">
                                <span>
                                  {lang === 'mr' ? 'सवलत' : 'Discount'}
                                </span>
                                <span className="font-mono tabular-nums">
                                  -₹{ord.discountAmount}
                                </span>
                              </div>
                            ) : null}
                            <div className="flex justify-between">
                              <span>
                                {lang === 'mr' ? 'पोस्टल शुल्क' : 'Shipping'}
                              </span>
                              <span className="font-mono tabular-nums text-[#252832]">
                                {ord.shippingCost === 0
                                  ? lang === 'mr'
                                    ? 'मोफत'
                                    : 'Free'
                                  : `₹${ord.shippingCost}`}
                              </span>
                            </div>
                            <div className="pt-1.5 border-t border-[#E6DFCE] flex justify-between font-bold text-[#252832]">
                              <span>
                                {lang === 'mr' ? 'एकूण देय' : 'Grand Total'}
                              </span>
                              <span className="font-mono tabular-nums">
                                ₹{ord.grandTotal}
                              </span>
                            </div>
                          </div>
                          {ord.paymentReference && (
                            <p className="text-[11.5px] font-mono text-[#5A5F72] pt-1 truncate">
                              Ref: {ord.paymentReference}
                            </p>
                          )}
                        </div>

                        {/* 3. Chronological Status Updates & Audit Log */}
                        <div
                          data-testid="order-status-timeline"
                          className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#E6DFCE] space-y-2.5"
                        >
                          <div className="flex items-center gap-1.5 text-[12.5px] font-bold text-[#243B8A]">
                            <Clock className="w-3.5 h-3.5" />
                            <span>
                              {lang === 'mr'
                                ? 'स्थिती अद्यतने (Status Log)'
                                : 'Status Updates'}
                            </span>
                          </div>
                          <ul className="space-y-2 text-[12.5px]">
                            {(ord.auditTrail || []).slice(-4).map((ev, i) => (
                              <li
                                key={`${ord.id}-audit-${i}`}
                                className="border-b last:border-b-0 border-[#E6DFCE]/70 pb-1.5 last:pb-0"
                              >
                                <p className="font-medium text-[#252832]">
                                  {ev.note || ev.action}
                                </p>
                                <p className="text-[11px] font-mono text-[#5A5F72] tabular-nums">
                                  {ev.timestamp.slice(0, 16).replace('T', ' ')}
                                </p>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Bottom Action Bar for Order Card */}
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#E6DFCE]">
                        <button
                          type="button"
                          onClick={() => onNavigate('/track-order')}
                          className="text-[13px] font-semibold text-[#243B8A] hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>
                            {lang === 'mr'
                              ? 'सार्वजनिक पार्सल ट्रॅकिंग पृष्ठावर पाहा'
                              : 'Open Public Parcel Tracker'}
                          </span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>

                        {canCancel && (
                          <button
                            type="button"
                            data-testid="cancel-order-btn"
                            disabled={cancellingId === ord.id}
                            onClick={() => handleCancelOrderClick(ord)}
                            className="px-3.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-[#B42318] text-[12.5px] font-semibold transition-colors cursor-pointer disabled:opacity-60"
                          >
                            {cancellingId === ord.id
                              ? lang === 'mr'
                                ? 'रद्द करत आहे...'
                                : 'Cancelling...'
                              : lang === 'mr'
                              ? 'ऑर्डर रद्द करा'
                              : 'Cancel Order'}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Link a Previous Guest Order to Your Account */}
      <form
        onSubmit={handleSubmitGuestLink}
        data-testid="link-guest-order-form"
        className="bg-white rounded-3xl border border-[#E6DFCE] p-6 sm:p-8 space-y-4"
      >
        <h3 className="font-serif text-[20px] font-bold text-[#252832]">
          {lang === 'mr'
            ? 'पूर्वीची गेस्ट ऑर्डर खात्याशी जोडा'
            : 'Link a Previous Guest Order to Your Account'}
        </h3>
        <p className="text-[14px] text-[#5A5F72]">
          {lang === 'mr'
            ? 'लॉगिन न करता केलेल्या ऑर्डरचा क्रमांक आणि गेस्ट टोकन टाकून ती ऑर्डर तुमच्या खात्यात व क्लाउड फायरस्टोअरमध्ये समाविष्ट करा.'
            : 'Enter your order number and guest access token (or use a verified matching email) to link a guest order to your account and Cloud Firestore.'}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input
            type="text"
            value={linkOrderNumber}
            onChange={(e) => setLinkOrderNumber(e.target.value)}
            placeholder="AK-2026-1043"
            className="px-3.5 py-2.5 rounded-xl border border-[#E6DFCE] bg-[#FFFDF7] font-mono text-[14px]"
          />
          <input
            type="text"
            value={linkGuestToken}
            onChange={(e) => setLinkGuestToken(e.target.value)}
            placeholder="Guest Access Token (gtok-...)"
            className="px-3.5 py-2.5 rounded-xl border border-[#E6DFCE] bg-[#FFFDF7] font-mono text-[13px]"
          />
          <button
            type="submit"
            disabled={isLinking}
            className="px-5 py-2.5 rounded-xl bg-[#243B8A] hover:bg-[#1B2D6B] text-[#FFFDF7] text-[14px] font-semibold transition-colors cursor-pointer disabled:opacity-60"
          >
            {isLinking
              ? lang === 'mr'
                ? 'जोडत आहे...'
                : 'Linking...'
              : lang === 'mr'
              ? 'ऑर्डर जोडा'
              : 'Link Order'}
          </button>
        </div>
      </form>
    </div>
  );
};
