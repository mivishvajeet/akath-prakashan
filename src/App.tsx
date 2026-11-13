import React, { useEffect, useMemo, useState } from 'react';
import { INITIAL_ARTICLES, INITIAL_AUTHORS, INITIAL_BOOKS } from './data/seedData';
import type { BookRecord, EditorialArticle } from './types/publishing';

type Language = 'mr' | 'en';
type Route = { page: 'home' | 'books' | 'book' | 'authors' | 'author' | 'journal' | 'article' | 'about' | 'contact' | 'not-found'; slug?: string };

const copy = {
  mr: {
    home: 'मुख्यपृष्ठ', books: 'ग्रंथदालन', journal: 'वाचनकट्टा', authors: 'लेखक', about: 'आमच्याविषयी', contact: 'संपर्क',
    eyebrow: 'स्वतंत्र मराठी साहित्य प्रकाशन', hero: 'मराठी साहित्य. नवे आवाज. दीर्घ संवाद.',
    intro: 'काही पुस्तकं संपतात. काही वाचकांसोबत राहतात. आशयघन लेखन, नव्या जाणिवा आणि दीर्घकाळ टिकणाऱ्या साहित्याचा एक निवांत पत्ता.',
    explore: 'पुस्तके पाहा', read: 'वाचनकट्टा वाचा', featured: 'निवडक ग्रंथ', featuredSub: 'अकथच्या संपादकीय निवडीतून काही पुस्तकं.',
    allBooks: 'सर्व पुस्तके पाहा', latest: 'वाचनकट्टा', latestSub: 'लेख, समीक्षा आणि लेखकांशी संवाद.',
    authorsTitle: 'लेखक आणि त्यांचे विश्व', aboutTitle: 'अकथ प्रकाशन', aboutText: 'वेगळ्या जाणिवांचे लेखन शोधणारी, त्याला संपादकीय साक्षेपाने घडवणारी आणि पुस्तक, लेखक व वाचक यांच्यात दीर्घकालीन नाते निर्माण करणारी स्वतंत्र मराठी साहित्य प्रकाशन संस्था.',
    catalogue: 'ग्रंथदालन', catalogueSub: 'कादंबरी, कविता, कथा, समीक्षा आणि वैचारिक लेखन.',
    search: 'पुस्तक किंवा लेखक शोधा…', all: 'सर्व पुस्तके', noBooks: 'या शोधाशी जुळणारी पुस्तके सापडली नाहीत.',
    author: 'लेखक', details: 'पुस्तकाविषयी', enquire: 'या पुस्तकाबद्दल चौकशी करा', isbn: 'ISBN', pages: 'पृष्ठे', format: 'स्वरूप',
    journalTitle: 'वाचनकट्टा', journalSub: 'समकालीन मराठी साहित्याचे वाचन, चिंतन आणि संवाद.',
    readArticle: 'लेख वाचा', aboutHeading: 'शब्दांना वेळ देणारे प्रकाशन', contactHeading: 'अकथशी संवाद साधा',
    contactText: 'पुस्तके, ग्रंथालयीन मागणी, वितरण किंवा संपादकीय संवादासाठी ईमेल किंवा WhatsApp द्वारे संपर्क साधा.',
    email: 'ईमेल लिहा', whatsapp: 'WhatsApp वर संपर्क', back: 'मागे जा', allRights: 'सर्व हक्क राखीव.',
    noContent: 'हे पान सध्या उपलब्ध नाही.', language: 'English'
  },
  en: {
    home: 'Home', books: 'Books', journal: 'Vachankatta', authors: 'Authors', about: 'About', contact: 'Contact',
    eyebrow: 'Independent Marathi Literary Publisher', hero: 'Words That Stay. Stories That Travel.',
    intro: 'Some books end. Others stay with their readers. A considered home for distinctive writing, new sensibilities and literature that lasts.',
    explore: 'Explore books', read: 'Read Vachankatta', featured: 'Selected titles', featuredSub: 'A few books from the Akath editorial catalogue.',
    allBooks: 'View all books', latest: 'Vachankatta', latestSub: 'Essays, reviews and conversations with writers.',
    authorsTitle: 'Writers and their worlds', aboutTitle: 'Akath Prakashan', aboutText: 'An independent Marathi literary publisher that discovers distinctive writing, gives it the editorial attention it deserves, and builds lasting relationships between books, writers, and readers.',
    catalogue: 'The catalogue', catalogueSub: 'Fiction, poetry, short stories, criticism and ideas.',
    search: 'Search books or authors…', all: 'All books', noBooks: 'No books matched your search.',
    author: 'Author', details: 'About this book', enquire: 'Enquire about this book', isbn: 'ISBN', pages: 'Pages', format: 'Format',
    journalTitle: 'Vachankatta', journalSub: 'Reading, reflection and conversation around contemporary Marathi literature.',
    readArticle: 'Read article', aboutHeading: 'A publishing house that gives words time', contactHeading: 'Start a conversation',
    contactText: 'For books, library enquiries, distribution or editorial correspondence, reach us by email or WhatsApp.',
    email: 'Write an email', whatsapp: 'Message on WhatsApp', back: 'Go back', allRights: 'All rights reserved.',
    noContent: 'This page is not available at the moment.', language: 'मराठी'
  }
};

function initialPath(): string {
  const search = window.location.search;
  if (search.startsWith('?/')) {
    const decoded = search.slice(2).split('&').map(part => part.replace(/~and~/g, '&')).join('?');
    const clean = decoded.startsWith('/') ? decoded.slice(1) : decoded;
    return `/${clean}`;
  }
  return window.location.pathname;
}

function readRoute(pathname: string): Route {
  const parts = pathname.split('/').filter(Boolean);
  if (!parts.length) return { page: 'home' };
  if (parts[0] === 'books' && parts[1]) return { page: 'book', slug: parts[1] };
  if (parts[0] === 'books') return { page: 'books' };
  if (parts[0] === 'authors' && parts[1]) return { page: 'author', slug: parts[1] };
  if (parts[0] === 'authors') return { page: 'authors' };
  if (parts[0] === 'vachankatta' && parts[1]) return { page: 'article', slug: parts[1] };
  if (parts[0] === 'vachankatta') return { page: 'journal' };
  if (parts[0] === 'about') return { page: 'about' };
  if (parts[0] === 'contact') return { page: 'contact' };
  return { page: 'not-found' };
}

const publicBooks = (INITIAL_BOOKS as BookRecord[]).filter(book => book.publicationStatus !== 'draft');
const publicAuthors = INITIAL_AUTHORS.filter(author => author.publicProfileStatus === 'published');
const publicArticles = (INITIAL_ARTICLES as EditorialArticle[]).filter(article => article.workflowStatus === 'published');

function BookTile({ book, lang }: { book: BookRecord; lang: Language }) {
  const author = publicAuthors.find(item => item.id === book.authorId);
  return <article className="group rounded-2xl border border-[#E6E1D6] bg-white p-4 transition hover:-translate-y-1 hover:shadow-xl">
    <a href={`/books/${book.slug}`} className="block">
      <div className="mb-4 flex aspect-[4/5] items-center justify-center overflow-hidden rounded-xl bg-[#F7F3E8] p-5">
        {book.coverImageUrl ? <img src={book.coverImageUrl} alt={book.title} loading="lazy" className="h-full w-auto max-w-full object-contain shadow-lg transition group-hover:scale-[1.02]" /> : <div className="text-center font-serif text-2xl text-[#243B8A]">{book.title}</div>}
      </div>
      <p className="text-xs font-semibold uppercase tracking-wide text-[#9A6B2F]">{book.category}</p>
      <h3 className="mt-2 font-serif text-xl font-semibold leading-snug text-[#252832]">{book.title}</h3>
      <p className="mt-1 text-sm text-[#68665F]">{author?.name ?? ''}</p>
    </a>
    <div className="mt-4 flex items-center justify-between border-t border-[#EEE9DF] pt-3">
      <span className="font-semibold text-[#252832]">{book.price > 0 ? `₹${book.price}` : (lang === 'mr' ? 'माहितीसाठी संपर्क' : 'Contact for details')}</span>
      <a className="text-sm font-semibold text-[#243B8A] hover:underline" href={`/books/${book.slug}`}>{lang === 'mr' ? 'तपशील' : 'Details'} ↗</a>
    </div>
  </article>;
}

export default function App() {
  const [lang, setLang] = useState<Language>(() => localStorage.getItem('akath_public_lang') === 'en' ? 'en' : 'mr');
  const [route, setRoute] = useState<Route>(() => readRoute(initialPath()));
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const t = copy[lang];

  useEffect(() => {
    const onPop = () => setRoute(readRoute(window.location.pathname));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => { document.documentElement.lang = lang; localStorage.setItem('akath_public_lang', lang); }, [lang]);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setRoute(readRoute(path));
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredBooks = useMemo(() => publicBooks.filter(book => {
    const term = query.trim().toLocaleLowerCase();
    if (!term) return true;
    const author = publicAuthors.find(item => item.id === book.authorId);
    return [book.title, book.transliteratedTitle, book.category, ...(book.topics || []), author?.name || '', author?.transliteratedName || ''].join(' ').toLocaleLowerCase().includes(term);
  }), [query]);

  const book = route.page === 'book' ? publicBooks.find(item => item.slug === route.slug) : undefined;
  const author = route.page === 'author' ? publicAuthors.find(item => item.slug === route.slug) : undefined;
  const article = route.page === 'article' ? publicArticles.find(item => item.slug === route.slug) : undefined;

  const navLinks = [{ label: t.home, path: '/' }, { label: t.books, path: '/books' }, { label: t.journal, path: '/vachankatta' }, { label: t.authors, path: '/authors' }, { label: t.about, path: '/about' }, { label: t.contact, path: '/contact' }];

  return <div className="min-h-screen bg-[#FFFDF7] text-[#252832]">
    <header className="sticky top-0 z-40 border-b border-[#1B2D6B] bg-[#243B8A] text-[#FFFDF7] shadow-lg">
      <div className="h-1 bg-gradient-to-r from-[#243B8A] via-[#FFD966] to-[#EF6855]" />
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <a href="/" onClick={e => {e.preventDefault(); navigate('/');}} className="flex items-center gap-3">
          <img src="/assets/akath/akath-logo.png" alt="" className="h-11 w-11 rounded-full object-cover" />
          <span><span className="block font-serif text-xl font-bold">अकथ प्रकाशन</span><span className="block text-[10px] tracking-wider text-[#FFD966]">AKATH PRAKASHAN · MARATHI LITERATURE</span></span>
        </a>
        <nav className="hidden items-center gap-5 lg:flex">{navLinks.map(link => <a key={link.path} href={link.path} onClick={e => {e.preventDefault(); navigate(link.path);}} className="text-sm font-medium text-white/90 transition hover:text-[#FFD966]">{link.label}</a>)}</nav>
        <div className="flex items-center gap-2">
          <button onClick={() => setLang(lang === 'mr' ? 'en' : 'mr')} className="rounded-lg border border-white/25 px-3 py-2 text-xs font-semibold hover:bg-white/10">{t.language}</button>
          <button onClick={() => setMenuOpen(!menuOpen)} className="rounded-lg border border-white/25 px-3 py-2 text-sm lg:hidden" aria-label="Toggle menu">☰</button>
        </div>
      </div>
      {menuOpen && <nav className="grid gap-1 border-t border-white/15 px-4 py-3 lg:hidden">{navLinks.map(link => <a key={link.path} href={link.path} onClick={e => {e.preventDefault(); navigate(link.path);}} className="rounded-lg px-3 py-2 hover:bg-white/10">{link.label}</a>)}</nav>}
    </header>

    <main>
      {route.page === 'home' && <>
        <section className="relative isolate overflow-hidden bg-[#F3EEDF]">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-[1.05fr_.95fr] md:py-24">
            <div><p className="mb-4 text-xs font-bold uppercase tracking-[.2em] text-[#9A6B2F]">{t.eyebrow}</p><h1 className="max-w-3xl font-serif text-4xl font-semibold leading-[1.2] sm:text-5xl lg:text-6xl">{t.hero}</h1><p className="mt-6 max-w-xl text-base leading-8 text-[#5C5A53]">{t.intro}</p><div className="mt-8 flex flex-wrap gap-3"><button onClick={() => navigate('/books')} className="rounded-xl bg-[#243B8A] px-6 py-3 font-semibold text-white hover:bg-[#1B2D6B]">{t.explore}</button><button onClick={() => navigate('/vachankatta')} className="rounded-xl border border-[#243B8A]/30 px-6 py-3 font-semibold text-[#243B8A] hover:bg-white">{t.read}</button></div></div>
            <div className="relative"><img src="/assets/akath/hero-books.jpg" alt="A selection of books from Akath Prakashan" className="w-full rounded-[2rem] object-cover shadow-2xl" /><span className="absolute -bottom-4 -left-3 rounded-xl bg-[#FFD966] px-4 py-3 font-serif text-sm font-semibold text-[#252832] shadow-lg">अकथ प्रकाशन · नांदेड</span></div>
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6"><div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#9A6B2F]">01 · AKATH CATALOGUE</p><h2 className="mt-2 font-serif text-3xl font-semibold">{t.featured}</h2><p className="mt-2 text-[#68665F]">{t.featuredSub}</p></div><button onClick={() => navigate('/books')} className="font-semibold text-[#243B8A] hover:underline">{t.allBooks} ↗</button></div><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{(publicBooks.filter(item => item.isFeatured).length ? publicBooks.filter(item => item.isFeatured) : publicBooks).slice(0,4).map(item => <BookTile key={item.id} book={item} lang={lang}/>)}</div></section>
        <section className="bg-[#F7F3E8] py-16"><div className="mx-auto max-w-7xl px-4 sm:px-6"><div className="mb-8"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#9A6B2F]">02 · VACHANKATTA</p><h2 className="mt-2 font-serif text-3xl font-semibold">{t.latest}</h2><p className="mt-2 text-[#68665F]">{t.latestSub}</p></div><div className="grid gap-5 md:grid-cols-3">{publicArticles.slice(0,3).map(item => <a key={item.id} href={`/vachankatta/${item.slug}`} onClick={e => {e.preventDefault();navigate(`/vachankatta/${item.slug}`);}} className="rounded-2xl border border-[#E6E1D6] bg-white p-6 hover:shadow-lg"><p className="text-xs font-semibold text-[#9A6B2F]">{item.categoryMarathi}</p><h3 className="mt-3 font-serif text-xl font-semibold">{item.title}</h3><p className="mt-3 text-sm leading-6 text-[#68665F]">{item.summary}</p><span className="mt-5 inline-block text-sm font-semibold text-[#243B8A]">{t.readArticle} ↗</span></a>)}</div></div></section>
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6"><h2 className="font-serif text-3xl font-semibold">{t.aboutTitle}</h2><p className="mt-4 max-w-3xl text-lg leading-8 text-[#68665F]">{t.aboutText}</p><button onClick={() => navigate('/about')} className="mt-6 font-semibold text-[#243B8A] hover:underline">{t.about} ↗</button></section>
      </>}

      {route.page === 'books' && <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#9A6B2F]">AKATH · CATALOGUE</p><h1 className="mt-2 font-serif text-4xl font-semibold">{t.catalogue}</h1><p className="mt-3 text-[#68665F]">{t.catalogueSub}</p><input value={query} onChange={e => setQuery(e.target.value)} placeholder={t.search} className="mt-7 w-full max-w-xl rounded-xl border border-[#DCD5C8] bg-white px-4 py-3 outline-none focus:border-[#243B8A]"/><p className="mb-5 mt-7 text-sm text-[#68665F]">{filteredBooks.length} {lang === 'mr' ? 'पुस्तके' : 'titles'}</p><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{filteredBooks.map(item => <BookTile key={item.id} book={item} lang={lang}/>)}</div>{filteredBooks.length === 0 && <p className="py-12 text-center text-[#68665F]">{t.noBooks}</p>}</section>}

      {route.page === 'book' && book && <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6"><button onClick={() => navigate('/books')} className="mb-8 text-sm font-semibold text-[#243B8A]">← {t.back}</button><div className="grid gap-10 md:grid-cols-[.8fr_1.2fr]"><div className="flex justify-center rounded-3xl bg-[#F3EEDF] p-8"><img src={book.coverImageUrl || '/assets/akath/akath-logo.png'} alt={book.title} className="max-h-[560px] max-w-full object-contain shadow-2xl"/></div><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#9A6B2F]">{book.category}</p><h1 className="mt-3 font-serif text-4xl font-semibold leading-tight">{book.title}</h1><p className="mt-3 text-lg text-[#68665F]">{publicAuthors.find(item => item.id === book.authorId)?.name}</p><p className="mt-6 text-2xl font-semibold">{book.price > 0 ? `₹${book.price}` : ''}</p><h2 className="mt-8 font-serif text-xl font-semibold">{t.details}</h2><p className="mt-3 whitespace-pre-line leading-8 text-[#5C5A53]">{book.description}</p><dl className="mt-8 grid grid-cols-2 gap-4 border-y border-[#E6E1D6] py-5 text-sm"><div><dt className="text-[#8B887F]">{t.isbn}</dt><dd className="mt-1 font-medium">{book.isbn || '—'}</dd></div><div><dt className="text-[#8B887F]">{t.pages}</dt><dd className="mt-1 font-medium">{book.pageCount || '—'}</dd></div><div><dt className="text-[#8B887F]">{t.format}</dt><dd className="mt-1 font-medium">{book.format}</dd></div><div><dt className="text-[#8B887F]">{t.author}</dt><dd className="mt-1 font-medium">{publicAuthors.find(item => item.id === book.authorId)?.name || '—'}</dd></div></dl><a href={`mailto:akathpublication@gmail.com?subject=${encodeURIComponent(`Enquiry about ${book.title}`)}`} className="mt-8 inline-flex rounded-xl bg-[#243B8A] px-6 py-3 font-semibold text-white hover:bg-[#1B2D6B]">{t.enquire}</a></div></div></section>}
      {route.page === 'book' && !book && <NotFound text={t.noContent}/>}
      {route.page === 'authors' && <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6"><h1 className="font-serif text-4xl font-semibold">{t.authorsTitle}</h1><div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{publicAuthors.map(item => <a key={item.id} href={`/authors/${item.slug}`} onClick={e => {e.preventDefault();navigate(`/authors/${item.slug}`);}} className="rounded-2xl border border-[#E6E1D6] bg-white p-6 hover:shadow-lg"><p className="text-xs font-semibold text-[#9A6B2F]">{item.literaryRole}</p><h2 className="mt-2 font-serif text-2xl font-semibold">{item.name}</h2><p className="mt-2 text-sm leading-6 text-[#68665F]">{item.biography.slice(0,220)}…</p></a>)}</div></section>}
      {route.page === 'author' && author && <section className="mx-auto max-w-4xl px-4 py-16"><button onClick={() => navigate('/authors')} className="mb-8 text-sm font-semibold text-[#243B8A]">← {t.back}</button><p className="text-xs font-bold uppercase tracking-wider text-[#9A6B2F]">{author.literaryRole}</p><h1 className="mt-3 font-serif text-4xl font-semibold">{author.name}</h1><p className="mt-6 text-lg leading-8 text-[#68665F]">{author.biography}</p><div className="mt-10 grid gap-4 sm:grid-cols-2">{publicBooks.filter(item => item.authorId === author.id).map(item => <BookTile key={item.id} book={item} lang={lang}/>)}</div></section>}
      {route.page === 'author' && !author && <NotFound text={t.noContent}/>}
      {route.page === 'journal' && <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6"><h1 className="font-serif text-4xl font-semibold">{t.journalTitle}</h1><p className="mt-3 text-[#68665F]">{t.journalSub}</p><div className="mt-8 grid gap-5 md:grid-cols-2">{publicArticles.map(item => <a key={item.id} href={`/vachankatta/${item.slug}`} onClick={e => {e.preventDefault();navigate(`/vachankatta/${item.slug}`);}} className="rounded-2xl border border-[#E6E1D6] bg-white p-7 hover:shadow-lg"><p className="text-xs font-semibold text-[#9A6B2F]">{item.categoryMarathi} · {item.readingTimeMinutes} min</p><h2 className="mt-3 font-serif text-2xl font-semibold">{item.title}</h2><p className="mt-3 leading-7 text-[#68665F]">{item.summary}</p></a>)}</div></section>}
      {route.page === 'article' && article && <article className="mx-auto max-w-3xl px-4 py-16"><button onClick={() => navigate('/vachankatta')} className="mb-8 text-sm font-semibold text-[#243B8A]">← {t.back}</button><p className="text-xs font-bold uppercase tracking-wider text-[#9A6B2F]">{article.categoryMarathi} · {article.readingTimeMinutes} min</p><h1 className="mt-4 font-serif text-4xl font-semibold leading-tight">{article.title}</h1><p className="mt-5 text-lg leading-8 text-[#68665F]">{article.leadParagraph}</p><div className="prose prose-lg mt-10 max-w-none">{article.sections.map(section => <section key={section.id} className="mb-8"><h2 className="font-serif text-2xl font-semibold">{section.heading}</h2>{section.paragraphs.map((paragraph,index) => <p key={index} className="mt-4 leading-8 text-[#45443F]">{paragraph}</p>)}</section>)}</div></article>}
      {route.page === 'article' && !article && <NotFound text={t.noContent}/>}
      {route.page === 'about' && <section className="mx-auto max-w-4xl px-4 py-20"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#9A6B2F]">OUR STORY</p><h1 className="mt-3 font-serif text-4xl font-semibold">{t.aboutHeading}</h1><p className="mt-7 text-lg leading-9 text-[#5C5A53]">{t.aboutText}</p><blockquote className="mt-10 border-l-4 border-[#FFD966] pl-6 font-serif text-2xl italic text-[#243B8A]">“{lang === 'mr' ? 'चांगल्या पुस्तकाला घडण्यासाठी आपला संथ, संयमी वेळ लागतो — आणि म्हणूनच ते पिढ्यानपिढ्या टिकून राहते.' : 'Like the turtle, a good book takes its time — and lasts for generations.'}”</blockquote></section>}
      {route.page === 'contact' && <section className="mx-auto max-w-3xl px-4 py-20"><h1 className="font-serif text-4xl font-semibold">{t.contactHeading}</h1><p className="mt-5 text-lg leading-8 text-[#68665F]">{t.contactText}</p><div className="mt-8 flex flex-wrap gap-3"><a href="mailto:akathpublication@gmail.com" className="rounded-xl bg-[#243B8A] px-6 py-3 font-semibold text-white">{t.email}</a><a href="https://wa.me/919270282932" target="_blank" rel="noreferrer" className="rounded-xl border border-[#243B8A]/30 px-6 py-3 font-semibold text-[#243B8A]">{t.whatsapp}</a></div><p className="mt-8 text-sm text-[#68665F]">akathpublication@gmail.com · +91 92702 82932</p></section>}
      {route.page === 'not-found' && <NotFound text={t.noContent}/>}
    </main>

    <footer className="mt-16 bg-[#243B8A] text-white"><div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3"><div><h2 className="font-serif text-2xl font-semibold">अकथ प्रकाशन</h2><p className="mt-3 max-w-sm text-sm leading-7 text-white/75">{t.aboutText}</p></div><div><h3 className="font-semibold text-[#FFD966]">{t.books} · {t.journal}</h3><div className="mt-3 grid gap-2 text-sm text-white/80">{navLinks.map(link => <a key={link.path} href={link.path} onClick={e => {e.preventDefault();navigate(link.path);}} className="hover:text-[#FFD966]">{link.label}</a>)}</div></div><div><h3 className="font-semibold text-[#FFD966]">{t.contact}</h3><a className="mt-3 block text-sm text-white/80 hover:text-white" href="mailto:akathpublication@gmail.com">akathpublication@gmail.com</a><a className="mt-2 block text-sm text-white/80 hover:text-white" href="https://wa.me/919270282932">+91 92702 82932</a><p className="mt-6 text-xs text-white/60">© 2026 Akath Prakashan. {t.allRights}</p></div></div><div className="border-t border-white/15 py-4 text-center text-xs text-white/60">मराठी साहित्य. नवे आवाज. दीर्घ संवाद.</div></footer>
  </div>;
}

function NotFound({ text }: { text: string }) {
  return <section className="mx-auto max-w-xl px-4 py-24 text-center"><h1 className="font-serif text-3xl font-semibold">404</h1><p className="mt-3 text-[#68665F]">{text}</p><a href="/" className="mt-6 inline-block font-semibold text-[#243B8A]">← Akath Prakashan</a></section>;
}
