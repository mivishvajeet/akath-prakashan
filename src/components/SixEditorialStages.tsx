import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  CheckCircle2,
  FileText,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PUBLISHER_IDENTITY } from '../data/seedData';
import { useLanguage } from '../i18n/translations';

interface SixEditorialStagesProps {
  variant?: 'home' | 'about';
  onNavigate?: (path: string) => void;
}

interface EnrichedStageSpec {
  step: string;
  roman: string;
  titleMr: string;
  titleEn: string;
  descMr: string;
  descEn: string;
  phaseMr: string;
  phaseEn: string;
  deliverableMr: string;
  deliverableEn: string;
  pillarMr: string;
  pillarEn: string;
  specCode: string;
  checkpointsMr: string[];
  checkpointsEn: string[];
}

const ENRICHED_STAGES: EnrichedStageSpec[] = [
  {
    step: '01',
    roman: 'I',
    titleMr:
      PUBLISHER_IDENTITY.preservedCapabilities[0]?.titleMarathi ||
      'सखोल संपादन आणि मुद्रितशोधन',
    titleEn:
      PUBLISHER_IDENTITY.preservedCapabilities[0]?.titleEnglish ||
      'Editing & Proofreading',
    descMr:
      PUBLISHER_IDENTITY.preservedCapabilities[0]?.description ||
      'मराठी, हिंदी आणि इंग्रजी भाषेतील हस्तलिखितांचे आशयसंपादन, वाक्यरचना सुधारणा आणि अचूक मुद्रितशोधन.',
    descEn:
      PUBLISHER_IDENTITY.preservedCapabilities[0]?.descriptionEnglish ||
      'Substantive developmental editing, structural refinement, and meticulous proofreading across Marathi, Hindi, and English manuscripts.',
    phaseMr: 'अध्याय ०१ • संहिता परीक्षण व मुद्रितशोधन',
    phaseEn: 'Chapter I • Developmental Editing & Proofing',
    deliverableMr: 'त्रिस्तरीय संपादित व मुद्रितशोधित संहिता',
    deliverableEn: '3-Pass Edited & Proofread Master Manuscript',
    pillarMr: 'संहिता संस्कार',
    pillarEn: 'Textual Rigor',
    specCode: 'AKATH-ED-01',
    checkpointsMr: [
      'दोन स्वतंत्र संपादकांकडून संपूर्ण हस्तलिखिताचे सखोल वाचन व आशयसंपादन',
      'लेखकाचा मूळ स्वर अबाधित ठेवून वाक्यरचना, लय आणि प्रकरणांची सलगता घट्ट करणे',
      'मराठी साहित्य महामंडळ नियमांनुसार तीन फेऱ्यांचे काटेकोर मुद्रितशोधन',
    ],
    checkpointsEn: [
      'Unabridged evaluation and substantive editing by two literary editors',
      "Refining structural pacing and syntax while honoring the author's original voice",
      'Three independent rounds of orthographic and galley proofreading',
    ],
  },
  {
    step: '02',
    roman: 'II',
    titleMr:
      PUBLISHER_IDENTITY.preservedCapabilities[1]?.titleMarathi ||
      'आशयघन मुखपृष्ठ संकल्पना',
    titleEn:
      PUBLISHER_IDENTITY.preservedCapabilities[1]?.titleEnglish ||
      'Story-Led Cover Design',
    descMr:
      PUBLISHER_IDENTITY.preservedCapabilities[1]?.description ||
      'पुस्तकाच्या अंतरंगाशी सुसंगत, वाचकाचे लक्ष वेधून घेणारी आणि साहित्यिक गांभीर्य जपणारी मुखपृष्ठ मांडणी.',
    descEn:
      PUBLISHER_IDENTITY.preservedCapabilities[1]?.descriptionEnglish ||
      'Bespoke cover art direction that reflects the inner soul of the book while preserving literary dignity.',
    phaseMr: 'अध्याय ०२ • दृश्य ओळख व मुखपृष्ठ कला',
    phaseEn: 'Chapter II • Visual Identity & Jacket Craft',
    deliverableMr: 'मूळ मुखपृष्ठ कलाकृती व पाठीचा (Spine) आराखडा',
    deliverableEn: 'Original Cover Art, Jacket & Spine Mechanical',
    pillarMr: 'दृश्य सौंदर्य',
    pillarEn: 'Visual Dignity',
    specCode: 'AKATH-CV-02',
    checkpointsMr: [
      'पुस्तकाच्या आतील प्रकृतीला साजेसे मूळ चित्रांकन आणि देवनागरी सुलेखन',
      'कोणताही बाजारी भडकपणा टाळून अभिजात, संग्रहणीय दृश्य मांडणी',
      'मॅट-लिनन स्पर्शक्षम फिनिशिंग, मलपृष्ठ मजकूर आणि अचूक कणा (Spine) भूमिती',
    ],
    checkpointsEn: [
      'Commissioned original artwork and custom Devanagari cover typography',
      'Restrained, archival visual hierarchy free of commercial clichés',
      'Tactile matte/textured jacket specification, back-cover synopsis & spine geometry',
    ],
  },
  {
    step: '03',
    roman: 'III',
    titleMr:
      PUBLISHER_IDENTITY.preservedCapabilities[2]?.titleMarathi ||
      'अंतर्गत मांडणी आणि अक्षरजुळणी',
    titleEn:
      PUBLISHER_IDENTITY.preservedCapabilities[2]?.titleEnglish ||
      'Layout & Typesetting',
    descMr:
      PUBLISHER_IDENTITY.preservedCapabilities[2]?.description ||
      'दीर्घ वाचनासाठी डोळ्यांना सुखद वाटणारी देवनागरी अक्षरजुळणी, समास आणि कागद-अनुकूल पृष्ठरचना.',
    descEn:
      PUBLISHER_IDENTITY.preservedCapabilities[2]?.descriptionEnglish ||
      'Eye-friendly Devanagari typesetting, generous margins, and paper-conscious page architecture crafted for long-form reading.',
    phaseMr: 'अध्याय ०३ • देवनागरी अक्षरजुळणी व पृष्ठरचना',
    phaseEn: 'Chapter III • Devanagari Typography & Page Architecture',
    deliverableMr: 'मुद्रण-सिद्ध पृष्ठ आराखडा (Print Signatures)',
    deliverableEn: 'Print-Ready Typeset Book Signatures',
    pillarMr: 'अक्षर सौष्ठव',
    pillarEn: 'Typographic Grace',
    specCode: 'AKATH-TY-03',
    checkpointsMr: [
      'जोडाक्षरे व शिरोरेषा सुस्पष्ट दिसणारा उच्च-वाचनक्षम देवनागरी टंक',
      'दीर्घ वाचनासाठी १.८५ ओळ-अंतर आणि पारंपरिक सुवर्ण-प्रमाणातील समास',
      'प्रकरण प्रारंभ, तळटीपा, अवतरणे आणि पृष्ठक्रमांकांची सुसंवादित मांडणी',
    ],
    checkpointsEn: [
      'High-legibility Devanagari conjuncts with balanced Shirorekha weight',
      'Generous 1.85 line-height and classical book margins for fatigue-free reading',
      'Bespoke chapter openers, running headers, footnotes, and folio numbers',
    ],
  },
  {
    step: '04',
    roman: 'IV',
    titleMr:
      PUBLISHER_IDENTITY.preservedCapabilities[3]?.titleMarathi ||
      'ISBN नोंदणी आणि प्रताधिकार प्रक्रिया',
    titleEn:
      PUBLISHER_IDENTITY.preservedCapabilities[3]?.titleEnglish ||
      'ISBN & Copyright Documentation',
    descMr:
      PUBLISHER_IDENTITY.preservedCapabilities[3]?.description ||
      'कायदेशीर प्रताधिकार लेखकाच्या नावे सुरक्षित ठेवून अधिकृत ISBN व ग्रंथसूची नोंदणीची पूर्ण जबाबदारी.',
    descEn:
      PUBLISHER_IDENTITY.preservedCapabilities[3]?.descriptionEnglish ||
      'Complete management of official ISBN registration and bibliographic cataloguing while safeguarding copyright in the author’s name.',
    phaseMr: 'अध्याय ०४ • ISBN-13 व लेखक प्रताधिकार सुरक्षा',
    phaseEn: 'Chapter IV • ISBN-13 & Author Copyright Stewardship',
    deliverableMr: 'अधिकृत ISBN-13, बारकोड व पारदर्शक करार',
    deliverableEn: 'Official ISBN-13, Barcode & Author Contract',
    pillarMr: 'प्रताधिकार सन्मान',
    pillarEn: 'Author Rights',
    specCode: 'AKATH-IS-04',
    checkpointsMr: [
      'राजा राममोहन रॉय राष्ट्रीय संस्थेकडून प्रत्येक आवृत्तीसाठी अधिकृत ISBN-13 नोंदणी',
      'पुस्तकाचे सर्व कायदेशीर प्रताधिकार (Copyright) पूर्णपणे लेखकाच्या नावे सुरक्षित',
      'स्पष्ट लेखी प्रकाशन करार आणि पारदर्शक लेखक मानधन (Royalty) संरचना',
    ],
    checkpointsEn: [
      'Official ISBN-13 allocation and national bibliographic metadata registration',
      '100% legal literary copyright retained in the author’s own name',
      'Clear written publishing agreement with transparent royalty accounting',
    ],
  },
  {
    step: '05',
    roman: 'V',
    titleMr:
      PUBLISHER_IDENTITY.preservedCapabilities[4]?.titleMarathi ||
      'दर्जेदार मुद्रण आणि बांधणी',
    titleEn:
      PUBLISHER_IDENTITY.preservedCapabilities[4]?.titleEnglish ||
      'Archival Printing & Binding',
    descMr:
      PUBLISHER_IDENTITY.preservedCapabilities[4]?.description ||
      'पेपरबॅक आणि हार्डबाउंड आवृत्त्यांसाठी टिकाऊ कागद, स्पष्ट छपाई आणि मजबूत पुस्तक बांधणी.',
    descEn:
      PUBLISHER_IDENTITY.preservedCapabilities[4]?.descriptionEnglish ||
      'Acid-free natural shade paper, crisp presswork, and durable binding for both paperback and hardbound editions.',
    phaseMr: 'अध्याय ०५ • संग्रहणीय मुद्रण व धागा-शिलाई बांधणी',
    phaseEn: 'Chapter V • Archival Presswork & Thread Binding',
    deliverableMr: 'संग्रहणीय पेपरबॅक / हार्डबाउंड मुद्रित आवृत्ती',
    deliverableEn: 'Archival Natural-Shade Paperback / Hardbound Edition',
    pillarMr: 'संग्रहणीय मुद्रण',
    pillarEn: 'Archival Presswork',
    specCode: 'AKATH-PR-05',
    checkpointsMr: [
      'डोळ्यांना शांतता देणारा आम्लविरहित नैसर्गिक क्रीम (Natural Shade) कागद',
      'पुस्तक १८० अंशात सपाट उघडणारी मजबूत धागा-शिलाई (Smyth-Sewn) बांधणी',
      'प्रत्येक मुद्रित प्रतीची शाई-घनता, कापणी आणि बांधणी गुणवत्तेची तपासणी',
    ],
    checkpointsEn: [
      'Glare-free acid-free natural cream archival bookpaper',
      '180° lay-flat Smyth-sewn thread binding built to endure decades of reading',
      'Batch-level press inspection for ink density, trim precision, and spine strength',
    ],
  },
  {
    step: '06',
    roman: 'VI',
    titleMr:
      PUBLISHER_IDENTITY.preservedCapabilities[5]?.titleMarathi ||
      'वितरण आणि ई-बुक प्रसार',
    titleEn:
      PUBLISHER_IDENTITY.preservedCapabilities[5]?.titleEnglish ||
      'Distribution & eBook Reach',
    descMr:
      PUBLISHER_IDENTITY.preservedCapabilities[5]?.description ||
      'नांदेडच्या पलीकडे महाराष्ट्रभरातील स्वतंत्र पुस्तकांची दुकाने, वाचनालये आणि थेट ऑनलाइन वाचकांपर्यंत पोहोच.',
    descEn:
      PUBLISHER_IDENTITY.preservedCapabilities[5]?.descriptionEnglish ||
      'Reaching independent bookstores, institutional libraries, and direct online readers across Maharashtra and India.',
    phaseMr: 'अध्याय ०६ • देशभर वितरण, ग्रंथालये व वाचक संवाद',
    phaseEn: 'Chapter VI • Nationwide Dispatch, Libraries & Reader Reach',
    deliverableMr: 'महाराष्ट्र व देशभर थेट वाचक आणि ग्रंथालय वितरण',
    deliverableEn: 'Direct Reader Dispatch, Bookstores & Library Supply',
    pillarMr: 'वाचक संवाद',
    pillarEn: 'Reader Communion',
    specCode: 'AKATH-DP-06',
    checkpointsMr: [
      'नांदेड वितरण केंद्रातून आर्द्रतारोधक वेष्टनात सुरक्षित घरपोच रवानगी',
      'महाराष्ट्रातील प्रमुख स्वतंत्र ग्रंथदालने, विद्यापीठे आणि सार्वजनिक वाचनालयांत उपलब्धता',
      'वाचनकट्टा, पुस्तक चर्चा आणि डिजिटल माध्यमांतून पुस्तकाचा दीर्घकालीन प्रसार',
    ],
    checkpointsEn: [
      'Moisture-shielded protective book-wrap dispatch from our Nanded hub',
      'Placement across independent Marathi bookshops, universities, and public libraries',
      'Sustained post-publication literary conversations, reviews, and reader outreach',
    ],
  },
];

/**
 * Miniature animated SVG icon rendered inside each of the 6 stage spine index items
 */
const StageMiniIcon: React.FC<{ stepIndex: number; isActive: boolean }> = ({
  stepIndex,
  isActive,
}) => {
  const strokeColor = isActive ? '#243B8A' : '#174D3A';
  const accentColor = isActive ? '#EF6855' : '#FFD966';

  switch (stepIndex) {
    case 0:
      return (
        <svg viewBox="0 0 48 48" className="w-7 h-7" fill="none" aria-hidden="true">
          <rect
            x="8"
            y="6"
            width="26"
            height="34"
            rx="2"
            fill="#FFFDF7"
            stroke={strokeColor}
            strokeWidth="2"
          />
          <line x1="13" y1="14" x2="28" y2="14" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" />
          <line x1="13" y1="20" x2="26" y2="20" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" />
          <line x1="13" y1="26" x2="24" y2="26" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" />
          <g className="akath-stage-loupe">
            <circle cx="31" cy="28" r="8" fill="#FFD966" fillOpacity="0.45" stroke={accentColor} strokeWidth="2.2" />
            <line x1="36.8" y1="33.8" x2="42" y2="39" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
          </g>
        </svg>
      );
    case 1:
      return (
        <svg viewBox="0 0 48 48" className="w-7 h-7" fill="none" aria-hidden="true">
          <rect x="10" y="6" width="28" height="36" rx="2" fill="#FFFDF7" stroke={strokeColor} strokeWidth="2" />
          <line x1="15" y1="6" x2="15" y2="42" stroke={strokeColor} strokeWidth="1.8" />
          <g className="akath-stage-stamp">
            <circle cx="26.5" cy="21" r="6.5" fill={accentColor} fillOpacity="0.4" stroke={strokeColor} strokeWidth="1.8" />
            <circle cx="26.5" cy="21" r="2.5" fill={strokeColor} />
          </g>
          <line x1="20" y1="33" x2="33" y2="33" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 2:
      return (
        <svg viewBox="0 0 48 48" className="w-7 h-7" fill="none" aria-hidden="true">
          <rect x="7" y="8" width="34" height="32" rx="2" fill="#FFFDF7" stroke={strokeColor} strokeWidth="2" />
          <line x1="11" y1="16" x2="37" y2="16" stroke={accentColor} strokeWidth="2" />
          <text
            x="24"
            y="31"
            textAnchor="middle"
            fill={strokeColor}
            fontSize="16"
            fontWeight="700"
            fontFamily="Noto Serif Devanagari, serif"
          >
            अक
          </text>
          <g className="akath-stage-caliper">
            <line x1="13" y1="12" x2="13" y2="36" stroke={accentColor} strokeWidth="1.6" strokeDasharray="2 2" />
            <line x1="35" y1="12" x2="35" y2="36" stroke={accentColor} strokeWidth="1.6" strokeDasharray="2 2" />
          </g>
        </svg>
      );
    case 3:
      return (
        <svg viewBox="0 0 48 48" className="w-7 h-7" fill="none" aria-hidden="true">
          <rect x="8" y="8" width="30" height="32" rx="2" fill="#FFFDF7" stroke={strokeColor} strokeWidth="2" />
          <line x1="13" y1="16" x2="13" y2="26" stroke={strokeColor} strokeWidth="2" />
          <line x1="17" y1="16" x2="17" y2="26" stroke={strokeColor} strokeWidth="1.4" />
          <line x1="21" y1="16" x2="21" y2="26" stroke={strokeColor} strokeWidth="2.2" />
          <line x1="25" y1="16" x2="25" y2="26" stroke={strokeColor} strokeWidth="1.5" />
          <g className="akath-stage-proof-mark">
            <circle cx="33" cy="30" r="8.5" fill={accentColor} stroke={strokeColor} strokeWidth="1.8" />
            <path d="M29.2 30.2L31.8 32.8L36.8 27.5" stroke="#FFFDF7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </svg>
      );
    case 4:
      return (
        <svg viewBox="0 0 48 48" className="w-7 h-7" fill="none" aria-hidden="true">
          <g className="akath-stage-book">
            <path
              d="M7 13C13 11 19 12 24 15C29 12 35 11 41 13V35C35 33 29 34 24 37C19 34 13 33 7 35V13Z"
              fill="#FFFDF7"
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <line x1="24" y1="15" x2="24" y2="37" stroke={accentColor} strokeWidth="2" />
            <line x1="12" y1="20" x2="20" y2="21" stroke={strokeColor} strokeWidth="1.6" strokeLinecap="round" />
            <line x1="28" y1="21" x2="36" y2="20" stroke={strokeColor} strokeWidth="1.6" strokeLinecap="round" />
          </g>
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 48 48" className="w-7 h-7" fill="none" aria-hidden="true">
          <rect x="8" y="10" width="32" height="28" rx="3" fill="#FFFDF7" stroke={strokeColor} strokeWidth="2" />
          <path
            d="M14 28C19 20 27 30 34 18"
            stroke={accentColor}
            strokeWidth="2.2"
            className="akath-stage-flow-line"
          />
          <circle cx="14" cy="28" r="3" fill={strokeColor} />
          <circle cx="34" cy="18" r="3.5" fill={accentColor} stroke={strokeColor} strokeWidth="1.4" />
        </svg>
      );
  }
};

/**
 * Large Editorial Blueprint SVG Illustration for the Active Stage Theatre
 */
const StageCraftIllustration: React.FC<{ stepIndex: number; lang: 'mr' | 'en' }> = ({
  stepIndex,
  lang,
}) => {
  switch (stepIndex) {
    case 0:
      return (
        <svg
          viewBox="0 0 360 220"
          className="w-full h-auto max-h-[210px] select-none"
          fill="none"
          role="img"
          aria-label={lang === 'mr' ? 'सखोल संपादन आणि मुद्रितशोधन आराखडा' : 'Editing and Proofreading Illustration'}
        >
          <rect x="46" y="24" width="268" height="172" rx="4" fill="#E6E1D6" opacity="0.55" />
          <rect x="40" y="18" width="134" height="172" rx="3" fill="#FFFDF7" stroke="#243B8A" strokeWidth="2" />
          <rect x="174" y="18" width="134" height="172" rx="3" fill="#FFFDF7" stroke="#243B8A" strokeWidth="2" />
          <line x1="174" y1="18" x2="174" y2="190" stroke="#243B8A" strokeWidth="2" />

          <rect x="58" y="36" width="54" height="10" rx="2" fill="#FFD966" />
          <text x="60" y="60" fill="#243B8A" fontSize="11" fontWeight="700" fontFamily="Noto Serif Devanagari, serif">
            आशयसंपादन व भाषाशुद्धी
          </text>
          <line x1="58" y1="74" x2="154" y2="74" stroke="#252832" strokeWidth="2" strokeLinecap="round" opacity="0.75" />
          <line x1="58" y1="88" x2="148" y2="88" stroke="#252832" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
          <line x1="58" y1="102" x2="152" y2="102" stroke="#252832" strokeWidth="2" strokeLinecap="round" opacity="0.75" />
          <line x1="58" y1="116" x2="136" y2="116" stroke="#252832" strokeWidth="2" strokeLinecap="round" opacity="0.55" />
          <line x1="58" y1="134" x2="150" y2="134" stroke="#174D3A" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="58" y1="148" x2="142" y2="148" stroke="#252832" strokeWidth="2" strokeLinecap="round" opacity="0.6" />

          <rect x="192" y="38" width="96" height="22" rx="3" fill="#FFD966" fillOpacity="0.38" stroke="#FFD966" strokeWidth="1.2" />
          <line x1="198" y1="46" x2="276" y2="46" stroke="#243B8A" strokeWidth="2" strokeLinecap="round" />
          <line x1="198" y1="53" x2="258" y2="53" stroke="#243B8A" strokeWidth="1.8" strokeLinecap="round" />

          <line x1="192" y1="76" x2="286" y2="76" stroke="#252832" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
          <line x1="192" y1="90" x2="280" y2="90" stroke="#252832" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
          <rect x="192" y="102" width="94" height="24" rx="3" fill="#174D3A" fillOpacity="0.1" />
          <line x1="198" y1="111" x2="278" y2="111" stroke="#174D3A" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="198" y1="119" x2="262" y2="119" stroke="#174D3A" strokeWidth="2" strokeLinecap="round" />

          <path d="M164 18V64L174 56L184 64V18H164Z" fill="#EF6855" />

          <g className="akath-stage-loupe">
            <circle
              cx="232"
              cy="112"
              r="34"
              fill="#FFFDF7"
              fillOpacity="0.9"
              stroke="#243B8A"
              strokeWidth="3.5"
            />
            <circle
              cx="232"
              cy="112"
              r="28"
              stroke="#FFD966"
              strokeWidth="2"
              strokeDasharray="4 3"
            />
            <text
              x="232"
              y="117"
              textAnchor="middle"
              fill="#243B8A"
              fontSize="12.5"
              fontWeight="700"
              fontFamily="Noto Serif Devanagari, serif"
            >
              ३-फेऱ्या शोधन
            </text>
            <line
              x1="257"
              y1="137"
              x2="286"
              y2="166"
              stroke="#174D3A"
              strokeWidth="6"
              strokeLinecap="round"
            />
          </g>
        </svg>
      );

    case 1:
      return (
        <svg
          viewBox="0 0 360 220"
          className="w-full h-auto max-h-[210px] select-none"
          fill="none"
          role="img"
          aria-label={lang === 'mr' ? 'आशयघन मुखपृष्ठ संकल्पना आराखडा' : 'Story-Led Cover Design Illustration'}
        >
          <rect x="42" y="18" width="114" height="180" rx="3" fill="#F7F3E8" stroke="#243B8A" strokeWidth="2" />
          <rect x="156" y="18" width="28" height="180" fill="#243B8A" stroke="#243B8A" strokeWidth="2" />
          <rect x="184" y="18" width="134" height="180" rx="3" fill="#FFFDF7" stroke="#243B8A" strokeWidth="2.2" />

          <line x1="58" y1="44" x2="138" y2="44" stroke="#252832" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
          <line x1="58" y1="56" x2="132" y2="56" stroke="#252832" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
          <line x1="58" y1="68" x2="124" y2="68" stroke="#252832" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
          <rect x="58" y="136" width="76" height="44" rx="3" fill="#FFFDF7" stroke="#174D3A" strokeWidth="1.5" />
          <text x="96" y="156" textAnchor="middle" fill="#174D3A" fontSize="9.5" fontWeight="700" fontFamily="Noto Serif Devanagari, serif">
            मलपृष्ठ संक्षेप
          </text>
          <line x1="68" y1="166" x2="124" y2="166" stroke="#174D3A" strokeWidth="1.5" strokeLinecap="round" />

          <circle cx="170" cy="38" r="6" fill="#FFD966" />
          <line x1="170" y1="58" x2="170" y2="158" stroke="#FFFDF7" strokeWidth="2" strokeDasharray="6 4" />
          <rect x="163" y="172" width="14" height="14" rx="2" fill="#EF6855" />

          <rect x="200" y="34" width="102" height="150" rx="2" stroke="#174D3A" strokeWidth="1.5" />
          <text
            x="251"
            y="60"
            textAnchor="middle"
            fill="#243B8A"
            fontSize="14"
            fontWeight="700"
            fontFamily="Noto Serif Devanagari, serif"
          >
            अकथ प्रकाशन
          </text>
          <g className="akath-stage-stamp">
            <circle cx="251" cy="108" r="26" fill="#FFD966" fillOpacity="0.45" stroke="#174D3A" strokeWidth="2" />
            <ellipse cx="251" cy="108" rx="16" ry="11" fill="#174D3A" />
            <circle cx="270" cy="106" r="3.5" fill="#174D3A" />
            <path d="M241 108H261" stroke="#FFD966" strokeWidth="1.5" />
          </g>
          <line x1="218" y1="154" x2="284" y2="154" stroke="#243B8A" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="230" y1="165" x2="272" y2="165" stroke="#EF6855" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 2:
      return (
        <svg
          viewBox="0 0 360 220"
          className="w-full h-auto max-h-[210px] select-none"
          fill="none"
          role="img"
          aria-label={lang === 'mr' ? 'अंतर्गत मांडणी आणि अक्षरजुळणी आराखडा' : 'Layout and Typesetting Illustration'}
        >
          <rect x="44" y="16" width="272" height="186" rx="4" fill="#FFFDF7" stroke="#243B8A" strokeWidth="2" />
          <rect
            x="68"
            y="36"
            width="224"
            height="146"
            stroke="#EF6855"
            strokeWidth="1.2"
            strokeDasharray="4 4"
          />

          <line x1="78" y1="74" x2="282" y2="74" stroke="#243B8A" strokeWidth="2.5" />
          <line x1="78" y1="122" x2="282" y2="122" stroke="#174D3A" strokeWidth="1.4" strokeDasharray="3 3" />

          <text
            x="180"
            y="114"
            textAnchor="middle"
            fill="#243B8A"
            fontSize="44"
            fontWeight="700"
            fontFamily="Noto Serif Devanagari, serif"
          >
            अकथ ग्रंथ
          </text>

          <g className="akath-stage-caliper">
            <rect x="82" y="48" width="84" height="16" rx="2" fill="#FFD966" stroke="#243B8A" strokeWidth="1.2" />
            <text x="124" y="59" textAnchor="middle" fill="#243B8A" fontSize="9" fontWeight="700" fontFamily="JetBrains Mono, monospace">
              1.85 LH • DEVANAGARI
            </text>
          </g>

          <line x1="84" y1="144" x2="170" y2="144" stroke="#252832" strokeWidth="2" strokeLinecap="round" opacity="0.75" />
          <line x1="84" y1="156" x2="162" y2="156" stroke="#252832" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
          <line x1="84" y1="168" x2="154" y2="168" stroke="#252832" strokeWidth="2" strokeLinecap="round" opacity="0.5" />

          <line x1="190" y1="144" x2="276" y2="144" stroke="#252832" strokeWidth="2" strokeLinecap="round" opacity="0.75" />
          <line x1="190" y1="156" x2="268" y2="156" stroke="#252832" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
          <line x1="190" y1="168" x2="252" y2="168" stroke="#252832" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        </svg>
      );

    case 3:
      return (
        <svg
          viewBox="0 0 360 220"
          className="w-full h-auto max-h-[210px] select-none"
          fill="none"
          role="img"
          aria-label={lang === 'mr' ? 'ISBN नोंदणी आणि प्रताधिकार आराखडा' : 'ISBN and Copyright Documentation Illustration'}
        >
          <rect x="46" y="18" width="268" height="182" rx="5" fill="#FFFDF7" stroke="#243B8A" strokeWidth="2.2" />
          <rect x="64" y="36" width="136" height="22" rx="3" fill="#243B8A" />
          <text x="132" y="51" textAnchor="middle" fill="#FFD966" fontSize="10" fontWeight="700" fontFamily="JetBrains Mono, monospace">
            ISBN 978-81-964821
          </text>

          <text x="64" y="80" fill="#252832" fontSize="13" fontWeight="700" fontFamily="Noto Serif Devanagari, serif">
            लेखक प्रताधिकार सुरक्षा प्रमाणपत्र
          </text>
          <line x1="64" y1="96" x2="210" y2="96" stroke="#252832" strokeWidth="2" strokeLinecap="round" opacity="0.75" />
          <line x1="64" y1="110" x2="196" y2="110" stroke="#252832" strokeWidth="2" strokeLinecap="round" opacity="0.6" />

          <rect x="64" y="128" width="118" height="54" rx="3" fill="#FFFFFF" stroke="#252832" strokeWidth="1.6" />
          <line x1="78" y1="138" x2="78" y2="166" stroke="#252832" strokeWidth="2.5" />
          <line x1="86" y1="138" x2="86" y2="166" stroke="#252832" strokeWidth="1.4" />
          <line x1="93" y1="138" x2="93" y2="166" stroke="#252832" strokeWidth="2.8" />
          <line x1="102" y1="138" x2="102" y2="166" stroke="#252832" strokeWidth="1.6" />
          <line x1="110" y1="138" x2="110" y2="166" stroke="#252832" strokeWidth="2.2" />
          <line x1="118" y1="138" x2="118" y2="166" stroke="#252832" strokeWidth="1.4" />
          <line x1="126" y1="138" x2="126" y2="166" stroke="#252832" strokeWidth="2.6" />
          <line x1="135" y1="138" x2="135" y2="166" stroke="#252832" strokeWidth="1.8" />
          <line x1="144" y1="138" x2="144" y2="166" stroke="#252832" strokeWidth="2.4" />
          <line x1="154" y1="138" x2="154" y2="166" stroke="#252832" strokeWidth="1.5" />
          <line x1="164" y1="138" x2="164" y2="166" stroke="#252832" strokeWidth="2.2" />
          <text x="123" y="176" textAnchor="middle" fill="#252832" fontSize="8" fontFamily="JetBrains Mono, monospace">
            9 788196 482107
          </text>

          <g className="akath-stage-proof-mark">
            <circle cx="256" cy="124" r="36" fill="#FFD966" stroke="#243B8A" strokeWidth="2.5" />
            <circle cx="256" cy="124" r="29" stroke="#243B8A" strokeWidth="1.2" strokeDasharray="3 3" />
            <path
              d="M242 124.5L252 134.5L271 114.5"
              stroke="#243B8A"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <text x="256" y="148" textAnchor="middle" fill="#243B8A" fontSize="8.5" fontWeight="700">
              COPYRIGHT ©
            </text>
          </g>
        </svg>
      );

    case 4:
      return (
        <svg
          viewBox="0 0 360 220"
          className="w-full h-auto max-h-[210px] select-none"
          fill="none"
          role="img"
          aria-label={lang === 'mr' ? 'दर्जेदार मुद्रण आणि बांधणी आराखडा' : 'Archival Printing and Binding Illustration'}
        >
          <g className="akath-stage-book">
            <path
              d="M54 50C96 38 138 42 174 58C210 42 252 38 294 50V162C252 150 210 154 174 170C138 154 96 150 54 162V50Z"
              fill="#FFFDF7"
              stroke="#243B8A"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path
              d="M58 167C98 156 138 160 174 175C210 160 250 156 290 167"
              stroke="#174D3A"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M62 172C100 162 138 166 174 180C210 166 248 162 286 172"
              stroke="#EF6855"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <line x1="174" y1="58" x2="174" y2="170" stroke="#243B8A" strokeWidth="2.5" />
            <circle cx="174" cy="80" r="3.5" fill="#FFD966" stroke="#243B8A" strokeWidth="1.5" />
            <circle cx="174" cy="114" r="3.5" fill="#FFD966" stroke="#243B8A" strokeWidth="1.5" />
            <circle cx="174" cy="148" r="3.5" fill="#FFD966" stroke="#243B8A" strokeWidth="1.5" />

            <rect x="76" y="70" width="78" height="22" rx="3" fill="#FFD966" fillOpacity="0.45" stroke="#243B8A" strokeWidth="1.4" />
            <text x="115" y="84" textAnchor="middle" fill="#243B8A" fontSize="9.5" fontWeight="700">
              NATURAL SHADE
            </text>
            <line x1="76" y1="108" x2="152" y2="112" stroke="#252832" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
            <line x1="76" y1="122" x2="146" y2="126" stroke="#252832" strokeWidth="2" strokeLinecap="round" opacity="0.6" />

            <rect x="196" y="70" width="78" height="22" rx="3" fill="#174D3A" />
            <text x="235" y="84" textAnchor="middle" fill="#FFFDF7" fontSize="9.5" fontWeight="700">
              SMYTH-SEWN
            </text>
            <line x1="196" y1="112" x2="272" y2="108" stroke="#252832" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
            <line x1="196" y1="126" x2="264" y2="122" stroke="#252832" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
          </g>
        </svg>
      );

    default:
      return (
        <svg
          viewBox="0 0 360 220"
          className="w-full h-auto max-h-[210px] select-none"
          fill="none"
          role="img"
          aria-label={lang === 'mr' ? 'वितरण आणि ई-बुक प्रसार आराखडा' : 'Distribution and Reader Reach Illustration'}
        >
          <rect x="42" y="18" width="276" height="182" rx="6" fill="#FFFDF7" stroke="#243B8A" strokeWidth="2" />

          <rect x="62" y="80" width="78" height="64" rx="4" fill="#243B8A" />
          <text x="101" y="106" textAnchor="middle" fill="#FFD966" fontSize="11" fontWeight="700" fontFamily="Noto Serif Devanagari, serif">
            अकथ केंद्र
          </text>
          <text x="101" y="124" textAnchor="middle" fill="#FFFDF7" fontSize="9.5" fontFamily="Noto Serif Devanagari, serif">
            नांदेड, महाराष्ट्र
          </text>

          <path
            d="M140 94C172 94 184 58 216 58"
            stroke="#EF6855"
            strokeWidth="2.5"
            className="akath-stage-flow-line"
          />
          <path
            d="M140 112H216"
            stroke="#174D3A"
            strokeWidth="2.5"
            className="akath-stage-flow-line"
          />
          <path
            d="M140 130C172 130 184 166 216 166"
            stroke="#243B8A"
            strokeWidth="2.5"
            className="akath-stage-flow-line"
          />

          <rect x="216" y="40" width="84" height="36" rx="4" fill="#FFD966" fillOpacity="0.4" stroke="#243B8A" strokeWidth="1.6" />
          <text x="258" y="62" textAnchor="middle" fill="#243B8A" fontSize="10.5" fontWeight="700" fontFamily="Noto Serif Devanagari, serif">
            घरपोच वाचक प्रत
          </text>

          <rect x="216" y="94" width="84" height="36" rx="4" fill="#F7F3E8" stroke="#174D3A" strokeWidth="1.6" />
          <text x="258" y="116" textAnchor="middle" fill="#174D3A" fontSize="10.5" fontWeight="700" fontFamily="Noto Serif Devanagari, serif">
            ग्रंथदालने व वाचनालये
          </text>

          <rect x="216" y="148" width="84" height="36" rx="4" fill="#EF6855" fillOpacity="0.15" stroke="#EF6855" strokeWidth="1.6" />
          <text x="258" y="170" textAnchor="middle" fill="#252832" fontSize="10.5" fontWeight="700" fontFamily="Noto Serif Devanagari, serif">
            ई-बुक व वाचनकट्टा
          </text>
        </svg>
      );
  }
};

const stepperContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.06,
    },
  },
};

const stepperNodeVariants = {
  hidden: { opacity: 0, x: -14 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.44,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

const gridContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

export const SixEditorialStages: React.FC<SixEditorialStagesProps> = ({
  variant = 'home',
  onNavigate,
}) => {
  const { lang } = useLanguage();
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    if (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % ENRICHED_STAGES.length);
    }, 5400);

    return () => window.clearInterval(timer);
  }, [isAutoPlaying]);

  const activeStage = ENRICHED_STAGES[activeIndex] || ENRICHED_STAGES[0];

  const handleSelectStage = (idx: number) => {
    setActiveIndex(idx);
    setIsAutoPlaying(false);
  };

  const handlePrev = () => {
    setIsAutoPlaying(false);
    setActiveIndex((prev) => (prev - 1 + ENRICHED_STAGES.length) % ENRICHED_STAGES.length);
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setActiveIndex((prev) => (prev + 1) % ENRICHED_STAGES.length);
  };

  return (
    <section
      data-testid={`six-editorial-stages-${variant}`}
      aria-labelledby={`six-editorial-stages-heading-${variant}`}
      className={
        variant === 'home'
          ? 'py-12 sm:py-16 bg-[#F7F3E8]/85 border-b border-[#E6E1D6] relative overflow-hidden'
          : 'py-10 sm:py-14 relative'
      }
    >
      <div className={variant === 'home' ? 'max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12' : ''}>
        {/* Compact Editorial Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-5"
        >
          <div className="max-w-3xl space-y-1.5">
            <div className="inline-flex items-center gap-2 text-[11px] font-mono font-bold tracking-[0.14em] uppercase text-[#243B8A]">
              <span className="w-2 h-2 rounded-full bg-[#EF6855]" />
              <span>
                {lang === 'mr'
                  ? 'अकथ संपादकीय आणि मुद्रण कार्यपद्धती • संहिता ते ग्रंथ'
                  : 'Akath Editorial & Bookmaking Architecture • Manuscript to Bound Edition'}
              </span>
            </div>

            <h2
              id={`six-editorial-stages-heading-${variant}`}
              className="text-2xl sm:text-3xl lg:text-[2.15rem] font-serif font-bold text-[#252832] leading-tight"
            >
              {lang === 'mr'
                ? 'हस्तलिखितापासून मुद्रित पुस्तकापर्यंतचे सहा संपादकीय टप्पे'
                : 'Six Editorial Stages from Manuscript to Printed Book'}
            </h2>

            <p className="text-xs sm:text-sm text-[#525665] leading-relaxed max-w-[65ch]">
              {lang === 'mr'
                ? 'एक चांगले पुस्तक घाईत घडत नाही. लेखकाच्या मूळ हस्तलिखितापासून वाचकाच्या हातात पडणाऱ्या संग्रहणीय प्रतीपर्यंत आम्ही प्रत्येक टप्प्यावर शांतपणे आणि काटेकोरपणे काम करतो.'
                : 'An enduring book is never rushed. From raw manuscript to thread-sewn edition, every Akath title moves through six deliberate stages of editorial and typographic craft.'}
            </p>
          </div>

          {/* Interactive Playback & Step Controls */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-end shrink-0">
            <button
              type="button"
              data-testid="editorial-stages-autoplay-toggle"
              onClick={() => setIsAutoPlaying((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold border transition-colors cursor-pointer ${
                isAutoPlaying
                  ? 'bg-[#243B8A] text-[#FFFDF7] border-[#243B8A]'
                  : 'bg-[#FFFDF7] text-[#252832] border-[#E6E1D6] hover:border-[#243B8A]'
              }`}
              aria-pressed={isAutoPlaying}
            >
              {isAutoPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-[#FFD966]" />
                  <span>
                    {lang === 'mr' ? 'स्वयं-प्रवास सुरू' : 'Auto-Tour Active'}
                  </span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-[#243B8A]" />
                  <span>
                    {lang === 'mr' ? 'क्रमवार पहा' : 'Play Stage Tour'}
                  </span>
                </>
              )}
            </button>

            <div className="inline-flex items-center rounded-sm border border-[#E6E1D6] bg-[#FFFDF7] p-0.5">
              <button
                type="button"
                onClick={handlePrev}
                aria-label={lang === 'mr' ? 'मागील संपादकीय टप्पा' : 'Previous editorial stage'}
                className="p-1.5 text-[#252832] hover:text-[#243B8A] hover:bg-[#F7F3E8] rounded-sm transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2.5 text-xs font-mono font-bold text-[#243B8A] tabular-nums">
                {activeStage.step} / 06
              </span>
              <button
                type="button"
                onClick={handleNext}
                aria-label={lang === 'mr' ? 'पुढील संपादकीय टप्पा' : 'Next editorial stage'}
                className="p-1.5 text-[#252832] hover:text-[#243B8A] hover:bg-[#F7F3E8] rounded-sm transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* ===================================================================
            UNIFIED ARCHIVAL BOOKMAKING LEDGER FRAME (ZERO VERTICAL DEAD SPACE)
            Connected 12-Col Architectural Grid:
            Left 5 Cols: Connected 6-Row Spine Index (divide-y, no loose gaps)
            Right 7 Cols: Side-by-Side Split Editorial Dossier & Tight Checkpoints
            =================================================================== */}
        <div className="rounded-sm border border-[#243B8A]/25 bg-[#FFFDF7] shadow-xs overflow-hidden">
          {/* Top 6-Stage Continuous Progress Hairline */}
          <div className="grid grid-cols-6 h-1 bg-[#E6E1D6]">
            {ENRICHED_STAGES.map((s, idx) => (
              <button
                key={s.step}
                type="button"
                aria-label={`Stage ${s.step}`}
                onClick={() => handleSelectStage(idx)}
                className={`h-full transition-colors duration-300 cursor-pointer ${
                  idx === activeIndex
                    ? 'bg-[#EF6855]'
                    : idx < activeIndex
                    ? 'bg-[#243B8A]'
                    : 'bg-transparent'
                }`}
              />
            ))}
          </div>

          {/* Mobile & Tablet (<lg): Compact Horizontal Stage Ribbon Inside Frame */}
          <div className="lg:hidden bg-[#F7F3E8]/85 border-b border-[#E6E1D6] px-3 py-2.5">
            <div
              data-testid="editorial-stages-mobile-tabs"
              className="flex overflow-x-auto snap-x snap-mandatory gap-2 no-scrollbar"
            >
              {ENRICHED_STAGES.map((stage, idx) => {
                const isCurrent = idx === activeIndex;
                return (
                  <button
                    key={stage.step}
                    type="button"
                    onClick={() => handleSelectStage(idx)}
                    className={`snap-start shrink-0 min-w-[185px] max-w-[215px] text-left px-2.5 py-2 rounded-sm border transition-all cursor-pointer flex items-center gap-2.5 ${
                      isCurrent
                        ? 'bg-[#243B8A] text-[#FFFDF7] border-[#243B8A]'
                        : 'bg-[#FFFDF7] text-[#252832] border-[#E6E1D6]'
                    }`}
                  >
                    <span
                      className={`font-mono text-[11px] font-bold px-1.5 py-0.5 rounded-sm shrink-0 tabular-nums ${
                        isCurrent
                          ? 'bg-[#FFD966] text-[#252832]'
                          : 'bg-[#F7F3E8] text-[#243B8A]'
                      }`}
                    >
                      {stage.step}
                    </span>
                    <div className="min-w-0">
                      <span
                        className={`block text-[9.5px] font-mono uppercase tracking-wider truncate ${
                          isCurrent ? 'text-[#FFD966]' : 'text-[#174D3A]'
                        }`}
                      >
                        {lang === 'mr' ? stage.pillarMr : stage.pillarEn}
                      </span>
                      <span className="block font-serif text-xs font-bold truncate">
                        {lang === 'mr' ? stage.titleMr : stage.titleEn}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main 12-Column Connected Ledger */}
          <div className="grid grid-cols-1 lg:grid-cols-12 lg:divide-x divide-[#E6E1D6] items-start">
            {/* Left 5 Columns (Desktop lg+): Tight Connected 6-Row Spine Index */}
            <motion.div
              data-testid="editorial-stages-spine-index"
              variants={stepperContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              className="hidden lg:flex lg:col-span-5 flex-col divide-y divide-[#E6E1D6] bg-[#FFFDF7]"
            >
              {ENRICHED_STAGES.map((stage, idx) => {
                const isCurrent = idx === activeIndex;
                const isCompleted = idx < activeIndex;
                return (
                  <motion.button
                    key={stage.step}
                    variants={stepperNodeVariants}
                    type="button"
                    data-testid={`editorial-stage-step-${stage.step}`}
                    onClick={() => handleSelectStage(idx)}
                    className={`akath-seq-step group relative text-left px-4 py-3 transition-colors cursor-pointer overflow-hidden ${
                      isCurrent
                        ? 'bg-[#F7F3E8]/95'
                        : isCompleted
                        ? 'bg-[#FFFDF7] hover:bg-[#F7F3E8]/55'
                        : 'bg-[#FFFDF7] hover:bg-[#F7F3E8]/45'
                    }`}
                  >
                    {/* Active Spine Indicator Bar */}
                    {isCurrent && (
                      <motion.div
                        layoutId="akath-stage-active-spine"
                        className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#243B8A] via-[#174D3A] to-[#EF6855]"
                        transition={{ type: 'spring', stiffness: 360, damping: 32 }}
                      />
                    )}

                    <div className="flex items-center justify-between gap-3 pl-1">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-sm shrink-0 flex items-center justify-center border transition-colors ${
                            isCurrent
                              ? 'bg-[#FFD966]/45 border-[#243B8A]'
                              : 'bg-[#F7F3E8] border-[#E6E1D6] group-hover:border-[#243B8A]/35'
                          }`}
                        >
                          <StageMiniIcon stepIndex={idx} isActive={isCurrent} />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`font-mono text-[10.5px] font-bold tabular-nums ${
                                isCurrent
                                  ? 'text-[#243B8A]'
                                  : isCompleted
                                  ? 'text-[#174D3A]'
                                  : 'text-[#525665]'
                              }`}
                            >
                              {stage.step} · {stage.roman}
                            </span>
                            <span className="text-[#E6E1D6]">|</span>
                            <span className="text-[10.5px] font-mono font-semibold text-[#174D3A] truncate">
                              {lang === 'mr' ? stage.pillarMr : stage.pillarEn}
                            </span>
                          </div>

                          <p
                            className={`text-sm font-serif font-bold truncate leading-snug ${
                              isCurrent ? 'text-[#243B8A]' : 'text-[#252832]'
                            }`}
                          >
                            {lang === 'mr' ? stage.titleMr : stage.titleEn}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`hidden xl:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded-sm border ${
                            isCurrent
                              ? 'bg-[#243B8A] text-[#FFFDF7] border-[#243B8A]'
                              : 'bg-[#F7F3E8] text-[#525665] border-[#E6E1D6]'
                          }`}
                        >
                          {stage.specCode}
                        </span>
                        <ArrowRight
                          className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                            isCurrent
                              ? 'text-[#EF6855] translate-x-0.5'
                              : 'text-[#525665]/40 group-hover:text-[#243B8A] group-hover:translate-x-0.5'
                          }`}
                        />
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>

            {/* Right 7 Columns: Compact Split-View Editorial Stage Spotlight */}
            <motion.div
              data-testid="editorial-stage-spotlight"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-7 bg-[#FFFDF7] flex flex-col"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStage.step}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col"
                >
                  {/* Top Dossier Metadata Strip */}
                  <div className="px-4 sm:px-6 py-2.5 bg-[#F7F3E8]/80 border-b border-[#E6E1D6] flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-[#243B8A] uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5 text-[#EF6855]" />
                        {lang === 'mr' ? activeStage.phaseMr : activeStage.phaseEn}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] font-mono">
                      <span className="px-2 py-0.5 rounded-sm bg-[#FFD966]/45 text-[#252832] font-bold">
                        {lang === 'mr'
                          ? `टप्पा ${activeStage.step} / ०६`
                          : `STAGE ${activeStage.step} / 06`}
                      </span>
                      <span className="text-[#525665] font-semibold">
                        {activeStage.specCode}
                      </span>
                    </div>
                  </div>

                  {/* Main Body: Side-by-Side Split Layout (Prose & Tight Checkpoints Left | Blueprint Right) */}
                  <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                    {/* Left 7 Cols inside Spotlight: Stage Title, Description & Tight Checkpoints Table */}
                    <div className="md:col-span-7 space-y-3.5">
                      <div className="space-y-1.5">
                        <h3 className="text-lg sm:text-2xl font-serif font-bold text-[#252832] leading-snug">
                          {lang === 'mr' ? activeStage.titleMr : activeStage.titleEn}
                        </h3>
                        <p className="text-xs sm:text-sm text-[#525665] leading-relaxed">
                          {lang === 'mr' ? activeStage.descMr : activeStage.descEn}
                        </p>
                      </div>

                      {/* Zero-Gap Bordered Editorial Checkpoints Ledger */}
                      <motion.div
                        variants={gridContainerVariants}
                        initial="hidden"
                        animate="visible"
                        className="rounded-sm border border-[#E6E1D6] bg-[#F7F3E8]/45 overflow-hidden"
                      >
                        <div className="px-3 py-1.5 bg-[#F7F3E8] border-b border-[#E6E1D6] flex items-center justify-between">
                          <span className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-[#243B8A]">
                            {lang === 'mr'
                              ? 'संपादकीय गुणवत्ता निकष'
                              : 'Editorial Quality Checkpoints'}
                          </span>
                          <span className="text-[10px] font-mono font-semibold text-[#174D3A]">
                            {lang === 'mr' ? activeStage.pillarMr : activeStage.pillarEn}
                          </span>
                        </div>

                        <ul className="divide-y divide-[#E6E1D6]/80">
                          {(lang === 'mr'
                            ? activeStage.checkpointsMr
                            : activeStage.checkpointsEn
                          ).map((point, i) => (
                            <motion.li
                              key={i}
                              variants={stepperNodeVariants}
                              className="px-3 py-2 flex items-start gap-2 text-xs sm:text-[13px] text-[#252832] leading-snug"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#174D3A] shrink-0 mt-0.5" />
                              <span>{point}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </motion.div>
                    </div>

                    {/* Right 5 Cols inside Spotlight: Compact Blueprint Specimen & Stage Deliverable */}
                    <div className="md:col-span-5 flex flex-col gap-3">
                      <div className="rounded-sm border border-[#E6E1D6] bg-[#F7F3E8]/75 p-3 sarvam-grid-lines flex items-center justify-center">
                        <StageCraftIllustration stepIndex={activeIndex} lang={lang} />
                      </div>

                      <div className="rounded-sm border border-[#243B8A]/20 bg-[#243B8A]/5 px-3.5 py-2.5">
                        <span className="block text-[10px] font-mono uppercase tracking-wider text-[#525665]">
                          {lang === 'mr' ? 'या टप्प्याची निष्पत्ती' : 'Stage Deliverable'}
                        </span>
                        <span className="mt-0.5 block text-xs sm:text-[13px] font-serif font-bold text-[#243B8A] leading-snug">
                          {lang === 'mr'
                            ? activeStage.deliverableMr
                            : activeStage.deliverableEn}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Compact Bottom Action & Quick-Jump Bar */}
                  <div className="px-4 sm:px-6 py-3 bg-[#F7F3E8]/55 border-t border-[#E6E1D6] flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5">
                      {ENRICHED_STAGES.map((s, idx) => (
                        <button
                          key={s.step}
                          type="button"
                          onClick={() => handleSelectStage(idx)}
                          aria-label={`Jump to stage ${s.step}`}
                          className={`px-2 py-0.5 rounded-sm font-mono text-[11px] font-bold transition-colors cursor-pointer ${
                            idx === activeIndex
                              ? 'bg-[#243B8A] text-[#FFFDF7]'
                              : 'bg-[#FFFDF7] text-[#525665] border border-[#E6E1D6] hover:border-[#243B8A]'
                          }`}
                        >
                          {s.step}
                        </button>
                      ))}
                    </div>

                    {onNavigate && (
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onNavigate('/submit-manuscript')}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-sm bg-[#EF6855] hover:bg-[#d95643] text-[#FFFDF7] text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>
                            {lang === 'mr' ? 'संहिता पाठवा' : 'Submit Manuscript'}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onNavigate('/books')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[#FFFDF7] hover:bg-[#F7F3E8] text-[#243B8A] border border-[#243B8A]/30 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>
                            {lang === 'mr' ? 'प्रकाशित ग्रंथ पहा' : 'Published Books'}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SixEditorialStages;
