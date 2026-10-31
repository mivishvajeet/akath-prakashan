import { createContext, useContext } from 'react';
import { AppLanguage } from '../utils/validation';

export interface TranslationDictionary {
  brandName: string;
  brandTagline: string;
  langToggleAria: string;
  nav: {
    books: string;
    vachankatta: string;
    firstPage: string;
    authors: string;
    about: string;
    submitManuscript: string;
    trackOrder: string;
    contact: string;
    search: string;
    searchAria: string;
    cart: string;
    editorialDesk: string;
    auditReport: string;
    openMenu: string;
    closeMenu: string;
  };
  home: {
    heroEyebrow: string;
    heroHeadline: string;
    heroSubheadline: string;
    heroLead: string;
    ctaExploreBooks: string;
    ctaStartReading: string;
    featuredBooksEyebrow: string;
    featuredBooksTitle: string;
    viewAllBooks: string;
    firstPageEyebrow: string;
    firstPageTitle: string;
    firstPageSubtitle: string;
    editorSelectionEyebrow: string;
    vachankattaEyebrow: string;
    vachankattaTitle: string;
    viewAllArticles: string;
    authorsEyebrow: string;
    authorsTitle: string;
    viewAllAuthors: string;
    manuscriptTitle: string;
    manuscriptBody: string;
    manuscriptCta: string;
    newsletterTitle: string;
    newsletterBody: string;
    newsletterNameLabel: string;
    newsletterNamePlaceholder: string;
    newsletterEmailLabel: string;
    newsletterEmailPlaceholder: string;
    newsletterSubmit: string;
    newsletterPrivacyNote: string;
  };
  catalogue: {
    eyebrow: string;
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    allCategories: string;
    inStockOnly: string;
    sortBy: string;
    sortFeatured: string;
    sortNewest: string;
    sortPriceLow: string;
    sortPriceHigh: string;
    resultsCount: string;
    noMatchesTitle: string;
    noMatchesBody: string;
    resetFilters: string;
  };
  book: {
    byAuthor: string;
    price: string;
    inStock: string;
    limitedStock: string;
    outOfStock: string;
    forthcoming: string;
    addToCart: string;
    addedToCart: string;
    buyNow: string;
    readExcerpt: string;
    viewDetails: string;
    specifications: string;
    isbn: string;
    edition: string;
    pages: string;
    format: string;
    language: string;
    publisher: string;
    editorialNote: string;
    aboutBook: string;
    relatedBooks: string;
  };
  cart: {
    title: string;
    itemCountLabel: string;
    emptyTitle: string;
    emptySubtitle: string;
    emptyCta: string;
    recommendationsTitle: string;
    unitPrice: string;
    quantity: string;
    decreaseQty: string;
    increaseQty: string;
    remove: string;
    removeAria: string;
    lineTotal: string;
    availability: string;
    orderSummary: string;
    subtotal: string;
    discount: string;
    shipping: string;
    freeShipping: string;
    taxNote: string;
    grandTotal: string;
    proceedToCheckout: string;
    continueShopping: string;
    clearCart: string;
  };
  checkout: {
    title: string;
    subtitle: string;
    backToCart: string;
    contactSection: string;
    shippingSection: string;
    paymentSection: string;
    requiredMarker: string;
    optionalMarker: string;
    fullNameLabel: string;
    fullNamePlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    phoneHint: string;
    emailLabel: string;
    emailPlaceholder: string;
    emailHint: string;
    addressLine1Label: string;
    addressLine1Placeholder: string;
    addressLine2Label: string;
    cityLabel: string;
    districtLabel: string;
    stateLabel: string;
    postalCodeLabel: string;
    postalCodePlaceholder: string;
    orderNotesLabel: string;
    institutionalToggle: string;
    institutionNameLabel: string;
    paymentUpi: string;
    paymentCard: string;
    paymentInstitutional: string;
    placeOrderBtn: string;
    submittingBtn: string;
    errors: {
      fullNameRequired: string;
      addressRequired: string;
      cityRequired: string;
      fixFormErrors: string;
    };
  };
  vachankatta: {
    eyebrow: string;
    title: string;
    subtitle: string;
    allCategories: string;
    articles: string;
    reviews: string;
    interviews: string;
    firstPage: string;
    readingLists: string;
    literaryWorld: string;
    readingTime: string;
    readFullArticle: string;
    blindModeToggle: string;
    revealIdentity: string;
    hideIdentity: string;
    reactionReadMore: string;
    reactionStruckByLine: string;
    reactionWantContext: string;
  };
  manuscript: {
    title: string;
    subtitle: string;
    authorNameLabel: string;
    manuscriptTitleLabel: string;
    categoryLabel: string;
    wordCountLabel: string;
    synopsisLabel: string;
    sampleExcerptLabel: string;
    submitBtn: string;
    successTitle: string;
  };
  contact: {
    title: string;
    subtitle: string;
    nameLabel: string;
    roleLabel: string;
    subjectLabel: string;
    messageLabel: string;
    submitBtn: string;
    successMessage: string;
  };
  trackOrder: {
    title: string;
    subtitle: string;
    orderNumberLabel: string;
    contactLabel: string;
    searchBtn: string;
  };
  footer: {
    aboutBlurb: string;
    booksAndCatalogue: string;
    editorialJournal: string;
    readerServices: string;
    shippingPolicy: string;
    privacyPolicy: string;
    termsOfUse: string;
    rightsReserved: string;
  };
}

export const TRANSLATIONS: Record<AppLanguage, TranslationDictionary> = {
  mr: {
    brandName: 'अकथ प्रकाशन',
    brandTagline: 'स्वतंत्र मराठी साहित्य आणि प्रकाशन गृह',
    langToggleAria: 'भाषा निवडा: मराठी किंवा इंग्रजी',
    nav: {
      books: 'पुस्तके',
      vachankatta: 'वाचनकट्टा',
      firstPage: 'पहिले पान',
      authors: 'लेखक',
      about: 'अकथविषयी',
      submitManuscript: 'हस्तलिखित पाठवा',
      trackOrder: 'ऑर्डर ट्रॅकिंग',
      contact: 'संपर्क',
      search: 'शोधा',
      searchAria: 'पुस्तके, लेखक आणि लेख शोधा',
      cart: 'पिशवी',
      editorialDesk: 'संपादकीय कक्ष',
      auditReport: 'तांत्रिक परीक्षण',
      openMenu: 'मेनू उघडा',
      closeMenu: 'मेनू बंद करा',
    },
    home: {
      heroEyebrow: 'समकालीन मराठी साहित्य आणि विचारमंच',
      heroHeadline: 'मराठी साहित्य. नवे आवाज. दीर्घ संवाद.',
      heroSubheadline: 'काही पुस्तकं संपतात. काही वाचकांसोबत राहतात.',
      heroLead:
        'अकथ प्रकाशन हे केवळ पुस्तकांचे दुकान नाही; तो गंभीर मराठी वाचक, नवे लेखक आणि समकालीन साहित्यिक जाणिवा यांमधील शांत, आशयघन संवाद आहे.',
      ctaExploreBooks: 'पुस्तकं शोधा',
      ctaStartReading: 'वाचायला सुरुवात करा',
      featuredBooksEyebrow: 'अकथ ग्रंथसूची',
      featuredBooksTitle: 'निवडक मराठी प्रकाशने',
      viewAllBooks: 'सर्व पुस्तके पहा',
      firstPageEyebrow: 'वाचन अनुभव · पहिले पान',
      firstPageTitle: 'पुस्तक खरेदी करण्यापूर्वी त्याचे पहिले पान वाचा',
      firstPageSubtitle:
        'मुखपृष्ठ किंवा नावाच्या पलीकडे जाऊन थेट लेखनाच्या भाषेशी आणि लयीशी जोडले जा.',
      editorSelectionEyebrow: 'संपादकांची या महिन्याची निवड',
      vachankattaEyebrow: 'वाचनकट्टा · साहित्यिक नियतकालिक',
      vachankattaTitle: 'समीक्षा, दीर्घ निबंध आणि संपादकीय संवाद',
      viewAllArticles: 'वाचनकट्ट्यावरील सर्व लेख पहा',
      authorsEyebrow: 'अकथचे लेखक आणि कवी',
      authorsTitle: 'समकालीन मराठी साहित्याचे नवे आणि प्रगल्भ स्वर',
      viewAllAuthors: 'सर्व लेखकांचा परिचय पहा',
      manuscriptTitle: 'नवीन हस्तलिखित पाठवा',
      manuscriptBody:
        'तुमची कादंबरी, कथासंग्रह, कवितासंग्रह, ललित गद्य किंवा अनुवादित संहिता आमच्या संपादकीय मंडळाकडे पाठवा. प्रत्येक संहितेचे गांभीर्याने वाचन केले जाते.',
      manuscriptCta: 'हस्तलिखित मार्गदर्शक तत्त्वे पहा',
      newsletterTitle: 'अकथ वाचनपत्रिका',
      newsletterBody:
        'दर पंधरवड्याला निवडक मराठी उतारे, संपादकीय टिपणे आणि नवीन पुस्तकांची माहिती थेट तुमच्या ईमेलवर. कोणताही जाहिरातवजा गोंगाट नाही.',
      newsletterNameLabel: 'तुमचे नाव (ऐच्छिक)',
      newsletterNamePlaceholder: 'उदा. प्रणाली देशमुख',
      newsletterEmailLabel: 'ईमेल पत्ता',
      newsletterEmailPlaceholder: 'reader@example.com',
      newsletterSubmit: 'वाचनपत्रिकेत सहभागी व्हा',
      newsletterPrivacyNote:
        'आम्ही तुमचा ईमेल कधीही इतरांना देत नाही. कधीही सदस्यत्व रद्द करता येईल.',
    },
    catalogue: {
      eyebrow: 'अकथ ग्रंथदालन',
      title: 'पुस्तक दालन आणि संपूर्ण यादी',
      subtitle:
        'कथा, कादंबरी, कविता, समीक्षा, ललित गद्य आणि भाषांतर — मूळ मराठी संहिता आणि संपादकीय टिपणांसह.',
      searchPlaceholder: 'पुस्तकाचे नाव, लेखक किंवा विषय शोधा...',
      allCategories: 'सर्व साहित्य प्रकार',
      inStockOnly: 'फक्त सध्या उपलब्ध पुस्तके',
      sortBy: 'क्रमवारी',
      sortFeatured: 'संपादकीय निवड',
      sortNewest: 'नवीन प्रकाशने प्रथम',
      sortPriceLow: 'किंमत: कमी ते जास्त',
      sortPriceHigh: 'किंमत: जास्त ते कमी',
      resultsCount: 'पुस्तके सापडली',
      noMatchesTitle: 'या शोधाशी जुळणारे कोणतेही पुस्तक सापडले नाही',
      noMatchesBody:
        'कृपया वेगळा शब्द वापरून पहा किंवा सर्व फिल्टर काढून संपूर्ण ग्रंथसूची पहा.',
      resetFilters: 'सर्व फिल्टर रिसेट करा',
    },
    book: {
      byAuthor: 'लेखक:',
      price: 'मूल्य',
      inStock: 'उपलब्ध',
      limitedStock: 'मर्यादित साठा',
      outOfStock: 'सध्या उपलब्ध नाही',
      forthcoming: 'लवकरच प्रकाशित होत आहे',
      addToCart: 'पिशवीत जोडा',
      addedToCart: 'पिशवीत जोडले',
      buyNow: 'आताच खरेदी करा',
      readExcerpt: 'पहिले पान वाचा',
      viewDetails: 'तपशील पहा',
      specifications: 'ग्रंथ तपशील',
      isbn: 'ISBN क्रमांक',
      edition: 'आवृत्ती',
      pages: 'पृष्ठे',
      format: 'बांधणी',
      language: 'भाषा',
      publisher: 'प्रकाशक',
      editorialNote: 'संपादकीय संदर्भ आणि भूमिका',
      aboutBook: 'पुस्तकाविषयी',
      relatedBooks: 'याच प्रवाहातील इतर पुस्तके',
    },
    cart: {
      title: 'तुमची पुस्तक पिशवी',
      itemCountLabel: 'निवडलेली पुस्तके',
      emptyTitle: 'तुमची पुस्तक पिशवी सध्या रिकामी आहे',
      emptySubtitle:
        'अकथ प्रकाशनच्या दालनातील कादंबऱ्या, कवितासंग्रह आणि वैचारिक पुस्तके पाहण्यासाठी खालील पर्याय निवडा.',
      emptyCta: 'पुस्तक दालनाकडे जा',
      recommendationsTitle: 'वाचकांसाठी निवडक पुस्तके',
      unitPrice: 'प्रति प्रत मूल्य',
      quantity: 'प्रतींची संख्या',
      decreaseQty: 'संख्या एकने कमी करा',
      increaseQty: 'संख्या एकने वाढवा',
      remove: 'काढून टाका',
      removeAria: 'हे पुस्तक पिशवीतून काढून टाका',
      lineTotal: 'एकूण मूल्य',
      availability: 'उपलब्धता',
      orderSummary: 'तुमचा ऑर्डर तपशील',
      subtotal: 'उप-एकूण (पुस्तक मूल्य)',
      discount: 'सवलत',
      shipping: 'वितरण शुल्क (स्पीड पोस्ट / कुरिअर)',
      freeShipping: 'मोफत',
      taxNote: 'कर (छापील पुस्तकांवर ०% GST)',
      grandTotal: 'एकूण देय रक्कम',
      proceedToCheckout: 'पुढे चेकआउटकडे जा',
      continueShopping: 'अजून पुस्तकं पहा',
      clearCart: 'पिशवी रिकामी करा',
    },
    checkout: {
      title: 'ऑर्डर आणि वितरण तपशील',
      subtitle: 'खाते तयार न करता थेट आणि सुरक्षित पुस्तक खरेदी.',
      backToCart: 'पिशवीत परत जा',
      contactSection: '१. वाचक संपर्क माहिती',
      shippingSection: '२. पुस्तक वितरणाचा पत्ता',
      paymentSection: '३. पेमेंट पद्धत',
      requiredMarker: 'आवश्यक',
      optionalMarker: 'ऐच्छिक',
      fullNameLabel: 'पूर्ण नाव',
      fullNamePlaceholder: 'उदा. डॉ. श्रीकांत कुलकर्णी',
      phoneLabel: 'भारतीय मोबाईल क्रमांक',
      phonePlaceholder: 'उदा. 9876543210 किंवा +91 98765 43210',
      phoneHint: 'कुरिअर ट्रॅकिंगसाठी १० अंकी भारतीय मोबाईल क्रमांक (६-९ ने सुरू होणारा).',
      emailLabel: 'ईमेल पत्ता',
      emailPlaceholder: 'उदा. reader@example.com',
      emailHint: 'ऑर्डरची अधिकृत पावती आणि स्पीड पोस्ट ट्रॅकिंग या ईमेलवर पाठवले जाईल.',
      addressLine1Label: 'घर क्रमांक, इमारत आणि रस्त्याचा पत्ता',
      addressLine1Placeholder: 'उदा. १२, अक्षर निवास, कर्वे रस्ता',
      addressLine2Label: 'जवळची खूण / परिसर',
      cityLabel: 'शहर / गाव',
      districtLabel: 'जिल्हा',
      stateLabel: 'राज्य',
      postalCodeLabel: 'पिन कोड (PIN Code)',
      postalCodePlaceholder: 'उदा. 411004',
      orderNotesLabel: 'वितरणाबाबत काही विशेष सूचना',
      institutionalToggle: 'ही ऑर्डर ग्रंथालय, महाविद्यालय किंवा संस्थेसाठी आहे',
      institutionNameLabel: 'संस्थेचे / ग्रंथालयाचे नाव',
      paymentUpi: 'UPI / QR पेमेंट (त्वरित सर्व्हर पडताळणी)',
      paymentCard: 'डेबिट / क्रेडिट कार्ड / नेटबँकिंग',
      paymentInstitutional: 'संस्थात्मक देयक (अधिकृत पावतीसह)',
      placeOrderBtn: 'ऑर्डर निश्चित करा आणि पेमेंट करा',
      submittingBtn: 'ऑर्डर तपासली जात आहे...',
      errors: {
        fullNameRequired: 'कृपया तुमचे पूर्ण नाव लिहा.',
        addressRequired: 'कृपया पूर्ण घर क्रमांक, रस्ता किंवा परिसराचा पत्ता लिहा.',
        cityRequired: 'कृपया तुमचे शहर किंवा गाव लिहा.',
        fixFormErrors: 'कृपया खालील फॉर्ममधील त्रुटी दुरुस्त करून पुन्हा प्रयत्न करा.',
      },
    },
    vachankatta: {
      eyebrow: 'वाचनकट्टा · अकथ साहित्य पत्रिका',
      title: 'वाचनकट्टा: समकालीन मराठी साहित्य विचार',
      subtitle:
        'दीर्घ निबंध, सखोल पुस्तक समीक्षा, लेखकांच्या मुलाखती आणि नव्या पुस्तकांचे पहिले पान.',
      allCategories: 'सर्व विभाग',
      articles: 'दीर्घ लेख',
      reviews: 'पुस्तक समीक्षा',
      interviews: 'मुलाखती',
      firstPage: 'पहिले पान (उतारे)',
      readingLists: 'वाचन याद्या',
      literaryWorld: 'साहित्य विश्व',
      readingTime: 'मिनिटे वाचन वेळ',
      readFullArticle: 'पूर्ण लेख वाचा',
      blindModeToggle: 'आधी उतारा वाचा, नंतर लेखक जाणून घ्या',
      revealIdentity: 'पुस्तक आणि लेखकाचे नाव पहा',
      hideIdentity: 'पुस्तक आणि लेखकाचे नाव लपवा',
      reactionReadMore: 'मला पुढे वाचायचं आहे',
      reactionStruckByLine: 'या ओळीने लक्ष वेधलं',
      reactionWantContext: 'मला अजून संदर्भ हवा आहे',
    },
    manuscript: {
      title: 'हस्तलिखित सादरीकरण कक्ष',
      subtitle: 'अकथ प्रकाशनकडे तुमचे मूळ मराठी लेखन पाठवण्यासाठी अधिकृत अर्ज.',
      authorNameLabel: 'लेखकाचे पूर्ण नाव',
      manuscriptTitleLabel: 'हस्तलिखिताचे शीर्षक',
      categoryLabel: 'साहित्य प्रकार',
      wordCountLabel: 'अंदाजे शब्दसंख्या',
      synopsisLabel: 'संहितेचा सारांश आणि मध्यवर्ती कल्पना (किमान ४० अक्षरे)',
      sampleExcerptLabel: 'नमुना उतारा (किमान ८० अक्षरे)',
      submitBtn: 'हस्तलिखित संपादकीय मंडळाकडे पाठवा',
      successTitle: 'तुमचे हस्तलिखित यशस्वीरीत्या प्राप्त झाले आहे',
    },
    contact: {
      title: 'अकथ प्रकाशनशी संपर्क साधा',
      subtitle:
        'वाचक प्रतिक्रिया, ग्रंथालयीन खरेदी, पुस्तक वितरण किंवा संपादकीय संवादासाठी खालील फॉर्म वापरा.',
      nameLabel: 'तुमचे नाव',
      roleLabel: 'तुमची भूमिका',
      subjectLabel: 'विषय',
      messageLabel: 'तुमचा सविस्तर संदेश',
      submitBtn: 'संदेश पाठवा',
      successMessage:
        'तुमचा संदेश अकथ प्रकाशनकडे पोहोचला आहे. आम्ही २ कामकाजाच्या दिवसांत प्रतिसाद देऊ.',
    },
    trackOrder: {
      title: 'तुमची ऑर्डर ट्रॅक करा',
      subtitle:
        'तुमचा ऑर्डर क्रमांक आणि नोंदणीकृत ईमेल किंवा १० अंकी मोबाईल क्रमांक टाकून सद्यस्थिती पहा.',
      orderNumberLabel: 'ऑर्डर क्रमांक (उदा. AK-2026-1041)',
      contactLabel: 'नोंदणीकृत ईमेल किंवा मोबाईल क्रमांक',
      searchBtn: 'ऑर्डर स्थिती तपासा',
    },
    footer: {
      aboutBlurb:
        'अकथ प्रकाशन हे गंभीर मराठी साहित्य, कादंबरी, कविता, समीक्षा आणि अनुवाद प्रकाशित करणारे स्वतंत्र प्रकाशन गृह आहे.',
      booksAndCatalogue: 'ग्रंथदालन',
      editorialJournal: 'वाचनकट्टा व लेखन',
      readerServices: 'वाचक सेवा आणि धोरणे',
      shippingPolicy: 'वितरण आणि परतावा धोरण',
      privacyPolicy: 'गोपनीयता धोरण',
      termsOfUse: 'वापराच्या अटी',
      rightsReserved: '© २०२६ अकथ प्रकाशन. सर्व हक्क राखीव.',
    },
  },
  en: {
    brandName: 'Akath Prakashan',
    brandTagline: 'Independent Marathi Literary Publisher',
    langToggleAria: 'Select language: Marathi or English',
    nav: {
      books: 'Books',
      vachankatta: 'Vachankatta',
      firstPage: 'First Page',
      authors: 'Authors',
      about: 'About',
      submitManuscript: 'Submit Manuscript',
      trackOrder: 'Track Order',
      contact: 'Contact',
      search: 'Search',
      searchAria: 'Search books, authors, and literary essays',
      cart: 'Cart',
      editorialDesk: 'Editorial Desk',
      auditReport: 'QA Audit',
      openMenu: 'Open Menu',
      closeMenu: 'Close Menu',
    },
    home: {
      heroEyebrow: 'Contemporary Marathi Literature & Literary Journal',
      heroHeadline: 'मराठी साहित्य. नवे आवाज. दीर्घ संवाद.',
      heroSubheadline: 'काही पुस्तकं संपतात. काही वाचकांसोबत राहतात.',
      heroLead:
        'Akath Prakashan is an independent Marathi literary publishing house and journal dedicated to serious fiction, poetry, cultural criticism, and translations.',
      ctaExploreBooks: 'Explore Books',
      ctaStartReading: 'Start Reading',
      featuredBooksEyebrow: 'Akath Catalogue',
      featuredBooksTitle: 'Curated Marathi Editions',
      viewAllBooks: 'View All Books',
      firstPageEyebrow: 'Reading Experience · First Page',
      firstPageTitle: 'Read the First Page Before You Buy',
      firstPageSubtitle:
        'Experience the prose, rhythm, and voice of an original Marathi work before looking at the cover.',
      editorSelectionEyebrow: 'Editor’s Selection of the Month',
      vachankattaEyebrow: 'Vachankatta · Literary Journal',
      vachankattaTitle: 'Critical Essays, Reviews & Author Dialogues',
      viewAllArticles: 'Read All Vachankatta Essays',
      authorsEyebrow: 'Authors & Poets of Akath',
      authorsTitle: 'Distinctive Voices in Contemporary Marathi Writing',
      viewAllAuthors: 'Meet All Authors',
      manuscriptTitle: 'Submit a Manuscript',
      manuscriptBody:
        'Submit your original Marathi novel, short story collection, poetry, essays, or translation to our editorial board. Every manuscript is read with care.',
      manuscriptCta: 'View Submission Guidelines',
      newsletterTitle: 'Akath Literary Newsletter',
      newsletterBody:
        'Fortnightly Marathi book excerpts, editorial notes, and new release dispatches delivered quietly to your inbox.',
      newsletterNameLabel: 'Your Name (Optional)',
      newsletterNamePlaceholder: 'e.g. Pranali Deshmukh',
      newsletterEmailLabel: 'Email Address',
      newsletterEmailPlaceholder: 'reader@example.com',
      newsletterSubmit: 'Subscribe to Newsletter',
      newsletterPrivacyNote: 'We never share your email. Unsubscribe anytime with one click.',
    },
    catalogue: {
      eyebrow: 'Akath Bookstore & Archive',
      title: 'Complete Book Catalogue',
      subtitle:
        'Original Marathi novels, short stories, poetry collections, cultural criticism, and translations with editorial commentary.',
      searchPlaceholder: 'Search by book title, author, or theme...',
      allCategories: 'All Literary Genres',
      inStockOnly: 'In-Stock Books Only',
      sortBy: 'Sort By',
      sortFeatured: 'Editorial Selection',
      sortNewest: 'Newest Releases',
      sortPriceLow: 'Price: Low to High',
      sortPriceHigh: 'Price: High to Low',
      resultsCount: 'books found',
      noMatchesTitle: 'No books matched your current search or filter',
      noMatchesBody: 'Try another search term or reset filters to browse the full catalogue.',
      resetFilters: 'Reset All Filters',
    },
    book: {
      byAuthor: 'By',
      price: 'Price',
      inStock: 'In Stock',
      limitedStock: 'Limited Stock',
      outOfStock: 'Out of Stock',
      forthcoming: 'Forthcoming',
      addToCart: 'Add to Cart',
      addedToCart: 'Added to Cart',
      buyNow: 'Buy Now',
      readExcerpt: 'Read First Page',
      viewDetails: 'View Details',
      specifications: 'Edition Specifications',
      isbn: 'ISBN',
      edition: 'Edition',
      pages: 'Pages',
      format: 'Format',
      language: 'Language',
      publisher: 'Publisher',
      editorialNote: 'Editorial Context & Note',
      aboutBook: 'About the Book',
      relatedBooks: 'Related Titles from the Catalogue',
    },
    cart: {
      title: 'Your Book Bag',
      itemCountLabel: 'selected books',
      emptyTitle: 'Your book bag is currently empty',
      emptySubtitle:
        'Browse our catalogue of contemporary Marathi novels, poetry collections, and critical essays below.',
      emptyCta: 'Explore Book Catalogue',
      recommendationsTitle: 'Recommended from Our Catalogue',
      unitPrice: 'Unit Price',
      quantity: 'Quantity',
      decreaseQty: 'Decrease quantity by one',
      increaseQty: 'Increase quantity by one',
      remove: 'Remove',
      removeAria: 'Remove this book from your cart',
      lineTotal: 'Line Total',
      availability: 'Availability',
      orderSummary: 'Your Order Details',
      subtotal: 'Subtotal (Books)',
      discount: 'Discount',
      shipping: 'Shipping (Registered Post / Courier)',
      freeShipping: 'Free',
      taxNote: 'Tax (0% GST on printed books)',
      grandTotal: 'Total Payable',
      proceedToCheckout: 'Proceed to Checkout',
      continueShopping: 'Continue Browsing Books',
      clearCart: 'Clear Cart',
    },
    checkout: {
      title: 'Order & Shipping Details',
      subtitle: 'Direct guest checkout with server-verified payment and tracking.',
      backToCart: 'Return to Cart',
      contactSection: '1. Reader Contact Information',
      shippingSection: '2. Delivery Address',
      paymentSection: '3. Payment Method',
      requiredMarker: 'Required',
      optionalMarker: 'Optional',
      fullNameLabel: 'Full Name',
      fullNamePlaceholder: 'e.g. Dr. Shrikant Kulkarni',
      phoneLabel: 'Indian Mobile Number',
      phonePlaceholder: 'e.g. 9876543210 or +91 98765 43210',
      phoneHint: '10-digit Indian mobile number starting with 6, 7, 8, or 9 for courier updates.',
      emailLabel: 'Email Address',
      emailPlaceholder: 'e.g. reader@example.com',
      emailHint: 'Order receipt and Speed Post tracking details will be sent to this email.',
      addressLine1Label: 'House / Flat No., Building & Street Address',
      addressLine1Placeholder: 'e.g. 12, Akshar Niwas, Karve Road',
      addressLine2Label: 'Landmark / Area',
      cityLabel: 'City / Town',
      districtLabel: 'District',
      stateLabel: 'State',
      postalCodeLabel: 'PIN Code (6-digit Indian Postal Code)',
      postalCodePlaceholder: 'e.g. 411004',
      orderNotesLabel: 'Delivery Instructions',
      institutionalToggle: 'This is an institutional, college, or library order',
      institutionNameLabel: 'Institution / Library Name',
      paymentUpi: 'UPI / QR Payment (Instant Server Verification)',
      paymentCard: 'Debit / Credit Card / NetBanking',
      paymentInstitutional: 'Institutional Invoice (Official Library Billing)',
      placeOrderBtn: 'Confirm Order & Proceed to Payment',
      submittingBtn: 'Validating Order...',
      errors: {
        fullNameRequired: 'Please enter your full name.',
        addressRequired: 'Please enter your complete street and locality address.',
        cityRequired: 'Please enter your city or town.',
        fixFormErrors: 'Please review and fix the highlighted fields below.',
      },
    },
    vachankatta: {
      eyebrow: 'Vachankatta · Akath Literary Journal',
      title: 'Vachankatta: Contemporary Marathi Literary Discourse',
      subtitle:
        'Long-form essays, critical book reviews, author conversations, and First Page book excerpts.',
      allCategories: 'All Sections',
      articles: 'Long Essays',
      reviews: 'Book Reviews',
      interviews: 'Interviews',
      firstPage: 'First Page (Excerpts)',
      readingLists: 'Reading Lists',
      literaryWorld: 'Literary World',
      readingTime: 'min read',
      readFullArticle: 'Read Full Essay',
      blindModeToggle: 'Read the prose first, reveal the author after',
      revealIdentity: 'Reveal Book & Author',
      hideIdentity: 'Hide Book & Author',
      reactionReadMore: 'I want to read further',
      reactionStruckByLine: 'This line stayed with me',
      reactionWantContext: 'I want more editorial context',
    },
    manuscript: {
      title: 'Manuscript Submission Desk',
      subtitle: 'Official submission form for original Marathi manuscripts to Akath Prakashan.',
      authorNameLabel: 'Author Full Name',
      manuscriptTitleLabel: 'Manuscript Title',
      categoryLabel: 'Literary Genre',
      wordCountLabel: 'Estimated Word Count',
      synopsisLabel: 'Synopsis & Core Theme (minimum 40 characters)',
      sampleExcerptLabel: 'Sample Excerpt (minimum 80 characters)',
      submitBtn: 'Submit Manuscript to Editorial Board',
      successTitle: 'Your Manuscript Has Been Received',
    },
    contact: {
      title: 'Contact Akath Prakashan',
      subtitle:
        'For reader feedback, library orders, distribution inquiries, or editorial correspondence.',
      nameLabel: 'Your Name',
      roleLabel: 'Your Role',
      subjectLabel: 'Subject',
      messageLabel: 'Your Message',
      submitBtn: 'Send Message',
      successMessage:
        'Your message has been received by Akath Prakashan. We will respond within 2 working days.',
    },
    trackOrder: {
      title: 'Track Your Order',
      subtitle:
        'Enter your order number along with your registered email address or 10-digit mobile number.',
      orderNumberLabel: 'Order Number (e.g. AK-2026-1041)',
      contactLabel: 'Registered Email or Mobile Number',
      searchBtn: 'Check Order Status',
    },
    footer: {
      aboutBlurb:
        'Akath Prakashan is an independent Marathi literary publishing house dedicated to serious fiction, poetry, criticism, and translations.',
      booksAndCatalogue: 'Bookstore',
      editorialJournal: 'Vachankatta Journal',
      readerServices: 'Reader Services & Policies',
      shippingPolicy: 'Shipping & Returns Policy',
      privacyPolicy: 'Privacy Policy',
      termsOfUse: 'Terms of Use',
      rightsReserved: '© 2026 Akath Prakashan. All rights reserved.',
    },
  },
};

export interface LanguageContextValue {
  lang: AppLanguage;
  setLang: (lang: AppLanguage) => void;
  t: TranslationDictionary;
}

export const LanguageContext = createContext<LanguageContextValue>({
  lang: 'mr',
  setLang: () => {},
  t: TRANSLATIONS.mr,
});

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}
