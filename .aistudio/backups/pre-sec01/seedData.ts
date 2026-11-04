import {
  AuthorRecord,
  BookRecord,
  EditorialArticle,
  FirstPageExcerpt,
  ReadingList,
} from '../types/publishing';

export const PUBLISHER_IDENTITY = {
  nameMarathi: 'अकथ प्रकाशन',
  nameEnglish: 'Akath Prakashan',
  taglineMarathi: 'मराठी साहित्य. नवे आवाज. दीर्घ संवाद.',
  positioningEnglish:
    'An independent Marathi literary publisher that discovers distinctive writing, gives it the editorial attention it deserves, and builds lasting relationships between books, writers, and readers.',
  positioningMarathi:
    'वेगळ्या जाणिवांचे लेखन शोधणारी, त्याला संपादकीय साक्षेपाने घडवणारी आणि पुस्तक, लेखक व वाचक यांच्यात दीर्घकालीन नाते निर्माण करणारी स्वतंत्र मराठी साहित्य प्रकाशन संस्था.',
  turtlePhilosophyMarathi:
    '“कासवाप्रमाणेच एका चांगल्या पुस्तकालाही घडण्यासाठी आपला संथ, संयमी वेळ लागतो — आणि म्हणूनच ते पिढ्यानपिढ्या टिकून राहते.”',
  turtlePhilosophyEnglish:
    '“Like the turtle, a good book takes its time — and lasts for generations.”',
  cityMarathi: 'नांदेड, महाराष्ट्र',
  cityEnglish: 'Nanded, Maharashtra',
  founderNameEnglish: 'Pooja Vasantrao Dhawale',
  founderNameMarathi: 'पूजा वसंतराव ढवळे',
  whatsappNumber: '919270282932',
  phoneDisplay: '+91 92702 82932',
  logoUrl: '/assets/akath/akath-logo.png',
  heroBooksUrl: '/assets/akath/hero-books.jpg',
  existingLiveUrl: 'https://akathpublication.arthsankalp.com/#top',
  editorialPrinciples: [
    {
      title: 'संपादकीय स्वातंत्र्य आणि वाङ्मयीन कस',
      titleEnglish: 'Editorial Independence & Literary Rigor',
      description:
        'तात्कालिक बाजारी लाटांपेक्षा आशयघनता, भाषिक नेमकेपणा आणि दीर्घकाळ टिकणाऱ्या साहित्यमूल्यांना प्राधान्य.',
      descriptionEnglish:
        'Prioritizing substantive depth, linguistic precision, and enduring literary value over fleeting commercial trends.',
    },
    {
      title: 'मराठी भाषेचे समकालीन भान',
      titleEnglish: 'Contemporary Marathi Sensibility',
      description:
        'प्रमाण भाषेसोबतच मराठवाडा व महाराष्ट्रातील विविध बोली, प्रादेशिक अनुभवविश्व आणि नव्या संवेदनांचा सन्मान.',
      descriptionEnglish:
        'Honoring standard Marathi alongside the diverse regional dialects, lived realities, and emerging sensibilities of Marathwada and Maharashtra.',
    },
    {
      title: 'नव्या आणि गंभीर आवाजांना व्यासपीठ',
      titleEnglish: 'A Home for Serious & Emerging Voices',
      description:
        'पहिल्या पुस्तकाच्या लेखकापासून ते अनुभवी अभ्यासकांपर्यंत प्रत्येक हस्तलिखितावर सखोल संपादकीय संवाद.',
      descriptionEnglish:
        'Sustained, thoughtful editorial dialogue on every manuscript—from debut writers to seasoned literary scholars.',
    },
    {
      title: 'पारदर्शक लेखक-प्रकाशक व्यवहार',
      titleEnglish: 'Transparent Author–Publisher Partnership',
      description:
        'हस्तलिखित निवडीपासून संपादन, मुद्रण, विक्री अहवाल आणि मानधनापर्यंत स्पष्ट व विश्वासार्ह कार्यपद्धती.',
      descriptionEnglish:
        'Clear, trustworthy workflows from manuscript evaluation and editing to print production, sales reporting, and royalties.',
    },
  ],
  preservedCapabilities: [
    {
      step: '01',
      titleMarathi: 'सखोल संपादन आणि मुद्रितशोधन',
      titleEnglish: 'Editing & Proofreading',
      description:
        'मराठी, हिंदी आणि इंग्रजी भाषेतील हस्तलिखितांचे आशयसंपादन, वाक्यरचना सुधारणा आणि अचूक मुद्रितशोधन.',
      descriptionEnglish:
        'Substantive developmental editing, structural refinement, and meticulous proofreading across Marathi, Hindi, and English manuscripts.',
    },
    {
      step: '02',
      titleMarathi: 'आशयघन मुखपृष्ठ संकल्पना',
      titleEnglish: 'Story-Led Cover Design',
      description:
        'पुस्तकाच्या अंतरंगाशी सुसंगत, वाचकाचे लक्ष वेधून घेणारी आणि साहित्यिक गांभीर्य जपणारी मुखपृष्ठ मांडणी.',
      descriptionEnglish:
        'Bespoke cover art direction that reflects the inner soul of the book while preserving literary dignity.',
    },
    {
      step: '03',
      titleMarathi: 'अंतर्गत मांडणी आणि अक्षरजुळणी',
      titleEnglish: 'Layout & Typesetting',
      description:
        'दीर्घ वाचनासाठी डोळ्यांना सुखद वाटणारी देवनागरी अक्षरजुळणी, समास आणि कागद-अनुकूल पृष्ठरचना.',
      descriptionEnglish:
        'Eye-friendly Devanagari typesetting, generous margins, and paper-conscious page architecture crafted for long-form reading.',
    },
    {
      step: '04',
      titleMarathi: 'ISBN नोंदणी आणि प्रताधिकार प्रक्रिया',
      titleEnglish: 'ISBN & Copyright Documentation',
      description:
        'कायदेशीर प्रताधिकार लेखकाच्या नावे सुरक्षित ठेवून अधिकृत ISBN व ग्रंथसूची नोंदणीची पूर्ण जबाबदारी.',
      descriptionEnglish:
        'Complete management of official ISBN registration and bibliographic cataloguing while safeguarding copyright in the author’s name.',
    },
    {
      step: '05',
      titleMarathi: 'दर्जेदार मुद्रण आणि बांधणी',
      titleEnglish: 'Archival Printing & Binding',
      description:
        'पेपरबॅक आणि हार्डबाउंड आवृत्त्यांसाठी टिकाऊ कागद, स्पष्ट छपाई आणि मजबूत पुस्तक बांधणी.',
      descriptionEnglish:
        'Acid-free natural shade paper, crisp presswork, and durable binding for both paperback and hardbound editions.',
    },
    {
      step: '06',
      titleMarathi: 'वितरण आणि ई-बुक प्रसार',
      titleEnglish: 'Distribution & eBook Reach',
      description:
        'नांदेडच्या पलीकडे महाराष्ट्रभरातील स्वतंत्र पुस्तकांची दुकाने, वाचनालये आणि थेट ऑनलाइन वाचकांपर्यंत पोहोच.',
      descriptionEnglish:
        'Reaching independent bookstores, institutional libraries, and direct online readers across Maharashtra and India.',
    },
  ],
  closingMottoMarathi: 'वाचत राहू. विचारत राहू. लिहित राहू.',
  closingMottoEnglish:
    'Let us keep reading. Let us keep questioning. Let us keep writing.',
};

export const PHASE_0_AUDIT_REPORT = {
  auditedSource: 'https://akathpublication.arthsankalp.com/#top',
  auditDate: 'ऑक्टोबर २०२६',
  existingStackSummary:
    'मूळ संकेतस्थळ एक-पृष्ठीय (Single-Page) ब्रॉशर स्वरूपात होते, ज्यामध्ये केवळ सेवांची माहिती (Editing, Cover Design, Layout, ISBN, Printing, Distribution) आणि WhatsApp संपर्क फॉर्म होता.',
  preservedAssetsAndFacts: [
    'अकथ प्रकाशनचे मूळ चिन्ह (कासव आणि उघडलेले पुस्तक — /assets/akath/akath-logo.png)',
    'मूळ बोधवाक्य: “Like the turtle, a good book takes its time — and lasts for generations.”',
    'मुख्यालय व संपर्क: नांदेड, महाराष्ट्र | अधिकृत WhatsApp व दूरध्वनी: +91 92702 82932',
    'साहित्य प्रकार: कविता, कादंबरी, कथासंग्रह, चरित्र, ललित निबंध, बालसाहित्य, अध्यात्म/तत्त्वज्ञान, संशोधन आणि अनुवाद',
  ],
  identifiedGapsResolved: [
    'स्वतंत्र पुस्तक सूची (Catalogue) आणि ISBN/आवृत्ती माहितीचे रकाने नव्हते — आता पूर्ण Literary Index सह कार्यान्वित.',
    'वाचनकट्टा (Reader’s Room) आणि पहिलं पान (उतारा वाचन) उपलब्ध नव्हते — आता ६ संपादकीय विभागांसह समाविष्ट.',
    'सर्व्हर-तपासणीसह पुस्तकपेढी (Cart, Guest Checkout, Order Verification, Admin Order Fulfilment) जोडण्यात आली.',
    'हस्तलिखित संहिता सादरीकरण (Manuscript Submission) आणि प्रकाशन प्रक्रिया पारदर्शक करण्यात आली.',
  ],
  publisherSupplyChecklist: [
    {
      item: 'प्रत्यक्ष प्रकाशित पुस्तकांची अंतिम ISBN व साठा यादी (Master Catalogue Sheet)',
      status: 'प्रकाशक मंजुरीसाठी तयार (CMS द्वारे संपादनयोग्य)',
      note: 'कोणतेही काल्पनिक पुस्तक व्यावसायिक दावा म्हणून न दाखवता संपादकीय संदर्भ/नमुना स्पष्टपणे चिन्हांकित केला आहे.',
    },
    {
      item: 'पेमेंट गेटवे (Razorpay / अधिकृत मर्चंट बँक खाते) प्रोडक्शन की',
      status: '.env.example मध्ये संरचित',
      note: 'प्रोडक्शन की मिळेपर्यंत सर्व्हर-साईड Verified Sandbox Payment व अधिकृत चलन (Invoice) कार्यपद्धती कार्यरत.',
    },
    {
      item: 'लेखकांचे संमतीपत्र आणि ‘पहिलं पान’ उताऱ्यांचे अधिकृत परवाने',
      status: 'संपादकीय कक्षामध्ये (Admin Studio) परवाना स्थितीसह नोंदणीकृत',
      note: 'केवळ मंजूर उतारेच वाचकांसाठी खुले होतात.',
    },
  ],
};

export const INITIAL_AUTHORS: AuthorRecord[] = [
  {
    id: 'author-g-k-ainapure',
    slug: 'g-k-ainapure',
    name: 'जी. के. ऐनापुरे',
    transliteratedName: 'G. K. Ainapure',
    literaryRole: 'समकालीन मराठी कथाकार, कादंबरीकार व समीक्षक',
    region: 'सांगली, महाराष्ट्र',
    biography:
      'जी. के. ऐनापुरे (जन्म १९६२, एम. एस्सी. समुद्री प्राणीशास्त्र) हे समकालीन मराठी कथनपरंपरेला नवोत्तर संवेदनांचे भान देणारे सिद्धहस्त कथाकार, दीर्घकथाकार आणि कादंबरीकार आहेत. खंगोल, निकटवर्ती सूत्र, सूर्याचे सांगाती, कांदाचिर (कथासंग्रह); झिंझुरडा, घनसाळ, चिंचपोकळी, नासमाया, स्कॉलर ज्यूस (दीर्घकथा); आणि अवकाश, अभिसरण, अधुरा, रिबोट, जाईच्या घरी जाई, ओस निळा एकान्त, अयोध्या (कादंबरी) या त्यांच्या महत्त्वपूर्ण साहित्यकृती प्रसिद्ध आहेत.',
    editorialNote:
      'अकथ प्रकाशन क्र. ०१ ‘स्कॉलर ज्यूस (दीर्घकथा संग्रह)’ चे लेखक.',
    themes: ['दीर्घकथा', 'समकालीन मराठी कथनपरंपरा', 'सामाजिक-सांस्कृतिक वास्तव', 'नवोत्तर संवेदना'],
    bookIds: ['book-scholar-juice'],
    articleIds: ['article-parikshan-scholar-juice'],
    publicProfileStatus: 'published',
    verificationStatus: 'publisher_verified',
    provenanceLabel: 'अकथ प्रकाशन अधिकृत लेखक प्रोफाइल',
  },
  {
    id: 'author-anuratna-waghmare',
    slug: 'anuratna-waghmare',
    name: 'अनुरत्न वाघमारे',
    transliteratedName: 'Anuratna Waghmare',
    literaryRole: 'प्रवासवर्णनकार व ललित लेखक',
    region: 'नांदेड / महाराष्ट्र',
    biography:
      'निसर्ग, मानवी संस्कृती आणि हिमालयीन भूभागातील शांत जीवनशैलीचा संवेदनशील वेध घेणारे लेखक. प्रवासाकडे केवळ पर्यटन म्हणून न पाहता मानवी मनाचा आणि स्थानिक संस्कृतीचा आरसा म्हणून पाहणारी चित्रदर्शी शैली ही त्यांच्या लेखनाची ओळख आहे.',
    editorialNote:
      'अकथ प्रकाशनच्या ‘धुक्याची दुलई : भूतान प्रवासवर्णन’ या पुस्तकाचे लेखक.',
    themes: ['प्रवासवर्णन', 'ललित गद्य', 'भूतान संस्कृती', 'हिमालयीन जनजीवन'],
    bookIds: ['book-dhukyachi-dulai'],
    articleIds: ['article-dhukyachi-dulai-pravas'],
    publicProfileStatus: 'published',
    verificationStatus: 'publisher_verified',
    provenanceLabel: 'अकथ प्रकाशन अधिकृत लेखक प्रोफाइल',
  },
  {
    id: 'author-akhilesh-yelkadare',
    slug: 'akhilesh-pandit-yelkadare',
    name: 'आखिलेश पंडित येलकदरे',
    transliteratedName: 'Akhilesh Pandit Yelkadare',
    literaryRole: 'समाजमाध्यम व लोकशाही अभ्यासक',
    region: 'नांदेड, महाराष्ट्र',
    biography:
      'भारतीय संविधानिक मूल्ये, समकालीन लोकशाही प्रक्रिया आणि डिजिटल युगातील समाजमाध्यमांचा सामाजिक-राजकीय प्रभाव यांचा चिकित्सक अभ्यास करणारे युवा संशोधक व लेखक.',
    editorialNote:
      'अकथ प्रकाशनच्या ‘लोकशाहीमध्ये समाजमाध्यमांचा वापर’ या वैचारिक ग्रंथाचे लेखक.',
    themes: ['लोकशाही व संविधान', 'समाजमाध्यम चिकित्सा', 'डिजिटल अभिव्यक्ती', 'वैचारिक लेखन'],
    bookIds: ['book-lokshahimadhye-samajmadhyamancha-vapar'],
    articleIds: ['article-lokshahi-ani-samajmadhyame'],
    publicProfileStatus: 'published',
    verificationStatus: 'publisher_verified',
    provenanceLabel: 'अकथ प्रकाशन अधिकृत लेखक प्रोफाइल',
  },
];

export const INITIAL_BOOKS: BookRecord[] = [
  {
    id: 'book-scholar-juice',
    slug: 'scholar-juice',
    title: 'स्कॉलर ज्यूस',
    subtitle: '( दीर्घकथा संग्रह )',
    transliteratedTitle: 'Scholar Juice Dirghakatha Sangrah G. K. Ainapure',
    authorId: 'author-g-k-ainapure',
    contributorIds: [],
    category: 'कथासंग्रह',
    categorySlug: 'fiction-stories',
    topics: ['दीर्घकथा संग्रह', 'समकालीन मराठी कथनपरंपरा', 'नवोत्तर संवेदना', 'सामाजिक-सांस्कृतिक वास्तव'],
    language: 'मराठी',
    publisher: 'अकथ प्रकाशन, नांदेड',
    isbn: '978-81-996989-6-3',
    edition: 'अकथ प्रकाशन क्र. ०१ · पहिली आवृत्ती (२६ जानेवारी २०२६)',
    publicationDate: '२०२६-०१-२६',
    format: 'दीर्घकथा संग्रह (पेपरबॅक · मुखपृष्ठ व आतील चित्रे: मिलिंद कडणे)',
    price: 549,
    listPrice: 625,
    currency: 'INR',
    stock: 35,
    availability: 'in_stock',
    shippingNote: 'महाराष्ट्रभर ४ ते ६ कामाच्या दिवसांत नोंदणीकृत पोस्टाने किंवा कुरिअरने वितरण.',
    description:
      "समकालीन मराठी कथनपरंपरेला नवोत्तर संवेदनांचे भान देणाऱ्या जी. के. ऐनापुरे यांचा 'स्कॉलरज्यूस' हा एक वैशिष्ट्यपूर्ण दीर्घ कथासंग्रह आहे. नैसर्गिक जगण्याचा गुन्हा केलेल्या माणसांची आंतरिक द्वंद्वे आणि सामाजिक संरचनेतील विसंवाद मांडणारा हा संग्रह मूल्यांच्या विघटनाची विविध रूपे- विरुपे अधोरेखित करतो. शैक्षणिक व व्यावसायिक स्पर्धेचे साजिवंत क्रौर्य आणि त्यात अस्तित्वसंकटात सापडलेल्या नव्या पिढीची संघर्षरत हताशा संग्रहभर आढळून येते. धर्माच्या भांडवलाचे आणि भांडवलाच्या धर्माचे आंतरसंबंध उलगडून दाखवत लेखक शोषणाची आधुनिक केंद्रे निर्देशीत करत जातो. समुहमनाचा वेध घेत हळूहळू व्यक्तीमनाच्या खोल खोल तळापर्यंत जाऊन तिथे ढवळाढवळ करतो. ही ढवळाढवळ फार अस्वस्थ करणारी आहे. व्यक्तीचित्रणातील बारीक-सारीक नोंदी, नव्या सामाजिक/सांस्कृतिक वास्तवाचे सूक्ष्म भान, वैशिष्ट्यपूर्ण भाषाशैली आणि अंतर्मनाला अस्वस्थ करणारी कथा - विन्यासरचना यामुळे हा दीर्घ कथासंग्रह समकाळातील माणूस आणि समाज यांच्या नात्याचा गालिबी आरसा आहे असे म्हणता येईल. स्कॉलरज्यूस वाचकाला केवळ कथा सांगत नाही तर जीवनाला गेलेले अदृश्य तडे पाहण्याची दृष्टी बहाल करतो.",
    editorialContext: '- सुदाम राठोड, नाशिक',
    rightsNote: 'प्रताधिकार © जी. के. ऐनापुरे. प्रकाशक: पूजा भागीरथा वसंत ढवळे, अकथ प्रकाशन, नांदेड.',
    isFeatured: true,
    isNewRelease: true,
    isEditorSelection: true,
    editorSelectionNote: {
      personalNote:
        "समकालीन मराठी कथनपरंपरेला नवोत्तर संवेदनांचे भान देणाऱ्या जी. के. ऐनापुरे यांचा 'स्कॉलरज्यूस' हा एक वैशिष्ट्यपूर्ण दीर्घ कथासंग्रह आहे. नैसर्गिक जगण्याचा गुन्हा केलेल्या माणसांची आंतरिक द्वंद्वे आणि सामाजिक संरचनेतील विसंवाद मांडणारा हा संग्रह मूल्यांच्या विघटनाची विविध रूपे- विरुपे अधोरेखित करतो. शैक्षणिक व व्यावसायिक स्पर्धेचे साजिवंत क्रौर्य आणि त्यात अस्तित्वसंकटात सापडलेल्या नव्या पिढीची संघर्षरत हताशा संग्रहभर आढळून येते. धर्माच्या भांडवलाचे आणि भांडवलाच्या धर्माचे आंतरसंबंध उलगडून दाखवत लेखक शोषणाची आधुनिक केंद्रे निर्देशीत करत जातो. समुहमनाचा वेध घेत हळूहळू व्यक्तीमनाच्या खोल खोल तळापर्यंत जाऊन तिथे ढवळाढवळ करतो. ही ढवळाढवळ फार अस्वस्थ करणारी आहे. व्यक्तीचित्रणातील बारीक-सारीक नोंदी, नव्या सामाजिक/सांस्कृतिक वास्तवाचे सूक्ष्म भान, वैशिष्ट्यपूर्ण भाषाशैली आणि अंतर्मनाला अस्वस्थ करणारी कथा - विन्यासरचना यामुळे हा दीर्घ कथासंग्रह समकाळातील माणूस आणि समाज यांच्या नात्याचा गालिबी आरसा आहे असे म्हणता येईल. स्कॉलरज्यूस वाचकाला केवळ कथा सांगत नाही तर जीवनाला गेलेले अदृश्य तडे पाहण्याची दृष्टी बहाल करतो.",
      whySelected:
        'व्यक्तीचित्रणातील बारीक-सारीक नोंदी, नव्या सामाजिक/सांस्कृतिक वास्तवाचे सूक्ष्म भान, वैशिष्ट्यपूर्ण भाषाशैली आणि अंतर्मनाला अस्वस्थ करणारी कथा-विन्यासरचना.',
      whoShouldRead:
        'समकालीन मराठी कथासाहित्य, दीर्घकथा आणि गंभीर साहित्यिक जाणिवांचा शोध घेणाऱ्या प्रत्येक वाचकासाठी.',
      selectedBy: 'सुदाम राठोड, नाशिक',
      selectionMonth: 'विशेष ग्रंथ आवृत्ती २०२६',
    },
    firstPageExcerptId: 'excerpt-scholar-juice',
    relatedArticleIds: ['article-parikshan-scholar-juice'],
    relatedBookIds: ['book-dhukyachi-dulai', 'book-lokshahimadhye-samajmadhyamancha-vapar'],
    readingListIds: ['list-akath-prakashan-vishesh-granth'],
    verificationStatus: 'publisher_verified',
    provenanceLabel: 'अकथ प्रकाशन क्र. ०१ · अधिकृत प्रकाशित ग्रंथ',
    coverImageUrl: '/assets/aistudio/scholar-juice-cover.jpg',
    coverSpreadUrl: '/assets/aistudio/scholar-juice-spread.jpg',
    coverPdfUrl: '/assets/aistudio/SCHOLAR_JUSIE_cover_design_cdr_15_15f6273e.pdf',
    galleryImages: [
      {
        id: 'gal-scholar-juice-front',
        url: '/assets/aistudio/scholar-juice-cover.jpg',
        caption: 'मुखपृष्ठ — स्कॉलर ज्यूस (चित्रकार: मिलिंद कडणे)',
        altText: 'स्कॉलर ज्यूस — जी. के. ऐनापुरे मुखपृष्ठ',
      },
      {
        id: 'gal-scholar-juice-spread',
        url: '/assets/aistudio/scholar-juice-spread.jpg',
        caption: 'पूर्ण मुखपृष्ठ व मलपृष्ठ मांडणी (ISBN 978-81-996989-6-3 · सुदाम राठोड यांचे भाष्य)',
        altText: 'स्कॉलर ज्यूस पूर्ण वेष्टन मांडणी',
      },
      {
        id: 'gal-scholar-juice-folio-1',
        url: '/assets/aistudio/scholar-juice-folio-img-1.jpg',
        caption: 'प्रारंभिक पृष्ठ १ — अंतर्गत रेखांकन (मिलिंद कडणे)',
        altText: 'स्कॉलर ज्यूस प्रारंभिक रेखांकन',
      },
    ],
    coverStyle: {
      backgroundHex: '#8C6226',
      accentHex: '#D91C1F',
      textHex: '#FFFDF7',
      borderPattern: 'classic_frame',
      emblemText: 'दीर्घकथा संग्रह · अकथ प्रकाशन',
    },
  },
  {
    id: 'book-dhukyachi-dulai',
    slug: 'dhukyachi-dulai-bhutan-pravasvarnan',
    title: 'धुक्याची दुलई',
    subtitle: 'भूतान प्रवासवर्णन',
    transliteratedTitle: 'Dhukyachi Dulai Bhutan Pravasvarnan Anuratna Waghmare',
    authorId: 'author-anuratna-waghmare',
    contributorIds: [],
    category: 'ललित आणि वैचारिक',
    categorySlug: 'essays-thought',
    topics: ['भूतान प्रवासवर्णन', 'ललित गद्य', 'हिमालयीन संस्कृती', 'निसर्ग आणि शांतता'],
    language: 'मराठी',
    publisher: 'अकथ प्रकाशन, नांदेड',
    isbn: '978-81-996989-5-6',
    edition: 'पहिली आवृत्ती, २०२६',
    publicationDate: '२०२६-०२-१०',
    pageCount: 168,
    format: 'प्रवासवर्णन (पेपरबॅक)',
    price: 320,
    currency: 'INR',
    stock: 30,
    availability: 'in_stock',
    shippingNote: 'महाराष्ट्रभर ४ ते ६ कामाच्या दिवसांत नोंदणीकृत पोस्टाने किंवा कुरिअरने वितरण.',
    description:
      'हिमालयाच्या कुशीत दडलेल्या भूतान या शांत, निसर्गसंपन्न आणि आनंदी देशाचा संवेदनशील प्रवासपट म्हणजे अनुरत्न वाघमारे यांचे ‘धुक्याची दुलई : भूतान प्रवासवर्णन’. धुक्यात लपेटलेले डोंगरमाथे, प्राचीन बौद्ध मठ (जोंग), प्रार्थनाध्वजांची फडफड आणि तिथल्या माणसांचे साधे, समाधानी जगणे लेखकाने अत्यंत तरल व चित्रदर्शी भाषेत टिपले आहे. केवळ भौगोलिक स्थळांची माहिती न देता प्रवासादरम्यान मनात उमटणारे सांस्कृतिक आणि तात्त्विक तरंग या पुस्तकातून वाचकाला प्रत्यक्ष भूतानच्या वाटेवर घेऊन जातात.',
    editorialContext:
      'प्रवासवर्णन या साहित्यप्रकाराला ललित गद्याची उंची देणारे अकथ प्रकाशनचे वैशिष्ट्यपूर्ण प्रकाशन.',
    rightsNote: 'प्रताधिकार © अनुरत्न वाघमारे. अकथ प्रकाशन, नांदेड.',
    isFeatured: false,
    isNewRelease: true,
    isEditorSelection: true,
    firstPageExcerptId: 'excerpt-dhukyachi-dulai',
    relatedArticleIds: ['article-dhukyachi-dulai-pravas'],
    relatedBookIds: ['book-scholar-juice', 'book-lokshahimadhye-samajmadhyamancha-vapar'],
    readingListIds: ['list-akath-prakashan-vishesh-granth'],
    verificationStatus: 'publisher_verified',
    provenanceLabel: 'अकथ प्रकाशन अधिकृत प्रकाशित ग्रंथ',
    coverImageUrl: '/assets/aistudio/book2_b40a45e1.jpeg',
    galleryImages: [
      {
        id: 'gal-dhukyachi-dulai-front',
        url: '/assets/aistudio/book2_b40a45e1.jpeg',
        caption: 'मुखपृष्ठ — धुक्याची दुलई : भूतान प्रवासवर्णन (लेखक: अनुरत्न वाघमारे)',
        altText: 'धुक्याची दुलई भूतान प्रवासवर्णन मुखपृष्ठ',
      },
    ],
    coverStyle: {
      backgroundHex: '#243D4F',
      accentHex: '#84241E',
      textHex: '#F7F3EA',
      borderPattern: 'minimal_archival',
      emblemText: 'भूतान प्रवासवर्णन · अकथ प्रकाशन',
    },
  },
  {
    id: 'book-lokshahimadhye-samajmadhyamancha-vapar',
    slug: 'lokshahimadhye-samajmadhyamancha-vapar',
    title: 'लोकशाहीमध्ये समाजमाध्यमांचा वापर',
    subtitle: 'संविधानिक मूल्ये, डिजिटल लोकमत आणि राजकीय प्रक्रियेचा चिकित्सक वेध',
    transliteratedTitle: 'Lokshahimadhye Samajmadhyamancha Vapar Akhilesh Pandit Yelkadare',
    authorId: 'author-akhilesh-yelkadare',
    contributorIds: [],
    category: 'संशोधन आणि समीक्षा',
    categorySlug: 'research-criticism',
    topics: ['लोकशाही', 'समाजमाध्यमे', 'भारतीय संविधान', 'लोकमत व डिजिटल माध्यम'],
    language: 'मराठी',
    publisher: 'अकथ प्रकाशन, नांदेड',
    isbn: '978-81-996989-4-9',
    edition: 'पहिली आवृत्ती, २०२६',
    publicationDate: '२०२६-०२-२०',
    pageCount: 152,
    format: 'वैचारिक व संशोधन ग्रंथ (पेपरबॅक)',
    price: 200,
    currency: 'INR',
    stock: 40,
    availability: 'in_stock',
    shippingNote: 'महाराष्ट्रभर ४ ते ६ कामाच्या दिवसांत नोंदणीकृत पोस्टाने किंवा कुरिअरने वितरण.',
    description:
      'भारतात लोकशाही स्वीकृत झाल्यापासून डॉ. बाबासाहेब आंबेडकरांनी ज्याची भक्कम उभारणी केली, त्या संविधानाने प्रत्येक नागरिकाला विचार, अभिव्यक्ती आणि सहभाग यांचे समान हक्क दिले. या हक्कांचा विस्तार आज डिजिटल जगात समाजमाध्यमांच्या रूपाने मोठ्या प्रमाणावर झाला आहे. सध्याच्या काळात समाजमाध्यमे केवळ संवादाचे साधन न राहता, सामाजिक मनःस्थिती घडवणारे, लोकमत तयार करणारे आणि राजकीय प्रक्रियेवर प्रभाव टाकणारे सामर्थ्यशाली माध्यम बनले आहेत. या पुस्तकात समाजमाध्यमांचा लोकशाहीमध्ये वाढता प्रभाव, त्यातील संधी आणि धोके, तसेच जबाबदार वापराची आवश्यकता यांचा चिकित्सक वेध घेतला आहे.',
    editorialContext: '— डॉ. दत्ता माधवराव कुंभेलवार',
    rightsNote: 'प्रताधिकार © आखिलेश पंडित येलकदरे. अकथ प्रकाशन, नांदेड.',
    isFeatured: false,
    isNewRelease: true,
    isEditorSelection: true,
    firstPageExcerptId: 'excerpt-lokshahimadhye-samajmadhyamancha-vapar',
    relatedArticleIds: ['article-lokshahi-ani-samajmadhyame'],
    relatedBookIds: ['book-scholar-juice', 'book-dhukyachi-dulai'],
    readingListIds: ['list-akath-prakashan-vishesh-granth'],
    verificationStatus: 'publisher_verified',
    provenanceLabel: 'अकथ प्रकाशन अधिकृत प्रकाशित ग्रंथ (ISBN 978-81-996989-4-9)',
    coverImageUrl: '/assets/aistudio/lokshahi-cover.jpg',
    coverSpreadUrl: '/assets/aistudio/ChatGPT_Image_Nov_3__2026_at_11_52_43_PM_821c7865.png',
    galleryImages: [
      {
        id: 'gal-lokshahi-front',
        url: '/assets/aistudio/lokshahi-cover.jpg',
        caption: 'मुखपृष्ठ — लोकशाहीमध्ये समाजमाध्यमांचा वापर (आखिलेश पंडित येलकदरे)',
        altText: 'लोकशाहीमध्ये समाजमाध्यमांचा वापर मुखपृष्ठ',
      },
      {
        id: 'gal-lokshahi-spread',
        url: '/assets/aistudio/ChatGPT_Image_Nov_3__2026_at_11_52_43_PM_821c7865.png',
        caption: 'पूर्ण मुखपृष्ठ व मलपृष्ठ मांडणी (डॉ. दत्ता माधवराव कुंभेलवार यांचे भाष्य · किंमत ₹ २००/-)',
        altText: 'लोकशाहीमध्ये समाजमाध्यमांचा वापर पूर्ण वेष्टन मांडणी',
      },
    ],
    coverStyle: {
      backgroundHex: '#123B4E',
      accentHex: '#8E2922',
      textHex: '#F5EFE4',
      borderPattern: 'essay_monograph',
      emblemText: 'लोकशाही व समाजमाध्यम · अकथ प्रकाशन',
    },
  },
];

export const INITIAL_EXCERPTS: FirstPageExcerpt[] = [
  {
    id: 'excerpt-scholar-juice',
    slug: 'scholar-juice-suruvatichi-saha-pane',
    title: 'स्कॉलर ज्यूस : सुरुवातीची सहा पाने आणि कथाक्रम',
    bookId: 'book-scholar-juice',
    authorId: 'author-g-k-ainapure',
    genreMarathi: 'दीर्घकथा संग्रह · अकथ प्रकाशन क्र. ०१',
    openingHook: 'अर्पणपत्रिका व प्रारंभिक संहिता : “उत्तम व साखरी ह्या कुपोषणामुळे मरण पावलेल्या भावंडांना”',
    excerptParagraphs: [
      'अकथ प्रकाशन क्र. ०१ म्हणून प्रकाशित झालेला जी. के. ऐनापुरे यांचा ‘स्कॉलर ज्यूस’ हा दीर्घकथा संग्रह आपल्या अर्पणपत्रिकेपासूनच वाचकाला गदगदून सोडतो — “उत्तम व साखरी ह्या कुपोषणामुळे मरण पावलेल्या भावंडांना”.',
      'या संग्रहातील पाच दीर्घकथा — १. मौनाची फेज अर्थात तळ, २. स्कॉलर ज्यूस, ३. पास्कलच्या घरातील सैतानाचा शोध, ४. फुल ना फुलाची पाकळी, आणि ५. भोवराः आत आतला घुम्म — समकालीन शैक्षणिक व व्यावसायिक स्पर्धेचे क्रौर्य, अस्तित्वसंकटात सापडलेल्या नव्या पिढीची संघर्षरत हताशा आणि मूल्यांच्या विघटनाचा तळ गाठतात.',
      'वरील ‘प्रारंभिक ६ पृष्ठे (मूळ मुद्रित संहिता)’ दर्शकामध्ये पुस्तकाचे पहिले रेखांकन (मिलिंद कडणे), शीर्षक पृष्ठ, अकथ प्रकाशनची अधिकृत प्रकाशन नोंद (ISBN 978-81-996989-6-3), अर्पणपत्रिका, लेखक जी. के. ऐनापुरे यांचा समग्र साहित्य परिचय आणि कथांची अनुक्रमणिका (।। क्रम ।।) जशीच्या तशी अनुभवता येईल.',
    ],
    highlightedLine:
      'उत्तम व साखरी ह्या कुपोषणामुळे मरण पावलेल्या भावंडांना — स्कॉलर ज्यूस वाचकाला केवळ कथा सांगत नाही तर जीवनाला गेलेले अदृश्य तडे पाहण्याची दृष्टी बहाल करतो.',
    editorialNote:
      'स्कॉलर ज्यूसच्या मूळ मुद्रित पुस्तकातील सुरुवातीची ६ पाने (PDF संहिता व पृष्ठनिहाय वाचन) येथे समाविष्ट केली आहेत.',
    rightsStatus: 'अधिकृत प्रकाशक संहिता (अकथ प्रकाशन क्र. ०१)',
    approvalStatus: 'approved',
    blindModeDefault: false,
    relatedArticleId: 'article-parikshan-scholar-juice',
    pdfDocumentUrl: '/assets/aistudio/_________________________________________ead1d264.pdf',
    folioPages: [
      {
        pageNumber: 1,
        labelMarathi: 'पृष्ठ १ · प्रारंभिक रेखांकन',
        labelEnglish: 'Page 1 · Frontispiece Illustration',
        heading: 'अंतर्गत रेखांकन — मिलिंद कडणे',
        sublines: ['दिनांक नोंद : २८ · ११ · २५'],
        bodyLines: [
          'स्कॉलर ज्यूस या दीर्घकथा संग्रहाच्या पहिल्या पानावरील चित्रकार मिलिंद कडणे यांनी साकारलेले एकरेषीय स्वाक्षरी-रेखांकन.',
        ],
        illustrationUrl: '/assets/aistudio/scholar-juice-folio-img-1.jpg',
      },
      {
        pageNumber: 2,
        labelMarathi: 'पृष्ठ २ · मुख्य शीर्षक पृष्ठ',
        labelEnglish: 'Page 2 · Title Page',
        heading: 'स्कॉलर ज्यूस',
        sublines: ['जी. के. ऐनापुरे', '( दीर्घकथा संग्रह )'],
        bodyLines: [
          'अकथ प्रकाशन, नांदेड',
          '“कासवाप्रमाणेच एका चांगल्या पुस्तकालाही घडण्यासाठी आपला संथ, संयमी वेळ लागतो.”',
        ],
        emblemUrl: '/assets/aistudio/scholar-juice-folio-img-2.jpg',
      },
      {
        pageNumber: 3,
        labelMarathi: 'पृष्ठ ३ · प्रकाशन नोंद व मुद्रण संदर्भ',
        labelEnglish: 'Page 3 · Imprint & Colophon',
        heading: 'अकथ प्रकाशन क्र. ०१ · स्कॉलर ज्यूस (दीर्घकथा संग्रह)',
        sublines: ['ISBN : 978-81-996989-6-3', 'पहिली आवृत्ती : २६ जानेवारी २०२६'],
        bodyLines: [
          'लेखक : जी. के. ऐनापुरे (डी ६, मथुरा अपार्टमेंट, चिंतामणीनगर, सांगली - ४१६४१६ · भ्रमणध्वनी - ९८३४२२७१०२)',
          'प्रकाशक : पूजा भागीरथा वसंत ढवळे, १/१६/८७, वैशाखी नगर, स्वातंत्र्य सैनिक कॉलनी जवळ, नांदेड - ४३१६०५ · भ्रमणध्वनी - ९२७०२८२९३२',
          '© जी. के. ऐनापुरे (या पुस्तकातील लेखनाचे सर्व हक्क लेखकाकडे सुरक्षित आहेत.)',
          'मुखपृष्ठ आणि आतील चित्रे : मिलिंद कडणे',
          'अक्षर जुळणी : इरलं ग्राफिक्स, मुंबई · अंतर्गत मांडणी : केतन बंगाल',
          'मुद्रितशोधन : अनिकेत डोळस, प्रवीण पवार',
          'मुद्रक : नंदन देऊळकर, सिद्धी ईम्प्रेशन्स, पुणे',
          'मूल्य : ६२५ रू. (विशेष वाचक सवलत मूल्य : ₹ ५४९/-)',
        ],
      },
      {
        pageNumber: 4,
        labelMarathi: 'पृष्ठ ४ · अर्पणपत्रिका',
        labelEnglish: 'Page 4 · Dedication',
        heading: 'उत्तम व साखरी',
        sublines: ['ह्या', 'कुपोषणामुळे मरण पावलेल्या', 'भावंडांना'],
        bodyLines: [
          'नैसर्गिक जगण्याचा गुन्हा केलेल्या माणसांची आंतरिक द्वंद्वे आणि सामाजिक संरचनेतील विसंवाद अधोरेखित करणाऱ्या संग्रहाची अर्पणपत्रिका.',
        ],
      },
      {
        pageNumber: 5,
        labelMarathi: 'पृष्ठ ५ · लेखक परिचय व ग्रंथसंपदा',
        labelEnglish: 'Page 5 · Author Bio & Bibliography',
        heading: 'परिचय — जी. के. ऐनापुरे (१९६२), एम. एस्सी. (समुद्री प्राणीशास्त्र)',
        sublines: ['प्रकाशित साहित्य, अनुवाद आणि सन्मान'],
        bodyLines: [
          'कथा : खंगोल (२००२), निकटवर्ती सूत्र (२०१४), सूर्याचे सांगाती (२०१४), कांदाचिर (२०१९)',
          'दीर्घकथा : झिंझुरडा (२०११), घनसाळ (२०१४), चिंचपोकळी (२०१७), नासमाया (२०२२)',
          'कादंबरी : अवकाश (२००७), अभिसरण (२००८), अधुरा (२००९), रिबोट (२०१०), जाईच्या घरी जाई (२०१२), ओस निळा एकान्त (२०१९), अयोध्या (२०२३)',
          'रिपोर्ताज : दप्तर (२०१२) · ललित गद्य : ओलीचिंब पावलं (२०१०) · संपादन : आकलनाचा प्रश्न (२०१२)',
          'चरित्र : कॉम्रेड के. एम. तथा बापू आडके (२०१३) · समीक्षा : समकालीन कादंबरी: आकलन आणि अन्वयार्थ (२०२५)',
          'अनुवाद : ‘उखडलेले वृक्ष’ या हिंदी कथासंग्रहात सहभाग (साहित्य अकादमी, दिल्ली); ‘कसांद्रा’ या इंग्रजी कथासंग्रहात सहभाग (मॅकमिलन प्रकाशन, दिल्ली)',
          'पुरस्कार : अत्रे कट्टा सन्मान (२००७), भि. ग. रोहमारे पुरस्कार (२००९), वा. ल. कुलकर्णी पुरस्कार (२०१०), ह. ना. आपटे पुरस्कार - महाराष्ट्र शासन (२०११), भैरूरतन दमाणी पुरस्कार (२०१२), दया पवार स्मृती पुरस्कार (२०१४), अनंत काणेकर पुरस्कार - साहित्य कला यात्री (२०१८), रिंगण पुरस्कार (२०२४)',
        ],
      },
      {
        pageNumber: 6,
        labelMarathi: 'पृष्ठ ६ · ।। क्रम ।। (अनुक्रमणिका)',
        labelEnglish: 'Page 6 · Table of Contents',
        heading: '।। क्रम ।। — संग्रहातील पाच दीर्घकथा',
        sublines: [
          'सन्मान : गुंफण समरसता साहित्य संमेलनाध्यक्ष (२०१२) · औदुंबर साहित्य संमेलनाध्यक्ष (२०१९) · दक्षिण महाराष्ट्र साहित्य संमेलनाध्यक्ष (२०२५)',
        ],
        bodyLines: [
          '१. मौनाची फेज अर्थात तळ',
          '२. स्कॉलर ज्यूस',
          '३. पास्कलच्या घरातील सैतानाचा शोध',
          '४. फुल ना फुलाची पाकळी',
          '५. भोवराः आत आतला घुम्म',
        ],
      },
    ],
    reactions: {
      readMore: 94,
      struckByLine: 118,
      wantContext: 52,
    },
  },
  {
    id: 'excerpt-dhukyachi-dulai',
    slug: 'dhukyachi-dulai-bhutan-pahile-pan',
    title: 'धुक्यात लपेटलेला मठ आणि हिमालयाची शांतता',
    bookId: 'book-dhukyachi-dulai',
    authorId: 'author-anuratna-waghmare',
    genreMarathi: 'भूतान प्रवासवर्णन · ललित गद्य',
    openingHook: 'प्रकरण पहिले : पारो खोऱ्यातील पहाट आणि धुक्याची दुलई',
    excerptParagraphs: [
      'पहाटेच्या वेळी खिडकीबाहेर पाहिले तेव्हा समोरचे देवदार वृक्ष आणि दूरवरच्या डोंगररांगा पांढऱ्याशुभ्र धुक्याच्या दुलईत शांत पहुडलेल्या होत्या. भूतानमध्ये वेळ घड्याळाच्या काट्यावर धावत नाही; ती दरीतून हळूहळू वर सरकणाऱ्या ढगांच्या लयीत चालते.',
      'डोंगरकड्यावर उभा असलेला तो प्राचीन बौद्ध मठ धुक्यातून अचानक समोर येतो, तेव्हा असे वाटते की आपण शतकांच्या पलीकडच्या एका निस्तब्ध जगात पाऊल ठेवले आहे. वाऱ्यावर फडफडणाऱ्या रंगीबेरंगी प्रार्थनाध्वजांचा आवाज मनातली सगळी अस्वस्थता शांत करून टाकतो.',
      'प्रवास म्हणजे केवळ नकाशावरची अंतरे पार करणे नव्हे; कधीकधी स्वतःच्या आतल्या गोंगाटातून बाहेर पडून निसर्गाच्या मुक्या भाषेशी संवाद साधणे म्हणजेही प्रवासच असतो.',
    ],
    highlightedLine:
      'भूतानमध्ये वेळ घड्याळाच्या काट्यावर धावत नाही; ती दरीतून हळूहळू वर सरकणाऱ्या ढगांच्या लयीत चालते.',
    editorialNote:
      'अनुरत्न वाघमारे यांच्या ‘धुक्याची दुलई : भूतान प्रवासवर्णन’ या पुस्तकातील निवडक प्रारंभिक उतारा.',
    rightsStatus: 'अधिकृत संपादकीय परवानगी प्राप्त (Approved Excerpt)',
    approvalStatus: 'approved',
    blindModeDefault: false,
    relatedArticleId: 'article-dhukyachi-dulai-pravas',
    reactions: {
      readMore: 64,
      struckByLine: 82,
      wantContext: 37,
    },
  },
  {
    id: 'excerpt-lokshahimadhye-samajmadhyamancha-vapar',
    slug: 'lokshahimadhye-samajmadhyamancha-vapar-pahile-pan',
    title: 'संविधानिक अभिव्यक्ती स्वातंत्र्य आणि डिजिटल लोकमत',
    bookId: 'book-lokshahimadhye-samajmadhyamancha-vapar',
    authorId: 'author-akhilesh-yelkadare',
    genreMarathi: 'लोकशाही व समाजमाध्यम संशोधन',
    openingHook: 'प्रस्तावना : भारतीय लोकशाही आणि समाजमाध्यमांचे नवे व्यासपीठ',
    excerptParagraphs: [
      'भारतात लोकशाही स्वीकृत झाल्यापासून डॉ. बाबासाहेब आंबेडकरांनी ज्याची भक्कम उभारणी केली, त्या संविधानाने प्रत्येक नागरिकाला विचार, अभिव्यक्ती आणि सहभाग यांचे समान हक्क दिले. या हक्कांचा विस्तार आज डिजिटल जगात समाजमाध्यमांच्या रूपाने मोठ्या प्रमाणावर झाला आहे.',
      'सध्याच्या काळात समाजमाध्यमे केवळ संवादाचे साधन न राहता, सामाजिक मनःस्थिती घडवणारे, लोकमत तयार करणारे आणि राजकीय प्रक्रियेवर प्रभाव टाकणारे सामर्थ्यशाली माध्यम बनले आहेत.',
      'या पुस्तकात समाजमाध्यमांचा लोकशाहीमध्ये वाढता प्रभाव, त्यातील संधी आणि धोके, तसेच जबाबदार वापराची आवश्यकता यांचा चिकित्सक वेध घेतला आहे.',
    ],
    highlightedLine:
      'समाजमाध्यमे केवळ संवादाचे साधन न राहता, सामाजिक मनःस्थिती घडवणारे आणि लोकमत तयार करणारे सामर्थ्यशाली माध्यम बनले आहेत.',
    editorialNote:
      'आखिलेश पंडित येलकदरे यांच्या ‘लोकशाहीमध्ये समाजमाध्यमांचा वापर’ या पुस्तकातील प्रस्तावना व मलपृष्ठ संदर्भ.',
    rightsStatus: 'अधिकृत संपादकीय परवानगी प्राप्त (Approved Excerpt)',
    approvalStatus: 'approved',
    blindModeDefault: false,
    relatedArticleId: 'article-lokshahi-ani-samajmadhyame',
    reactions: {
      readMore: 59,
      struckByLine: 74,
      wantContext: 41,
    },
  },
];

export const INITIAL_ARTICLES: EditorialArticle[] = [
  {
    id: 'article-parikshan-scholar-juice',
    slug: 'scholar-juice-galibi-arsa-sudam-rathod',
    title: '‘स्कॉलर ज्यूस’ : समकाळातील माणूस आणि समाज यांच्या नात्याचा गालिबी आरसा',
    subtitle: 'जी. के. ऐनापुरे यांच्या दीर्घकथा संग्रहावरील समीक्षात्मक भाष्य',
    transliteratedTitle: 'Scholar Juice G K Ainapure Critical Appreciation Sudam Rathod',
    authorId: 'author-g-k-ainapure',
    contributorName: 'सुदाम राठोड, नाशिक',
    contributorRole: 'समीक्षक व साहित्य अभ्यासक',
    categorySlug: 'reviews',
    categoryMarathi: 'पुस्तक परीक्षण',
    tags: ['स्कॉलर ज्यूस', 'जी. के. ऐनापुरे', 'दीर्घकथा संग्रह', 'पुस्तक परीक्षण'],
    publishedAt: '२०२६-०१-२६',
    readingTimeMinutes: 6,
    summary:
      'समकालीन मराठी कथनपरंपरेला नवोत्तर संवेदनांचे भान देणाऱ्या जी. के. ऐनापुरे यांचा ‘स्कॉलर ज्यूस’ हा दीर्घकथा संग्रह मूल्यांच्या विघटनाची विविध रूपे अधोरेखित करतो.',
    leadParagraph:
      "समकालीन मराठी कथनपरंपरेला नवोत्तर संवेदनांचे भान देणाऱ्या जी. के. ऐनापुरे यांचा 'स्कॉलरज्यूस' हा एक वैशिष्ट्यपूर्ण दीर्घ कथासंग्रह आहे. नैसर्गिक जगण्याचा गुन्हा केलेल्या माणसांची आंतरिक द्वंद्वे आणि सामाजिक संरचनेतील विसंवाद मांडणारा हा संग्रह मूल्यांच्या विघटनाची विविध रूपे- विरुपे अधोरेखित करतो.",
    sections: [
      {
        id: 'sec-sj-1',
        heading: '१. शैक्षणिक व व्यावसायिक स्पर्धेचे जिवंत क्रौर्य',
        paragraphs: [
          'शैक्षणिक व व्यावसायिक स्पर्धेचे साजिवंत क्रौर्य आणि त्यात अस्तित्वसंकटात सापडलेल्या नव्या पिढीची संघर्षरत हताशा संग्रहभर आढळून येते. धर्माच्या भांडवलाचे आणि भांडवलाच्या धर्माचे आंतरसंबंध उलगडून दाखवत लेखक शोषणाची आधुनिक केंद्रे निर्देशीत करत जातो.',
          'समुहमनाचा वेध घेत हळूहळू व्यक्तीमनाच्या खोल खोल तळापर्यंत जाऊन तिथे ढवळाढवळ करतो. ही ढवळाढवळ फार अस्वस्थ करणारी आहे.',
        ],
        pullQuote:
          '“स्कॉलरज्यूस वाचकाला केवळ कथा सांगत नाही तर जीवनाला गेलेले अदृश्य तडे पाहण्याची दृष्टी बहाल करतो.”',
      },
      {
        id: 'sec-sj-2',
        heading: '२. व्यक्तीचित्रण आणि कथा-विन्यासरचना',
        paragraphs: [
          'व्यक्तीचित्रणातील बारीक-सारीक नोंदी, नव्या सामाजिक/सांस्कृतिक वास्तवाचे सूक्ष्म भान, वैशिष्ट्यपूर्ण भाषाशैली आणि अंतर्मनाला अस्वस्थ करणारी कथा - विन्यासरचना यामुळे हा दीर्घ कथासंग्रह समकाळातील माणूस आणि समाज यांच्या नात्याचा गालिबी आरसा आहे असे म्हणता येईल.',
        ],
      },
    ],
    workflowStatus: 'published',
    relatedBookIds: ['book-scholar-juice', 'book-dhukyachi-dulai', 'book-lokshahimadhye-samajmadhyamancha-vapar'],
    relatedAuthorIds: ['author-g-k-ainapure'],
    relatedArticleIds: ['article-dhukyachi-dulai-pravas', 'article-lokshahi-ani-samajmadhyame'],
    verificationStatus: 'publisher_verified',
    provenanceLabel: 'अकथ प्रकाशन अधिकृत ग्रंथ समीक्षा',
  },
  {
    id: 'article-dhukyachi-dulai-pravas',
    slug: 'dhukyachi-dulai-bhutan-pravas-anubhav',
    title: '‘धुक्याची दुलई’ : हिमालयाच्या कुशीतील भूतानचा संवेदनशील प्रवासानुभव',
    subtitle: 'अनुरत्न वाघमारे यांच्या भूतान प्रवासवर्णनाच्या निमित्ताने निसर्ग आणि संस्कृतीचा संवाद',
    transliteratedTitle: 'Dhukyachi Dulai Bhutan Travelogue Essay Anuratna Waghmare',
    authorId: 'author-anuratna-waghmare',
    contributorName: 'अनुरत्न वाघमारे',
    contributorRole: 'लेखक व प्रवासवर्णनकार',
    categorySlug: 'articles',
    categoryMarathi: 'लेख आणि विचार',
    tags: ['धुक्याची दुलई', 'भूतान प्रवासवर्णन', 'अनुरत्न वाघमारे', 'ललित गद्य'],
    publishedAt: '२०२६-०२-१२',
    readingTimeMinutes: 5,
    summary:
      'भूतानच्या धुक्यात लपेटलेल्या दऱ्याखोऱ्यांमधून फिरताना उमगलेले शांततेचे आणि समाधानी जीवनाचे तत्त्वज्ञान मांडणारा लेख.',
    leadParagraph:
      'भूतान हा केवळ नकाशावरचा एक छोटा देश नाही; तो आधुनिक जगाच्या वेगवान स्पर्धेतून क्षणभर बाहेर पडून स्वतःकडे पाहायला लावणारा एक शांत आरसा आहे. ‘धुक्याची दुलई’ हे पुस्तक याच प्रवासातून जन्माला आले.',
    sections: [
      {
        id: 'sec-dd-1',
        heading: 'निसर्गाची लय आणि मानवी समाधान',
        paragraphs: [
          'भूतानमधील प्राचीन मठ, डोंगरउतारावरील पायवाटा आणि तिथल्या माणसांचे अतिशय साधे पण समृद्ध जगणे पाहताना आपल्याला आपल्याच गरजांचा नव्याने विचार करावा लागतो.',
        ],
        pullQuote:
          '“धुक्याची दुलई पांघरलेला हिमालय आपल्याला सांगतो की, निसर्गाशी स्पर्धा करण्यापेक्षा त्याच्याशी संवाद साधण्यातच खरे सुख दडलेले आहे.”',
      },
    ],
    workflowStatus: 'published',
    relatedBookIds: ['book-dhukyachi-dulai', 'book-scholar-juice'],
    relatedAuthorIds: ['author-anuratna-waghmare'],
    relatedArticleIds: ['article-parikshan-scholar-juice'],
    verificationStatus: 'publisher_verified',
    provenanceLabel: 'वाचनकट्टा लेखक मनोगत',
  },
  {
    id: 'article-lokshahi-ani-samajmadhyame',
    slug: 'lokshahimadhye-samajmadhyamancha-vapar-chintan',
    title: 'भारतीय लोकशाही, संविधान आणि समाजमाध्यमांचा वाढता प्रभाव',
    subtitle: 'आखिलेश पंडित येलकदरे यांच्या ‘लोकशाहीमध्ये समाजमाध्यमांचा वापर’ या पुस्तकाच्या निमित्ताने',
    transliteratedTitle: 'Social Media in Indian Democracy Akhilesh Pandit Yelkadare',
    authorId: 'author-akhilesh-yelkadare',
    contributorName: 'डॉ. दत्ता माधवराव कुंभेलवार',
    contributorRole: 'अभ्यासक व भाष्यकार',
    categorySlug: 'reviews',
    categoryMarathi: 'पुस्तक परीक्षण',
    tags: ['लोकशाही', 'समाजमाध्यमे', 'आखिलेश पंडित येलकदरे', 'संविधान'],
    publishedAt: '२०२६-०२-२२',
    readingTimeMinutes: 5,
    summary:
      'संविधानाने दिलेल्या विचार व अभिव्यक्ती स्वातंत्र्याचा डिजिटल विस्तार आणि समाजमाध्यमांच्या संधी व धोक्यांचा चिकित्सक वेध.',
    leadParagraph:
      'भारतात लोकशाही स्वीकृत झाल्यापासून डॉ. बाबासाहेब आंबेडकरांनी ज्याची भक्कम उभारणी केली, त्या संविधानाने प्रत्येक नागरिकाला विचार, अभिव्यक्ती आणि सहभाग यांचे समान हक्क दिले. या हक्कांचा विस्तार आज डिजिटल जगात समाजमाध्यमांच्या रूपाने मोठ्या प्रमाणावर झाला आहे.',
    sections: [
      {
        id: 'sec-ls-1',
        heading: 'लोकमत घडवणारे सामर्थ्यशाली माध्यम',
        paragraphs: [
          'सध्याच्या काळात समाजमाध्यमे केवळ संवादाचे साधन न राहता, सामाजिक मनःस्थिती घडवणारे, लोकमत तयार करणारे आणि राजकीय प्रक्रियेवर प्रभाव टाकणारे सामर्थ्यशाली माध्यम बनले आहेत.',
          'आखिलेश पंडित येलकदरे यांनी या पुस्तकात समाजमाध्यमांचा लोकशाहीमध्ये वाढता प्रभाव, त्यातील संधी आणि धोके, तसेच जबाबदार वापराची आवश्यकता यांचा चिकित्सक वेध घेतला आहे.',
        ],
        pullQuote:
          '“संविधानाने दिलेल्या विचार आणि अभिव्यक्ती स्वातंत्र्याची जपणूक करण्यासाठी समाजमाध्यमांचा जबाबदार व विवेकी वापर ही काळाची गरज आहे.”',
      },
    ],
    workflowStatus: 'published',
    relatedBookIds: ['book-lokshahimadhye-samajmadhyamancha-vapar', 'book-scholar-juice'],
    relatedAuthorIds: ['author-akhilesh-yelkadare'],
    relatedArticleIds: ['article-parikshan-scholar-juice'],
    verificationStatus: 'publisher_verified',
    provenanceLabel: 'अकथ प्रकाशन ग्रंथ भाष्य',
  },
];

export const INITIAL_READING_LISTS: ReadingList[] = [
  {
    id: 'list-akath-prakashan-vishesh-granth',
    slug: 'akath-prakashan-pramukh-prakashit-granth',
    title: 'अकथ प्रकाशन विशेष ग्रंथसूची : दीर्घकथा, प्रवासवर्णन आणि लोकशाही चिंतन',
    subtitle: 'समकालीन मराठी कथाविश्व, भूतान प्रवासानुभव आणि डिजिटल लोकशाहीचा वेध घेणारी तीन महत्त्वाची पुस्तके',
    curatorName: 'पूजा वसंतराव ढवळे',
    curatorRole: 'संस्थापक व प्रकाशक, अकथ प्रकाशन',
    themeTag: 'अकथ विशेष ग्रंथ निवड',
    introduction:
      'अकथ प्रकाशनच्या साहित्यिक प्रवासातील ही तीन प्रमुख पुस्तके — जी. के. ऐनापुरे यांचा अस्वस्थ करणारा दीर्घकथा संग्रह ‘स्कॉलर ज्यूस’, अनुरत्न वाघमारे यांचे चित्रदर्शी ‘धुक्याची दुलई : भूतान प्रवासवर्णन’, आणि आखिलेश पंडित येलकदरे यांचा ‘लोकशाहीमध्ये समाजमाध्यमांचा वापर’ हा वैचारिक ग्रंथ.',
    items: [
      {
        bookId: 'book-scholar-juice',
        curatorComment:
          'समकाळातील माणूस आणि समाज यांच्या नात्याचा गालिबी आरसा ठरणारा व जीवनाला गेलेले अदृश्य तडे दाखवणारा जी. के. ऐनापुरे यांचा दीर्घकथा संग्रह.',
      },
      {
        bookId: 'book-dhukyachi-dulai',
        curatorComment:
          'हिमालयाच्या कुशीतील भूतानच्या निसर्गाचे, बौद्ध मठांचे आणि शांत जीवनशैलीचे अनुरत्न वाघमारे यांनी केलेले संवेदनशील प्रवासवर्णन.',
      },
      {
        bookId: 'book-lokshahimadhye-samajmadhyamancha-vapar',
        curatorComment:
          'संविधानिक अभिव्यक्ती स्वातंत्र्य आणि डिजिटल युगातील समाजमाध्यमांचा लोकशाहीवरील प्रभाव यांचा आखिलेश पंडित येलकदरे यांनी घेतलेला चिकित्सक वेध.',
      },
    ],
    relatedArticleIds: [
      'article-parikshan-scholar-juice',
      'article-dhukyachi-dulai-pravas',
      'article-lokshahi-ani-samajmadhyame',
    ],
  },
];
