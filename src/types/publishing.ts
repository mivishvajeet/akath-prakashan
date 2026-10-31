export type VerificationProvenance =
  | 'publisher_verified'
  | 'archival_classic'
  | 'editorial_specimen';

export type BookAvailability =
  | 'in_stock'
  | 'limited_stock'
  | 'out_of_stock'
  | 'forthcoming';

export type EditorialWorkflowStatus =
  | 'draft'
  | 'editorial_review'
  | 'revision'
  | 'approved'
  | 'scheduled'
  | 'published'
  | 'archived';

export type EditorialCategorySlug =
  | 'articles'
  | 'reviews'
  | 'interviews'
  | 'first-page'
  | 'reading-lists'
  | 'literary-world';

export interface BookCoverStyle {
  backgroundHex: string;
  accentHex: string;
  textHex: string;
  borderPattern: 'classic_frame' | 'minimal_archival' | 'poetry_line' | 'essay_monograph';
  emblemText: string;
}

export interface BookRecord {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  transliteratedTitle: string;
  authorId: string;
  contributorIds: string[];
  category: string;
  categorySlug: string;
  topics: string[];
  language: string;
  publisher: string;
  isbn?: string;
  edition: string;
  publicationDate: string;
  pageCount?: number;
  format: string;
  price: number;
  currency: 'INR';
  stock: number;
  availability: BookAvailability;
  shippingNote: string;
  description: string;
  editorialContext: string;
  rightsNote: string;
  isFeatured: boolean;
  isNewRelease: boolean;
  isEditorSelection: boolean;
  editorSelectionNote?: {
    personalNote: string;
    whySelected: string;
    whoShouldRead: string;
    selectedBy: string;
    selectionMonth: string;
  };
  firstPageExcerptId?: string;
  relatedArticleIds: string[];
  relatedBookIds: string[];
  readingListIds: string[];
  verificationStatus: VerificationProvenance;
  provenanceLabel: string;
  coverStyle: BookCoverStyle;
  ownerUserId?: string;
  publicationStatus?: BookPublicationStatus;
  moderationFeedback?: string;
  coverUploadMeta?: {
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    uploadedAt: string;
  };
}

export interface AuthorRecord {
  id: string;
  slug: string;
  name: string;
  transliteratedName: string;
  literaryRole: string;
  region: string;
  biography: string;
  editorialNote: string;
  themes: string[];
  bookIds: string[];
  articleIds: string[];
  publicProfileStatus: 'published' | 'draft';
  verificationStatus: VerificationProvenance;
  provenanceLabel: string;
  ownerUserId?: string;
}

export interface ArticleSection {
  id: string;
  heading: string;
  paragraphs: string[];
  pullQuote?: string;
}

export interface EditorialArticle {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  transliteratedTitle: string;
  authorId: string;
  contributorName: string;
  contributorRole: string;
  categorySlug: EditorialCategorySlug;
  categoryMarathi: string;
  tags: string[];
  publishedAt: string;
  updatedAt?: string;
  readingTimeMinutes: number;
  summary: string;
  leadParagraph: string;
  sections: ArticleSection[];
  workflowStatus: EditorialWorkflowStatus;
  relatedBookIds: string[];
  relatedAuthorIds: string[];
  relatedArticleIds: string[];
  verificationStatus: VerificationProvenance;
  provenanceLabel: string;
}

export interface FirstPageReactionCounts {
  readMore: number;      // मला पुढे वाचायचं आहे
  struckByLine: number;  // या ओळीने लक्ष वेधलं
  wantContext: number;   // मला अजून संदर्भ हवा आहे
}

export interface FirstPageExcerpt {
  id: string;
  slug: string;
  title: string;
  bookId: string;
  authorId: string;
  genreMarathi: string;
  openingHook: string;
  excerptParagraphs: string[];
  highlightedLine: string;
  editorialNote: string;
  rightsStatus: string;
  approvalStatus: 'approved' | 'scheduled';
  blindModeDefault: boolean;
  relatedArticleId?: string;
  reactions: FirstPageReactionCounts;
}

export interface ReadingList {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  curatorName: string;
  curatorRole: string;
  themeTag: string;
  introduction: string;
  items: {
    bookId: string;
    curatorComment: string;
  }[];
  relatedArticleIds: string[];
}

export interface CartItemInput {
  bookId: string;
  quantity: number;
}

export interface ValidatedCartLine {
  bookId: string;
  slug: string;
  title: string;
  authorName: string;
  format: string;
  unitPrice: number;
  requestedQuantity: number;
  approvedQuantity: number;
  lineTotal: number;
  availableStock: number;
  stockWarning?: string;
}

export interface CartQuoteResponse {
  items: ValidatedCartLine[];
  subtotal: number;
  shippingCost: number;
  shippingRuleNote: string;
  grandTotal: number;
  currency: 'INR';
  isValidForCheckout: boolean;
  validationMessages: string[];
}

export type OrderStatus =
  | 'pending_payment'
  | 'payment_verified'
  | 'processing_fulfilment'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'
  | 'payment_failed';

export interface OrderAuditEvent {
  timestamp: string;
  actor: string;
  action: string;
  note: string;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  idempotencyKey: string;
  userId?: string;
  guestAccessToken?: string;
  createdAt: string;
  updatedAt: string;
  customer: {
    fullName: string;
    phone: string;
    email: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    district: string;
    state: string;
    postalCode: string;
    orderNotes?: string;
    isInstitutionalOrder: boolean;
    institutionName?: string;
  };
  items: ValidatedCartLine[];
  subtotal: number;
  shippingCost: number;
  grandTotal: number;
  currency: 'INR';
  paymentMethod: 'upi_verified' | 'razorpay_standard' | 'institutional_invoice';
  paymentStatus: 'unverified' | 'verified' | 'failed' | 'refunded';
  paymentReference?: string;
  orderStatus: OrderStatus;
  fulfilment: {
    courierPartner?: string;
    trackingNumber?: string;
    dispatchedAt?: string;
  };
  auditTrail: OrderAuditEvent[];
}

export interface ManuscriptSubmission {
  id: string;
  referenceCode: string;
  submittedAt: string;
  authorName: string;
  email: string;
  phone: string;
  city: string;
  manuscriptTitle: string;
  category: string;
  wordCountEstimate: string;
  synopsis: string;
  sampleExcerptText: string;
  fileAttachmentMeta?: {
    fileName: string;
    fileType: string;
    fileSizeBytes: number;
  };
  originalWorkConfirmed: boolean;
  privacyConsentConfirmed: boolean;
  reviewStatus: 'received' | 'initial_reading' | 'editorial_committee' | 'response_sent';
  editorialInternalNote?: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  name?: string;
  preferredTopics: string[];
  consentConfirmed: boolean;
  subscriptionSource: string;
  subscribedAt: string;
  status: 'active' | 'unsubscribed';
  unsubscribeToken: string;
}

export interface ContactInquiry {
  id: string;
  submittedAt: string;
  name: string;
  role: 'Reader' | 'Author' | 'Bookstore_Institution' | 'Contributor';
  emailOrPhone: string;
  subject: string;
  message: string;
  preferWhatsAppFollowup: boolean;
}

export type BookPublicationStatus =
  | 'draft'
  | 'submitted_for_review'
  | 'revision_requested'
  | 'approved'
  | 'published'
  | 'unpublished'
  | 'archived';

export type UserRole = 'guest' | 'reader' | 'author' | 'admin';

export type AccountStatus = 'active' | 'suspended' | 'deactivated';

export type Permission =
  | 'catalog:browse'
  | 'checkout:guest'
  | 'account:profile'
  | 'account:orders'
  | 'account:addresses'
  | 'account:wishlist'
  | 'reviews:write'
  | 'author:apply'
  | 'author:profile'
  | 'author:books:create'
  | 'author:books:edit_own'
  | 'author:books:submit_review'
  | 'author:royalties:view'
  | 'admin:dashboard'
  | 'admin:users:manage'
  | 'admin:authors:approve'
  | 'admin:books:moderate'
  | 'admin:orders:manage'
  | 'admin:audit:view';

export interface NotificationPreferences {
  newReleases: boolean;
  orderUpdates: boolean;
  vachankattaDigest: boolean;
  publishingAlerts: boolean;
}

export interface SavedAddress {
  id: string;
  userId: string;
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PublicUserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  bio?: string;
  role: Exclude<UserRole, 'guest'>;
  accountStatus: AccountStatus;
  emailVerified: boolean;
  linkedAuthorId?: string;
  wishlistBookIds: string[];
  personalReadingList: {
    bookId: string;
    note?: string;
    addedAt: string;
  }[];
  notificationPreferences: NotificationPreferences;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface SessionInfo {
  id: string;
  userId: string;
  userAgent: string;
  ipAddress: string;
  createdAt: string;
  expiresAt: string;
  lastActiveAt: string;
  isCurrent?: boolean;
}

export interface AuthorApplicationRecord {
  id: string;
  userId: string;
  applicantName: string;
  applicantEmail: string;
  phone: string;
  penName?: string;
  region: string;
  literaryRole: string;
  biography: string;
  themes: string[];
  portfolioSummary: string;
  sampleWritingExcerpt: string;
  status: 'pending' | 'approved' | 'rejected';
  moderationNote?: string;
  reviewedByUserId?: string;
  reviewedAt?: string;
  createdAuthorId?: string;
  submittedAt: string;
  updatedAt: string;
}

export interface BookReviewRecord {
  id: string;
  bookId: string;
  userId: string;
  reviewerName: string;
  rating: number; // 1 to 5
  title: string;
  comment: string;
  status: 'published' | 'pending_moderation' | 'hidden';
  createdAt: string;
  updatedAt: string;
}

export interface SecurityAuditEvent {
  id: string;
  timestamp: string;
  actorUserId: string | null;
  actorEmail?: string;
  actorRole: UserRole;
  ipAddress: string;
  action: string;
  targetType: 'user' | 'book' | 'order' | 'author_application' | 'session' | 'review' | 'system';
  targetId?: string;
  outcome: 'success' | 'denied' | 'failure';
  details: string;
}

export interface AnalyticsEvent {
  id: string;
  timestamp: string;
  eventType:
    | 'catalogue_search'
    | 'book_detail_view'
    | 'excerpt_opened'
    | 'excerpt_completed'
    | 'excerpt_reaction'
    | 'article_read'
    | 'newsletter_subscribed'
    | 'add_to_cart'
    | 'checkout_initiated'
    | 'purchase_completed'
    | 'payment_failed'
    | 'manuscript_submitted'
    | 'contact_completed';
  entitySlug?: string;
  metadata?: Record<string, string | number | boolean>;
}

