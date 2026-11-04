import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {
  BookRecord,
  InventoryMovementRecord,
  MediaAssetRecord,
  PromotionRecord,
  SiteConfigRecord,
  AdminNotificationRecord,
} from '../types/publishing';
import { generateOpaqueToken } from './authStore';

export const PAYMENT_WEBHOOK_SECRET =
  process.env.PAYMENT_WEBHOOK_SECRET?.trim() ||
  'whsec_akath_dev_hmac_secret_2026';

export const WEBHOOK_TOLERANCE_MS = 5 * 60 * 1000; // 5 minutes replay window
export const processedWebhookCache = new Map<string, number>();

export function computeWebhookSignature(
  rawPayload: string,
  secret = PAYMENT_WEBHOOK_SECRET,
  timestamp?: string
): string {
  const signingInput = timestamp ? `${timestamp}.${rawPayload}` : rawPayload;
  return crypto
    .createHmac('sha256', secret)
    .update(signingInput, 'utf8')
    .digest('hex');
}

export interface WebhookVerificationOptions {
  timestampHeader?: string;
  eventId?: string;
  toleranceMs?: number;
  enforceReplayProtection?: boolean;
}

export interface WebhookVerificationResult {
  valid: boolean;
  reason?:
    | 'missing_signature'
    | 'invalid_timestamp'
    | 'timestamp_expired'
    | 'signature_mismatch'
    | 'replayed_event';
}

export function verifyPaymentWebhookSignatureWithDetails(
  rawPayload: string,
  signatureHeader?: string,
  secret = PAYMENT_WEBHOOK_SECRET,
  options: WebhookVerificationOptions = {}
): WebhookVerificationResult {
  if (!signatureHeader || typeof signatureHeader !== 'string') {
    return { valid: false, reason: 'missing_signature' };
  }
  const cleanSig = signatureHeader.replace(/^sha256=/i, '').trim();
  if (!/^[0-9a-fA-F]{64}$/.test(cleanSig)) {
    return { valid: false, reason: 'signature_mismatch' };
  }

  const toleranceMs = options.toleranceMs ?? WEBHOOK_TOLERANCE_MS;
  const timestampStr = options.timestampHeader?.trim();

  if (timestampStr) {
    const parsedTs = Number(timestampStr);
    if (!Number.isFinite(parsedTs) || parsedTs <= 0) {
      return { valid: false, reason: 'invalid_timestamp' };
    }
    // Support both unix seconds and unix milliseconds
    const timestampMs = parsedTs < 1e12 ? parsedTs * 1000 : parsedTs;
    const ageMs = Math.abs(Date.now() - timestampMs);
    if (ageMs > toleranceMs) {
      return { valid: false, reason: 'timestamp_expired' };
    }
  }

  // Accept signature computed over `${timestamp}.${rawPayload}` (preferred) or `rawPayload`
  const expectedWithTs = timestampStr
    ? computeWebhookSignature(rawPayload, secret, timestampStr)
    : null;
  const expectedRaw = computeWebhookSignature(rawPayload, secret);

  let matched = false;
  try {
    const sigBuf = Buffer.from(cleanSig, 'hex');
    if (expectedWithTs) {
      const expTsBuf = Buffer.from(expectedWithTs, 'hex');
      if (
        sigBuf.length === expTsBuf.length &&
        crypto.timingSafeEqual(sigBuf, expTsBuf)
      ) {
        matched = true;
      }
    }
    if (!matched) {
      const expRawBuf = Buffer.from(expectedRaw, 'hex');
      if (
        sigBuf.length === expRawBuf.length &&
        crypto.timingSafeEqual(sigBuf, expRawBuf)
      ) {
        matched = true;
      }
    }
  } catch {
    return { valid: false, reason: 'signature_mismatch' };
  }

  if (!matched) {
    return { valid: false, reason: 'signature_mismatch' };
  }

  if (options.enforceReplayProtection !== false) {
    const replayKey = options.eventId
      ? `evt:${options.eventId}`
      : `sig:${cleanSig.toLowerCase()}`;
    const existingTs = processedWebhookCache.get(replayKey);
    const now = Date.now();
    if (existingTs && now - existingTs < toleranceMs * 12) {
      return { valid: false, reason: 'replayed_event' };
    }
    processedWebhookCache.set(replayKey, now);
  }

  return { valid: true };
}

export function verifyPaymentWebhookSignature(
  rawPayload: string,
  signatureHeader?: string,
  secret = PAYMENT_WEBHOOK_SECRET,
  options: WebhookVerificationOptions = {}
): boolean {
  return verifyPaymentWebhookSignatureWithDetails(
    rawPayload,
    signatureHeader,
    secret,
    options
  ).valid;
}

// ============================================================================
// 1. INITIAL SEED STORES FOR INVENTORY LEDGER, MEDIA, PROMOTIONS & SITE CONFIG
// ============================================================================

export const inventoryMovementsStore: InventoryMovementRecord[] = [
  {
    id: 'inv-seed-1',
    timestamp: '2026-01-26T09:00:00.000Z',
    bookId: 'book-scholar-juice',
    bookTitle: 'स्कॉलर ज्यूस',
    isbn: '978-81-996989-6-3',
    type: 'stock_in',
    delta: 35,
    previousStock: 0,
    newStock: 35,
    reason: 'Initial print run received (Akath Prakashan Edition No. 01)',
    actorEmail: 'admin.console@akath.in',
  },
  {
    id: 'inv-seed-2',
    timestamp: '2026-10-20T10:15:00.000Z',
    bookId: 'book-dhukyachi-dulai',
    bookTitle: 'धुक्याची दुलई',
    isbn: '978-81-996989-5-6',
    type: 'order_fulfilled',
    delta: -2,
    previousStock: 32,
    newStock: 30,
    reason: 'Order AK-2026-1041 verified & dispatched',
    actorEmail: 'system@akath.in',
    orderNumber: 'AK-2026-1041',
  },
  {
    id: 'inv-seed-3',
    timestamp: '2026-02-20T11:30:00.000Z',
    bookId: 'book-lokshahimadhye-samajmadhyamancha-vapar',
    bookTitle: 'लोकशाहीमध्ये समाजमाध्यमांचा वापर',
    isbn: '978-81-996989-4-9',
    type: 'stock_in',
    delta: 40,
    previousStock: 0,
    newStock: 40,
    reason: 'First edition stock verified',
    actorEmail: 'admin.console@akath.in',
  },
];

export const mediaAssetsStore: MediaAssetRecord[] = [
  {
    id: 'med-seed-1',
    fileName: 'akath-tortoise-colophon-crest.svg',
    title: 'अकथ कासव मुद्रा (Official Tortoise Colophon Emblem)',
    altText: 'अकथ प्रकाशन कासव आणि उघडलेले पुस्तक अधिकृत मुद्रा',
    caption: 'अकथ प्रकाशनची अधिकृत कासव आणि उघडलेले पुस्तक मुद्रा.',
    credit: 'अकथ प्रकाशन कला विभाग, नांदेड',
    mimeType: 'image/svg+xml',
    sizeBytes: 4280,
    url: `data:image/svg+xml;utf8,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 320" fill="none"><rect width="240" height="320" rx="16" fill="#243B8A"/><rect x="16" y="16" width="208" height="288" rx="8" stroke="#FFD966" stroke-width="2" stroke-opacity="0.65"/><circle cx="120" cy="135" r="46" fill="#FFD966" fill-opacity="0.18" stroke="#FFD966" stroke-width="2"/><ellipse cx="120" cy="135" rx="30" ry="28" fill="#FFFDF7"/><path d="M120 195 C95 180 68 178 44 184 C56 196 88 202 120 212 C152 202 184 196 196 184 C172 178 145 180 120 195 Z" fill="#EF6855"/><text x="120" y="268" text-anchor="middle" fill="#FFFDF7" font-family="Georgia, serif" font-size="20" font-weight="bold">अकथ प्रकाशन</text></svg>`
    )}`,
    folder: 'book_covers',
    cropAspect: '3:4',
    uploadedBy: 'admin.console@akath.in',
    uploadedAt: '2026-10-01T10:00:00.000Z',
  },
  {
    id: 'med-seed-2',
    fileName: 'godavari-ghat-archival-banner.svg',
    title: 'गोदावरी घाट आणि मराठवाडा स्थापत्य कमान',
    altText: 'गोदावरी नदीकाठची दगडी कमान आणि संध्याकाळचा प्रकाश',
    caption: 'नांदेड व पैठण परिसरातील गोदावरी काठावरील ऐतिहासिक दगडी घाट.',
    credit: 'अकथ दृश्य संग्रहालय',
    mimeType: 'image/svg+xml',
    sizeBytes: 5120,
    url: `data:image/svg+xml;utf8,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" fill="none"><rect width="800" height="450" fill="#FFFDF7"/><rect x="24" y="24" width="752" height="402" rx="18" fill="#243B8A"/><path d="M140 426 V240 C140 120 260 54 400 44 C540 54 660 120 660 240 V426" stroke="#FFD966" stroke-width="2.5" stroke-opacity="0.55"/><circle cx="400" cy="210" r="58" fill="#FFD966" fill-opacity="0.9"/><path d="M100 350 Q400 320 700 350" stroke="#EF6855" stroke-width="4"/><text x="400" y="395" text-anchor="middle" fill="#FFFDF7" font-family="Georgia, serif" font-size="24">वाचनकट्टा · अकथ साहित्य मंच</text></svg>`
    )}`,
    folder: 'article_media',
    cropAspect: '16:9',
    uploadedBy: 'admin.console@akath.in',
    uploadedAt: '2026-10-10T12:00:00.000Z',
  },
];

export const promotionsStore: PromotionRecord[] = [
  {
    id: 'promo-seed-1',
    code: 'AKATH10',
    title: 'वाचक स्वागत सवलत (10% Off)',
    description: '₹४०० किंवा अधिक मूल्याच्या पुस्तक खरेदीवर १०% थेट सवलत.',
    discountType: 'percentage',
    discountValue: 10,
    minOrderSubtotal: 400,
    maxDiscountAmount: 250,
    active: true,
    startsAt: '2026-10-01T00:00:00.000Z',
    expiresAt: '2027-12-31T23:59:59.000Z',
    usageLimit: 500,
    usedCount: 14,
    createdAt: '2026-10-01T09:00:00.000Z',
    updatedAt: '2026-10-20T09:00:00.000Z',
  },
  {
    id: 'promo-seed-2',
    code: 'GRANTH100',
    title: 'ग्रंथालय व अभ्यासक विशेष सवलत (₹100 Off)',
    description: '₹९०० पेक्षा जास्त पुस्तकांच्या एकत्रित ऑर्डरवर ₹१०० सवलत.',
    discountType: 'fixed_amount',
    discountValue: 100,
    minOrderSubtotal: 900,
    active: true,
    startsAt: '2026-10-01T00:00:00.000Z',
    usageLimit: 200,
    usedCount: 5,
    createdAt: '2026-10-05T09:00:00.000Z',
    updatedAt: '2026-10-18T09:00:00.000Z',
  },
];

export const adminNotificationsStore: AdminNotificationRecord[] = [
  {
    id: 'notif-seed-1',
    createdAt: '2026-10-26T14:25:00.000Z',
    type: 'author_application',
    recipientEmail: 'admin.console@akath.in',
    title: 'नवीन लेखक अर्ज प्राप्त: कावेरी इनामदार',
    message: 'छत्रपती संभाजीनगर येथील लोकसाहित्य संशोधक कावेरी इनामदार यांचा लेखक अर्ज संपादकीय मंजुरीसाठी प्रलंबित आहे.',
    read: false,
    targetPath: '/admin/authors',
  },
  {
    id: 'notif-seed-2',
    createdAt: '2026-10-27T09:15:00.000Z',
    type: 'low_stock_alert',
    recipientEmail: 'admin.console@akath.in',
    title: 'प्रकाशन नोंद: स्कॉलर ज्यूस (अकथ प्रकाशन क्र. ०१)',
    message: '‘स्कॉलर ज्यूस’ या दीर्घकथा संग्रहाच्या ३५ प्रती वितरणासाठी उपलब्ध आहेत.',
    read: false,
    targetPath: '/admin/books',
  },
];

export const INITIAL_SITE_CONFIG: SiteConfigRecord = {
  hero: {
    eyebrowMarathi: 'समकालीन मराठी साहित्य आणि विचारमंच',
    eyebrowEnglish: 'Contemporary Marathi Literature & Literary Journal',
    headlineMarathi: 'मराठी साहित्य. नवे आवाज. दीर्घ संवाद.',
    headlineEnglish: 'मराठी साहित्य. नवे आवाज. दीर्घ संवाद.',
    subheadlineMarathi: 'काही पुस्तकं संपतात. काही वाचकांसोबत राहतात.',
    subheadlineEnglish: 'Some books end. Others stay with the reader for life.',
    leadMarathi:
      'अकथ प्रकाशन हे गंभीर मराठी कादंबरी, कविता, समीक्षा, ललित गद्य आणि जागतिक अनुवादांना संपादकीय साक्षेपाने वाचकांपर्यंत पोहोचवणारे स्वतंत्र प्रकाशन गृह आहे.',
    leadEnglish:
      'Akath Prakashan is an independent Marathi literary publishing house and journal dedicated to serious fiction, poetry, cultural criticism, and translations.',
    primaryCtaMarathi: 'पुस्तके पहा',
    primaryCtaEnglish: 'Explore Books',
    secondaryCtaMarathi: 'पहिले पान वाचा',
    secondaryCtaEnglish: 'Start Reading',
  },
  promoBanner: {
    enabled: true,
    badgeText: 'AKATH10',
    messageMarathi:
      'शरद ऋतू वाचन अभियान: ₹६००+ ऑर्डरवर मोफत स्पीड पोस्ट वितरण आणि AKATH10 कूपनने १०% वाचक सवलत.',
    messageEnglish:
      'Autumn Reading Dispatch: Free India Post shipping on ₹600+ orders & 10% off with code AKATH10.',
    couponCode: 'AKATH10',
    ctaLink: '/books',
  },
  featuredBookIds: [
    'book-scholar-juice',
    'book-dhukyachi-dulai',
    'book-lokshahimadhye-samajmadhyamancha-vapar',
  ],
  highlightedCategories: [
    { slug: 'novel', labelMarathi: 'कादंबरी', labelEnglish: 'Novels', featured: true },
    { slug: 'poetry', labelMarathi: 'कवितासंग्रह', labelEnglish: 'Poetry', featured: true },
    { slug: 'essays', labelMarathi: 'समीक्षा व निबंध', labelEnglish: 'Criticism & Essays', featured: true },
    { slug: 'short-stories', labelMarathi: 'कथासंग्रह', labelEnglish: 'Short Stories', featured: true },
    { slug: 'translation', labelMarathi: 'अनुवाद', labelEnglish: 'Translations', featured: true },
  ],
  sectionOrder: [
    'promo_banner',
    'hero',
    'featured_catalogue',
    'first_page_excerpt',
    'turtle_philosophy',
    'vachankatta_journal',
    'authors_showcase',
    'newsletter',
  ],
  lowStockGlobalThreshold: 5,
  freeShippingThreshold: 600,
  standardShippingFee: 45,
  seoDefaults: {
    siteTitle: 'अकथ प्रकाशन (Akath Prakashan) — स्वतंत्र मराठी साहित्य आणि प्रकाशन मंच',
    metaDescription:
      'अकथ प्रकाशन, नांदेड: स्वतंत्र मराठी साहित्य प्रकाशन संस्था, वाचनकट्टा संपादकीय मंच, पहिले पान उतारा वाचन आणि थेट वाचक पुस्तकपेढी.',
  },
  status: 'published',
  updatedAt: '2026-10-30T10:00:00.000Z',
  updatedBy: 'admin.console@akath.in',
  history: [
    {
      versionId: 'sc-ver-initial',
      savedAt: '2026-10-30T10:00:00.000Z',
      actorEmail: 'admin.console@akath.in',
      note: 'Initial Akath Prakashan storefront configuration',
      hero: {
        eyebrowMarathi: 'समकालीन मराठी साहित्य आणि विचारमंच',
        eyebrowEnglish: 'Contemporary Marathi Literature & Literary Journal',
        headlineMarathi: 'मराठी साहित्य. नवे आवाज. दीर्घ संवाद.',
        headlineEnglish: 'मराठी साहित्य. नवे आवाज. दीर्घ संवाद.',
        subheadlineMarathi: 'काही पुस्तकं संपतात. काही वाचकांसोबत राहतात.',
        subheadlineEnglish: 'Some books end. Others stay with the reader for life.',
        leadMarathi:
          'अकथ प्रकाशन हे गंभीर मराठी कादंबरी, कविता, समीक्षा, ललित गद्य आणि जागतिक अनुवादांना संपादकीय साक्षेपाने वाचकांपर्यंत पोहोचवणारे स्वतंत्र प्रकाशन गृह आहे.',
        leadEnglish:
          'Akath Prakashan is an independent Marathi literary publishing house and journal dedicated to serious fiction, poetry, cultural criticism, and translations.',
        primaryCtaMarathi: 'पुस्तके पहा',
        primaryCtaEnglish: 'Explore Books',
        secondaryCtaMarathi: 'पहिले पान वाचा',
        secondaryCtaEnglish: 'Start Reading',
      },
      promoBanner: {
        enabled: true,
        badgeText: 'AKATH10',
        messageMarathi:
          'शरद ऋतू वाचन अभियान: ₹६००+ ऑर्डरवर मोफत स्पीड पोस्ट वितरण आणि AKATH10 कूपनने १०% वाचक सवलत.',
        messageEnglish:
          'Autumn Reading Dispatch: Free India Post shipping on ₹600+ orders & 10% off with code AKATH10.',
        couponCode: 'AKATH10',
        ctaLink: '/books',
      },
      featuredBookIds: [
        'book-scholar-juice',
        'book-dhukyachi-dulai',
        'book-lokshahimadhye-samajmadhyamancha-vapar',
      ],
      highlightedCategories: [
        { slug: 'novel', labelMarathi: 'कादंबरी', labelEnglish: 'Novels', featured: true },
        { slug: 'poetry', labelMarathi: 'कवितासंग्रह', labelEnglish: 'Poetry', featured: true },
        { slug: 'essays', labelMarathi: 'समीक्षा व निबंध', labelEnglish: 'Criticism & Essays', featured: true },
        { slug: 'short-stories', labelMarathi: 'कथासंग्रह', labelEnglish: 'Short Stories', featured: true },
        { slug: 'translation', labelMarathi: 'अनुवाद', labelEnglish: 'Translations', featured: true },
      ],
      sectionOrder: [
        'promo_banner',
        'hero',
        'featured_catalogue',
        'first_page_excerpt',
        'turtle_philosophy',
        'vachankatta_journal',
        'authors_showcase',
        'newsletter',
      ],
      lowStockGlobalThreshold: 5,
      freeShippingThreshold: 600,
      standardShippingFee: 45,
      seoDefaults: {
        siteTitle: 'अकथ प्रकाशन (Akath Prakashan) — स्वतंत्र मराठी साहित्य आणि प्रकाशन मंच',
        metaDescription:
          'अकथ प्रकाशन, नांदेड व पुणे: स्वतंत्र मराठी साहित्य प्रकाशन संस्था, वाचनकट्टा संपादकीय मंच, पहिले पान उतारा वाचन आणि थेट वाचक पुस्तकपेढी.',
      },
    },
  ],
};

export const siteConfigStore: {
  published: SiteConfigRecord;
  draft: SiteConfigRecord;
} = {
  published: structuredClone(INITIAL_SITE_CONFIG),
  draft: structuredClone(INITIAL_SITE_CONFIG),
};

// ============================================================================
// 2. CSV IMPORT / EXPORT PARSER & GENERATOR WITH VALIDATION
// ============================================================================

export function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

export function escapeCsvCell(val: unknown): string {
  const str = val === null || val === undefined ? '' : String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportBooksToCsv(books: BookRecord[]): string {
  const headers = [
    'id',
    'slug',
    'title',
    'transliteratedTitle',
    'authorId',
    'category',
    'isbn',
    'price',
    'listPrice',
    'stock',
    'availability',
    'publicationStatus',
    'edition',
    'pageCount',
    'isFeatured',
  ];
  const rows = books.map((b) =>
    [
      b.id,
      b.slug,
      b.title,
      b.transliteratedTitle,
      b.authorId,
      b.category,
      b.isbn || '',
      b.price,
      b.listPrice || b.price,
      b.stock,
      b.availability,
      b.publicationStatus || 'published',
      b.edition,
      b.pageCount || 160,
      b.isFeatured ? 'true' : 'false',
    ]
      .map(escapeCsvCell)
      .join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}

export function exportInventoryLedgerToCsv(
  movements: InventoryMovementRecord[]
): string {
  const headers = [
    'id',
    'timestamp',
    'bookId',
    'bookTitle',
    'isbn',
    'type',
    'delta',
    'previousStock',
    'newStock',
    'reason',
    'actorEmail',
    'orderNumber',
  ];
  const rows = movements.map((m) =>
    [
      m.id,
      m.timestamp,
      m.bookId,
      m.bookTitle,
      m.isbn || '',
      m.type,
      m.delta,
      m.previousStock,
      m.newStock,
      m.reason,
      m.actorEmail,
      m.orderNumber || '',
    ]
      .map(escapeCsvCell)
      .join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}

// ============================================================================
// 3. PERSISTENT DISK SNAPSHOT / BACKUP & ROLLBACK MANAGER
// ============================================================================

const BACKUP_FILE_PATH = path.resolve(
  process.cwd(),
  process.env.CMS_STORAGE_FILE || '.aistudio/cms-state.json'
);

export interface CmsBackupSnapshot {
  snapshotId: string;
  createdAt: string;
  actorEmail: string;
  booksCount: number;
  articlesCount: number;
  ordersCount: number;
  data: {
    books: BookRecord[];
    inventoryMovements: InventoryMovementRecord[];
    mediaAssets: MediaAssetRecord[];
    promotions: PromotionRecord[];
    siteConfig: SiteConfigRecord;
  };
}

export const backupSnapshotsStore: CmsBackupSnapshot[] = [];

export function saveCmsBackupSnapshot(params: {
  actorEmail: string;
  books: BookRecord[];
}): CmsBackupSnapshot {
  const snapshot: CmsBackupSnapshot = {
    snapshotId: `bkp-${Date.now()}-${generateOpaqueToken(3)}`,
    createdAt: new Date().toISOString(),
    actorEmail: params.actorEmail,
    booksCount: params.books.length,
    articlesCount: 0,
    ordersCount: 0,
    data: {
      books: structuredClone(params.books),
      inventoryMovements: structuredClone(inventoryMovementsStore),
      mediaAssets: structuredClone(mediaAssetsStore),
      promotions: structuredClone(promotionsStore),
      siteConfig: structuredClone(siteConfigStore.published),
    },
  };

  backupSnapshotsStore.unshift(snapshot);
  if (backupSnapshotsStore.length > 15) {
    backupSnapshotsStore.pop();
  }

  try {
    const dir = path.dirname(BACKUP_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(
      BACKUP_FILE_PATH,
      JSON.stringify(
        {
          updatedAt: snapshot.createdAt,
          latestSnapshotId: snapshot.snapshotId,
          promotions: promotionsStore,
          siteConfig: siteConfigStore.published,
        },
        null,
        2
      ),
      'utf-8'
    );
  } catch {
    // Ignore read-only filesystem errors in ephemeral containers
  }

  return snapshot;
}
