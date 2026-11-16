import React, { useState, useEffect, useRef } from 'react';

interface EditorialRoomPixelStageProps {
  lang: 'mr' | 'en';
  onSelectTopic?: (topicKey: 'Manuscript Submission' | 'Book Enquiry' | 'Collaboration' | 'General Enquiry') => void;
}

/**
 * Genuine 16-bit Pixel-Art Interactive Editorial Office Environment
 * - Strictly crisp pixel clusters (shapeRendering="crispEdges")
 * - Limited retro publishing house palette (#F5EBDD, #E6DFCE, #78845A, #354B37, #997451, #B86F50, #E8BC69, #302C25, #243B8A, #FFD966, #EF6855)
 * - Interactive desk lamp (switches on automatically on scroll into view + clickable toggle)
 * - Interactive desk envelope (hover/click reveals editorial note)
 * - Interactive 16-bit tortoise walking past the bookshelf & pausing to look toward the visitor
 */
export const EditorialRoomPixelStage: React.FC<EditorialRoomPixelStageProps> = ({
  lang,
  onSelectTopic,
}) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const [lampOn, setLampOn] = useState(false);
  const [envelopeHovered, setEnvelopeHovered] = useState(false);
  const [tortoiseGreeted, setTortoiseGreeted] = useState(false);
  const [windowTime, setWindowTime] = useState<'morning' | 'golden'>('golden');

  // Switch the desk lamp on automatically when the user reaches the section
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      setLampOn(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setLampOn(true);
          }
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={stageRef}
      data-testid="contact-editorial-room-scene"
      className="relative rounded-2xl border-2 border-[#302C25] bg-[#26211B] shadow-[0_20px_50px_-20px_rgba(37,40,50,0.35)] overflow-hidden select-none"
    >
      {/* Top 16-Bit Scene Status & Interactive Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-[#302C25] border-b border-[#4A4238] text-[#F5EBDD] text-[12px] font-mono">
        <div className="flex items-center gap-2">
          <span
            className={`inline-block w-2 h-2 ${
              lampOn ? 'bg-[#FFD966]' : 'bg-[#78845A]'
            }`}
          />
          <span className="tracking-wider uppercase text-[#E8BC69]">
            {lang === 'mr'
              ? 'संपादकीय कक्ष · नांदेड कार्यालय'
              : 'THE EDITORIAL ROOM · NANDेड STUDIO'}
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11.5px]">
          <button
            type="button"
            data-testid="editorial-room-lamp-toggle"
            onClick={() => setLampOn((prev) => !prev)}
            className="text-[#F5EBDD]/90 hover:text-[#FFD966] transition-colors cursor-pointer focus:outline-none focus-visible:underline"
          >
            {lampOn
              ? lang === 'mr'
                ? 'दिवा: चालू (बंद करा)'
                : 'Desk Lamp: ON'
              : lang === 'mr'
                ? 'दिवा: बंद (चालू करा)'
                : 'Desk Lamp: OFF'}
          </button>
          <span aria-hidden="true" className="text-[#78845A]">
            ·
          </span>
          <button
            type="button"
            onClick={() =>
              setWindowTime((prev) => (prev === 'golden' ? 'morning' : 'golden'))
            }
            className="text-[#F5EBDD]/90 hover:text-[#FFD966] transition-colors cursor-pointer focus:outline-none focus-visible:underline"
          >
            {windowTime === 'golden'
              ? lang === 'mr'
                ? 'खिडकी: संध्याकाळ'
                : 'Window: Dusk Sky'
              : lang === 'mr'
                ? 'खिडकी: सकाळ'
                : 'Window: Morning Sky'}
          </button>
        </div>
      </div>

      {/* Main 16-Bit Pixel-Art SVG Canvas (320 x 176 native pixel grid scaled crisply) */}
      <div className="relative w-full aspect-[16/9] sm:aspect-[20/10] bg-[#2D261E]">
        <svg
          viewBox="0 0 320 160"
          className="w-full h-full block"
          shapeRendering="crispEdges"
          role="img"
          aria-label={
            lang === 'mr'
              ? 'अकथ प्रकाशनचा १६-बिट पिक्सेल-आर्ट संपादकीय कक्ष: लाकडी टेबल, जुने टाईपरायटर, हस्तलिखितांचे गठ्ठे, मराठी पुस्तकांचे कपाट, टेबल लॅम्प, खिडकी आणि कासव.'
              : '16-bit pixel-art editorial office of Akath Prakashan featuring a wooden writing desk, vintage typewriter, stacks of manuscripts, bookshelves filled with Marathi books, warm desk lamp, window with drifting clouds, and tortoise mascot.'
          }
        >
          {/* ==============================================================
              1. ROOM WALL & FLOOR BACKGROUND (16-Bit Stepped Plaster & Wood)
              ============================================================== */}
          {/* Warm Plaster Wall */}
          <rect x="0" y="0" width="320" height="124" fill="#E6DAC3" />
          {/* Subtle Wainscoting / Lower Wood Paneling */}
          <rect x="0" y="96" width="320" height="28" fill="#C8B696" />
          <rect x="0" y="96" width="320" height="2" fill="#997451" />
          {/* Vertical Panel Grooves */}
          <rect x="32" y="98" width="1" height="26" fill="#B29D7B" />
          <rect x="64" y="98" width="1" height="26" fill="#B29D7B" />
          <rect x="96" y="98" width="1" height="26" fill="#B29D7B" />
          <rect x="128" y="98" width="1" height="26" fill="#B29D7B" />
          <rect x="160" y="98" width="1" height="26" fill="#B29D7B" />
          <rect x="192" y="98" width="1" height="26" fill="#B29D7B" />
          <rect x="224" y="98" width="1" height="26" fill="#B29D7B" />
          <rect x="256" y="98" width="1" height="26" fill="#B29D7B" />
          <rect x="288" y="98" width="1" height="26" fill="#B29D7B" />

          {/* Baseboard Molding */}
          <rect x="0" y="122" width="320" height="4" fill="#654931" />
          <rect x="0" y="125" width="320" height="1" fill="#302C25" />

          {/* Wooden Floorboards */}
          <rect x="0" y="126" width="320" height="34" fill="#855E3E" />
          <rect x="0" y="134" width="320" height="1" fill="#654931" />
          <rect x="0" y="143" width="320" height="1" fill="#654931" />
          <rect x="0" y="152" width="320" height="1" fill="#654931" />
          {/* Woven Editorial Rug under Desk */}
          <rect x="86" y="138" width="156" height="16" fill="#9C4134" />
          <rect x="90" y="140" width="148" height="12" fill="#B86F50" />
          <rect x="94" y="142" width="140" height="8" fill="#E8BC69" />
          <rect x="98" y="144" width="132" height="4" fill="#243B8A" />
          {/* Rug Fringes */}
          <rect x="83" y="139" width="3" height="2" fill="#F5EBDD" />
          <rect x="83" y="143" width="3" height="2" fill="#F5EBDD" />
          <rect x="83" y="147" width="3" height="2" fill="#F5EBDD" />
          <rect x="83" y="151" width="3" height="2" fill="#F5EBDD" />
          <rect x="242" y="139" width="3" height="2" fill="#F5EBDD" />
          <rect x="242" y="143" width="3" height="2" fill="#F5EBDD" />
          <rect x="242" y="147" width="3" height="2" fill="#F5EBDD" />
          <rect x="242" y="151" width="3" height="2" fill="#F5EBDD" />

          {/* ==============================================================
              2. WINDOW WITH SLOWLY CHANGING OUTDOOR LANDSCAPE & CLOUDS
              ============================================================== */}
          <g transform="translate(216, 14)">
            {/* Outer Wooden Window Frame */}
            <rect x="0" y="0" width="84" height="68" fill="#4E3622" />
            <rect x="2" y="2" width="80" height="64" fill="#7D5838" />

            {/* Clip Path for Outdoor Landscape */}
            <clipPath id="editorial-window-clip">
              <rect x="5" y="5" width="74" height="58" />
            </clipPath>

            <g clipPath="url(#editorial-window-clip)">
              {/* Stepped Sky Bands */}
              <rect
                x="5"
                y="5"
                width="74"
                height="20"
                fill={windowTime === 'golden' ? '#D98A5C' : '#9CC4E4'}
              />
              <rect
                x="5"
                y="25"
                width="74"
                height="18"
                fill={windowTime === 'golden' ? '#E8BC69' : '#C5E0F3'}
              />
              <rect
                x="5"
                y="43"
                width="74"
                height="20"
                fill={windowTime === 'golden' ? '#F5EBDD' : '#EAF4FB'}
              />

              {/* Pixel Sun / Moon Disc */}
              <rect
                x="56"
                y="12"
                width="10"
                height="10"
                fill={windowTime === 'golden' ? '#FFD966' : '#FFFDF7'}
              />
              <rect
                x="58"
                y="10"
                width="6"
                height="14"
                fill={windowTime === 'golden' ? '#FFD966' : '#FFFDF7'}
              />
              <rect
                x="54"
                y="14"
                width="14"
                height="6"
                fill={windowTime === 'golden' ? '#FFD966' : '#FFFDF7'}
              />

              {/* Parallax Drifting Pixel Clouds (Layer 1 - Far) */}
              <g className="editorial-room-clouds-far">
                <rect x="10" y="14" width="16" height="3" fill="#FFFDF7" />
                <rect x="13" y="12" width="10" height="2" fill="#FFFDF7" />
                <rect x="46" y="21" width="14" height="3" fill="#FFFDF7" />
                <rect x="49" y="19" width="8" height="2" fill="#FFFDF7" />
              </g>

              {/* Parallax Drifting Pixel Clouds (Layer 2 - Near) */}
              <g className="editorial-room-clouds-near">
                <rect x="24" y="27" width="20" height="4" fill="#F5EBDD" />
                <rect x="28" y="24" width="12" height="3" fill="#FFFDF7" />
              </g>

              {/* Distant Sahyadri Ridges */}
              <rect x="5" y="46" width="74" height="17" fill="#78845A" />
              <rect x="10" y="43" width="18" height="3" fill="#78845A" />
              <rect x="14" y="40" width="10" height="3" fill="#78845A" />
              <rect x="42" y="42" width="24" height="4" fill="#78845A" />
              <rect x="48" y="39" width="14" height="3" fill="#78845A" />

              {/* Foreground Tree Canopy & Hills */}
              <rect x="5" y="53" width="74" height="10" fill="#354B37" />
              <rect x="8" y="49" width="14" height="4" fill="#354B37" />
              <rect x="30" y="50" width="18" height="3" fill="#354B37" />
              <rect x="58" y="48" width="16" height="5" fill="#354B37" />
            </g>

            {/* Window Mullions / Crossbars */}
            <rect x="41" y="5" width="2" height="58" fill="#4E3622" />
            <rect x="5" y="33" width="74" height="2" fill="#4E3622" />
            {/* Window Sill */}
            <rect x="-3" y="66" width="90" height="4" fill="#5D4028" />
            <rect x="-2" y="66" width="88" height="2" fill="#997451" />

            {/* Small Terracotta Plant on Window Sill */}
            <rect x="10" y="60" width="8" height="6" fill="#B86F50" />
            <rect x="9" y="59" width="10" height="2" fill="#9C4134" />
            <rect x="12" y="55" width="4" height="4" fill="#354B37" />
            <rect x="10" y="56" width="2" height="2" fill="#78845A" />
            <rect x="16" y="54" width="3" height="3" fill="#78845A" />
          </g>

          {/* ==============================================================
              3. BOOKSHELVES FILLED WITH MARATHI BOOKS (LEFT SIDE OF ROOM)
              ============================================================== */}
          <g transform="translate(14, 12)">
            {/* Bookshelf Outer Timber Frame */}
            <rect x="0" y="0" width="76" height="112" fill="#4E3622" />
            <rect x="3" y="3" width="70" height="106" fill="#362417" />

            {/* Shelf Planks */}
            <rect x="2" y="26" width="72" height="3" fill="#855E3E" />
            <rect x="2" y="52" width="72" height="3" fill="#855E3E" />
            <rect x="2" y="78" width="72" height="3" fill="#855E3E" />
            <rect x="2" y="104" width="72" height="4" fill="#855E3E" />

            {/* ROW 1 BOOKS (Top Shelf) */}
            <rect x="6" y="8" width="5" height="18" fill="#EF6855" />
            <rect x="7" y="10" width="3" height="2" fill="#FFD966" />
            <rect x="12" y="6" width="6" height="20" fill="#243B8A" />
            <rect x="13" y="9" width="4" height="2" fill="#F5EBDD" />
            <rect x="19" y="9" width="4" height="17" fill="#78845A" />
            <rect x="24" y="7" width="6" height="19" fill="#E8BC69" />
            <rect x="31" y="10" width="5" height="16" fill="#9C4134" />
            {/* Animated Book Spine (Subtle environmental pulse) */}
            <g className="editorial-room-book-glint">
              <rect x="37" y="6" width="6" height="20" fill="#243B8A" />
              <rect x="38" y="8" width="4" height="3" fill="#FFD966" />
            </g>
            <rect x="44" y="9" width="5" height="17" fill="#B86F50" />
            <rect x="50" y="7" width="6" height="19" fill="#354B37" />
            {/* Tilted Book */}
            <rect x="58" y="9" width="5" height="17" fill="#E8BC69" />
            <rect x="64" y="11" width="5" height="15" fill="#EF6855" />

            {/* ROW 2 BOOKS (Second Shelf) */}
            <rect x="6" y="33" width="6" height="19" fill="#354B37" />
            <rect x="13" y="35" width="5" height="17" fill="#E8BC69" />
            <rect x="19" y="32" width="7" height="20" fill="#9C4134" />
            <rect x="21" y="35" width="3" height="4" fill="#F5EBDD" />
            <rect x="27" y="34" width="5" height="18" fill="#243B8A" />
            <rect x="33" y="36" width="4" height="16" fill="#78845A" />
            {/* Small Horizontal Stack of Marathi Lit */}
            <rect x="40" y="48" width="16" height="4" fill="#EF6855" />
            <rect x="41" y="44" width="14" height="4" fill="#F5EBDD" />
            <rect x="42" y="40" width="13" height="4" fill="#243B8A" />
            <rect x="58" y="33" width="6" height="19" fill="#B86F50" />
            <rect x="65" y="35" width="5" height="17" fill="#E8BC69" />

            {/* ROW 3 BOOKS (Third Shelf) */}
            <rect x="6" y="59" width="7" height="19" fill="#243B8A" />
            <rect x="8" y="62" width="3" height="2" fill="#FFD966" />
            <rect x="14" y="61" width="5" height="17" fill="#EF6855" />
            <rect x="20" y="58" width="6" height="20" fill="#78845A" />
            <rect x="27" y="60" width="5" height="18" fill="#E8BC69" />
            <rect x="33" y="59" width="6" height="19" fill="#9C4134" />
            <rect x="40" y="62" width="5" height="16" fill="#354B37" />
            <rect x="46" y="58" width="7" height="20" fill="#B86F50" />
            <rect x="48" y="61" width="3" height="3" fill="#F5EBDD" />
            <rect x="54" y="60" width="5" height="18" fill="#243B8A" />
            <rect x="60" y="61" width="6" height="17" fill="#E8BC69" />

            {/* ROW 4 BOOKS (Bottom Shelf) */}
            <rect x="6" y="85" width="8" height="19" fill="#9C4134" />
            <rect x="15" y="86" width="6" height="18" fill="#243B8A" />
            <rect x="22" y="84" width="7" height="20" fill="#E8BC69" />
            <rect x="30" y="87" width="5" height="17" fill="#354B37" />
            <rect x="36" y="85" width="6" height="19" fill="#EF6855" />
            {/* Archival Box on Bottom Shelf */}
            <rect x="45" y="88" width="22" height="16" fill="#C8B696" />
            <rect x="45" y="88" width="22" height="3" fill="#997451" />
            <rect x="52" y="94" width="8" height="4" fill="#F5EBDD" />
          </g>

          {/* ==============================================================
              4. HANDWRITTEN EDITORIAL NOTES BOARD (CENTER WALL)
              ============================================================== */}
          <g transform="translate(104, 16)">
            {/* Corkboard Frame */}
            <rect x="0" y="0" width="96" height="46" fill="#5D4028" />
            <rect x="2" y="2" width="92" height="42" fill="#997451" />

            {/* Pinned Note 1 (Cream Proof Sheet) */}
            <rect x="7" y="6" width="24" height="28" fill="#F5EBDD" />
            <rect x="18" y="5" width="2" height="2" fill="#EF6855" />
            <rect x="10" y="11" width="16" height="1" fill="#243B8A" />
            <rect x="10" y="14" width="18" height="1" fill="#302C25" />
            <rect x="10" y="17" width="14" height="1" fill="#302C25" />
            <rect x="10" y="20" width="17" height="1" fill="#302C25" />
            <rect x="10" y="25" width="10" height="1" fill="#EF6855" />

            {/* Pinned Note 2 (Amber Editorial Schedule) */}
            <rect x="36" y="8" width="26" height="22" fill="#FFD966" />
            <rect x="48" y="7" width="2" height="2" fill="#243B8A" />
            <rect x="39" y="13" width="18" height="1" fill="#302C25" />
            <rect x="39" y="16" width="15" height="1" fill="#302C25" />
            <rect x="39" y="19" width="19" height="1" fill="#302C25" />
            <rect x="39" y="23" width="12" height="1" fill="#9C4134" />

            {/* Pinned Note 3 (Postcard / Cover Sketch) */}
            <rect x="67" y="6" width="21" height="26" fill="#FFFDF7" />
            <rect x="76" y="5" width="2" height="2" fill="#354B37" />
            <rect x="70" y="10" width="15" height="12" fill="#243B8A" />
            <rect x="73" y="13" width="9" height="6" fill="#E8BC69" />
            <rect x="70" y="25" width="14" height="1" fill="#302C25" />
            <rect x="70" y="28" width="10" height="1" fill="#78845A" />
          </g>

          {/* ==============================================================
              5. WARM DESK LAMP LIGHT CONE (When Switched On)
              ============================================================== */}
          {lampOn && (
            <g
              data-testid="editorial-room-lamp-glow"
              className="editorial-room-lamp-cone"
              opacity="0.28"
            >
              {/* Stepped 16-bit Pixel Light Pyramid */}
              <rect x="116" y="64" width="26" height="6" fill="#FFD966" />
              <rect x="110" y="70" width="38" height="8" fill="#FFD966" />
              <rect x="102" y="78" width="56" height="10" fill="#FFD966" />
              <rect x="94" y="88" width="74" height="12" fill="#FFD966" />
            </g>
          )}

          {/* ==============================================================
              6. WOODEN WRITING DESK, VINTAGE TYPEWRITER, MANUSCRIPTS, LAMP
              ============================================================== */}
          <g transform="translate(96, 56)">
            {/* Desk Surface & Front Apron */}
            <rect x="0" y="40" width="136" height="5" fill="#997451" />
            <rect x="2" y="45" width="132" height="14" fill="#654931" />
            <rect x="4" y="47" width="36" height="10" fill="#4E3622" />
            <rect x="46" y="47" width="44" height="10" fill="#4E3622" />
            <rect x="96" y="47" width="36" height="10" fill="#4E3622" />
            {/* Brass Drawer Pulls */}
            <rect x="20" y="51" width="4" height="2" fill="#FFD966" />
            <rect x="66" y="51" width="4" height="2" fill="#FFD966" />
            <rect x="112" y="51" width="4" height="2" fill="#FFD966" />
            {/* Desk Legs */}
            <rect x="6" y="59" width="6" height="29" fill="#4E3622" />
            <rect x="124" y="59" width="6" height="29" fill="#4E3622" />
            <rect x="16" y="59" width="4" height="25" fill="#362417" />
            <rect x="116" y="59" width="4" height="25" fill="#362417" />

            {/* --- A. WARM BRASS & GREEN BANKER'S DESK LAMP (Left of Desk) --- */}
            <g
              transform="translate(14, 2)"
              onClick={() => setLampOn((prev) => !prev)}
              className="cursor-pointer"
            >
              {/* Lamp Base */}
              <rect x="8" y="34" width="14" height="4" fill="#D4A445" />
              <rect x="11" y="32" width="8" height="2" fill="#E8BC69" />
              {/* Brass Neck */}
              <rect x="14" y="12" width="2" height="20" fill="#D4A445" />
              <rect x="14" y="10" width="8" height="2" fill="#D4A445" />
              {/* Classic Green Shade */}
              <rect x="12" y="4" width="18" height="3" fill="#354B37" />
              <rect x="10" y="7" width="22" height="4" fill="#49684C" />
              {/* Warm Bulb Filament */}
              <rect
                x="14"
                y="11"
                width="14"
                height="2"
                fill={lampOn ? '#FFD966' : '#8E887C'}
              />
            </g>

            {/* --- B. VINTAGE TYPEWRITER (Center of Desk) --- */}
            <g transform="translate(52, 12)">
              {/* Paper Sheet in Platen Roller */}
              <rect x="8" y="0" width="18" height="14" fill="#FFFDF7" />
              {/* Typed Marathi / Editorial Lines on Paper */}
              <rect x="11" y="3" width="12" height="1" fill="#302C25" />
              <rect x="11" y="6" width="10" height="1" fill="#243B8A" />
              <rect x="11" y="9" width="13" height="1" fill="#302C25" />
              {/* Platen Roller & Carriage Knobs */}
              <rect x="3" y="11" width="28" height="3" fill="#302C25" />
              <rect x="1" y="11" width="2" height="3" fill="#997451" />
              <rect x="31" y="11" width="2" height="3" fill="#997451" />
              {/* Typewriter Cast-Iron Body */}
              <rect x="4" y="14" width="26" height="8" fill="#243B8A" />
              <rect x="2" y="20" width="30" height="8" fill="#1B2C68" />
              {/* Gold Ribbon Spool Covers */}
              <rect x="7" y="15" width="5" height="3" fill="#E8BC69" />
              <rect x="22" y="15" width="5" height="3" fill="#E8BC69" />
              {/* Animated Typewriter Keys (Subtle stepped motion) */}
              <g className="editorial-room-typewriter-keys">
                <rect x="5" y="23" width="3" height="2" fill="#F5EBDD" />
                <rect x="10" y="23" width="3" height="2" fill="#F5EBDD" />
                <rect x="15" y="23" width="3" height="2" fill="#FFD966" />
                <rect x="20" y="23" width="3" height="2" fill="#F5EBDD" />
                <rect x="25" y="23" width="3" height="2" fill="#F5EBDD" />
              </g>
              <rect x="8" y="26" width="18" height="2" fill="#E6DFCE" />
            </g>

            {/* --- C. STACK OF MANUSCRIPTS WITH BREEZE-TOUCHED TOP SHEET --- */}
            <g transform="translate(92, 22)">
              {/* Lower Manuscript Bundle tied with Red Twine */}
              <rect x="0" y="12" width="24" height="6" fill="#E6DFCE" />
              <rect x="1" y="8" width="22" height="4" fill="#F5EBDD" />
              <rect x="0" y="14" width="24" height="1" fill="#997451" />
              <rect x="11" y="8" width="2" height="10" fill="#EF6855" />
              {/* Top Paper Sheet Moving Slightly in the Breeze */}
              <g className="editorial-room-paper-breeze">
                <rect x="2" y="5" width="21" height="3" fill="#FFFDF7" />
                <rect x="5" y="6" width="14" height="1" fill="#243B8A" />
              </g>
            </g>

            {/* --- D. SMALL INTERACTIVE ENVELOPE NEAR DESK EDGE --- */}
            <g
              transform="translate(34, 31)"
              data-testid="editorial-room-desk-envelope"
              onMouseEnter={() => setEnvelopeHovered(true)}
              onMouseLeave={() => setEnvelopeHovered(false)}
              onClick={() => {
                setEnvelopeHovered((prev) => !prev);
                onSelectTopic?.('Book Enquiry');
              }}
              className="cursor-pointer"
            >
              <rect
                x="0"
                y="0"
                width="14"
                height="9"
                fill={envelopeHovered ? '#FFD966' : '#FFFDF7'}
              />
              <rect x="1" y="1" width="12" height="7" fill="#F5EBDD" />
              {/* Envelope Flap & Wax Seal */}
              <rect x="2" y="2" width="10" height="2" fill="#E6DFCE" />
              <rect x="6" y="4" width="2" height="2" fill="#EF6855" />
            </g>
          </g>

          {/* ==============================================================
              7. TORTOISE MASCOT WALKING SLOWLY PAST BOOKSHELF
              ============================================================== */}
          <g
            data-testid="editorial-room-tortoise"
            className={`editorial-room-tortoise-walker cursor-pointer ${
              tortoiseGreeted ? 'is-looking' : ''
            }`}
            onClick={() => setTortoiseGreeted((prev) => !prev)}
            onMouseEnter={() => setTortoiseGreeted(true)}
            onMouseLeave={() => setTortoiseGreeted(false)}
          >
            <g transform="translate(26, 124)">
              {/* Shadow under Tortoise */}
              <rect x="2" y="14" width="24" height="2" fill="#4E3622" />
              {/* Legs (Animated stepped gait) */}
              <g className="editorial-room-tortoise-legs-a">
                <rect x="4" y="11" width="4" height="4" fill="#354B37" />
                <rect x="17" y="11" width="4" height="4" fill="#354B37" />
              </g>
              <g className="editorial-room-tortoise-legs-b">
                <rect x="8" y="11" width="3" height="4" fill="#49684C" />
                <rect x="21" y="11" width="3" height="4" fill="#49684C" />
              </g>
              {/* Tiny Tail */}
              <rect x="0" y="9" width="3" height="2" fill="#354B37" />
              {/* Domed Pixel Shell */}
              <rect x="3" y="4" width="20" height="7" fill="#997451" />
              <rect x="5" y="2" width="16" height="2" fill="#B86F50" />
              {/* Shell Pattern Pixels */}
              <rect x="7" y="5" width="4" height="3" fill="#E8BC69" />
              <rect x="13" y="5" width="4" height="3" fill="#E8BC69" />
              <rect x="3" y="10" width="20" height="2" fill="#E8BC69" />
              {/* Miniature Book Carried on Shell */}
              <rect x="8" y="0" width="10" height="2" fill="#EF6855" />
              <rect x="9" y="-1" width="8" height="1" fill="#FFFDF7" />
              {/* Tortoise Head (Looks toward visitor on pause or hover) */}
              <g className="editorial-room-tortoise-head">
                <rect x="23" y="5" width="6" height="5" fill="#49684C" />
                <rect x="24" y="4" width="4" height="1" fill="#78845A" />
                {/* Pixel Eye */}
                <rect x="26" y="6" width="2" height="2" fill="#FFFDF7" />
                <rect x="27" y="6" width="1" height="2" fill="#302C25" />
              </g>
            </g>
          </g>
        </svg>

        {/* Interactive Envelope Tooltip Overlay */}
        {envelopeHovered && (
          <div
            data-testid="editorial-room-envelope-note"
            className="absolute left-4 bottom-4 sm:left-8 sm:bottom-6 max-w-[320px] bg-[#FFFDF7] border-2 border-[#302C25] px-3.5 py-2.5 shadow-[4px_4px_0px_#302C25] text-[12.5px] text-[#252832]"
          >
            <p className="font-mono text-[10.5px] uppercase tracking-wider text-[#243B8A] font-semibold mb-0.5">
              {lang === 'mr' ? 'टेबलावरील पत्र' : 'DESK CORRESPONDENCE'}
            </p>
            <p className="leading-snug">
              {lang === 'mr'
                ? '“तुमचा प्रत्येक शब्द आणि हस्तलिखित आमच्या संपादकीय मेजावर काळजीपूर्वक वाचले जाते.”'
                : '“Every letter and manuscript that arrives on this desk is read personally by our editors.”'}
            </p>
          </div>
        )}

        {/* Interactive Tortoise Greeting Bubble */}
        {tortoiseGreeted && !envelopeHovered && (
          <div className="absolute right-4 bottom-4 sm:right-6 sm:bottom-6 bg-[#FFFDF7] border-2 border-[#302C25] px-3 py-2 shadow-[4px_4px_0px_#302C25] text-[12px] text-[#252832] font-mono">
            {lang === 'mr'
              ? 'कासव थांबून तुमच्याकडे पाहत आहे... संथ पण अर्थपूर्ण प्रवास!'
              : 'The tortoise pauses by the bookshelf and looks toward you.'}
          </div>
        )}
      </div>

      {/* Bottom Interactive Legend Strip */}
      <div className="px-4 py-2.5 bg-[#26211B] border-t border-[#4A4238] flex flex-wrap items-center justify-between gap-2 text-[12px] text-[#E6DAC3]">
        <span>
          {lang === 'mr'
            ? 'संवादासाठी टिप: दिवा लावण्यासाठी लॅम्पवर क्लिक करा · संदेश पाहण्यासाठी टेबलावरील पत्रावर माऊस न्या.'
            : 'Interactive Room: Click the desk lamp to toggle light · Hover the envelope on the desk · Watch the tortoise by the shelf.'}
        </span>
        <span className="font-mono text-[11px] text-[#E8BC69]">
          16-BIT EDITORIAL STUDIO
        </span>
      </div>
    </div>
  );
};

/**
 * 4 Custom 16-Bit Pixel-Art Mini-Scenes for Contact Destinations ("Choose Your Conversation")
 */
export const DestinationPixelScene: React.FC<{
  kind: 'authors' | 'readers' | 'partners' | 'general';
}> = ({ kind }) => {
  return (
    <div className="w-16 h-16 rounded-xl bg-[#F5EBDD] border-2 border-[#302C25] shadow-[3px_3px_0px_#302C25] flex items-center justify-center shrink-0 overflow-hidden">
      <svg
        viewBox="0 0 32 32"
        className="w-12 h-12 block"
        shapeRendering="crispEdges"
        aria-hidden="true"
      >
        {kind === 'authors' && (
          /* 01 — FOR AUTHORS: Manuscript stack & fountain pen */
          <g>
            {/* Manuscript Stack */}
            <rect x="4" y="20" width="18" height="5" fill="#C8B696" />
            <rect x="5" y="10" width="18" height="11" fill="#FFFDF7" />
            <rect x="5" y="10" width="18" height="1" fill="#997451" />
            {/* Handwritten Lines */}
            <rect x="8" y="13" width="12" height="1" fill="#243B8A" />
            <rect x="8" y="15" width="10" height="1" fill="#302C25" />
            <rect x="8" y="17" width="11" height="1" fill="#302C25" />
            {/* Red Editorial Twine */}
            <rect x="5" y="22" width="18" height="1" fill="#EF6855" />
            {/* Fountain Pen & Nib */}
            <rect x="22" y="6" width="3" height="12" fill="#243B8A" />
            <rect x="22" y="9" width="3" height="2" fill="#E8BC69" />
            <rect x="23" y="18" width="2" height="3" fill="#FFD966" />
            <rect x="23" y="21" width="1" height="2" fill="#302C25" />
          </g>
        )}

        {kind === 'readers' && (
          /* 02 — FOR READERS: Open book & ribbon bookmark */
          <g>
            {/* Open Book Cover */}
            <rect x="3" y="9" width="26" height="16" fill="#243B8A" />
            {/* Left & Right Cream Pages */}
            <rect x="5" y="8" width="10" height="15" fill="#FFFDF7" />
            <rect x="17" y="8" width="10" height="15" fill="#F5EBDD" />
            {/* Center Spine */}
            <rect x="15" y="8" width="2" height="16" fill="#997451" />
            {/* Page Text Pixels */}
            <rect x="7" y="11" width="6" height="1" fill="#302C25" />
            <rect x="7" y="14" width="6" height="1" fill="#302C25" />
            <rect x="7" y="17" width="5" height="1" fill="#302C25" />
            <rect x="19" y="11" width="6" height="1" fill="#302C25" />
            <rect x="19" y="14" width="6" height="1" fill="#302C25" />
            {/* Hanging Red Ribbon Bookmark */}
            <rect x="15" y="18" width="2" height="9" fill="#EF6855" />
            <rect x="14" y="26" width="1" height="2" fill="#EF6855" />
            <rect x="17" y="26" width="1" height="2" fill="#EF6855" />
          </g>
        )}

        {kind === 'partners' && (
          /* 03 — FOR BOOKSELLERS & PARTNERS: Stacked books & small storefront awning */
          <g>
            {/* Storefront Awning */}
            <rect x="4" y="5" width="24" height="3" fill="#302C25" />
            <rect x="4" y="8" width="4" height="4" fill="#EF6855" />
            <rect x="8" y="8" width="4" height="4" fill="#FFFDF7" />
            <rect x="12" y="8" width="4" height="4" fill="#EF6855" />
            <rect x="16" y="8" width="4" height="4" fill="#FFFDF7" />
            <rect x="20" y="8" width="4" height="4" fill="#EF6855" />
            <rect x="24" y="8" width="4" height="4" fill="#FFFDF7" />
            {/* Storefront Window & Stacked Books */}
            <rect x="6" y="12" width="20" height="14" fill="#997451" />
            <rect x="8" y="14" width="16" height="10" fill="#E8BC69" />
            {/* Stacked Books inside Display */}
            <rect x="10" y="20" width="12" height="3" fill="#243B8A" />
            <rect x="11" y="17" width="10" height="3" fill="#354B37" />
            <rect x="12" y="15" width="8" height="2" fill="#EF6855" />
          </g>
        )}

        {kind === 'general' && (
          /* 04 — GENERAL ENQUIRIES: Envelope & handwritten letter */
          <g>
            {/* Rising Letter Sheet */}
            <rect x="8" y="5" width="16" height="12" fill="#FFFDF7" />
            <rect x="10" y="8" width="10" height="1" fill="#243B8A" />
            <rect x="10" y="11" width="12" height="1" fill="#302C25" />
            {/* Pixel Envelope Body */}
            <rect x="5" y="13" width="22" height="13" fill="#E8BC69" />
            <rect x="6" y="14" width="20" height="11" fill="#F5EBDD" />
            {/* Envelope Flap Lines */}
            <rect x="6" y="14" width="4" height="2" fill="#C8B696" />
            <rect x="22" y="14" width="4" height="2" fill="#C8B696" />
            <rect x="10" y="16" width="12" height="2" fill="#C8B696" />
            {/* Red Wax Seal */}
            <rect x="14" y="17" width="4" height="4" fill="#EF6855" />
            <rect x="15" y="18" width="2" height="2" fill="#FFD966" />
          </g>
        )}
      </svg>
    </div>
  );
};

/**
 * Section 7 — THE TORTOISE'S LITTLE MOMENT
 * Interactive 16-bit pixel-art tortoise carrying a tiny envelope toward the editorial desk.
 * Clicking the envelope opens it and reveals:
 * "Good stories travel slowly, but they always find their readers."
 */
export const TortoiseEnvelopeMoment: React.FC<{ lang: 'mr' | 'en' }> = ({
  lang,
}) => {
  const [envelopeOpen, setEnvelopeOpen] = useState(false);

  return (
    <section
      data-testid="contact-tortoise-envelope-moment"
      className="mt-16 pt-12 border-t border-[#E6DFCE]"
    >
      <div className="rounded-2xl border-2 border-[#302C25] bg-[#F5EBDD] p-6 sm:p-8 shadow-[6px_6px_0px_#302C25]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Interactive Pixel Tortoise Courier Stage */}
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <button
              type="button"
              data-testid="tortoise-envelope-trigger"
              onClick={() => setEnvelopeOpen((prev) => !prev)}
              aria-expanded={envelopeOpen}
              className="group relative w-44 h-24 rounded-xl bg-[#26211B] border-2 border-[#302C25] flex items-center justify-center overflow-hidden cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#243B8A]"
              title={
                lang === 'mr'
                  ? 'कासवाजवळील पत्र उघडण्यासाठी क्लिक करा'
                  : 'Click to open the envelope carried by the tortoise'
              }
            >
              <svg
                viewBox="0 0 110 56"
                className="w-full h-full block"
                shapeRendering="crispEdges"
                aria-hidden="true"
              >
                {/* Floor Line */}
                <rect x="0" y="44" width="110" height="12" fill="#4E3622" />
                <rect x="0" y="44" width="110" height="2" fill="#997451" />

                {/* Corner of Editorial Desk on Right */}
                <rect x="84" y="24" width="22" height="4" fill="#997451" />
                <rect x="86" y="28" width="18" height="16" fill="#654931" />

                {/* 16-Bit Tortoise Carrying Envelope */}
                <g transform="translate(18, 22)" className="editorial-courier-tortoise">
                  {/* Legs */}
                  <rect x="6" y="18" width="4" height="4" fill="#354B37" />
                  <rect x="13" y="18" width="4" height="4" fill="#49684C" />
                  <rect x="24" y="18" width="4" height="4" fill="#354B37" />
                  <rect x="31" y="18" width="4" height="4" fill="#49684C" />
                  {/* Shell */}
                  <rect x="5" y="9" width="30" height="9" fill="#997451" />
                  <rect x="8" y="6" width="24" height="3" fill="#B86F50" />
                  <rect x="11" y="10" width="6" height="4" fill="#E8BC69" />
                  <rect x="21" y="10" width="6" height="4" fill="#E8BC69" />
                  <rect x="5" y="16" width="30" height="2" fill="#E8BC69" />
                  {/* Head */}
                  <rect x="35" y="10" width="9" height="7" fill="#49684C" />
                  <rect x="40" y="12" width="2" height="2" fill="#FFFDF7" />
                  <rect x="41" y="12" width="1" height="2" fill="#302C25" />

                  {/* Tiny Pixel Envelope on Shell */}
                  <g
                    transform={
                      envelopeOpen ? 'translate(10, -8)' : 'translate(10, -4)'
                    }
                  >
                    <rect x="0" y="2" width="18" height="10" fill="#FFFDF7" />
                    <rect x="1" y="3" width="16" height="8" fill="#F5EBDD" />
                    {envelopeOpen && (
                      <rect x="3" y="-3" width="12" height="6" fill="#FFD966" />
                    )}
                    <rect x="7" y="6" width="4" height="3" fill="#EF6855" />
                  </g>
                </g>
              </svg>
            </button>

            <div className="space-y-1.5 text-center sm:text-left">
              <p className="font-mono text-[11px] uppercase tracking-widest text-[#243B8A] font-semibold">
                {lang === 'mr'
                  ? 'कासवाचा छोटा क्षण · पत्रावर क्लिक करा'
                  : "THE TORTOISE'S LITTLE MOMENT · INTERACTIVE"}
              </p>
              <button
                type="button"
                onClick={() => setEnvelopeOpen((prev) => !prev)}
                className="text-[14.5px] font-semibold text-[#252832] hover:text-[#243B8A] underline decoration-[#997451] underline-offset-4 transition-colors cursor-pointer"
              >
                {envelopeOpen
                  ? lang === 'mr'
                    ? 'पत्र बंद करा'
                    : 'Fold the envelope back'
                  : lang === 'mr'
                    ? 'कासवाजवळील लहान पत्र उघडा →'
                    : 'Click the tiny envelope to read its note →'}
              </button>
            </div>
          </div>

          {/* Revealed Quote or Prompt */}
          <div className="max-w-[44ch] text-center md:text-right">
            {envelopeOpen ? (
              <div
                data-testid="tortoise-envelope-message"
                className="bg-[#FFFDF7] border-2 border-[#302C25] px-5 py-4 rounded-xl shadow-[4px_4px_0px_#302C25]"
              >
                <p className="font-serif italic text-[16px] sm:text-[17px] text-[#252832] leading-relaxed">
                  “Good stories travel slowly, but they always find their readers.”
                </p>
                {lang === 'mr' && (
                  <p className="mt-1.5 text-[13.5px] text-[#5A5F72]">
                    चांगल्या गोष्टी हळूहळू प्रवास करतात, पण त्या आपल्या वाचकांपर्यंत नक्की पोहोचतात.
                  </p>
                )}
              </div>
            ) : (
              <p className="text-[14px] text-[#5A5F72] italic">
                {lang === 'mr'
                  ? 'आमचे कासव संपादकीय टेबलाकडे एक छोटेसे पत्र घेऊन जात आहे. संदेश वाचण्यासाठी पत्रावर क्लिक करा.'
                  : 'Our tortoise is carrying a tiny envelope toward the editorial desk. Click the envelope to open it.'}
              </p>
            )}
          </div>
        </div>

        {/* Concluding Editorial Room Statement */}
        <div className="mt-6 pt-5 border-t border-[#D8CEB8] flex flex-col sm:flex-row items-center justify-between gap-2 text-[13px] text-[#5A5F72]">
          <p className="font-serif italic text-[#252832]">
            {lang === 'mr'
              ? '“एक असा संपादकीय कक्ष जिथे कल्पना पत्रांच्या रूपात येतात आणि पुस्तकांच्या रूपात बाहेर पडतात.”'
              : '“An editorial room where ideas arrive as letters and leave as books.”'}
          </p>
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#78845A]">
            AKATH PRAKASHAN · NANDED
          </span>
        </div>
      </div>
    </section>
  );
};
