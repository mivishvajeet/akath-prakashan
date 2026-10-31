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
  whatsappNumber: '919270282932',
  phoneDisplay: '+91 92702 82932',
  logoUrl: '/assets/akath/akath-logo.png',
  heroBooksUrl: '/assets/akath/hero-books.jpg',
  existingLiveUrl: 'https://akathpublication.arthsankalp.com/#top',
  editorialPrinciples: [
    {
      title: 'संपादकीय स्वातंत्र्य आणि वाङ्मयीन कस',
      description:
        'तात्कालिक बाजारी लाटांपेक्षा आशयघनता, भाषिक नेमकेपणा आणि दीर्घकाळ टिकणाऱ्या साहित्यमूल्यांना प्राधान्य.',
    },
    {
      title: 'मराठी भाषेचे समकालीन भान',
      description:
        'प्रमाण भाषेसोबतच मराठवाडा व महाराष्ट्रातील विविध बोली, प्रादेशिक अनुभवविश्व आणि नव्या संवेदनांचा सन्मान.',
    },
    {
      title: 'नव्या आणि गंभीर आवाजांना व्यासपीठ',
      description:
        'पहिल्या पुस्तकाच्या लेखकापासून ते अनुभवी अभ्यासकांपर्यंत प्रत्येक हस्तलिखितावर सखोल संपादकीय संवाद.',
    },
    {
      title: 'पारदर्शक लेखक-प्रकाशक व्यवहार',
      description:
        'हस्तलिखित निवडीपासून संपादन, मुद्रण, विक्री अहवाल आणि मानधनापर्यंत स्पष्ट व विश्वासार्ह कार्यपद्धती.',
    },
  ],
  preservedCapabilities: [
    {
      step: '01',
      titleMarathi: 'सखोल संपादन आणि मुद्रितशोधन',
      titleEnglish: 'Editing & Proofreading',
      description:
        'मराठी, हिंदी आणि इंग्रजी भाषेतील हस्तलिखितांचे आशयसंपादन, वाक्यरचना सुधारणा आणि अचूक मुद्रितशोधन.',
    },
    {
      step: '02',
      titleMarathi: 'आशयघन मुखपृष्ठ संकल्पना',
      titleEnglish: 'Story-Led Cover Design',
      description:
        'पुस्तकाच्या अंतरंगाशी सुसंगत, वाचकाचे लक्ष वेधून घेणारी आणि साहित्यिक गांभीर्य जपणारी मुखपृष्ठ मांडणी.',
    },
    {
      step: '03',
      titleMarathi: 'अंतर्गत मांडणी आणि अक्षरजुळणी',
      titleEnglish: 'Layout & Typesetting',
      description:
        'दीर्घ वाचनासाठी डोळ्यांना सुखद वाटणारी देवनागरी अक्षरजुळणी, समास आणि कागद-अनुकूल पृष्ठरचना.',
    },
    {
      step: '04',
      titleMarathi: 'ISBN नोंदणी आणि प्रताधिकार प्रक्रिया',
      titleEnglish: 'ISBN & Copyright Documentation',
      description:
        'कायदेशीर प्रताधिकार लेखकाच्या नावे सुरक्षित ठेवून अधिकृत ISBN व ग्रंथसूची नोंदणीची पूर्ण जबाबदारी.',
    },
    {
      step: '05',
      titleMarathi: 'दर्जेदार मुद्रण आणि बांधणी',
      titleEnglish: 'Archival Printing & Binding',
      description:
        'पेपरबॅक आणि हार्डबाउंड आवृत्त्यांसाठी टिकाऊ कागद, स्पष्ट छपाई आणि मजबूत पुस्तक बांधणी.',
    },
    {
      step: '06',
      titleMarathi: 'वितरण आणि ई-बुक प्रसार',
      titleEnglish: 'Distribution & eBook Reach',
      description:
        'नांदेडच्या पलीकडे महाराष्ट्रभरातील स्वतंत्र पुस्तकांची दुकाने, वाचनालये आणि थेट ऑनलाइन वाचकांपर्यंत पोहोच.',
    },
  ],
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
    id: 'author-dnyaneshwar-parampara',
    slug: 'marathwada-sant-sahitya-abhyas-mandal',
    name: 'डॉ. विश्वनाथ देशमुख',
    transliteratedName: 'Dr. Vishwanath Deshmukh Nanded',
    literaryRole: 'संतसाहित्य अभ्यासक व समीक्षक',
    region: 'नांदेड, मराठवाडा',
    biography:
      'मराठवाड्यातील मध्ययुगीन मराठी वाङ्मय, संतपरंपरा आणि लोकभाषेच्या स्थित्यंतराचे अभ्यासक. गेल्या दोन दशकांपासून नांदेड परिसरातील जुन्या पोथ्या, हस्तलिखिते आणि मौखिक परंपरेचे संकलन व चिकित्सक संपादन.',
    editorialNote:
      'अकथ प्रकाशनच्या संशोधन आणि समीक्षा विभागातील प्रमुख संपादकीय मार्गदर्शक व लेखक.',
    themes: ['संतसाहित्य', 'मराठवाडा सांस्कृतिक इतिहास', 'भाषाशास्त्र', 'चिकित्सक संपादन'],
    bookIds: ['book-godavari-kathache-akshar', 'book-shabdanche-antahsthal'],
    articleIds: ['article-marathi-bhasha-ani-pradeshik-avaj', 'article-samvad-vishwanath-deshmukh'],
    publicProfileStatus: 'published',
    verificationStatus: 'editorial_specimen',
    provenanceLabel: 'अकथ संपादकीय नमुना प्रोफाइल (प्रकाशक मंजुरीसाठी सज्ज)',
  },
  {
    id: 'author-revati-kulkarni',
    slug: 'revati-kulkarni',
    name: 'रेवती कुलकर्णी',
    transliteratedName: 'Revati Kulkarni',
    literaryRole: 'कवयित्री आणि ललित लेखिका',
    region: 'छत्रपती संभाजीनगर / नांदेड',
    biography:
      'समकालीन मराठी कवितेतील संयत आणि चिंतनशील आवाज. निसर्ग, महानगरीय एकटेपणा आणि स्त्रियांच्या दैनंदिन आयुष्यातील सूक्ष्म ताणतणाव यांच्यावर केंद्रित लेखन. विविध वाङ्मयीन नियतकालिकांतून कविता व ललित निबंध प्रसिद्ध.',
    editorialNote:
      'नव्या पिढीतील संवेदनशील कवितेचे प्रतिनिधित्व करणारा आवाज.',
    themes: ['समकालीन कविता', 'ललित गद्य', 'स्त्री-संवेदना', 'ग्रामीण-शहरी संधिकाळ'],
    bookIds: ['book-unhachya-savlya', 'book-santh-panyache-divas'],
    articleIds: ['article-kavitela-vel-ka-lagto', 'article-parikshan-unhachya-savlya'],
    publicProfileStatus: 'published',
    verificationStatus: 'editorial_specimen',
    provenanceLabel: 'अकथ संपादकीय नमुना प्रोफाइल (प्रकाशक मंजुरीसाठी सज्ज)',
  },
  {
    id: 'author-siddharth-waghmare',
    slug: 'siddharth-waghmare',
    name: 'सिद्धार्थ वाघमारे',
    transliteratedName: 'Siddharth Waghmare',
    literaryRole: 'कथाकार आणि समाजचिंतक',
    region: 'परभणी / नांदेड',
    biography:
      'ग्रामीण आणि निमशहरी महाराष्ट्रातील बदलते सामाजिक-आर्थिक वास्तव, शेतीव्यवस्था आणि तरुण पिढीची अस्वस्थता यांवर परखड परंतु कलात्मक भान ठेवून लिहिणारे कथाकार.',
    editorialNote:
      'वास्तवाचे थेट आणि बिनतोड चित्रण करणारे समकालीन कथासाहित्य.',
    themes: ['ग्रामीण कथा', 'सामाजिक वास्तव', 'कादंबरी', 'लोकसंस्कृती'],
    bookIds: ['book-koradya-nadichi-bakhar'],
    articleIds: ['article-katha-lihitana-bhovtal', 'article-reading-list-marathwada-sahitya'],
    publicProfileStatus: 'published',
    verificationStatus: 'editorial_specimen',
    provenanceLabel: 'अकथ संपादकीय नमुना प्रोफाइल (प्रकाशक मंजुरीसाठी सज्ज)',
  },
  {
    id: 'author-meera-joshi-anuvad',
    slug: 'meera-joshi',
    name: 'मीरा जोशी',
    transliteratedName: 'Meera Joshi Translator',
    literaryRole: 'अनुवादक आणि भारतीय साहित्य अभ्यासक',
    region: 'पुणे / नांदेड',
    biography:
      'भारतीय भाषांमधील (कन्नड, हिंदी आणि बंगाली) निवडक अभिजात व समकालीन साहित्याचा मराठीत संवेदनशील अनुवाद करणाऱ्या अभ्यासक. मूळ भाषेचा लहेजा आणि मराठीची सहजता यांचा समतोल साधण्यावर भर.',
    editorialNote:
      'अकथ प्रकाशनच्या ‘भारतीय साहित्य अनुवाद’ मालिकेच्या समन्वयक.',
    themes: ['भारतीय साहित्य', 'अनुवाद मीमांसा', 'तुलनात्मक साहित्य'],
    bookIds: ['book-antarbhasha-anuvad-sankalan'],
    articleIds: ['article-anuvad-mhanje-punarjanma'],
    publicProfileStatus: 'published',
    verificationStatus: 'editorial_specimen',
    provenanceLabel: 'अकथ संपादकीय नमुना प्रोफाइल (प्रकाशक मंजुरीसाठी सज्ज)',
  },
];

export const INITIAL_BOOKS: BookRecord[] = [
  {
    id: 'book-godavari-kathache-akshar',
    slug: 'godavari-kathache-akshar',
    title: 'गोदावरी काठाचे अक्षर',
    subtitle: 'मराठवाड्यातील वाङ्मयीन परंपरेचा आणि लोकभाषेचा चिकित्सक वेध',
    transliteratedTitle: 'Godavari Kathache Akshar Marathwada Sahitya',
    authorId: 'author-dnyaneshwar-parampara',
    contributorIds: [],
    category: 'संशोधन आणि समीक्षा',
    categorySlug: 'research-criticism',
    topics: ['मराठवाडा साहित्य', 'भाषाशास्त्र', 'सांस्कृतिक इतिहास', 'संतपरंपरा'],
    language: 'मराठी',
    publisher: 'अकथ प्रकाशन, नांदेड',
    isbn: '978-81-974210-1-3 (संपादकीय नोंद)',
    edition: 'पहिली आवृत्ती, २०२६',
    publicationDate: '२०२६-०२-१५',
    pageCount: 248,
    format: 'पेपरबॅक (क्रीम आर्चिव्हल पेपर)',
    price: 340,
    currency: 'INR',
    stock: 28,
    availability: 'in_stock',
    shippingNote: 'महाराष्ट्रभर ४ ते ६ कामाच्या दिवसांत नोंदणीकृत पोस्टाने किंवा कुरिअरने वितरण.',
    description:
      'गोदावरीच्या खोऱ्यात फुललेल्या मराठी साहित्याची पाळेमुळे केवळ ग्रांथिक परंपरेत नसून ती येथील लोकभाषा, ओव्या, पोथ्या आणि दैनंदिन संवादाच्या लयीत कशी दडलेली आहेत, याचा सखोल अभ्यास मांडणारा हा ग्रंथ आहे.',
    editorialContext:
      'अकथ प्रकाशनच्या स्थापनेमागील ‘स्थानिक मुळे आणि वैश्विक दृष्टी’ या सूत्राचे प्रतिनिधित्व करणारे हे महत्त्वाचे प्रकाशन आहे.',
    rightsNote: 'सर्व हक्क लेखकाधीन. अकथ प्रकाशनद्वारे अधिकृत मुद्रण व वितरण परवाना.',
    isFeatured: true,
    isNewRelease: true,
    isEditorSelection: true,
    editorSelectionNote: {
      personalNote:
        'आपण ज्या भूमीत राहतो, तिथल्या भाषेचा इतिहास समजून घेतल्याशिवाय नवे साहित्य लिहिता येत नाही. डॉ. विश्वनाथ देशमुख यांनी अनेक वर्षे शांतपणे केलेल्या संशोधनाचे हे फळ आहे.',
      whySelected:
        'कासवाच्या संयमाने केलेले अस्सल संशोधन कसे असते, याचा वस्तुपाठ म्हणजे हे पुस्तक. यात कोणताही अकादमिक बोजडपणा नसून वाचकाला गुंतवून ठेवणारी प्रवाही भाषा आहे.',
      whoShouldRead:
        'मराठी भाषा, इतिहास, संतसाहित्य आणि प्रादेशिक संस्कृतीविषयी आस्था असणाऱ्या प्रत्येक गंभीर वाचकासाठी.',
      selectedBy: 'संपादक मंडळ, अकथ प्रकाशन',
      selectionMonth: 'ऑक्टोबर २०२६ निवड',
    },
    firstPageExcerptId: 'excerpt-godavari-kathache-akshar',
    relatedArticleIds: [
      'article-marathi-bhasha-ani-pradeshik-avaj',
      'article-samvad-vishwanath-deshmukh',
    ],
    relatedBookIds: ['book-shabdanche-antahsthal', 'book-koradya-nadichi-bakhar'],
    readingListIds: ['list-marathwada-sahitya-pravah', 'list-navya-abhyasakansathi'],
    verificationStatus: 'editorial_specimen',
    provenanceLabel: 'अकथ संपादकीय कॅटलॉग नमुना (प्रकाशक अंतिम ISBN मंजुरीसाठी सज्ज)',
    coverStyle: {
      backgroundHex: '#2C362B',
      accentHex: '#C87D55',
      textHex: '#F3EEE4',
      borderPattern: 'essay_monograph',
      emblemText: 'संशोधन व समीक्षा · अकथ प्रकाशन',
    },
  },
  {
    id: 'book-unhachya-savlya',
    slug: 'unhachya-savlya',
    title: 'उन्हाच्या सावल्या',
    subtitle: 'समकालीन जाणिवांच्या निवडक कविता',
    transliteratedTitle: 'Unhachya Savlya Marathi Poetry Collection',
    authorId: 'author-revati-kulkarni',
    contributorIds: [],
    category: 'कविता',
    categorySlug: 'poetry',
    topics: ['समकालीन कविता', 'निसर्ग आणि माणूस', 'आत्मचिंतन'],
    language: 'मराठी',
    publisher: 'अकथ प्रकाशन, नांदेड',
    isbn: '978-81-974210-2-0 (संपादकीय नोंद)',
    edition: 'पहिली आवृत्ती, २०२६',
    publicationDate: '२०२६-०४-१०',
    pageCount: 116,
    format: 'पेपरबॅक (नॅचरल शेड ८० जीएसएम)',
    price: 210,
    currency: 'INR',
    stock: 42,
    availability: 'in_stock',
    shippingNote: 'महाराष्ट्रभर ४ ते ६ कामाच्या दिवसांत वितरण.',
    description:
      'दुपारच्या रखरखीत उन्हातही जशा झाडांच्या लहान सावल्या आपला आडोसा धरून राहतात, तशाच मानवी मनाच्या कोपऱ्यात जपून ठेवलेल्या हळव्या, अस्वस्थ आणि प्रामाणिक क्षणांच्या या कविता आहेत.',
    editorialContext:
      'आक्रस्ताळेपणा टाळून संयत शब्दांत काळाला भिडणाऱ्या नव्या मराठी कवितेचा हा संग्रह आहे.',
    rightsNote: 'प्रताधिकार © रेवती कुलकर्णी. अकथ प्रकाशनद्वारे प्रकाशित.',
    isFeatured: true,
    isNewRelease: true,
    isEditorSelection: false,
    firstPageExcerptId: 'excerpt-unhachya-savlya',
    relatedArticleIds: [
      'article-kavitela-vel-ka-lagto',
      'article-parikshan-unhachya-savlya',
    ],
    relatedBookIds: ['book-santh-panyache-divas', 'book-antarbhasha-anuvad-sankalan'],
    readingListIds: ['list-samkalin-marathi-kavita'],
    verificationStatus: 'editorial_specimen',
    provenanceLabel: 'अकथ संपादकीय कॅटलॉग नमुना (प्रकाशक अंतिम ISBN मंजुरीसाठी सज्ज)',
    coverStyle: {
      backgroundHex: '#7A3E2C',
      accentHex: '#E8D8C3',
      textHex: '#FAF7F0',
      borderPattern: 'poetry_line',
      emblemText: 'काव्यसंग्रह · अकथ प्रकाशन',
    },
  },
  {
    id: 'book-koradya-nadichi-bakhar',
    slug: 'koradya-nadichi-bakhar',
    title: 'कोरड्या नदीची बखर',
    subtitle: 'बदलत्या गावगाड्याच्या आणि माणसांच्या दीर्घकथा',
    transliteratedTitle: 'Koradya Nadichi Bakhar Short Stories',
    authorId: 'author-siddharth-waghmare',
    contributorIds: [],
    category: 'कथासंग्रह',
    categorySlug: 'fiction-stories',
    topics: ['ग्रामीण कथा', 'सामाजिक स्थित्यंतर', 'मराठवाडा जनजीवन'],
    language: 'मराठी',
    publisher: 'अकथ प्रकाशन, नांदेड',
    isbn: '978-81-974210-3-7 (संपादकीय नोंद)',
    edition: 'पहिली आवृत्ती, २०२६',
    publicationDate: '२०२६-०६-०१',
    pageCount: 192,
    format: 'पेपरबॅक',
    price: 280,
    currency: 'INR',
    stock: 19,
    availability: 'in_stock',
    shippingNote: 'महाराष्ट्रभर ४ ते ६ कामाच्या दिवसांत वितरण.',
    description:
      'पाणी आटलेल्या नदीपात्रात जसे दगडगोटे आणि जुन्या खुणा उघड्या पडतात, तसेच जागतिकीकरणानंतरच्या खेड्यांमधील तुटत चाललेले संबंध आणि तरीही टिकून राहिलेली माणूसकी या संग्रहातील सात दीर्घकथांमधून समोर येते.',
    editorialContext:
      'कथा हा मराठी वाचकांचा अत्यंत जिव्हाळ्याचा फॉर्म आहे; त्या फॉर्मला नवे गंभीर परिमाण देणारा संग्रह.',
    rightsNote: 'प्रताधिकार © सिद्धार्थ वाघमारे.',
    isFeatured: true,
    isNewRelease: false,
    isEditorSelection: false,
    firstPageExcerptId: 'excerpt-koradya-nadichi-bakhar',
    relatedArticleIds: [
      'article-katha-lihitana-bhovtal',
      'article-reading-list-marathwada-sahitya',
    ],
    relatedBookIds: ['book-godavari-kathache-akshar', 'book-santh-panyache-divas'],
    readingListIds: ['list-marathwada-sahitya-pravah'],
    verificationStatus: 'editorial_specimen',
    provenanceLabel: 'अकथ संपादकीय कॅटलॉग नमुना (प्रकाशक अंतिम ISBN मंजुरीसाठी सज्ज)',
    coverStyle: {
      backgroundHex: '#3A322B',
      accentHex: '#B65E43',
      textHex: '#F3EEE4',
      borderPattern: 'classic_frame',
      emblemText: 'दीर्घकथा · अकथ प्रकाशन',
    },
  },
  {
    id: 'book-santh-panyache-divas',
    slug: 'santh-panyache-divas',
    title: 'संथ पाण्याचे दिवस',
    subtitle: 'वाचन, प्रवास आणि आठवणींचे ललित निबंध',
    transliteratedTitle: 'Santh Panyache Divas Lalit Essays',
    authorId: 'author-revati-kulkarni',
    contributorIds: [],
    category: 'ललित आणि वैचारिक',
    categorySlug: 'essays-thought',
    topics: ['ललित गद्य', 'वाचनसंस्कृती', 'स्मरणरंजन व चिंतन'],
    language: 'मराठी',
    publisher: 'अकथ प्रकाशन, नांदेड',
    isbn: '978-81-974210-4-4 (संपादकीय नोंद)',
    edition: 'पहिली आवृत्ती, २०२५',
    publicationDate: '२०२५-११-२०',
    pageCount: 164,
    format: 'पेपरबॅक',
    price: 240,
    currency: 'INR',
    stock: 7,
    availability: 'limited_stock',
    shippingNote: 'मर्यादित प्रती उपलब्ध. ४ ते ६ कामाच्या दिवसांत वितरण.',
    description:
      'घाईगर्दीच्या काळात थांबून भोवतालच्या माणसांकडे, जुन्या घरांकडे आणि पुस्तकांच्या पानांकडे पाहण्याची निवांत दृष्टी देणारे अठरा ललित निबंध.',
    editorialContext:
      'मराठी ललित गद्याची समृद्ध परंपरा पुढे नेणारे वाचनीय पुस्तक.',
    rightsNote: 'प्रताधिकार © रेवती कुलकर्णी.',
    isFeatured: false,
    isNewRelease: false,
    isEditorSelection: false,
    relatedArticleIds: ['article-kavitela-vel-ka-lagto'],
    relatedBookIds: ['book-unhachya-savlya', 'book-shabdanche-antahsthal'],
    readingListIds: ['list-samkalin-marathi-kavita'],
    verificationStatus: 'editorial_specimen',
    provenanceLabel: 'अकथ संपादकीय कॅटलॉग नमुना (प्रकाशक अंतिम ISBN मंजुरीसाठी सज्ज)',
    coverStyle: {
      backgroundHex: '#253935',
      accentHex: '#D1B280',
      textHex: '#F3EEE4',
      borderPattern: 'minimal_archival',
      emblemText: 'ललित गद्य · अकथ प्रकाशन',
    },
  },
  {
    id: 'book-antarbhasha-anuvad-sankalan',
    slug: 'antarbhasha-bharatiya-katha',
    title: 'अंतर्भाषा : निवडक भारतीय कथा',
    subtitle: 'कन्नड, हिंदी आणि बंगाली कथांचा मराठी अनुवाद',
    transliteratedTitle: 'Antarbhasha Selected Indian Stories Translation',
    authorId: 'author-meera-joshi-anuvad',
    contributorIds: [],
    category: 'अनुवादित साहित्य',
    categorySlug: 'translations',
    topics: ['भारतीय साहित्य', 'अनुवाद', 'कथासाहित्य'],
    language: 'मराठी',
    publisher: 'अकथ प्रकाशन, नांदेड',
    isbn: '978-81-974210-5-1 (संपादकीय नोंद)',
    edition: 'पहिली आवृत्ती, २०२६',
    publicationDate: '२०२६-०७-१२',
    pageCount: 220,
    format: 'पेपरबॅक',
    price: 310,
    currency: 'INR',
    stock: 31,
    availability: 'in_stock',
    shippingNote: 'महाराष्ट्रभर ४ ते ६ कामाच्या दिवसांत वितरण.',
    description:
      'शेजारच्या भारतीय भाषांमध्ये काय लिहिले जात आहे, याची ओळख मराठी वाचकाला करून देणारा हा प्रातिनिधिक अनुवाद संग्रह. प्रत्येक कथेसोबत मूळ लेखकाची व भाषिक संदर्भाची संपादकीय टीप जोडलेली आहे.',
    editorialContext:
      'भारतीय भाषांमधील संवादाचा पूल उभारण्याचा अकथ प्रकाशनचा विशेष उपक्रम.',
    rightsNote: 'अनुवाद प्रताधिकार © मीरा जोशी. संबंधित मूळ हक्कधारकांच्या परवानगीने.',
    isFeatured: true,
    isNewRelease: true,
    isEditorSelection: false,
    firstPageExcerptId: 'excerpt-antarbhasha-anuvad',
    relatedArticleIds: ['article-anuvad-mhanje-punarjanma'],
    relatedBookIds: ['book-koradya-nadichi-bakhar', 'book-godavari-kathache-akshar'],
    readingListIds: ['list-navya-abhyasakansathi'],
    verificationStatus: 'editorial_specimen',
    provenanceLabel: 'अकथ संपादकीय कॅटलॉग नमुना (प्रकाशक अंतिम ISBN मंजुरीसाठी सज्ज)',
    coverStyle: {
      backgroundHex: '#33302C',
      accentHex: '#B65E43',
      textHex: '#F3EEE4',
      borderPattern: 'classic_frame',
      emblemText: 'भारतीय अनुवाद मालिका · अकथ प्रकाशन',
    },
  },
  {
    id: 'book-shabdanche-antahsthal',
    slug: 'shabdanche-antahsthal',
    title: 'शब्दांचे अंतःस्थळ',
    subtitle: 'मराठी वाचनसंस्कृती, संपादन आणि ग्रंथनिर्मितीवरील निबंध',
    transliteratedTitle: 'Shabdanche Antahsthal Essays on Reading and Publishing',
    authorId: 'author-dnyaneshwar-parampara',
    contributorIds: ['author-meera-joshi-anuvad'],
    category: 'ललित आणि वैचारिक',
    categorySlug: 'essays-thought',
    topics: ['ग्रंथसंस्कृती', 'संपादन कला', 'वाचन व्यवहार'],
    language: 'मराठी',
    publisher: 'अकथ प्रकाशन, नांदेड',
    isbn: '978-81-974210-6-8 (संपादकीय नोंद)',
    edition: 'पहिली आवृत्ती, २०२६',
    publicationDate: '२०२६-०८-०५',
    pageCount: 176,
    format: 'हार्डबाउंड (कापडी बांधणी)',
    price: 390,
    currency: 'INR',
    stock: 15,
    availability: 'in_stock',
    shippingNote: 'विशेष संरक्षक वेष्टनातून वितरण.',
    description:
      'एक हस्तलिखित पुस्तकाच्या रूपात वाचकाच्या हातात येईपर्यंत नेमका कोणता वैचारिक आणि कलात्मक प्रवास घडतो? संपादक, लेखक, मुद्रक आणि वाचक यांच्यातील अदृश्य नात्याचा वेध घेणारे पुस्तक.',
    editorialContext:
      'नव्या लेखकांसाठी आणि पुस्तकप्रेमींसाठी संग्राह्य संदर्भग्रंथ.',
    rightsNote: 'प्रताधिकार © अकथ प्रकाशन व लेखक.',
    isFeatured: false,
    isNewRelease: true,
    isEditorSelection: false,
    relatedArticleIds: ['article-marathi-bhasha-ani-pradeshik-avaj'],
    relatedBookIds: ['book-godavari-kathache-akshar', 'book-santh-panyache-divas'],
    readingListIds: ['list-navya-abhyasakansathi'],
    verificationStatus: 'editorial_specimen',
    provenanceLabel: 'अकथ संपादकीय कॅटलॉग नमुना (प्रकाशक अंतिम ISBN मंजुरीसाठी सज्ज)',
    coverStyle: {
      backgroundHex: '#1F2620',
      accentHex: '#A67C52',
      textHex: '#F3EEE4',
      borderPattern: 'essay_monograph',
      emblemText: 'ग्रंथसंस्कृती · अकथ प्रकाशन',
    },
  },
];

export const INITIAL_EXCERPTS: FirstPageExcerpt[] = [
  {
    id: 'excerpt-godavari-kathache-akshar',
    slug: 'godavari-kathache-akshar-pahile-pan',
    title: 'भाषेचा प्रवाह आणि नदीचे वळण',
    bookId: 'book-godavari-kathache-akshar',
    authorId: 'author-dnyaneshwar-parampara',
    genreMarathi: 'संशोधन व सांस्कृतिक चिंतन',
    openingHook: 'प्रकरण पहिले : नदीकाठची अक्षरे आणि मौखिक स्मृती',
    excerptParagraphs: [
      'नदी जशी एकाच जागी थांबत नाही, तशी भाषाही कधी एकाच ग्रंथात बंदिस्त राहत नाही. नांदेडच्या घाटावर पहाटेच्या वेळी ऐकू येणाऱ्या ओव्यांमध्ये जे शब्द सहजपणे तरंगत येतात, ते शब्द कोणत्याही शब्दकोशाची परवानगी घेऊन जन्माला आलेले नसतात. ते येतात थेट मातीच्या कष्टांतून, दुष्काळाच्या झळांतून आणि तरीही टिकून राहिलेल्या कृतज्ञतेच्या भावनेतून.',
      'आपण अनेकदा साहित्याचा इतिहास मोजताना केवळ छापील पुस्तकांची मोजदाद करतो. पण छापखाना येण्यापूर्वीही या परिसरातील घराघरांत हस्तलिखितांची बाडे आणि तोंडी पाठ असलेले अभंग जपले गेले होते. एका पिढीने दुसऱ्या पिढीच्या हातात दिलेली ती केवळ शाई नव्हती; तो जगण्याचा एक संयत दृष्टिकोन होता.',
      'म्हणूनच प्रादेशिक भाषेकडे ‘बोली’ म्हणून वरून खाली पाहण्याऐवजी, प्रमाण भाषेला जिवंत ठेवणारा तो मूळ झरा आहे हे आपण स्वीकारायला हवे. जेव्हा एखादा नवा लेखक आपल्या गावातील खऱ्या लयीत लिहू लागतो, तेव्हा मराठी साहित्य खऱ्या अर्थाने विस्तारते.',
    ],
    highlightedLine:
      '“प्रादेशिक भाषेकडे ‘बोली’ म्हणून पाहण्याऐवजी, भाषेला जिवंत ठेवणारा तो मूळ झरा आहे हे आपण स्वीकारायला हवे.”',
    editorialNote:
      'हा उतारा लेखक व प्रकाशकांच्या संपादकीय संमतीने वाचकांच्या पूर्वपरिचयासाठी उपलब्ध केला आहे.',
    rightsStatus: 'अधिकृत संपादकीय परवानगी प्राप्त (Approved Excerpt)',
    approvalStatus: 'approved',
    blindModeDefault: true,
    relatedArticleId: 'article-marathi-bhasha-ani-pradeshik-avaj',
    reactions: {
      readMore: 48,
      struckByLine: 63,
      wantContext: 29,
    },
  },
  {
    id: 'excerpt-unhachya-savlya',
    slug: 'unhachya-savlya-pahile-pan',
    title: 'दुपारची शांतता आणि जुने अंगण',
    bookId: 'book-unhachya-savlya',
    authorId: 'author-revati-kulkarni',
    genreMarathi: 'समकालीन मराठी कविता',
    openingHook: 'कविता क्र. ४ : उन्हाच्या सावल्या',
    excerptParagraphs: [
      'दुपारच्या वेळी जेव्हा रस्तेही स्वतःशीच बोलू लागतात,\nतेव्हा लिंबाच्या झाडाखाली एक जुनी सावली\nआपल्याच पावलांची वाट पाहत बसलेली असते.\n\nआपण शहरांच्या नादात कितीतरी उन्हाळे मागे सोडले,\nपण अजूनही एखाद्या जुन्या वहीच्या पानातून\nवाळलेल्या गवताचा वास अचानक समोर येतो.',
      'कविता तरी दुसरे काय करते?\nती फक्त धावणाऱ्या घड्याळाचा काटा\nक्षणभर आपल्या बोटावर थांबवून विचारते —\n‘तू शेवटचा निवांत श्वास कधी घेतला होतास?’',
    ],
    highlightedLine:
      '“तू शेवटचा निवांत श्वास कधी घेतला होतास?”',
    editorialNote:
      'संग्रहातील शीर्षक कवितेचा हा निवडक अंश वाचकांसाठी.',
    rightsStatus: 'अधिकृत संपादकीय परवानगी प्राप्त (Approved Excerpt)',
    approvalStatus: 'approved',
    blindModeDefault: true,
    relatedArticleId: 'article-parikshan-unhachya-savlya',
    reactions: {
      readMore: 72,
      struckByLine: 91,
      wantContext: 18,
    },
  },
  {
    id: 'excerpt-koradya-nadichi-bakhar',
    slug: 'koradya-nadichi-bakhar-pahile-pan',
    title: 'पाण्याचा ठाव आणि विहिरीचा तळ',
    bookId: 'book-koradya-nadichi-bakhar',
    authorId: 'author-siddharth-waghmare',
    genreMarathi: 'दीर्घकथा',
    openingHook: 'कथा पहिली : तळघाटाची विहीर',
    excerptParagraphs: [
      'वैशाखात नदीचे पात्र पूर्णपणे पांढरेफटक पडले होते. गावाबाहेरच्या जुन्या दगडी विहिरीच्या कठड्यावर बसून आबा खाली पाहत होते. तळाशी उरलेल्या हिरवट पाण्यात आभाळाचा तुकडा थरथरत होता. गेल्या चाळीस वर्षांत आबांनी या विहिरीला कधीच इतके मुके पाहिले नव्हते.',
      '“आबा, आता ट्रॅक्टरने टँकर येईल संध्याकाळी, कशाला उन्हात बसलात?” नातवाने विचारले. आबांनी काहीच उत्तर दिले नाही. टँकरने पाणी येते, पण विहिरीच्या पाण्यासोबत गावाची जी संध्याकाळची सुखदुःखाची बैठक असायची, ती टँकरच्या नळीतून येत नाही, हे त्या पोराला कसे सांगणार?',
      'माणूस फक्त पाण्याने तहानलेला नसतो; त्याला आपल्या माणसांच्या आवाजाचीही तहान असते.',
    ],
    highlightedLine:
      '“माणूस फक्त पाण्याने तहानलेला नसतो; त्याला आपल्या माणसांच्या आवाजाचीही तहान असते.”',
    editorialNote:
      'सिद्धार्थ वाघमारे यांच्या ‘तळघाटाची विहीर’ या दीर्घकथेतील प्रारंभिक परिच्छेद.',
    rightsStatus: 'अधिकृत संपादकीय परवानगी प्राप्त (Approved Excerpt)',
    approvalStatus: 'approved',
    blindModeDefault: true,
    relatedArticleId: 'article-katha-lihitana-bhovtal',
    reactions: {
      readMore: 54,
      struckByLine: 67,
      wantContext: 24,
    },
  },
  {
    id: 'excerpt-antarbhasha-anuvad',
    slug: 'antarbhasha-pahile-pan',
    title: 'सीमेपलीकडची गोष्ट, आपल्याच भाषेत',
    bookId: 'book-antarbhasha-anuvad-sankalan',
    authorId: 'author-meera-joshi-anuvad',
    genreMarathi: 'अनुवादित भारतीय साहित्य',
    openingHook: 'संपादकीय प्रस्तावनेतून : अनुवादाची गरज का?',
    excerptParagraphs: [
      'आपण जेव्हा कन्नड किंवा बंगालीतील एखादी कथा मराठीत वाचतो, तेव्हा सुरुवातीला तिथली नावे, गावांचे संदर्भ आणि खाद्यसंस्कृती आपल्याला अनोळखी वाटते. पण दोन-तीन पानांनंतर लक्षात येते की, घराच्या उंबऱ्यावर उभी राहून मुलाची वाट पाहणाऱ्या आईची काळजी धारवाडमध्येही तशीच आहे आणि नांदेडमध्येही तशीच आहे.',
      'चांगला अनुवाद मूळ कृतीवर स्वतःचा रंग चढवत नाही; तो स्वच्छ काचेच्या खिडकीसारखा असतो — ज्यातून आपल्याला दुसऱ्या भाषेचे आकाश स्पष्टपणे दिसू शकते.',
    ],
    highlightedLine:
      '“चांगला अनुवाद स्वच्छ काचेच्या खिडकीसारखा असतो — ज्यातून दुसऱ्या भाषेचे आकाश स्पष्ट दिसते.”',
    editorialNote:
      '‘अंतर्भाषा’ संग्रहाच्या प्रस्तावनेतील निवडक विचार.',
    rightsStatus: 'अधिकृत संपादकीय परवानगी प्राप्त (Approved Excerpt)',
    approvalStatus: 'approved',
    blindModeDefault: false,
    relatedArticleId: 'article-anuvad-mhanje-punarjanma',
    reactions: {
      readMore: 39,
      struckByLine: 44,
      wantContext: 31,
    },
  },
];

export const INITIAL_ARTICLES: EditorialArticle[] = [
  {
    id: 'article-marathi-bhasha-ani-pradeshik-avaj',
    slug: 'marathi-bhasha-ani-pradeshik-avaj',
    title: 'मराठी साहित्याचा परीघ आणि प्रादेशिक आवाजांचे आत्मभान',
    subtitle: 'प्रकाशन व्यवहार केवळ महानगरांपुरता मर्यादित न राहता जिल्ह्या-जिल्ह्यांतून का रुजायला हवा?',
    transliteratedTitle: 'Marathi Sahityacha Parigh ani Pradeshik Avaj',
    authorId: 'author-dnyaneshwar-parampara',
    contributorName: 'डॉ. विश्वनाथ देशमुख',
    contributorRole: 'संतसाहित्य अभ्यासक व समीक्षक',
    categorySlug: 'articles',
    categoryMarathi: 'लेख आणि विचार',
    tags: ['मराठी भाषा', 'स्वतंत्र प्रकाशन', 'मराठवाडा', 'वाचनसंस्कृती'],
    publishedAt: '२०२६-०९-१८',
    updatedAt: '२०२६-१०-०२',
    readingTimeMinutes: 7,
    summary:
      'मराठी साहित्याची खरी ताकद तिच्या प्रादेशिक वैविध्यात आहे. स्वतंत्र प्रकाशन संस्थांनी स्थानिक लेखकांना संपादकीय बळ दिले, तरच मराठीत नवे आणि अस्सल लेखन समोर येऊ शकते.',
    leadParagraph:
      'गेल्या काही दशकांत मराठी प्रकाशन व्यवसाय काही मोजक्या शहरांभोवती केंद्रित झाला. परिणामी, मुख्य प्रवाहाबाहेर राहून शांतपणे लिहिणाऱ्या अनेक कसदार लेखकांची हस्तलिखिते योग्य संपादकीय संस्कारांअभावी दुर्लक्षित राहिली किंवा केवळ ‘छपाई’पुरती मर्यादित झाली.',
    sections: [
      {
        id: 'sec-1',
        heading: '१. केवळ छपाई म्हणजे प्रकाशन नव्हे',
        paragraphs: [
          'पुस्तक छापणे आणि पुस्तक ‘प्रकाशित’ करणे यात मूलभूत फरक आहे. प्रकाशन ही एक जबाबदार सांस्कृतिक कृती आहे. लेखकाने आपल्या अनुभवातून उभी केलेली संहिता संपादकाच्या चिकित्सक नजरेतून जाते, तेव्हाच तिचे रूपांतर एका सुघड पुस्तकात होते.',
          'अकथ प्रकाशनची भूमिका हीच आहे की, नांदेडसारख्या सांस्कृतिकदृष्ट्या समृद्ध शहरातून संपूर्ण महाराष्ट्राशी संवाद साधणारे स्वतंत्र संपादकीय केंद्र उभे राहावे.',
        ],
        pullQuote:
          '“पुस्तक छापणे आणि पुस्तक प्रकाशित करणे यात मूलभूत फरक आहे; प्रकाशन ही लेखक आणि वाचक यांच्यातील दीर्घकालीन संवादाची सुरुवात असते.”',
      },
      {
        id: 'sec-2',
        heading: '२. कासवाची गती आणि साहित्याचे आयुष्य',
        paragraphs: [
          'आजच्या वेगवान सोशल मीडियाच्या काळात प्रत्येक गोष्ट तात्काळ व्हायरल होण्याची अपेक्षा असते. परंतु चांगले साहित्य कधीही घाईत जन्माला येत नाही. संपादन, पुनर्लेखन, मुद्रितशोधन आणि वाचन या सगळ्यांना स्वतःचा एक संथ वेळ लागतो.',
          'अकथच्या बोधचिन्हातील कासव आणि पुस्तक हे याच संयमाचे प्रतीक आहे. घाईने काढलेली दहा पुस्तके विस्मृतीत जातात, पण साक्षेपाने घडवलेले एक पुस्तक पिढ्यानपिढ्या वाचले जाते.',
        ],
      },
      {
        id: 'sec-3',
        heading: '३. वाचकाशी प्रामाणिक नाते',
        paragraphs: [
          'वाचकाला केवळ सवलतीच्या जाहिराती नको असतात; हे पुस्तक आपण का वाचावे, याचे प्रामाणिक कारण त्याला हवे असते. वाचनकट्टा आणि ‘पहिलं पान’ यांसारख्या उपक्रमांमधून आम्ही वाचकांना थेट मजकुराशी जोडण्याचा प्रयत्न करत आहोत.',
        ],
      },
    ],
    workflowStatus: 'published',
    relatedBookIds: ['book-godavari-kathache-akshar', 'book-shabdanche-antahsthal'],
    relatedAuthorIds: ['author-dnyaneshwar-parampara'],
    relatedArticleIds: ['article-samvad-vishwanath-deshmukh', 'article-kavitela-vel-ka-lagto'],
    verificationStatus: 'editorial_specimen',
    provenanceLabel: 'वाचनकट्टा संपादकीय निबंध',
  },
  {
    id: 'article-parikshan-unhachya-savlya',
    slug: 'parikshan-unhachya-savlya-kavita',
    title: 'कोलाहलात शांतपणे बोलणारी कविता : ‘उन्हाच्या सावल्या’च्या निमित्ताने',
    subtitle: 'रेवती कुलकर्णी यांच्या कवितासंग्रहाचे सविस्तर परीक्षण',
    transliteratedTitle: 'Book Review Unhachya Savlya Revati Kulkarni',
    authorId: 'author-meera-joshi-anuvad',
    contributorName: 'मीरा जोशी',
    contributorRole: 'समीक्षक व अनुवादक',
    categorySlug: 'reviews',
    categoryMarathi: 'पुस्तक परीक्षण',
    tags: ['कविता परीक्षण', 'उन्हाच्या सावल्या', 'समकालीन काव्य'],
    publishedAt: '२०२६-१०-०५',
    readingTimeMinutes: 6,
    summary:
      'रेवती कुलकर्णी यांच्या ‘उन्हाच्या सावल्या’ या संग्रहातील कविता घोषणाबाजी करत नाहीत, तर वाचकाच्या मनात हळूहळू पाझरत राहतात. संग्रहाच्या भाषिक व आशयसूत्रांचे विश्लेषण.',
    leadParagraph:
      'मराठीत दरवर्षी शेकडो कवितासंग्रह प्रकाशित होतात, पण वाचनानंतरही बराच काळ मनात रेंगाळणारे संग्रह मोजकेच असतात. रेवती कुलकर्णी यांचा ‘उन्हाच्या सावल्या’ हा असाच एक संयत आणि आत्ममग्न तरीही भोवतालाचे भान असलेला संग्रह आहे.',
    sections: [
      {
        id: 'sec-rev-1',
        heading: 'प्रतिमासृष्टीचे वेगळेपण',
        paragraphs: [
          'या संग्रहातील कवितांमध्ये ऊन, सावली, जुना उंबरा, पाण्याचा तळ आणि निमशहरी घरांमधील शांतता या प्रतिमा वारंवार येतात. पण त्या केवळ निसर्गवर्णनासाठी येत नाहीत; त्या माणसाच्या आतल्या एकटेपणाचे मोजमाप घेतात.',
          'कवयित्रीने शब्दांची केलेली काटकसर वाखाणण्याजोगी आहे. अनावश्यक विशेषणे गाळून थेट अनुभवाच्या गाभ्याला हात घालण्याची ताकद या कवितांमध्ये दिसते.',
        ],
        pullQuote:
          '“अनावश्यक विशेषणे गाळून थेट अनुभवाच्या गाभ्याला हात घालण्याची ताकद या कवितांमध्ये आहे.”',
      },
      {
        id: 'sec-rev-2',
        heading: 'संपादन आणि निर्मितीमूल्य',
        paragraphs: [
          'कवितेच्या पुस्तकासाठी पानावर किती मोकळी जागा (Whitespace) असावी, याचे भान अकथ प्रकाशनने उत्तम राखले आहे. त्यामुळे प्रत्येक कवितेला स्वतःचा श्वास घेता येतो.',
        ],
      },
    ],
    workflowStatus: 'published',
    relatedBookIds: ['book-unhachya-savlya', 'book-santh-panyache-divas'],
    relatedAuthorIds: ['author-revati-kulkarni', 'author-meera-joshi-anuvad'],
    relatedArticleIds: ['article-kavitela-vel-ka-lagto'],
    verificationStatus: 'editorial_specimen',
    provenanceLabel: 'वाचनकट्टा पुस्तक परीक्षण',
  },
  {
    id: 'article-samvad-vishwanath-deshmukh',
    slug: 'samvad-vishwanath-deshmukh-sanshodhan',
    title: '“जुन्या पोथ्यांच्या धुळीत आजच्या भाषेची उत्तरे सापडतात”',
    subtitle: 'डॉ. विश्वनाथ देशमुख यांच्याशी संशोधन पद्धती आणि वाङ्मयीन इतिहासावर दीर्घ संवाद',
    transliteratedTitle: 'Interview with Dr Vishwanath Deshmukh on Marathi Literary History',
    authorId: 'author-dnyaneshwar-parampara',
    contributorName: 'संपादकीय विभाग, अकथ प्रकाशन',
    contributorRole: 'वाचनकट्टा संवाद',
    categorySlug: 'interviews',
    categoryMarathi: 'लेखकांशी संवाद',
    tags: ['मुलाखत', 'संशोधन', 'गोदावरी काठाचे अक्षर', 'नांदेड'],
    publishedAt: '२०२६-१०-१२',
    readingTimeMinutes: 8,
    summary:
      '‘गोदावरी काठाचे अक्षर’ या ग्रंथाच्या निमित्ताने डॉ. विश्वनाथ देशमुख यांच्याशी झालेली ही बातचीत. जुनी हस्तलिखिते, क्षेत्रीय अभ्यास आणि नव्या अभ्यासकांसमोरील आव्हाने यांवर सविस्तर चर्चा.',
    leadParagraph:
      'नांदेड आणि परिसरातील वाङ्मयीन परंपरेचा शोध घेताना डॉ. विश्वनाथ देशमुख यांनी अनेक गावांतील जुनी ग्रंथालये आणि व्यक्तिगत संग्रह पालथे घातले. त्यांच्या या प्रवासाविषयी वाचनकट्ट्यासाठी घेतलेली ही विशेष मुलाखत.',
    sections: [
      {
        id: 'sec-int-1',
        heading: 'प्रश्न : या संशोधनाची सुरुवात नेमकी कशी झाली?',
        paragraphs: [
          'डॉ. देशमुख : महाविद्यालयात शिकवताना माझ्या लक्षात आले की, आपण विद्यार्थ्यांना जो साहित्याचा इतिहास शिकवतो, त्यात त्यांच्याच गावातील, त्यांच्याच नदीकाठच्या अनेक महत्त्वाच्या कवींचा आणि ग्रंथांचा उल्लेखही नसतो. तिथूनच प्रत्यक्ष गावोगावी जाऊन साधने शोधण्याची निकड निर्माण झाली.',
        ],
      },
      {
        id: 'sec-int-2',
        heading: 'प्रश्न : नव्या संशोधकांना तुम्ही काय सांगाल?',
        paragraphs: [
          'डॉ. देशमुख : केवळ दुय्यम संदर्भग्रंथांवर अवलंबून राहू नका. मूळ संहिता वाचा, लोकांची भाषा ऐका आणि घाईघाईने निष्कर्ष काढण्याऐवजी पुराव्यांची शांतपणे चिकित्सा करा.',
        ],
        pullQuote:
          '“केवळ दुय्यम संदर्भग्रंथांवर अवलंबून राहू नका; मूळ संहिता वाचा आणि लोकांची जिवंत भाषा ऐका.”',
      },
    ],
    workflowStatus: 'published',
    relatedBookIds: ['book-godavari-kathache-akshar', 'book-shabdanche-antahsthal'],
    relatedAuthorIds: ['author-dnyaneshwar-parampara'],
    relatedArticleIds: ['article-marathi-bhasha-ani-pradeshik-avaj'],
    verificationStatus: 'editorial_specimen',
    provenanceLabel: 'वाचनकट्टा लेखक संवाद',
  },
  {
    id: 'article-katha-lihitana-bhovtal',
    slug: 'katha-lihitana-bhovtal-siddharth-waghmare',
    title: 'कथा लिहिताना भोवतालचा आवाज कसा ऐकावा?',
    subtitle: 'ग्रामीण आणि निमशहरी वास्तवाचे चित्रण करताना येणाऱ्या लेखकीय अडचणींवर चिंतन',
    transliteratedTitle: 'Katha Lihitana Bhovtal Siddharth Waghmare Essay',
    authorId: 'author-siddharth-waghmare',
    contributorName: 'सिद्धार्थ वाघमारे',
    contributorRole: 'कथाकार',
    categorySlug: 'articles',
    categoryMarathi: 'लेख आणि विचार',
    tags: ['कथालेखन', 'ग्रामीण साहित्य', 'लेखकीय अनुभव'],
    publishedAt: '२०२६-०९-२८',
    readingTimeMinutes: 5,
    summary:
      'ग्रामीण कथा म्हणजे केवळ दुःखाचे किंवा भूतकाळाचे रंजन नव्हे; तर आजच्या गुंतागुंतीच्या वर्तमानाचा शोध आहे. ‘कोरड्या नदीची बखर’च्या लेखकाचे मनोगत.',
    leadParagraph:
      'आजचे खेडे हे तीस वर्षांपूर्वीच्या कथेतील खेडे राहिलेले नाही. तिथे स्मार्टफोन पोहोचला आहे, पण पाण्याचा प्रश्न तसाच आहे. हा विरोधाभास पकडायचा असेल, तर जुन्या साच्यातून बाहेर पडावे लागते.',
    sections: [
      {
        id: 'sec-kat-1',
        heading: 'पात्रांची भाषा आणि लेखकाची भाषा',
        paragraphs: [
          'अनेकदा लेखक स्वतःचीच अलंकारिक भाषा पात्रांच्या तोंडी घालतो आणि तिथेच कथेचा खरेपणा हरवतो. माणसे प्रत्यक्ष आयुष्यात जशी अर्धवट वाक्यांत, खाणाखुणांत आणि शांततेतून बोलतात, ती लय कथेत यायला हवी.',
        ],
      },
    ],
    workflowStatus: 'published',
    relatedBookIds: ['book-koradya-nadichi-bakhar'],
    relatedAuthorIds: ['author-siddharth-waghmare'],
    relatedArticleIds: ['article-marathi-bhasha-ani-pradeshik-avaj'],
    verificationStatus: 'editorial_specimen',
    provenanceLabel: 'वाचनकट्टा लेख',
  },
  {
    id: 'article-anuvad-mhanje-punarjanma',
    slug: 'anuvad-mhanje-bhashantaratun-punarjanma',
    title: 'अनुवाद म्हणजे शब्दांचे स्थलांतर नव्हे, तर संवेदनेचा पुनर्जन्म',
    subtitle: 'भारतीय भाषांमधील कथा मराठीत आणताना आलेले संपादकीय अनुभव',
    transliteratedTitle: 'Anuvad Mhanje Sanvedanecha Punarjanma Meera Joshi',
    authorId: 'author-meera-joshi-anuvad',
    contributorName: 'मीरा जोशी',
    contributorRole: 'अनुवादक',
    categorySlug: 'literary-world',
    categoryMarathi: 'साहित्यविश्व',
    tags: ['अनुवाद', 'भारतीय साहित्य', 'अंतर्भाषा'],
    publishedAt: '२०२६-१०-१८',
    readingTimeMinutes: 6,
    summary:
      'कन्नड किंवा बंगाली वाक्याची रचना मराठीत आणताना मूळ सांस्कृतिक संदर्भ कसे जपावेत, याचा वेध घेणारा लेख.',
    leadParagraph:
      'भारतीय भाषांचे कुटुंब एकमेकांशी खोलवर जोडलेले आहे. तरीही प्रत्येक भाषेची स्वतःची एक सांस्कृतिक आठवण असते. अनुवादकाचे काम त्या आठवणीला धक्का न लावता तिला मराठी वाचकाच्या मनात जागा करून देणे हे असते.',
    sections: [
      {
        id: 'sec-anu-1',
        heading: 'अनुवादातील संपादकीय शिस्त',
        paragraphs: [
          'मूळ लेखकाशी आणि मूळ संहितेशी प्रामाणिक राहून केलेला अनुवाद भाषेची शब्दसंपत्ती वाढवतो. अकथ प्रकाशनमध्ये आम्ही प्रत्येक अनुवादित संहितेची मूळ भाषेतील जाणकाराकडून पडताळणी करून घेतो.',
        ],
      },
    ],
    workflowStatus: 'published',
    relatedBookIds: ['book-antarbhasha-anuvad-sankalan'],
    relatedAuthorIds: ['author-meera-joshi-anuvad'],
    relatedArticleIds: ['article-parikshan-unhachya-savlya'],
    verificationStatus: 'editorial_specimen',
    provenanceLabel: 'वाचनकट्टा साहित्यविश्व लेख',
  },
  {
    id: 'article-kavitela-vel-ka-lagto',
    slug: 'kavitela-vel-ka-lagto',
    title: 'कवितेला वाचकापर्यंत पोहोचायला वेळ का लागतो?',
    subtitle: 'कवितेचे वाचन आणि संपादन यांविषयी काही निरीक्षणे',
    transliteratedTitle: 'Kavitela Vachakaparyant Pohochayla Vel Ka Lagto',
    authorId: 'author-revati-kulkarni',
    contributorName: 'रेवती कुलकर्णी',
    contributorRole: 'कवयित्री',
    categorySlug: 'articles',
    categoryMarathi: 'लेख आणि विचार',
    tags: ['कविता', 'वाचन पद्धती', 'ललित चिंतन'],
    publishedAt: '२०२६-०९-१०',
    readingTimeMinutes: 5,
    summary:
      'कविता ही एका बैठकीत संपवण्याची गोष्ट नाही; ती वारंवार उघडून वाचण्याची आणि स्वतःच्या अनुभवाशी ताडून पाहण्याची कलाकृती आहे.',
    leadParagraph:
      'कादंबरी आपल्याला कथानकाच्या प्रवाहात पुढे नेते, पण कविता आपल्याला एकाच ओळीवर थांबायला सांगते. आजच्या काळात थांबण्याची ही सवय कमी होत चालल्याने कवितेचे वाचन कठीण वाटू लागते.',
    sections: [
      {
        id: 'sec-kav-1',
        heading: 'कवितेचे संपादन करता येते का?',
        paragraphs: [
          'कविता ही स्फूर्तीतून येते हा अर्धसत्य भाग झाला; पण तिला अचूक रूप देण्यासाठी कठोर आत्मपरीक्षण आणि संपादकीय संवादाची गरज असते.',
        ],
      },
    ],
    workflowStatus: 'published',
    relatedBookIds: ['book-unhachya-savlya', 'book-santh-panyache-divas'],
    relatedAuthorIds: ['author-revati-kulkarni'],
    relatedArticleIds: ['article-parikshan-unhachya-savlya'],
    verificationStatus: 'editorial_specimen',
    provenanceLabel: 'वाचनकट्टा लेख',
  },
  {
    id: 'article-reading-list-marathwada-sahitya',
    slug: 'kay-vachave-marathwada-ani-samkalin-bhan',
    title: 'काय वाचावं? : प्रादेशिक जाणिवा आणि समकालीन मराठी साहित्याची निवडक यादी',
    subtitle: 'अकथ संपादक मंडळाने सुचवलेली चार महत्त्वाची पुस्तके',
    transliteratedTitle: 'Kay Vachave Curated Reading List Marathi Literature',
    authorId: 'author-siddharth-waghmare',
    contributorName: 'अकथ संपादक मंडळ',
    contributorRole: 'वाचन यादी संकलन',
    categorySlug: 'reading-lists',
    categoryMarathi: 'काय वाचावं?',
    tags: ['वाचन यादी', 'निवडक पुस्तके', 'मार्गदर्शक'],
    publishedAt: '२०२६-१०-२०',
    readingTimeMinutes: 4,
    summary:
      'समकालीन मराठी गद्य, संशोधन आणि अनुवाद समजून घेण्यासाठी कुठून सुरुवात करावी? वाचकांसाठी संपादकीय टिपांसह तयार केलेली मार्गदर्शक यादी.',
    leadParagraph:
      'नव्याने गंभीर मराठी वाचनाकडे वळणाऱ्या वाचकांना आणि वाचनगटांना उपयोगी पडावी यासाठी आम्ही आमच्या सूचीतील परस्परपूरक पुस्तकांची ही क्रमवार यादी तयार केली आहे.',
    sections: [
      {
        id: 'sec-rl-1',
        heading: 'वाचनाचा क्रम कसा ठेवावा?',
        paragraphs: [
          'प्रथम ललित निबंध किंवा कथांमधून भाषेच्या प्रवाहाशी जोडून घ्यावे, त्यानंतर समीक्षा व भाषाशास्त्रीय संशोधनाकडे वळल्यास संदर्भ अधिक स्पष्ट होतात.',
        ],
      },
    ],
    workflowStatus: 'published',
    relatedBookIds: [
      'book-godavari-kathache-akshar',
      'book-koradya-nadichi-bakhar',
      'book-unhachya-savlya',
      'book-antarbhasha-anuvad-sankalan',
    ],
    relatedAuthorIds: [
      'author-dnyaneshwar-parampara',
      'author-siddharth-waghmare',
      'author-revati-kulkarni',
    ],
    relatedArticleIds: ['article-marathi-bhasha-ani-pradeshik-avaj'],
    verificationStatus: 'editorial_specimen',
    provenanceLabel: 'वाचनकट्टा संपादकीय वाचन यादी',
  },
];

export const INITIAL_READING_LISTS: ReadingList[] = [
  {
    id: 'list-marathwada-sahitya-pravah',
    slug: 'marathwada-bhasha-ani-kathavishwa',
    title: 'माती, भाषा आणि कथाविश्व : मराठवाड्यातील वाङ्मयीन जाणिवा',
    subtitle: 'स्थानिक इतिहास, लोकभाषा आणि समकालीन ग्रामीण-निमशहरी कथांचा एकत्रित वेध',
    curatorName: 'डॉ. विश्वनाथ देशमुख आणि सिद्धार्थ वाघमारे',
    curatorRole: 'संपादकीय संकलन',
    themeTag: 'प्रादेशिक भान व कथा',
    introduction:
      'एखाद्या प्रदेशाची भाषा आणि तिथल्या माणसांच्या कथा एकमेकांपासून वेगळ्या काढता येत नाहीत. ही यादी संशोधनात्मक दृष्टी आणि ललित कथाविश्व यांना एकत्र आणते.',
    items: [
      {
        bookId: 'book-godavari-kathache-akshar',
        curatorComment:
          'भाषेची ऐतिहासिक पाळेमुळे आणि गोदावरी खोऱ्यातील वाङ्मयीन परंपरा समजून घेण्यासाठी पायाभूत ग्रंथ.',
      },
      {
        bookId: 'book-koradya-nadichi-bakhar',
        curatorComment:
          'त्याच भूमीतील आजच्या पिढीचे जगणे आणि बदलत्या गावगाड्याचे वास्तव मांडणाऱ्या दीर्घकथा.',
      },
      {
        bookId: 'book-shabdanche-antahsthal',
        curatorComment:
          'साहित्यनिर्मिती आणि संपादनाच्या प्रक्रियेकडे पाहण्याची चिकित्सक दृष्टी देणारे निबंध.',
      },
    ],
    relatedArticleIds: [
      'article-marathi-bhasha-ani-pradeshik-avaj',
      'article-katha-lihitana-bhovtal',
    ],
  },
  {
    id: 'list-samkalin-marathi-kavita',
    slug: 'santh-vachanasathi-kavita-ani-lalit',
    title: 'संथ वाचनासाठी : कविता, ललित गद्य आणि भारतीय अनुवाद',
    subtitle: 'गोंगाटापासून दूर नेणारे चिंतनशील साहित्य',
    curatorName: 'रेवती कुलकर्णी आणि मीरा जोशी',
    curatorRole: 'काव्य व अनुवाद विभाग',
    themeTag: 'कविता व ललित चिंतन',
    introduction:
      'रात्रीच्या शांत वेळेत किंवा प्रवासात टप्प्याटप्प्याने वाचता येतील आणि मनात दीर्घकाळ रेंगाळतील अशा तीन पुस्तकांची निवड.',
    items: [
      {
        bookId: 'book-unhachya-savlya',
        curatorComment:
          'कमीत कमी शब्दांत गहिरा आशय मांडणाऱ्या समकालीन मराठी कविता.',
      },
      {
        bookId: 'book-santh-panyache-divas',
        curatorComment:
          'वाचन, आठवणी आणि मानवी नात्यांवरील संवेदनशील ललित निबंध.',
      },
      {
        bookId: 'book-antarbhasha-anuvad-sankalan',
        curatorComment:
          'कन्नड, हिंदी व बंगाली साहित्यातील निवडक कथांचा अस्सल मराठी अनुवाद.',
      },
    ],
    relatedArticleIds: [
      'article-parikshan-unhachya-savlya',
      'article-anuvad-mhanje-punarjanma',
    ],
  },
];
