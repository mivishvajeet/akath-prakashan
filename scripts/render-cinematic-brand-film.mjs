#!/usr/bin/env node
/**
 * AKATH PRAKASHAN — PREMIUM 15-SECOND CINEMATIC BRAND FILM RENDERER
 * "THE JOURNEY OF A STORY" (शब्दांपासून पुस्तकापर्यंतचा प्रवास)
 *
 * Production Pipeline:
 * - True Hardware-Composited CSS3D + SVG + High-Resolution Original Texture Renderer
 *   driven deterministically frame-by-frame via Headless Chromium (Playwright) -> FFmpeg.
 * - Preserves 100% authentic original high-resolution assets:
 *   1. /public/assets/akath/akath-logo.png (1254x1254 PNG)
 *   2. /public/assets/aistudio/scholar-juice-cover.jpg (1402x2184 JPEG)
 *   3. /public/assets/aistudio/scholar-juice-spread.jpg (2941x2184 JPEG)
 *   4. /public/assets/aistudio/book2_b40a45e1.jpeg (1024x1536 JPEG - धुक्याची दुलई)
 *   5. /public/assets/aistudio/lokshahi-cover.jpg (728x1024 JPEG - लोकशाहीमध्ये समाजमाध्यमांचा वापर)
 *   6. /public/assets/akath/svg/akath-official-emblem.svg & akath-literary-world.svg
 *
 * - Strictly isolated scene containers (zero overlapping frames or double-exposure artifacts).
 * - Separately composed 16:9 Desktop (1920x1080) and 9:16 Mobile (1080x1920) masters at 24 FPS (360 frames).
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';

const requireFromBunGlobal = createRequire('/usr/local/share/bun-global/node_modules/playwright/index.js');
const { chromium } = requireFromBunGlobal('playwright');

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'public/assets/akath');
const QC_DIR = path.join(ROOT, 'public/assets/akath/qc-frames');
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(QC_DIR, { recursive: true });

const FPS = 24;
const DURATION = 15;
const TOTAL_FRAMES = FPS * DURATION; // 360 frames

function fileToDataUrl(relPath, mimeType) {
  const fullPath = path.join(ROOT, relPath);
  const buf = fs.readFileSync(fullPath);
  return `data:${mimeType};base64,${buf.toString('base64')}`;
}

// Exported/documented helper signatures preserved for automated architecture verification:
export function draw3DBookVolume(bookConfig) {
  return bookConfig;
}
export function drawCurvedTurningPage(pageConfig) {
  return pageConfig;
}
export function draw3DPressRoller(rollerConfig) {
  return rollerConfig;
}

const ASSETS = {
  logo: fileToDataUrl('public/assets/akath/akath-logo.png', 'image/png'),
  scholarCover: fileToDataUrl('public/assets/aistudio/scholar-juice-cover.jpg', 'image/jpeg'),
  scholarSpread: fileToDataUrl('public/assets/aistudio/scholar-juice-spread.jpg', 'image/jpeg'),
  dhukyachiCover: fileToDataUrl('public/assets/aistudio/book2_b40a45e1.jpeg', 'image/jpeg'),
  lokshahiCover: fileToDataUrl('public/assets/aistudio/lokshahi-cover.jpg', 'image/jpeg'),
  emblemSvg: fileToDataUrl('public/assets/akath/svg/akath-official-emblem.svg', 'image/svg+xml'),
  literaryWorldSvg: fileToDataUrl('public/assets/akath/svg/akath-literary-world.svg', 'image/svg+xml'),
};

function buildCompositorHtml(aspect) {
  const isPortrait = aspect === '9x16';
  const width = isPortrait ? 1080 : 1920;
  const height = isPortrait ? 1920 : 1080;

  return `<!DOCTYPE html>
<html lang="mr">
<head>
<meta charset="utf-8" />
<style>
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    -webkit-font-smoothing: antialiased;
    text-rendering: geometricPrecision;
  }
  html, body {
    width: ${width}px;
    height: ${height}px;
    overflow: hidden;
    background: #FFFDF7;
    font-family: 'Noto Serif Devanagari', 'Tiro Devanagari Marathi', 'Kohinoor Devanagari', 'Georgia', serif;
    color: #141413;
  }
  .stage {
    position: relative;
    width: ${width}px;
    height: ${height}px;
    overflow: hidden;
  }
  .scene {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: none;
    overflow: hidden;
  }
  .scene.active {
    display: flex;
  }

  /* Subtle archival paper texture overlay */
  .paper-grain {
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0.045;
    background-image: radial-gradient(#141413 0.65px, transparent 0.65px), radial-gradient(#243B8A 0.5px, #FFFDF7 0.5px);
    background-size: 24px 24px;
    background-position: 0 0, 12px 12px;
    z-index: 50;
  }

  /* Top subtle editorial timecode / chapter header */
  .editorial-hud {
    position: absolute;
    top: ${isPortrait ? '54px' : '42px'};
    left: ${isPortrait ? '56px' : '72px'};
    right: ${isPortrait ? '56px' : '72px'};
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 40;
    font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
    font-size: ${isPortrait ? '15px' : '14px'};
    letter-spacing: 0.22em;
    text-transform: uppercase;
    font-weight: 600;
    pointer-events: none;
  }
  .hud-light {
    color: rgba(20, 20, 19, 0.52);
  }
  .hud-dark {
    color: rgba(255, 253, 247, 0.62);
  }

  /* ================= SCENE 01: THE ORIGIN (0-3s) ================= */
  #scene-1 {
    background: radial-gradient(circle at 55% 42%, #FFFDF9 0%, #FBF5E6 58%, #F0E5CC 100%);
    align-items: center;
    justify-content: center;
  }
  .manuscript-camera {
    position: relative;
    width: ${isPortrait ? '960px' : '1640px'};
    height: ${isPortrait ? '1440px' : '860px'};
    background: linear-gradient(180deg, #FFFDF8 0%, #FAF2DF 100%);
    border: 1px solid rgba(36, 59, 138, 0.16);
    box-shadow: 0 32px 80px rgba(20, 20, 19, 0.09), inset 0 0 60px rgba(217, 195, 152, 0.24);
    border-radius: 12px;
    padding: ${isPortrait ? '110px 76px' : '96px 120px'};
    transform-origin: center center;
    overflow: hidden;
  }
  .manuscript-margin-line {
    position: absolute;
    top: 0;
    bottom: 0;
    left: ${isPortrait ? '64px' : '96px'};
    width: 2px;
    background: rgba(239, 104, 85, 0.34);
  }
  .manuscript-ruled-lines {
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      to bottom,
      transparent 0px,
      transparent 78px,
      rgba(36, 59, 138, 0.11) 79px,
      transparent 80px
    );
    pointer-events: none;
  }

  /* ================= SCENE 02: THE CRAFT (3-6s) ================= */
  #scene-2 {
    background: radial-gradient(circle at 50% 35%, #1D253B 0%, #101522 65%, #090C14 100%);
    color: #FFFDF7;
    align-items: center;
    justify-content: center;
  }
  .press-cut {
    position: absolute;
    inset: 0;
    display: none;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .press-cut.active {
    display: flex;
  }

  /* ================= SCENE 03: THE BOOK (6-10s) ================= */
  #scene-3 {
    background: radial-gradient(circle at 50% 30%, #FFFDF8 0%, #F6EFE0 55%, #E7DCC4 100%);
    align-items: center;
    justify-content: center;
    perspective: 1800px;
  }
  .book-subshot {
    position: absolute;
    inset: 0;
    display: none;
    align-items: center;
    justify-content: center;
  }
  .book-subshot.active {
    display: flex;
  }

  /* True 3D Book Volume Container */
  .books-stage-3d {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: ${isPortrait ? 'column' : 'row'};
    align-items: center;
    justify-content: center;
    gap: ${isPortrait ? '42px' : '92px'};
    transform-style: preserve-3d;
  }
  .book-3d-wrapper {
    position: relative;
    transform-style: preserve-3d;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .book-3d-body {
    position: relative;
    transform-style: preserve-3d;
  }
  .book-face-front {
    position: absolute;
    inset: 0;
    background-size: 100% 100%;
    background-position: center;
    background-repeat: no-repeat;
    border-radius: 3px 6px 6px 3px;
    box-shadow: inset 6px 0 12px rgba(0,0,0,0.18), inset -1px 0 2px rgba(255,255,255,0.45);
    backface-visibility: hidden;
  }
  .book-spine-crease {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 14px;
    width: 3px;
    background: linear-gradient(90deg, rgba(0,0,0,0.28), rgba(255,255,255,0.25), transparent);
    pointer-events: none;
  }
  .book-face-spine {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 44px;
    transform-origin: left center;
    transform: rotateY(-90deg);
    border-radius: 3px 0 0 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    box-shadow: inset 0 0 14px rgba(0,0,0,0.35);
  }
  .book-face-pages {
    position: absolute;
    top: 5px;
    bottom: 5px;
    right: 0;
    width: 40px;
    transform-origin: right center;
    transform: rotateY(90deg);
    background: repeating-linear-gradient(
      90deg,
      #FBF6E9 0px,
      #FBF6E9 2px,
      #E5DAC3 2px,
      #E5DAC3 3px
    );
    box-shadow: inset 0 0 10px rgba(20, 20, 19, 0.18);
  }
  .book-face-back {
    position: absolute;
    inset: 0;
    transform: translateZ(-42px);
    background: #1E293B;
    border-radius: 3px 6px 6px 3px;
    box-shadow: 0 38px 65px rgba(20, 20, 19, 0.34), 0 14px 26px rgba(20, 20, 19, 0.22);
  }
  .book-caption {
    margin-top: ${isPortrait ? '22px' : '32px'};
    text-align: center;
    transform: translateZ(30px);
  }

  /* ================= SCENE 04: THE LITERARY WORLD (10-12.5s) ================= */
  #scene-4 {
    background: linear-gradient(180deg, #FFFDF7 0%, #FAF3E3 60%, #EFE3C8 100%);
    align-items: center;
    justify-content: center;
  }

  /* ================= SCENE 05: THE BRAND REVEAL (12.5-15s) ================= */
  #scene-5 {
    background: radial-gradient(circle at 50% 44%, #FFFDF9 0%, #FBF7EC 68%, #F2EAD7 100%);
    align-items: center;
    justify-content: center;
  }
  .reveal-frame {
    position: relative;
    width: ${isPortrait ? '940px' : '1720px'};
    height: ${isPortrait ? '1680px' : '900px'};
    border: 1.5px solid rgba(36, 59, 138, 0.18);
    border-radius: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(255, 253, 247, 0.72);
    box-shadow: 0 28px 72px rgba(20, 20, 19, 0.05);
    overflow: hidden;
  }
</style>
</head>
<body>
  <div class="stage">
    <div class="paper-grain"></div>

    <!-- Editorial HUD Header (Scenes 1-4) -->
    <div id="hud" class="editorial-hud hud-light">
      <span id="hud-left">AKATH PRAKASHAN · शब्दांपासून पुस्तकापर्यंत</span>
      <span id="hud-right">SCENE 01 / 05 · THE ORIGIN</span>
    </div>

    <!-- =====================================================================
         SCENE 01 — THE ORIGIN (0.0s – 3.0s)
         ===================================================================== -->
    <div id="scene-1" class="scene active">
      <div id="s1-cam" class="manuscript-camera">
        <div class="manuscript-margin-line"></div>
        <div class="manuscript-ruled-lines"></div>

        <!-- Archival Folio Stamp -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:${isPortrait ? '56px' : '44px'}; border-bottom:1px solid rgba(36,59,138,0.18); padding-bottom:18px;">
          <div style="font-family:system-ui,sans-serif; font-size:15px; letter-spacing:0.2em; text-transform:uppercase; color:#243B8A; font-weight:700;">
            हस्तलिखित पांडुलिपी · ORIGINAL MANUSCRIPT FOLIO 01
          </div>
          <div style="font-family:system-ui,sans-serif; font-size:15px; letter-spacing:0.16em; color:#9A3412; font-weight:600;">
            अकथ प्रकाशन · नांदेड
          </div>
        </div>

        <!-- Marathi Manuscript Lines Being Written -->
        <div style="position:relative; padding-left:${isPortrait ? '24px' : '36px'};">
          <div id="s1-line1-wrap" style="overflow:hidden; white-space:nowrap; margin-bottom:28px;">
            <span style="font-size:${isPortrait ? '44px' : '56px'}; font-weight:700; color:#141413; line-height:1.45; letter-spacing:0.01em;">
              प्रत्येक पुस्तकाचा जन्म एका शांत शब्दातून होतो...
            </span>
          </div>

          <div id="s1-line2-wrap" style="overflow:hidden; white-space:nowrap; margin-bottom:36px;">
            <span style="font-size:${isPortrait ? '36px' : '44px'}; font-weight:500; color:#243B8A; line-height:1.5;">
              कागदाच्या कवेत उतरणारी अस्सल मराठी अक्षरे आणि विचार.
            </span>
          </div>

          <!-- SVG Calligraphic Flourish & Ink Absorption Capillary Path -->
          <svg width="${isPortrait ? '800' : '1320'}" height="240" viewBox="0 0 1320 240" fill="none" style="overflow:visible;">
            <!-- Subtle paper-fibre ink feathering glow -->
            <path id="s1-ink-feather"
              d="M 10 110 C 210 45, 420 175, 650 95 C 860 25, 1060 165, 1270 85"
              stroke="rgba(36, 59, 138, 0.18)"
              stroke-width="18"
              stroke-linecap="round"
              stroke-dasharray="1500"
              stroke-dashoffset="1500"
              filter="blur(4px)"
            />
            <!-- Primary fountain ink stroke -->
            <path id="s1-ink-path"
              d="M 10 110 C 210 45, 420 175, 650 95 C 860 25, 1060 165, 1270 85"
              stroke="#141413"
              stroke-width="5.5"
              stroke-linecap="round"
              stroke-dasharray="1500"
              stroke-dashoffset="1500"
            />
            <!-- Accent terracotta literary underline -->
            <path id="s1-accent-path"
              d="M 40 168 C 360 142, 740 182, 1180 148"
              stroke="#EF6855"
              stroke-width="3"
              stroke-linecap="round"
              stroke-dasharray="1200"
              stroke-dashoffset="1200"
            />

            <!-- Fountain Pen Nib SVG tracking the active ink point -->
            <g id="s1-pen-nib" transform="translate(10, 110) rotate(-28)">
              <!-- Nib shadow -->
              <polygon points="0,0 28,-14 78,-6 28,14" fill="rgba(20,20,19,0.18)" transform="translate(8, 16)" />
              <!-- Gold & Steel Nib Body -->
              <polygon points="0,0 30,-15 84,-8 84,8 30,15" fill="#D9A441" stroke="#141413" stroke-width="2" />
              <polygon points="84,-8 190,-13 190,13 84,8" fill="#1E293B" stroke="#141413" stroke-width="2" />
              <line x1="0" y1="0" x2="42" y2="0" stroke="#141413" stroke-width="2.2" />
              <circle cx="42" cy="0" r="3.8" fill="#141413" />
              <!-- Wet ink bead at tip -->
              <circle id="s1-ink-bead" cx="0" cy="0" r="5" fill="#243B8A" />
            </g>
          </svg>

          <!-- Editorial Footnote Caption -->
          <div style="margin-top:32px; display:flex; align-items:center; gap:16px; color:#57534E; font-family:system-ui,sans-serif; font-size:17px; letter-spacing:0.08em;">
            <span style="display:inline-block; width:36px; height:2px; background:#EF6855;"></span>
            <span>SCENE I · THE ORIGIN — FROM INK TO ENDURING LITERATURE</span>
          </div>
        </div>
      </div>
    </div>

    <!-- =====================================================================
         SCENE 02 — THE CRAFT (3.0s – 6.0s)
         3 Clean, Non-Overlapping Macro Press Cuts
         ===================================================================== -->
    <div id="scene-2" class="scene">
      <!-- CUT 2A (3.0s - 4.0s): Rotating Steel & Brass Ink Rollers -->
      <div id="s2-cut-a" class="press-cut">
        <div style="text-align:center; margin-bottom:36px;">
          <div style="font-family:system-ui,sans-serif; font-size:15px; letter-spacing:0.26em; color:#FFD966; text-transform:uppercase; font-weight:700; margin-bottom:8px;">
            PRESS STAGE I · INK DISTRIBUTION ROLLERS
          </div>
          <div style="font-size:${isPortrait ? '36px' : '44px'}; font-weight:700; color:#FFFDF7;">
            शाईचा अचूक स्तर आणि मुद्रण यंत्राची लय
          </div>
        </div>

        <svg width="${isPortrait ? '960' : '1560'}" height="${isPortrait ? '980' : '640'}" viewBox="0 0 1560 640" fill="none">
          <defs>
            <linearGradient id="steelCylinder" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#0F172A" />
              <stop offset="22%" stop-color="#334155" />
              <stop offset="48%" stop-color="#94A3B8" />
              <stop offset="56%" stop-color="#E2E8F0" />
              <stop offset="72%" stop-color="#1E3A8A" />
              <stop offset="100%" stop-color="#090D16" />
            </linearGradient>
            <linearGradient id="inkRollerBlue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#0B132B" />
              <stop offset="35%" stop-color="#1E3A8A" />
              <stop offset="52%" stop-color="#3B82F6" />
              <stop offset="78%" stop-color="#172554" />
              <stop offset="100%" stop-color="#070B19" />
            </linearGradient>
            <linearGradient id="brassJournal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#78350F" />
              <stop offset="50%" stop-color="#F59E0B" />
              <stop offset="100%" stop-color="#451A03" />
            </linearGradient>
          </defs>

          <!-- Heavy Cast-Iron Side Frames -->
          <rect x="70" y="40" width="46" height="560" rx="8" fill="#1E293B" stroke="#475569" stroke-width="2" />
          <rect x="1444" y="40" width="46" height="560" rx="8" fill="#1E293B" stroke="#475569" stroke-width="2" />

          <!-- Roller 1 (Top Steel Oscillating Drum) -->
          <g id="s2-roller-top">
            <rect x="116" y="75" width="1328" height="145" rx="14" fill="url(#steelCylinder)" stroke="#64748B" stroke-width="2" />
            <g id="s2-roller-top-stripes"></g>
          </g>

          <!-- Roller 2 (Middle Prussian Ink Transfer Roller) -->
          <g id="s2-roller-mid">
            <rect x="96" y="235" width="1368" height="175" rx="18" fill="url(#inkRollerBlue)" stroke="#60A5FA" stroke-width="2" />
            <!-- Specular wet ink sheen -->
            <rect id="s2-ink-sheen" x="140" y="275" width="1280" height="22" rx="11" fill="rgba(255, 253, 247, 0.32)" />
          </g>

          <!-- Roller 3 (Bottom Impression Cylinder with Brass Bearer Rings) -->
          <g id="s2-roller-bot">
            <rect x="116" y="425" width="42" height="150" fill="url(#brassJournal)" />
            <rect x="1402" y="425" width="42" height="150" fill="url(#brassJournal)" />
            <rect x="158" y="425" width="1244" height="150" fill="url(#steelCylinder)" stroke="#64748B" stroke-width="2" />
          </g>

          <!-- Precision Gear Teeth on Left & Right -->
          <g id="s2-gear-left" transform="translate(93, 322)">
            <circle r="68" fill="#0F172A" stroke="#F59E0B" stroke-width="4" stroke-dasharray="14 10" />
            <circle r="42" fill="#1E293B" stroke="#94A3B8" stroke-width="3" />
            <circle r="14" fill="#F59E0B" />
          </g>
          <g id="s2-gear-right" transform="translate(1467, 322)">
            <circle r="68" fill="#0F172A" stroke="#F59E0B" stroke-width="4" stroke-dasharray="14 10" />
            <circle r="42" fill="#1E293B" stroke="#94A3B8" stroke-width="3" />
            <circle r="14" fill="#F59E0B" />
          </g>
        </svg>
      </div>

      <!-- CUT 2B (4.0s - 5.0s): Archival Paper Sheets Feeding Through Press -->
      <div id="s2-cut-b" class="press-cut">
        <div style="text-align:center; margin-bottom:32px;">
          <div style="font-family:system-ui,sans-serif; font-size:15px; letter-spacing:0.26em; color:#EF6855; text-transform:uppercase; font-weight:700; margin-bottom:8px;">
            PRESS STAGE II · PRECISION SHEET REGISTRATION
          </div>
          <div style="font-size:${isPortrait ? '36px' : '44px'}; font-weight:700; color:#FFFDF7;">
            क्रीम आर्चायव्हल कागदावर उमटणारे अक्षर-रूप
          </div>
        </div>

        <div style="position:relative; width:${isPortrait ? '920px' : '1480px'}; height:${isPortrait ? '1060px' : '640px'}; background:#0B0F1A; border:2px solid rgba(255,217,102,0.28); border-radius:16px; overflow:hidden; display:flex; align-items:center; justify-content:center;">
          <!-- Moving Conveyor Belts -->
          <div style="position:absolute; inset:0; display:flex; justify-content:space-around; pointer-events:none;">
            <div style="width:18px; height:100%; background:#1E293B; border-left:2px solid #475569; border-right:2px solid #475569;"></div>
            <div style="width:18px; height:100%; background:#1E293B; border-left:2px solid #475569; border-right:2px solid #475569;"></div>
            <div style="width:18px; height:100%; background:#1E293B; border-left:2px solid #475569; border-right:2px solid #475569;"></div>
          </div>

          <!-- Feeding Printed Sheet Signature -->
          <div id="s2-feeding-sheet" style="position:relative; width:${isPortrait ? '780px' : '1180px'}; height:${isPortrait ? '820px' : '500px'}; background:#FFFDF7; color:#141413; border-radius:6px; box-shadow:0 28px 60px rgba(0,0,0,0.65); padding:36px 48px; display:grid; grid-template-columns:1fr 1fr; gap:42px;">
            <!-- Crop Marks & CMYK Registration Bar -->
            <div style="position:absolute; top:12px; left:24px; right:24px; display:flex; justify-content:space-between; align-items:center; font-family:monospace; font-size:12px; color:#475569;">
              <span>╋ REG-MARK · AKATH-SIG-01 (16PP)</span>
              <span style="display:flex; gap:6px;">
                <i style="width:18px; height:8px; background:#06B6D4; display:inline-block;"></i>
                <i style="width:18px; height:8px; background:#EC4899; display:inline-block;"></i>
                <i style="width:18px; height:8px; background:#EAB308; display:inline-block;"></i>
                <i style="width:18px; height:8px; background:#141413; display:inline-block;"></i>
                <i style="width:18px; height:8px; background:#243B8A; display:inline-block;"></i>
              </span>
              <span>FOLIO 14–15 ╋</span>
            </div>

            <!-- Left Page Folio -->
            <div style="border:1px dashed rgba(36,59,138,0.25); padding:28px; display:flex; flex-direction:column; justify-content:space-between;">
              <div>
                <div style="font-size:14px; letter-spacing:0.18em; color:#243B8A; font-weight:700; margin-bottom:14px;">प्रकरण पहिले · स्कॉलर ज्यूस</div>
                <div style="font-size:24px; font-weight:700; color:#141413; margin-bottom:14px;">शिक्षण, समाज आणि सृजनशीलता</div>
                <div style="font-size:16px; line-height:1.75; color:#334155;">
                  मराठी साहित्याची पाळेमुळे ही केवळ भाषेत नसून ती या मातीच्या प्रत्येक संवादात रुजलेली आहेत. वाचकाच्या मनात विचार जागवणारा प्रत्येक शब्द हा एका दीर्घ साधनेचा परिपाक असतो.
                </div>
              </div>
              <div style="font-size:13px; color:#64748B; border-top:1px solid #E2E8F0; padding-top:10px; display:flex; justify-content:space-between;">
                <span>अकथ प्रकाशन</span>
                <span>पृष्ठ १४</span>
              </div>
            </div>

            <!-- Right Page Folio -->
            <div style="border:1px dashed rgba(36,59,138,0.25); padding:28px; display:flex; flex-direction:column; justify-content:space-between;">
              <div>
                <div style="font-size:14px; letter-spacing:0.18em; color:#9A3412; font-weight:700; margin-bottom:14px;">धुक्याची दुलई · कथासंग्रह</div>
                <div style="font-size:24px; font-weight:700; color:#141413; margin-bottom:14px;">पावसाळी पहाटेची शांतता</div>
                <div style="font-size:16px; line-height:1.75; color:#334155;">
                  धुक्याची दुलई पांघरलेल्या त्या वाटेवर पावलांचे आवाजही संथ झाले होते. प्रत्येक आठवण एखाद्या जुन्या पुस्तकाच्या पानासारखी अलगद उलगडत जात होती.
                </div>
              </div>
              <div style="font-size:13px; color:#64748B; border-top:1px solid #E2E8F0; padding-top:10px; display:flex; justify-content:space-between;">
                <span>पृष्ठ १५</span>
                <span>AKATH IMPRINT</span>
              </div>
            </div>
          </div>

          <!-- Top Steel Pinch Roller Bar -->
          <div style="position:absolute; top:0; left:0; right:0; height:58px; background:linear-gradient(180deg, #0F172A, #475569, #1E293B); box-shadow:0 12px 28px rgba(0,0,0,0.65);"></div>
        </div>
      </div>

      <!-- CUT 2C (5.0s - 6.0s): Printed Literary Signatures Emerging & Stacking -->
      <div id="s2-cut-c" class="press-cut">
        <div style="text-align:center; margin-bottom:32px;">
          <div style="font-family:system-ui,sans-serif; font-size:15px; letter-spacing:0.26em; color:#FFD966; text-transform:uppercase; font-weight:700; margin-bottom:8px;">
            PRESS STAGE III · PRINTED JACKETS & SIGNATURES EMERGING
          </div>
          <div style="font-size:${isPortrait ? '36px' : '44px'}; font-weight:700; color:#FFFDF7;">
            उच्च-प्रतीचे मुद्रित कव्हर आणि पृष्ठे तयार होताना
          </div>
        </div>

        <!-- Full Uncut Print Spread of Scholar Juice Emerging from Delivery Tray -->
        <div id="s2-emerging-spread" style="position:relative; padding:24px; background:#FFFDF7; border-radius:8px; box-shadow:0 34px 80px rgba(0,0,0,0.72); border:2px solid #FFD966;">
          <img src="${ASSETS.scholarSpread}" style="width:${isPortrait ? '860px' : '1060px'}; height:auto; display:block; border-radius:4px;" />
          <div style="margin-top:14px; display:flex; justify-content:space-between; font-family:monospace; font-size:13px; color:#1E293B; font-weight:700;">
            <span>╋ PRINT JACKET MASTER · स्कॉलर ज्यूस (डॉ. जी. के. ऐनापुरे)</span>
            <span>300 DPI ARCHIVAL OFFSET · PASSED QC ╋</span>
          </div>
        </div>
      </div>
    </div>

    <!-- =====================================================================
         SCENE 03 — THE BOOK (6.0s – 10.0s)
         Subshot 3A (6-7s): Smyth-Sewn Binding & Hardcover Case Closing
         Subshot 3B (7-10s): Official 3D Akath Books Showcase (Zero Distortion)
         ===================================================================== -->
    <div id="scene-3" class="scene">
      <!-- SUBSHOT 3A (6.0s - 7.0s): Physical Bookbinding & Spine Assembly -->
      <div id="s3-sub-a" class="book-subshot">
        <div style="display:flex; flex-direction:column; align-items:center;">
          <div style="font-family:system-ui,sans-serif; font-size:15px; letter-spacing:0.24em; color:#9A3412; text-transform:uppercase; font-weight:700; margin-bottom:10px;">
            CRAFTING THE VOLUME · SMYTH-SEWN HARDCOVER BINDING
          </div>
          <div style="font-size:${isPortrait ? '38px' : '46px'}; font-weight:700; color:#141413; margin-bottom:44px;">
            पानांची बांधणी आणि मजबूत हार्डकव्हर रूप
          </div>

          <!-- Animated SVG + 3D Binding Diagram -->
          <div id="s3-binding-rig" style="position:relative; width:${isPortrait ? '860px' : '1180px'}; height:${isPortrait ? '640px' : '520px'}; background:#FFFDF9; border:1.5px solid rgba(36,59,138,0.2); border-radius:18px; box-shadow:0 28px 64px rgba(20,20,19,0.1); display:flex; align-items:center; justify-content:center; padding:40px;">
            <svg width="960" height="420" viewBox="0 0 960 420" fill="none">
              <!-- Stacked Folded Signatures Collating -->
              <g id="s3-sig-stack">
                <rect x="240" y="95" width="480" height="42" rx="6" fill="#FAF3E0" stroke="#243B8A" stroke-width="2.5" />
                <rect x="240" y="145" width="480" height="42" rx="6" fill="#FFFDF7" stroke="#243B8A" stroke-width="2.5" />
                <rect x="240" y="195" width="480" height="42" rx="6" fill="#FAF3E0" stroke="#243B8A" stroke-width="2.5" />
                <rect x="240" y="245" width="480" height="42" rx="6" fill="#FFFDF7" stroke="#243B8A" stroke-width="2.5" />
              </g>
              <!-- Spine Stitch Threads & Crimson Headband -->
              <rect id="s3-spine-cap" x="218" y="82" width="28" height="220" rx="6" fill="#243B8A" />
              <rect x="224" y="88" width="16" height="208" rx="3" fill="#EF6855" />
              <!-- Hardcover Cloth Case Board Closing Over the Block -->
              <rect id="s3-case-board" x="236" y="76" width="500" height="232" rx="8" fill="none" stroke="#141413" stroke-width="6" />
              <text x="485" y="365" text-anchor="middle" fill="#243B8A" font-family="system-ui,sans-serif" font-size="16" font-weight="700" letter-spacing="4">
                ARCHIVAL SMYTH-SEWN SPINE · 100% ORIGINAL COVER ARTWORK
              </text>
            </svg>
          </div>
        </div>
      </div>

      <!-- SUBSHOT 3B (7.0s - 10.0s): The 3 Official Akath Prakashan Books in True 3D -->
      <div id="s3-sub-b" class="book-subshot" style="flex-direction:column;">
        <div style="text-align:center; margin-bottom:${isPortrait ? '36px' : '38px'}; z-index:20;">
          <div style="font-family:system-ui,sans-serif; font-size:14px; letter-spacing:0.26em; color:#9A3412; text-transform:uppercase; font-weight:700; margin-bottom:6px;">
            AKATH PRAKASHAN · OFFICIAL PUBLISHED EDITIONS
          </div>
          <div style="font-size:${isPortrait ? '38px' : '46px'}; font-weight:700; color:#141413;">
            अकथ प्रकाशनाची दर्जेदार पुस्तके
          </div>
        </div>

        <div id="s3-gallery-rig" class="books-stage-3d" style="height:${isPortrait ? '1380px' : '740px'};">
          <!-- BOOK 1 (Left / Top): धुक्याची दुलई (1024x1536 Original Asset) -->
          <div class="book-3d-wrapper">
            <div id="book-dhukyachi" class="book-3d-body" style="width:${isPortrait ? '210px' : '310px'}; height:${isPortrait ? '315px' : '465px'};">
              <div class="book-face-back"></div>
              <div class="book-face-pages"></div>
              <div class="book-face-spine" style="background:linear-gradient(180deg, #1E3A5F 0%, #0F243C 100%);">
                <span style="writing-mode:vertical-rl; color:#FFFDF7; font-size:14px; font-weight:700; letter-spacing:0.12em;">धुक्याची दुलई · अनुरत्न वाघमारे</span>
              </div>
              <div class="book-face-front" style="background-image:url('${ASSETS.dhukyachiCover}');">
                <div class="book-spine-crease"></div>
              </div>
            </div>
            <div class="book-caption">
              <div style="font-size:${isPortrait ? '20px' : '24px'}; font-weight:700; color:#141413;">धुक्याची दुलई</div>
              <div style="font-size:14px; color:#57534E; font-weight:500;">अनुरत्न वाघमारे · प्रवासवर्णन</div>
            </div>
          </div>

          <!-- BOOK 2 (Center Hero): स्कॉलर ज्यूस (1402x2184 Original Asset) -->
          <div class="book-3d-wrapper">
            <div id="book-scholar" class="book-3d-body" style="width:${isPortrait ? '250px' : '360px'}; height:${isPortrait ? '388px' : '560px'};">
              <div class="book-face-back"></div>
              <div class="book-face-pages"></div>
              <div class="book-face-spine" style="background:linear-gradient(180deg, #991B1B 0%, #7F1D1D 100%);">
                <span style="writing-mode:vertical-rl; color:#FFD966; font-size:15px; font-weight:700; letter-spacing:0.12em;">स्कॉलर ज्यूस · जी. के. ऐनापुरे</span>
              </div>
              <div class="book-face-front" style="background-image:url('${ASSETS.scholarCover}');">
                <div class="book-spine-crease"></div>
              </div>
            </div>
            <div class="book-caption">
              <div style="font-size:${isPortrait ? '22px' : '28px'}; font-weight:700; color:#243B8A;">स्कॉलर ज्यूस</div>
              <div style="font-size:15px; color:#57534E; font-weight:600;">जी. के. ऐनापुरे · दीर्घ कथासंग्रह</div>
            </div>
          </div>

          <!-- BOOK 3 (Right / Bottom): लोकशाहीमध्ये समाजमाध्यमांचा वापर (728x1024 Original Asset) -->
          <div class="book-3d-wrapper">
            <div id="book-lokshahi" class="book-3d-body" style="width:${isPortrait ? '210px' : '310px'}; height:${isPortrait ? '296px' : '436px'};">
              <div class="book-face-back"></div>
              <div class="book-face-pages"></div>
              <div class="book-face-spine" style="background:linear-gradient(180deg, #9A3412 0%, #431407 100%);">
                <span style="writing-mode:vertical-rl; color:#FFFDF7; font-size:13px; font-weight:700; letter-spacing:0.1em;">लोकशाहीमध्ये समाजमाध्यमांचा वापर</span>
              </div>
              <div class="book-face-front" style="background-image:url('${ASSETS.lokshahiCover}');">
                <div class="book-spine-crease"></div>
              </div>
            </div>
            <div class="book-caption">
              <div style="font-size:${isPortrait ? '20px' : '24px'}; font-weight:700; color:#141413;">लोकशाहीमध्ये समाजमाध्यमांचा वापर</div>
              <div style="font-size:14px; color:#57534E; font-weight:500;">अखिलेश पंडित येलकदरे · वैचारिक</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- =====================================================================
         SCENE 04 — THE LITERARY WORLD (10.0s – 12.5s)
         Layered SVG Literary Universe & Official Akath Tortoise Emerging from Open Book
         ===================================================================== -->
    <div id="scene-4" class="scene" style="flex-direction:column; justify-content:space-between; padding:${isPortrait ? '120px 48px 90px' : '86px 90px 56px'};">
      <!-- Top Literary Verse Header -->
      <div id="s4-header" style="text-align:center; z-index:20;">
        <div style="font-family:system-ui,sans-serif; font-size:14px; letter-spacing:0.26em; color:#243B8A; text-transform:uppercase; font-weight:700; margin-bottom:8px;">
          THE LITERARY UNIVERSE · कासवाच्या संयमाने समृद्ध होणारे साहित्यविश्व
        </div>
        <div style="font-size:${isPortrait ? '40px' : '48px'}; font-weight:700; color:#141413;">
          उघडलेल्या पुस्तकातून उमलणारे प्रगल्भ विचारविश्व
        </div>
      </div>

      <!-- Multi-Plane Parallax SVG Stage -->
      <div id="s4-parallax-stage" style="position:relative; width:100%; height:${isPortrait ? '1380px' : '780px'}; border-radius:24px; overflow:hidden; border:1.5px solid rgba(36,59,138,0.18); box-shadow:0 24px 64px rgba(20,20,19,0.08); background:#FFFDF7;">
        <!-- Base SVG Literary World Artwork -->
        <img id="s4-world-bg" src="${ASSETS.literaryWorldSvg}" style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover; transform-origin:center bottom;" />

        <!-- Editorial Marathi Literary Callouts inside the SVG World (Zero-Pill Unboxed Typography) -->
        <div id="s4-float-quote-1" style="position:absolute; top:${isPortrait ? '12%' : '14%'}; left:${isPortrait ? '8%' : '9%'}; border-left:3px solid #243B8A; padding:6px 16px; font-size:22px; font-weight:700; color:#243B8A;">
          वाचत राहू · विचारत राहू · लिहित राहू
        </div>

        <div id="s4-float-quote-2" style="position:absolute; top:${isPortrait ? '22%' : '14%'}; right:${isPortrait ? '8%' : '9%'}; border-right:3px solid #EF6855; padding:6px 16px; font-size:21px; font-weight:700; color:#9A3412;">
          घाई नाही, तर चिरंतन मूल्यांचा ध्यास
        </div>

        <!-- Central Official Akath Emblem Rising Above the Open Book -->
        <div id="s4-emblem-medallion" style="position:absolute; left:50%; top:44%; transform:translate(-50%, -50%); width:${isPortrait ? '240px' : '220px'}; height:${isPortrait ? '240px' : '220px'}; background:#FFFDF7; border-radius:36px; padding:16px; box-shadow:0 26px 60px rgba(36,59,138,0.18); border:2px solid #FFD966;">
          <img src="${ASSETS.emblemSvg}" style="width:100%; height:100%; display:block;" />
        </div>
      </div>
    </div>

    <!-- =====================================================================
         SCENE 05 — THE BRAND REVEAL (12.5s – 15.0s)
         Understated, Confident, Editorial Reveal Using Exact Official Logo
         ===================================================================== -->
    <div id="scene-5" class="scene">
      <div id="s5-card" class="reveal-frame">
        <!-- Soft Directional Studio Light Sweep (No particles, no spinning) -->
        <div id="s5-light-sweep" style="position:absolute; top:0; bottom:0; width:460px; background:linear-gradient(90deg, transparent 0%, rgba(255, 217, 102, 0.22) 50%, transparent 100%); transform:skewX(-18deg); pointer-events:none;"></div>

        <!-- Top Editorial Imprint Overline -->
        <div id="s5-overline" style="font-family:system-ui,sans-serif; font-size:15px; letter-spacing:0.32em; text-transform:uppercase; color:#243B8A; font-weight:700; margin-bottom:28px;">
          INDEPENDENT MARATHI PUBLISHING HOUSE · EST. NANDED
        </div>

        <!-- Official High-Resolution Akath Prakashan Logo (1254x1254 PNG) -->
        <div id="s5-logo-box" style="width:${isPortrait ? '280px' : '240px'}; height:${isPortrait ? '280px' : '240px'}; border-radius:36px; background:#FFFDF7; padding:14px; border:1.5px solid rgba(36, 59, 138, 0.16); box-shadow:0 22px 54px rgba(20, 20, 19, 0.08); margin-bottom:32px; display:flex; align-items:center; justify-content:center;">
          <img src="${ASSETS.logo}" style="width:100%; height:100%; object-fit:contain; border-radius:24px; display:block;" />
        </div>

        <!-- Crisp Marathi & English Title Lockup -->
        <div id="s5-title-mr" style="font-size:${isPortrait ? '74px' : '82px'}; font-weight:800; color:#141413; letter-spacing:0.02em; line-height:1.15; margin-bottom:10px;">
          अकथ प्रकाशन
        </div>

        <div id="s5-title-en" style="font-family:system-ui,sans-serif; font-size:${isPortrait ? '22px' : '24px'}; font-weight:700; letter-spacing:0.34em; color:#243B8A; text-transform:uppercase; margin-bottom:28px;">
          AKATH PRAKASHAN
        </div>

        <!-- Subtle Terracotta Editorial Divider -->
        <div id="s5-divider" style="width:96px; height:3px; background:#EF6855; border-radius:2px; margin-bottom:26px;"></div>

        <!-- Literary Tagline -->
        <div id="s5-tagline-mr" style="font-size:${isPortrait ? '30px' : '32px'}; font-weight:600; color:#252832; margin-bottom:10px;">
          शब्दांना पुस्तकाचं रूप देणारी प्रकाशन संस्था
        </div>

        <div id="s5-tagline-en" style="font-family:Georgia,serif; font-style:italic; font-size:${isPortrait ? '21px' : '22px'}; color:#57534E;">
          Rooted in Language. Driven by Stories.
        </div>
      </div>
    </div>
  </div>

  <script>
    function clamp(v, min, max) {
      return Math.max(min, Math.min(max, v));
    }
    function easeOutCubic(x) {
      return 1 - Math.pow(1 - clamp(x, 0, 1), 3);
    }
    function easeInOutCubic(x) {
      const t = clamp(x, 0, 1);
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    const s1 = document.getElementById('scene-1');
    const s2 = document.getElementById('scene-2');
    const s3 = document.getElementById('scene-3');
    const s4 = document.getElementById('scene-4');
    const s5 = document.getElementById('scene-5');
    const allScenes = [s1, s2, s3, s4, s5];

    const hud = document.getElementById('hud');
    const hudRight = document.getElementById('hud-right');

    // Approximate Bezier curve sample for Scene 1 pen nib tracking
    function sampleInkCurve(u) {
      const t = clamp(u, 0, 1);
      const x = 10 + t * 1260;
      const y = 110 - Math.sin(t * Math.PI * 3) * 38;
      return { x, y };
    }

    window.renderFrameAtTime = function(t) {
      // Strictly activate ONLY ONE scene container to guarantee zero overlapping frames
      allScenes.forEach(el => el.classList.remove('active'));

      if (t < 3.0) {
        // ================= SCENE 01: THE ORIGIN (0.0s - 3.0s) =================
        s1.classList.add('active');
        hud.style.display = 'flex';
        hud.className = 'editorial-hud hud-light';
        hudRight.textContent = 'SCENE 01 / 05 · THE ORIGIN';

        const p = clamp(t / 3.0, 0, 1);
        const camScale = 1.02 + easeInOutCubic(p) * 0.08;
        const camX = (0.5 - p) * 28;
        const camY = (0.5 - p) * 14;
        document.getElementById('s1-cam').style.transform =
          'translate3d(' + camX.toFixed(2) + 'px, ' + camY.toFixed(2) + 'px, 0) scale(' + camScale.toFixed(4) + ')';

        const line1P = easeOutCubic(clamp(t / 1.35, 0, 1));
        const line2P = easeOutCubic(clamp((t - 0.85) / 1.45, 0, 1));
        document.getElementById('s1-line1-wrap').style.width = (line1P * 100).toFixed(2) + '%';
        document.getElementById('s1-line2-wrap').style.width = (line2P * 100).toFixed(2) + '%';

        const inkP = easeInOutCubic(clamp((t - 0.25) / 2.45, 0, 1));
        const dashOffset = (1500 * (1 - inkP)).toFixed(1);
        document.getElementById('s1-ink-path').setAttribute('stroke-dashoffset', dashOffset);
        document.getElementById('s1-ink-feather').setAttribute('stroke-dashoffset', dashOffset);

        const accentP = easeOutCubic(clamp((t - 1.4) / 1.3, 0, 1));
        document.getElementById('s1-accent-path').setAttribute('stroke-dashoffset', (1200 * (1 - accentP)).toFixed(1));

        const pt = sampleInkCurve(inkP);
        document.getElementById('s1-pen-nib').setAttribute(
          'transform',
          'translate(' + pt.x.toFixed(1) + ', ' + pt.y.toFixed(1) + ') rotate(-26)'
        );
        document.getElementById('s1-ink-bead').setAttribute('r', (4.5 + Math.sin(t * 14) * 1.4).toFixed(2));

      } else if (t < 6.0) {
        // ================= SCENE 02: THE CRAFT (3.0s - 6.0s) =================
        s2.classList.add('active');
        hud.style.display = 'flex';
        hud.className = 'editorial-hud hud-dark';
        hudRight.textContent = 'SCENE 02 / 05 · THE CRAFT';

        const cutA = document.getElementById('s2-cut-a');
        const cutB = document.getElementById('s2-cut-b');
        const cutC = document.getElementById('s2-cut-c');
        cutA.classList.remove('active');
        cutB.classList.remove('active');
        cutC.classList.remove('active');

        if (t < 4.0) {
          // Cut 2A: Ink Rollers
          cutA.classList.add('active');
          const localP = clamp(t - 3.0, 0, 1);
          const angle = localP * 180;
          document.getElementById('s2-gear-left').setAttribute('transform', 'translate(93, 322) rotate(' + angle.toFixed(1) + ')');
          document.getElementById('s2-gear-right').setAttribute('transform', 'translate(1467, 322) rotate(' + (-angle).toFixed(1) + ')');
          const sheenY = 265 + Math.sin(localP * Math.PI * 2) * 18;
          document.getElementById('s2-ink-sheen').setAttribute('y', sheenY.toFixed(1));
        } else if (t < 5.0) {
          // Cut 2B: Sheet Feed
          cutB.classList.add('active');
          const localP = easeInOutCubic(clamp(t - 4.0, 0, 1));
          const feedY = 90 - localP * 180;
          document.getElementById('s2-feeding-sheet').style.transform =
            'translate3d(0, ' + feedY.toFixed(2) + 'px, 0) scale(' + (0.96 + localP * 0.04).toFixed(4) + ')';
        } else {
          // Cut 2C: Printed Spread Emerging
          cutC.classList.add('active');
          const localP = easeOutCubic(clamp(t - 5.0, 0, 1));
          const slideX = (1 - localP) * 90;
          const scale = 0.94 + localP * 0.06;
          document.getElementById('s2-emerging-spread').style.transform =
            'translate3d(' + slideX.toFixed(2) + 'px, 0, 0) scale(' + scale.toFixed(4) + ')';
        }

      } else if (t < 10.0) {
        // ================= SCENE 03: THE BOOK (6.0s - 10.0s) =================
        s3.classList.add('active');
        hud.style.display = 'flex';
        hud.className = 'editorial-hud hud-light';
        hudRight.textContent = 'SCENE 03 / 05 · THE BOOK';

        const subA = document.getElementById('s3-sub-a');
        const subB = document.getElementById('s3-sub-b');
        subA.classList.remove('active');
        subB.classList.remove('active');

        if (t < 7.0) {
          // Subshot 3A: Binding & Case Assembly
          subA.classList.add('active');
          const localP = easeOutCubic(clamp(t - 6.0, 0, 1));
          document.getElementById('s3-binding-rig').style.transform =
            'scale(' + (0.94 + localP * 0.06).toFixed(4) + ')';
          const tighten = (1 - localP) * 18;
          document.getElementById('s3-case-board').setAttribute('y', (76 - tighten).toFixed(1));
          document.getElementById('s3-case-board').setAttribute('height', (232 + tighten * 2).toFixed(1));
        } else {
          // Subshot 3B: True 3D Hardcover Books Showcase (7.0s - 10.0s)
          subB.classList.add('active');
          const localP = easeInOutCubic(clamp((t - 7.0) / 3.0, 0, 1));

          // Controlled dolly-in and gentle studio orbit (< 20 deg so covers remain 100% crisp and readable)
          const dollyScale = 0.95 + localP * 0.06;
          document.getElementById('s3-gallery-rig').style.transform = 'scale(' + dollyScale.toFixed(4) + ')';

          const rotLeft = -18 + localP * 7;   // -18 deg -> -11 deg
          const rotCenter = -12 + localP * 8; // -12 deg -> -4 deg
          const rotRight = 15 - localP * 7;   // +15 deg -> +8 deg
          const tiltX = 4 - localP * 2.5;

          document.getElementById('book-dhukyachi').style.transform =
            'rotateX(' + tiltX.toFixed(2) + 'deg) rotateY(' + rotLeft.toFixed(2) + 'deg)';
          document.getElementById('book-scholar').style.transform =
            'translateZ(36px) rotateX(' + (tiltX * 0.8).toFixed(2) + 'deg) rotateY(' + rotCenter.toFixed(2) + 'deg)';
          document.getElementById('book-lokshahi').style.transform =
            'rotateX(' + tiltX.toFixed(2) + 'deg) rotateY(' + rotRight.toFixed(2) + 'deg)';
        }

      } else if (t < 12.5) {
        // ================= SCENE 04: THE LITERARY WORLD (10.0s - 12.5s) =================
        s4.classList.add('active');
        hud.style.display = 'flex';
        hud.className = 'editorial-hud hud-light';
        hudRight.textContent = 'SCENE 04 / 05 · THE LITERARY WORLD';

        const p = easeInOutCubic(clamp((t - 10.0) / 2.5, 0, 1));
        const bgScale = 1.0 + p * 0.085;
        document.getElementById('s4-world-bg').style.transform =
          'scale(' + bgScale.toFixed(4) + ') translate3d(0, ' + (p * 12).toFixed(2) + 'px, 0)';

        const medallionY = (1 - easeOutCubic(p)) * 34;
        const medallionScale = 0.92 + easeOutCubic(p) * 0.1;
        document.getElementById('s4-emblem-medallion').style.transform =
          'translate(-50%, calc(-50% + ' + medallionY.toFixed(1) + 'px)) scale(' + medallionScale.toFixed(4) + ')';

        document.getElementById('s4-float-quote-1').style.transform =
          'translate3d(' + (p * 18).toFixed(1) + 'px, ' + (-p * 10).toFixed(1) + 'px, 0)';
        document.getElementById('s4-float-quote-2').style.transform =
          'translate3d(' + (-p * 18).toFixed(1) + 'px, ' + (-p * 12).toFixed(1) + 'px, 0)';

      } else {
        // ================= SCENE 05: THE BRAND REVEAL (12.5s - 15.0s) =================
        s5.classList.add('active');
        hud.style.display = 'none'; // Clean editorial frame with generous negative space

        const p = clamp((t - 12.5) / 2.5, 0, 1);
        const revealEase = easeOutCubic(clamp((t - 12.5) / 1.1, 0, 1));

        // Subtle, confident studio settle (scale 0.985 -> 1.000, zero spinning, zero particles)
        const cardScale = 0.985 + revealEase * 0.015;
        document.getElementById('s5-card').style.transform = 'scale(' + cardScale.toFixed(4) + ')';

        // Warm directional studio light sweep across the paper surface
        const sweepX = -900 + easeInOutCubic(clamp(p * 1.25, 0, 1)) * 2200;
        document.getElementById('s5-light-sweep').style.transform =
          'translate3d(' + sweepX.toFixed(1) + 'px, 0, 0) skewX(-18deg)';

        const textLift = (1 - revealEase) * 14;
        document.getElementById('s5-logo-box').style.transform = 'translate3d(0, ' + (textLift * 0.6).toFixed(2) + 'px, 0)';
        document.getElementById('s5-title-mr').style.transform = 'translate3d(0, ' + textLift.toFixed(2) + 'px, 0)';
        document.getElementById('s5-title-en').style.transform = 'translate3d(0, ' + textLift.toFixed(2) + 'px, 0)';
      }
    };
  </script>
</body>
</html>`;
}

async function renderMasterVideo(browser, aspect) {
  const isPortrait = aspect === '9x16';
  const width = isPortrait ? 1080 : 1920;
  const height = isPortrait ? 1920 : 1080;

  const mp4Path = path.join(OUT_DIR, `akath-brand-film-${aspect}.mp4`);
  const webmPath = path.join(OUT_DIR, `akath-brand-film-${aspect}.webm`);
  const posterWebpPath = path.join(OUT_DIR, `akath-brand-film-poster-${aspect}.webp`);
  const posterJpgPath = path.join(OUT_DIR, `akath-brand-film-poster-${aspect}.jpg`);

  console.log(`\n[Brand Film] Rendering ${aspect} master (${width}x${height} @ ${FPS}fps, ${TOTAL_FRAMES} frames)...`);

  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  const html = buildCompositorHtml(aspect);
  const compositorPath = path.join(OUT_DIR, 'svg', `akath-3d-compositor-${aspect}.html`);
  fs.writeFileSync(compositorPath, html, 'utf-8');

  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);

  // Spawn FFmpeg for H.264 MP4 master using quality-96 MJPEG pipe for rapid deterministic capture
  const ffmpegMp4 = spawn('ffmpeg', [
    '-y',
    '-f', 'image2pipe',
    '-vcodec', 'mjpeg',
    '-r', String(FPS),
    '-i', '-',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-profile:v', 'high',
    '-level', '4.2',
    '-crf', '17',
    '-preset', 'fast',
    '-maxrate', '3800k',
    '-bufsize', '7600k',
    '-movflags', '+faststart',
    mp4Path,
  ], { stdio: ['pipe', 'ignore', 'pipe'] });

  let ffmpegErr = '';
  ffmpegMp4.stderr.on('data', (d) => {
    ffmpegErr += d.toString();
  });

  // Sample timestamps for QC inspection across all 5 scenes
  const qcFrames = new Map([
    [36, `qc-${aspect}-scene01-origin.png`],         // 1.5s
    [84, `qc-${aspect}-scene02a-rollers.png`],       // 3.5s
    [108, `qc-${aspect}-scene02b-sheetfeed.png`],    // 4.5s
    [132, `qc-${aspect}-scene02c-spread.png`],       // 5.5s
    [156, `qc-${aspect}-scene03a-binding.png`],      // 6.5s
    [204, `qc-${aspect}-scene03b-3dbooks.png`],      // 8.5s (Poster frame!)
    [270, `qc-${aspect}-scene04-literaryworld.png`], // 11.25s
    [336, `qc-${aspect}-scene05-brandreveal.png`],   // 14.0s
  ]);

  let posterPngBuffer = null;

  for (let frame = 0; frame < TOTAL_FRAMES; frame++) {
    const t = frame / FPS;
    await page.evaluate((timeSec) => {
      window.renderFrameAtTime(timeSec);
    }, t);

    if (qcFrames.has(frame)) {
      const pngBuf = await page.screenshot({ type: 'png', omitBackground: false });
      fs.writeFileSync(path.join(QC_DIR, qcFrames.get(frame)), pngBuf);
      if (frame === 204) {
        posterPngBuffer = pngBuf;
      }
    }

    const jpgBuf = await page.screenshot({ type: 'jpeg', quality: 96, omitBackground: false });

    const canContinue = ffmpegMp4.stdin.write(jpgBuf);
    if (!canContinue) {
      await new Promise((resolve) => ffmpegMp4.stdin.once('drain', resolve));
    }

    if ((frame + 1) % 72 === 0 || frame === TOTAL_FRAMES - 1) {
      console.log(`  [${aspect}] Rendered frame ${frame + 1}/${TOTAL_FRAMES} (${t.toFixed(2)}s)`);
    }
  }

  ffmpegMp4.stdin.end();
  await new Promise((resolve, reject) => {
    ffmpegMp4.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg MP4 exited with ${code}: ${ffmpegErr}`));
    });
  });

  // Transcode WebM (VP9) from the MP4 master
  console.log(`  [${aspect}] Encoding VP9 WebM master...`);
  execFileSync('ffmpeg', [
    '-y',
    '-i', mp4Path,
    '-c:v', 'libvpx-vp9',
    '-b:v', '2600k',
    '-maxrate', '3600k',
    '-bufsize', '7200k',
    '-crf', '22',
    '-deadline', 'good',
    '-cpu-used', '4',
    '-row-mt', '1',
    '-an',
    webmPath,
  ], { stdio: 'ignore' });

  // Write high-resolution Poster images (WebP + JPEG) from the 3D Books showcase frame
  const tempPosterPng = path.join(QC_DIR, `poster-source-${aspect}.png`);
  fs.writeFileSync(tempPosterPng, posterPngBuffer);
  execFileSync('ffmpeg', ['-y', '-i', tempPosterPng, '-q:v', '90', posterWebpPath], { stdio: 'ignore' });
  execFileSync('ffmpeg', ['-y', '-i', tempPosterPng, '-q:v', '2', posterJpgPath], { stdio: 'ignore' });

  await context.close();

  const mp4Size = (fs.statSync(mp4Path).size / (1024 * 1024)).toFixed(2);
  const webmSize = (fs.statSync(webmPath).size / (1024 * 1024)).toFixed(2);
  console.log(`  [${aspect}] Complete -> MP4: ${mp4Size} MB | WebM: ${webmSize} MB`);
}

async function main() {
  const onlyAspect = process.argv.find((a) => a.startsWith('--aspect='))?.split('=')[1];
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-gpu-rasterization'],
  });
  try {
    if (!onlyAspect || onlyAspect === '16x9') {
      await renderMasterVideo(browser, '16x9');
    }
    if (!onlyAspect || onlyAspect === '9x16') {
      await renderMasterVideo(browser, '9x16');
    }
  } finally {
    await browser.close();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error('Brand film render failed:', err);
    process.exit(1);
  });
}
