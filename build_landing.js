const fs = require('fs');
const fonts = JSON.parse(fs.readFileSync('fonts_base64.json', 'utf8'));

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NOVA AGENT — Thinking Machines</title>

  <script type="importmap">
  {
    "imports": {
      "three": "https://unpkg.com/three@0.160.0/build/three.module.js",
      "three/addons/": "https://unpkg.com/three@0.160.0/examples/jsm/"
    }
  }
  </script>

  <style>
    @font-face {
      font-family: 'IBM Plex Mono';
      font-style: normal;
      font-weight: 300;
      src: url('data:font/woff2;base64,${fonts.mono300}') format('woff2');
    }
    @font-face {
      font-family: 'IBM Plex Mono';
      font-style: normal;
      font-weight: 400;
      src: url('data:font/woff2;base64,${fonts.mono400}') format('woff2');
    }
    @font-face {
      font-family: 'IBM Plex Mono';
      font-style: normal;
      font-weight: 500;
      src: url('data:font/woff2;base64,${fonts.mono500}') format('woff2');
    }
    @font-face {
      font-family: 'Schibsted Grotesk';
      font-style: normal;
      font-weight: 400 500;
      src: url('data:font/woff2;base64,${fonts.schibsted}') format('woff2');
    }

    :root {
      --bg: #efece6;
      --text: #141414;
      --dim-text: rgba(20, 20, 20, 0.5);
      --grid-line: rgba(20, 20, 20, 0.09);
      --paper-panel: rgba(239, 236, 230, 0.88);
      --brand-gradient: conic-gradient(from 200deg, #ffb347, #ff8a3d 18%, #ff5a5f 34%, #ff3d8b 50%, #ff5a5f 66%, #ff8a3d 82%, #ffb347);
      --brand-linear: linear-gradient(135deg, #ffb347 0%, #ff8a3d 25%, #ff5a5f 55%, #ff3d8b 100%);
      --col: 17%;
      --col-mid: 50%;
      --col-right: 83%;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html, body {
      background-color: var(--bg);
      color: var(--text);
      font-family: 'Schibsted Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      overflow-x: hidden;
      width: 100%;
      scroll-behavior: smooth;
    }

    .mono {
      font-family: 'IBM Plex Mono', monospace;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* Fixed 3D Canvas Background */
    #webgl-canvas {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 1;
      pointer-events: none;
    }

    /* Fixed Vertical Grid Guides (17%, 50%, 83%) */
    .grid-guides {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 2;
    }
    .grid-line {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 1px;
      background: var(--grid-line);
    }
    .grid-line.col-left { left: 17%; }
    .grid-line.col-mid { left: 50%; }
    .grid-line.col-right { left: 83%; }

    /* Top Bar (30px tall, mono 11px) */
    .top-bar {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 30px;
      background: var(--bg);
      border-bottom: 1px solid var(--grid-line);
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 17%;
      font-size: 11px;
      transition: transform 0.5s cubic-bezier(0.6, 0, 0.2, 1);
    }
    .top-bar.hidden {
      transform: translateY(-100%);
    }
    .top-bar-text {
      color: var(--text);
      display: flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .top-bar-text strong {
      font-weight: 500;
    }
    .top-bar-close {
      cursor: pointer;
      color: var(--dim-text);
      font-size: 14px;
      padding: 4px 8px;
      line-height: 1;
      background: none;
      border: none;
      transition: color 0.2s;
    }
    .top-bar-close:hover {
      color: var(--text);
    }

    /* Navigation Bar (52px tall, below top bar, moves to top 0 when scrolled) */
    .navbar {
      position: fixed;
      top: 30px;
      left: 0;
      width: 100%;
      height: 52px;
      background: rgba(239, 236, 230, 0.86);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border-bottom: 1px solid var(--grid-line);
      z-index: 99;
      display: grid;
      grid-template-columns: 17% 1fr 12% 17%;
      align-items: center;
      transition: top 0.5s cubic-bezier(0.6, 0, 0.2, 1);
    }
    .navbar.scrolled {
      top: 0;
    }

    .nav-logo-cell {
      padding-left: 24px;
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: var(--text);
    }
    .nav-logo-icon {
      width: 27px;
      height: 27px;
      flex-shrink: 0;
    }
    .nav-logo-text {
      font-size: 18px;
      font-weight: 500;
      letter-spacing: -0.01em;
      white-space: nowrap;
    }

    .nav-menu {
      display: flex;
      align-items: center;
      gap: 22px;
      padding-left: 20px;
      list-style: none;
      font-size: 11px;
    }
    .nav-menu a {
      color: var(--text);
      text-decoration: none;
      transition: color 0.2s;
    }
    .nav-menu a:hover {
      color: #ff5a5f;
    }

    .nav-pad-cell {
      height: 100%;
      border-left: 1px solid var(--grid-line);
      border-right: 1px solid var(--grid-line);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
    }
    .nav-pad-cell a {
      color: var(--text);
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 4px;
      transition: opacity 0.2s;
    }
    .nav-pad-cell a:hover {
      opacity: 0.7;
    }

    .nav-btn-cell {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: 24px;
    }
    .btn-launch {
      position: relative;
      height: 30px;
      padding: 0 14px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      color: var(--text);
      background: transparent;
      border: 1px solid rgba(20, 20, 20, 0.15);
      border-radius: 3px;
      cursor: pointer;
      text-decoration: none;
      overflow: hidden;
      transition: background 0.2s, transform 0.2s;
    }
    .btn-launch:hover {
      background: rgba(20, 20, 20, 0.04);
      transform: translateY(-1px);
    }
    /* Cut gradient border along part of its top edge and down its left edge */
    .btn-launch::before {
      content: '';
      position: absolute;
      top: -1px;
      left: -1px;
      right: -1px;
      bottom: -1px;
      background: var(--brand-linear);
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      padding: 1.5px;
      clip-path: polygon(0 0, 52% 0, 0 88%);
      pointer-events: none;
    }

    /* Right Rail (fixed, vertically centred, 270px tall) */
    .right-rail {
      position: fixed;
      right: 24px;
      top: 50%;
      transform: translateY(-50%);
      height: 270px;
      width: 76px;
      z-index: 90;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      pointer-events: auto;
    }
    .rail-track {
      position: relative;
      width: 100%;
      height: 230px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
    }
    .rail-dots {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
      width: 4px;
    }
    .rail-dot {
      width: 2.5px;
      height: 2.5px;
      background: rgba(20, 20, 20, 0.25);
      border-radius: 50%;
      margin: 0 auto;
    }
    .rail-floating-label {
      position: absolute;
      left: 0;
      width: 100%;
      height: 26px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      background: var(--bg);
      border: 1px solid var(--grid-line);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
      border-radius: 2px;
      font-size: 9.5px;
      letter-spacing: 0.08em;
      top: 0%;
      transition: top 0.7s cubic-bezier(0.2, 0.7, 0.2, 1);
      z-index: 2;
    }
    .rail-dial-icon {
      width: 9px;
      height: 9px;
      border: 1.5px solid var(--text);
      border-radius: 50%;
      position: relative;
    }
    .rail-dial-icon::after {
      content: '';
      position: absolute;
      top: 1px;
      left: 2.5px;
      width: 1.5px;
      height: 3px;
      background: #ff5a5f;
    }
    .rail-menu-btn {
      font-size: 10px;
      color: var(--dim-text);
      letter-spacing: 0.06em;
      cursor: pointer;
      text-decoration: none;
      transition: color 0.2s;
    }
    .rail-menu-btn:hover {
      color: var(--text);
    }

    /* Content Stage */
    .content-container {
      position: relative;
      z-index: 10;
      width: 100%;
    }

    section.page-section {
      position: relative;
      width: 100%;
      height: 100vh;
      min-height: 700px;
      overflow: hidden;
    }

    /* Staggered Reveal Animations (.rv) */
    .rv {
      opacity: 0;
      transform: translateY(26px);
      transition: opacity 1s cubic-bezier(0.2, 0.7, 0.2, 1), transform 1s cubic-bezier(0.2, 0.7, 0.2, 1);
    }
    .rv.revealed {
      opacity: 1;
      transform: translateY(0);
    }
    .rv-del-1 { transition-delay: 0.1s; }
    .rv-del-2 { transition-delay: 0.2s; }
    .rv-del-3 { transition-delay: 0.3s; }
    .rv-del-4 { transition-delay: 0.4s; }

    /* Corner Brackets (7px rounded) */
    .corner-bracket {
      position: absolute;
      width: 7px;
      height: 7px;
      border: 1.5px solid var(--text);
      pointer-events: none;
    }
    .cb-tl { top: -3px; left: -3px; border-right: none; border-bottom: none; border-top-left-radius: 2px; }
    .cb-tr { top: -3px; right: -3px; border-left: none; border-bottom: none; border-top-right-radius: 2px; }
    .cb-bl { bottom: -3px; left: -3px; border-right: none; border-top: none; border-bottom-left-radius: 2px; }
    .cb-br { bottom: -3px; right: -3px; border-left: none; border-top: none; border-bottom-right-radius: 2px; }

    /* ========================================================
       SECTION 1: INTRO (100vh)
       ======================================================== */
    .intro-prompt-box-wrap {
      position: absolute;
      left: 17%;
      top: 30%;
      width: 24.4%;
      pointer-events: auto;
    }
    .prompt-tab {
      width: 42px;
      height: 42px;
      background: var(--bg);
      border: 1px solid rgba(20, 20, 20, 0.14);
      border-bottom: none;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 28px;
      font-weight: bold;
      line-height: 1;
      color: var(--text);
    }
    .prompt-box {
      position: relative;
      padding: 16px 18px;
      background: rgba(239, 236, 230, 0.65);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      border: 1px solid rgba(20, 20, 20, 0.14);
      min-height: 94px;
    }
    .prompt-text {
      font-size: 11px;
      line-height: 1.45;
      color: var(--text);
      display: inline;
    }
    .typing-caret {
      display: inline-block;
      width: 6px;
      height: 11px;
      background: var(--text);
      vertical-align: middle;
      margin-left: 2px;
      animation: blink 0.9s infinite;
    }
    @keyframes blink {
      0%, 49% { opacity: 1; }
      50%, 100% { opacity: 0; }
    }
    .prompt-next-preview {
      margin-top: 10px;
      font-size: 10px;
      color: rgba(20, 20, 20, 0.35);
      line-height: 1.4;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Hairline rule from prompt box to 83% guide level with top of box */
    .intro-top-rule {
      position: absolute;
      top: 30%;
      left: calc(17% + 24.4%);
      right: 17%;
      height: 1px;
      background: var(--grid-line);
      pointer-events: none;
    }

    /* Feature list */
    .intro-feature-list {
      position: absolute;
      top: calc(30% + 1px);
      right: 17%;
      width: 23%;
      pointer-events: auto;
    }
    .feature-row {
      height: 21px;
      border-bottom: 1px solid var(--grid-line);
      display: flex;
      align-items: center;
      position: relative;
      font-size: 10.5px;
      color: var(--text);
      letter-spacing: 0.06em;
    }
    .feature-row.dim {
      color: var(--dim-text);
    }
    .feature-dot {
      position: absolute;
      left: 18%;
      width: 3px;
      height: 3px;
      background: var(--text);
      border-radius: 50%;
    }
    .feature-row.dim .feature-dot {
      background: var(--dim-text);
    }
    .feature-label {
      padding-left: calc(18% + 12px);
    }

    /* Bottom left headline */
    .intro-bottom-left {
      position: absolute;
      left: 17%;
      bottom: 5.5%;
      pointer-events: auto;
    }
    .unleash-tag {
      font-size: 12px;
      color: var(--text);
      margin-bottom: 12px;
      display: block;
      letter-spacing: 0.06em;
    }
    .headline-stack {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .headline-line {
      font-size: clamp(42px, 5.25vw, 92px);
      font-weight: 400;
      line-height: 1;
      padding: 6px 22px 10px 16px;
      position: relative;
      display: inline-block;
      width: fit-content;
      color: var(--text);
    }

    /* Box 1: Thinking - orange->pink border with bottom-right corner cut at 45deg */
    .headline-box-thinking {
      clip-path: polygon(
        0 0, 
        100% 0, 
        100% calc(100% - 22px), 
        calc(100% - 22px) 100%, 
        0 100%
      );
    }
    .headline-box-thinking::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, #ff8a3d 0%, #ff5a5f 55%, #ff3d8b 100%);
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      padding: 2px;
      clip-path: polygon(
        0 0, 
        100% 0, 
        100% calc(100% - 22px), 
        calc(100% - 22px) 100%, 
        0 100%
      );
      pointer-events: none;
    }

    /* Box 2: Machines - amber->orange->pink border */
    .headline-box-machines {
      position: relative;
      border: 2px solid transparent;
      border-image: linear-gradient(135deg, #ffb347 0%, #ff8a3d 50%, #ff5a5f 100%) 1;
    }

    /* Sub line (bottom 3.6%, left at 62% + 18px) */
    .intro-sub-line {
      position: absolute;
      left: calc(62% + 18px);
      bottom: 3.6%;
      font-size: 14.5px;
      color: var(--text);
      max-width: 290px;
      line-height: 1.4;
      pointer-events: auto;
    }

    /* Scroll link */
    .intro-scroll-link {
      position: absolute;
      right: 17%;
      bottom: 5.5%;
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 11px;
      letter-spacing: 0.08em;
      color: var(--text);
      text-decoration: none;
      cursor: pointer;
      pointer-events: auto;
    }
    .scroll-bracket-box {
      position: relative;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .scroll-arrow-icon {
      font-size: 12px;
      animation: arrowBob 2s ease-in-out infinite;
    }
    @keyframes arrowBob {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(4px); }
    }

    /* Bottom hairline rule from 50% to right edge at bottom 14% */
    .intro-bottom-rule {
      position: absolute;
      bottom: 14%;
      left: 50%;
      right: 0;
      height: 1px;
      background: var(--grid-line);
      pointer-events: none;
    }

    /* ========================================================
       SECTION 2: PRODUCT (100vh)
       ======================================================== */
    .product-carousel-strip {
      position: absolute;
      top: 14%;
      left: 17%;
      right: 0;
      height: 74px;
      overflow: hidden;
      display: flex;
      align-items: center;
      pointer-events: auto;
    }
    .product-carousel-track {
      display: flex;
      transition: transform 0.9s cubic-bezier(0.65, 0, 0.2, 1);
    }
    .carousel-tab {
      width: 33vw;
      min-width: 320px;
      height: 56px;
      display: flex;
      align-items: center;
      position: relative;
      flex-shrink: 0;
      padding: 0 18px;
      color: rgba(20, 20, 20, 0.14);
      transition: color 0.4s, opacity 0.4s;
    }
    .carousel-tab.passed {
      opacity: 0;
    }
    .carousel-tab.active {
      color: var(--text);
      border: 1px solid rgba(20, 20, 20, 0.2);
      background: rgba(239, 236, 230, 0.7);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
    }
    .carousel-tab .corner-bracket {
      display: none;
    }
    .carousel-tab.active .corner-bracket {
      display: block;
    }
    .carousel-tab-num {
      width: 68px;
      font-size: 11px;
      flex-shrink: 0;
      color: inherit;
    }
    .carousel-tab-label {
      font-size: 15px;
      font-weight: 500;
      letter-spacing: -0.01em;
      color: inherit;
    }

    /* Section 2 Headline */
    .product-headline-block {
      position: absolute;
      left: 17%;
      bottom: 8%;
      pointer-events: auto;
    }
    .product-dots-tag {
      font-size: 14px;
      letter-spacing: 0.2em;
      margin-bottom: 8px;
      color: var(--dim-text);
      display: block;
    }
    .product-gateway-box {
      display: inline-block;
      border: 1px solid rgba(20, 20, 20, 0.2);
      border-radius: 4px;
      padding: 6px 18px;
      font-size: clamp(30px, 3.05vw, 54px);
      font-weight: 400;
      line-height: 1.1;
      margin-bottom: 6px;
      background: rgba(239, 236, 230, 0.65);
    }
    .product-sub-title {
      font-size: clamp(30px, 3.05vw, 54px);
      font-weight: 400;
      line-height: 1.1;
      display: block;
    }

    /* ========================================================
       SECTION 3: REVIEWS (100vh)
       ======================================================== */
    .reviews-header-strip {
      position: absolute;
      top: 13%;
      left: 17%;
      right: 17%;
      height: 60px;
      border-bottom: 1px solid var(--grid-line);
      display: flex;
      align-items: center;
      gap: 18px;
      pointer-events: auto;
    }
    .tstmnl-badge {
      font-size: 11px;
      color: var(--text);
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .reviews-avatar-box {
      width: 56px;
      height: 56px;
      border: 1px solid var(--grid-line);
      border-radius: 2px;
      overflow: hidden;
      flex-shrink: 0;
      background: #e6e2db;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .reviews-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      transition: opacity 0.45s, transform 0.45s;
    }
    .reviews-name {
      font-weight: 500;
      color: var(--text);
    }
    .reviews-role {
      font-size: 11px;
      color: var(--dim-text);
    }

    .reviews-quote-wrap {
      position: absolute;
      left: 17%;
      top: 26%;
      width: 23vw;
      min-width: 290px;
      pointer-events: auto;
      transition: opacity 0.45s cubic-bezier(0.2, 0.7, 0.2, 1), transform 0.45s cubic-bezier(0.2, 0.7, 0.2, 1);
    }
    .reviews-quote-text {
      font-size: clamp(20px, 2.3vw, 40px);
      line-height: 1.19;
      font-weight: 400;
      letter-spacing: -0.015em;
      color: var(--text);
      margin-bottom: 24px;
    }
    .reviews-action-link {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 11px;
      color: var(--text);
      text-decoration: none;
      cursor: pointer;
    }
    .action-rule {
      width: 32px;
      height: 1px;
      background: var(--text);
    }

    .reviews-nav-arrows {
      position: absolute;
      left: 17%;
      bottom: 8%;
      display: flex;
      gap: 12px;
      pointer-events: auto;
    }
    .review-arrow-btn {
      width: 38px;
      height: 38px;
      border: 1px solid var(--grid-line);
      background: var(--bg);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 15px;
      transition: background 0.2s, border-color 0.2s;
    }
    .review-arrow-btn:hover {
      background: #e5e2db;
      border-color: rgba(20, 20, 20, 0.3);
    }

    .reviews-ghost-wrap {
      position: absolute;
      left: calc(83% + 24px);
      top: 26%;
      width: 20vw;
      opacity: 0.1;
      pointer-events: none;
    }
    .reviews-ghost-text {
      font-size: clamp(18px, 1.8vw, 32px);
      line-height: 1.25;
      color: var(--text);
    }

    /* Footer (30vh, centred mono "NOVA AGENT · 2026") */
    footer.page-footer {
      position: relative;
      z-index: 10;
      height: 30vh;
      min-height: 180px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-top: 1px solid var(--grid-line);
      background: var(--bg);
      font-size: 11px;
      color: var(--dim-text);
      letter-spacing: 0.08em;
    }

    /* ========================================================
       RESPONSIVE (<= 900px)
       ======================================================== */
    @media (max-width: 900px) {
      .grid-guides,
      .right-rail,
      .intro-top-rule,
      .intro-feature-list,
      .reviews-ghost-wrap,
      .nav-menu,
      .nav-pad-cell {
        display: none !important;
      }

      .top-bar {
        padding: 0 16px;
      }
      .navbar {
        grid-template-columns: 1fr auto;
        padding: 0 16px;
      }
      .nav-logo-cell {
        padding-left: 0;
      }
      .nav-btn-cell {
        padding-right: 0;
      }

      .intro-prompt-box-wrap {
        left: 16px;
        right: 16px;
        top: 18%;
        width: calc(100% - 32px);
      }
      .intro-bottom-left {
        left: 16px;
        bottom: 16px;
      }
      .intro-scroll-link {
        right: 16px;
        bottom: 16px;
      }
      .intro-sub-line {
        left: 16px;
        bottom: calc(16px + 140px);
        max-width: calc(100% - 32px);
      }
      .intro-bottom-rule {
        display: none;
      }

      /* Paper backings for enhanced readability on mobile */
      .unleash-tag,
      .headline-line,
      .intro-sub-line,
      .product-gateway-box,
      .product-sub-title,
      .reviews-quote-text,
      .reviews-action-link {
        background: var(--paper-panel);
        padding: 4px 8px;
        border-radius: 2px;
      }

      .product-carousel-strip {
        left: 16px;
      }
      .product-headline-block {
        left: 16px;
        bottom: 16px;
      }
      .reviews-header-strip {
        left: 16px;
        right: 16px;
      }
      .reviews-quote-wrap {
        left: 16px;
        width: calc(100% - 32px);
      }
      .reviews-nav-arrows {
        left: 16px;
        bottom: 16px;
      }
    }
  </style>
</head>
<body>

  <!-- Fixed 3D Robot Canvas -->
  <canvas id="webgl-canvas"></canvas>

  <!-- Fixed Vertical Grid Guides -->
  <div class="grid-guides" aria-hidden="true">
    <div class="grid-line col-left"></div>
    <div class="grid-line col-mid"></div>
    <div class="grid-line col-right"></div>
  </div>

  <!-- Top Bar -->
  <aside class="top-bar mono" id="topBar">
    <div class="top-bar-text">
      <strong>New:</strong> Nova Agent V1 Is Here - The Home for On-chain AI Agents ↗
    </div>
    <button class="top-bar-close" id="topBarClose" aria-label="Close Announcement">×</button>
  </aside>

  <!-- Navigation Bar -->
  <nav class="navbar" id="navbar">
    <a href="#intro" class="nav-logo-cell">
      <svg class="nav-logo-icon" viewBox="0 0 27 27" fill="none">
        <defs>
          <linearGradient id="logoGrad" x1="0" y1="0" x2="27" y2="27" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#ffb347"/>
            <stop offset="40%" stop-color="#ff8a3d"/>
            <stop offset="70%" stop-color="#ff5a5f"/>
            <stop offset="100%" stop-color="#ff3d8b"/>
          </linearGradient>
        </defs>
        <!-- C-shape rounded-square outline -->
        <path d="M 21.5 6 C 19 3 16 2 13.5 2 C 7.15 2 2 7.15 2 13.5 C 2 19.85 7.15 25 13.5 25 C 16 25 19 24 21.5 21" 
              stroke="url(#logoGrad)" stroke-width="2.6" stroke-linecap="round"/>
        <circle cx="10" cy="13.5" r="1.5" fill="#141414"/>
        <circle cx="16" cy="13.5" r="1.5" fill="#141414"/>
      </svg>
      <span class="nav-logo-text">NOVA AGENT</span>
    </a>

    <ul class="nav-menu mono">
      <li><a href="#product">Solutions ▾</a></li>
      <li><a href="#product">Pricing</a></li>
      <li><a href="#product">Learn ▾</a></li>
      <li><a href="#intro">$NOVA ▾</a></li>
      <li><a href="#reviews">Community ▾</a></li>
      <li><a href="#reviews">Contact us</a></li>
    </ul>

    <div class="nav-pad-cell mono">
      <a href="#product">Nova Pad ↗</a>
    </div>

    <div class="nav-btn-cell">
      <a href="#intro" class="btn-launch mono">
        <span>••</span> LAUNCH NOVA
      </a>
    </div>
  </nav>

  <!-- Right Rail -->
  <aside class="right-rail" id="rightRail">
    <div class="rail-track">
      <div class="rail-dots" id="railDots"></div>
      <div class="rail-floating-label mono" id="railLabel">
        <span class="rail-dial-icon"></span>
        <span id="railLabelText">INTRO</span>
      </div>
    </div>
    <a href="#intro" class="rail-menu-btn mono">≡ MENU</a>
  </aside>

  <!-- Content Container -->
  <main class="content-container">

    <!-- ==========================================
         SECTION 1: INTRO
         ========================================== -->
    <section class="page-section" id="intro">
      <!-- Prompt box -->
      <div class="intro-prompt-box-wrap rv rv-del-1">
        <div class="prompt-tab">“</div>
        <div class="prompt-box">
          <div class="corner-bracket cb-tl"></div>
          <div class="corner-bracket cb-tr"></div>
          <div class="corner-bracket cb-bl"></div>
          <div class="corner-bracket cb-br"></div>
          <span class="prompt-text mono" id="promptTypingText"></span><span class="typing-caret"></span>
          <div class="prompt-next-preview mono" id="promptNextPreview"></div>
        </div>
      </div>

      <!-- Rule from prompt box to 83% guide -->
      <div class="intro-top-rule rv rv-del-2"></div>

      <!-- Feature list -->
      <div class="intro-feature-list rv rv-del-2">
        <div class="feature-row mono">
          <span class="feature-dot"></span>
          <span class="feature-label">DEVELOPMENT</span>
        </div>
        <div class="feature-row mono">
          <span class="feature-dot"></span>
          <span class="feature-label">MARKET ANALYSIS</span>
        </div>
        <div class="feature-row mono">
          <span class="feature-dot"></span>
          <span class="feature-label">AI TRADING</span>
        </div>
        <div class="feature-row mono dim">
          <span class="feature-dot"></span>
          <span class="feature-label">AND MUCH MORE</span>
        </div>
      </div>

      <!-- Bottom left headline -->
      <div class="intro-bottom-left rv rv-del-3">
        <span class="unleash-tag mono">UNLEASH THE POWER OF</span>
        <div class="headline-stack">
          <!-- Thinking with 45deg cut bottom-right corner -->
          <div class="headline-line headline-box-thinking">
            Thinking
          </div>
          <!-- Machines with amber->orange->pink border -->
          <div class="headline-line headline-box-machines">
            Machines
          </div>
        </div>
      </div>

      <!-- Sub line -->
      <p class="intro-sub-line rv rv-del-4">
        Your personal expert in all crypto &amp; blockchain related topics.
      </p>

      <!-- Scroll link -->
      <a href="#product" class="intro-scroll-link mono rv rv-del-4">
        <span>SCROLL</span>
        <div class="scroll-bracket-box">
          <div class="corner-bracket cb-tl"></div>
          <div class="corner-bracket cb-tr"></div>
          <div class="corner-bracket cb-bl"></div>
          <div class="corner-bracket cb-br"></div>
          <span class="scroll-arrow-icon">↓</span>
        </div>
      </a>

      <!-- Bottom hairline rule from 50% to right edge at bottom 14% -->
      <div class="intro-bottom-rule"></div>
    </section>

    <!-- ==========================================
         SECTION 2: PRODUCT
         ========================================== -->
    <section class="page-section" id="product">
      <!-- 74px Tab Carousel -->
      <div class="product-carousel-strip rv rv-del-1">
        <div class="product-carousel-track" id="carouselTrack">
          <!-- 10 tabs generated by script -->
        </div>
      </div>

      <!-- Bottom left headline -->
      <div class="product-headline-block rv rv-del-3">
        <span class="product-dots-tag mono">··</span>
        <div class="product-gateway-box">Your Gateway</div>
        <span class="product-sub-title">To Web3 AI</span>
      </div>
    </section>

    <!-- ==========================================
         SECTION 3: REVIEWS
         ========================================== -->
    <section class="page-section" id="reviews">
      <!-- Header strip (60px tall) -->
      <div class="reviews-header-strip rv rv-del-1">
        <div class="tstmnl-badge mono">TSTMNL <span id="reviewNumBadge">[ 01 ]</span></div>
        <div class="reviews-avatar-box">
          <!-- Inline SVG avatar: a figure in front of a brick wall (56px) -->
          <svg viewBox="0 0 56 56" width="56" height="56" fill="none">
            <!-- Brick wall background -->
            <rect width="56" height="56" fill="#ded9d0"/>
            <path d="M0 14 H56 M0 28 H56 M0 42 H56" stroke="#c8c2b7" stroke-width="1.2"/>
            <path d="M14 0 V14 M42 0 V14 M28 14 V28 M14 28 V42 M42 28 V42 M28 42 V56" stroke="#c8c2b7" stroke-width="1.2"/>
            <!-- Stylized figure silhouette in front of wall -->
            <circle cx="28" cy="22" r="8.5" fill="#2a2928"/>
            <path d="M13 52 C13 36 21 34 28 34 C35 34 43 36 43 52 Z" fill="#2a2928"/>
            <circle cx="28" cy="21" r="3.2" fill="#ff8a3d"/>
          </svg>
        </div>
        <div class="reviews-meta" id="reviewMeta">
          <span class="reviews-name" id="reviewAuthor">Ilan Brooks</span>
          <span class="mono">·</span>
          <span class="reviews-role mono" id="reviewRole">Founder of Halden Capital</span>
        </div>
      </div>

      <!-- Quote -->
      <div class="reviews-quote-wrap rv rv-del-2" id="quoteWrap">
        <div class="reviews-quote-text" id="reviewQuoteText">
          “Smart contract auditing has always been a bottleneck for our startups, Nova Agent solves this problem in seconds.
        </div>
        <a href="#intro" class="reviews-action-link mono">
          <span class="action-rule"></span>
          <span>Try for yourself (Click Here)</span>
        </a>
      </div>

      <!-- Arrow Controls -->
      <div class="reviews-nav-arrows rv rv-del-4">
        <button class="review-arrow-btn" id="prevReviewBtn" aria-label="Previous Review">←</button>
        <button class="review-arrow-btn" id="nextReviewBtn" aria-label="Next Review">→</button>
      </div>

      <!-- Ghost next review (10% ink to the right of the 83% guide) -->
      <div class="reviews-ghost-wrap" id="ghostWrap">
        <div class="reviews-ghost-text" id="ghostQuoteText">
          Nova Agent is a vital asset for Web3 investors, simplifying the research process effortlessly.
        </div>
      </div>
    </section>

    <!-- Footer (30vh, centred mono "NOVA AGENT · 2026") -->
    <footer class="page-footer mono rv rv-del-1">
      NOVA AGENT · 2026
    </footer>

  </main>

  <!-- ==========================================
       THREE.JS APPLICATION SCRIPT
       ========================================== -->
  <script type="module">
    import * as THREE from 'three';
    import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
    import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

    /* ========================================================
       1. SCENE, RENDERER, ENVIRONMENT, CAMERA & LIGHTS
       ======================================================== */
    const canvas = document.getElementById('webgl-canvas');
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();

    // Environment: PMREM from RoomEnvironment (blur .04) at intensity .9
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const roomEnv = new RoomEnvironment();
    const envTexture = pmremGenerator.fromScene(roomEnv, 0.04).texture;
    scene.environment = envTexture;
    scene.environmentIntensity = 0.9;

    // Camera: perspective, 30° FOV
    const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 1.1, 11.6);

    // Lights
    // Hemisphere: sky #fff6ee, ground #d9d2c8, intensity .7
    const hemiLight = new THREE.HemisphereLight(0xfff6ee, 0xd9d2c8, 0.7);
    scene.add(hemiLight);

    // Key: directional #fff3e6 at 1.7 from (-3, 5, 4). Casts 1024px shadow with radius 6 and bias -.0005
    const keyLight = new THREE.DirectionalLight(0xfff3e6, 1.7);
    keyLight.position.set(-3, 5, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.radius = 6;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 18;
    keyLight.shadow.camera.left = -3.5;
    keyLight.shadow.camera.right = 3.5;
    keyLight.shadow.camera.top = 3.5;
    keyLight.shadow.camera.bottom = -3.5;
    scene.add(keyLight);

    // Rim: directional #fff0e6 at 1.2 from (4, 2, -4)
    const rimLight = new THREE.DirectionalLight(0xfff0e6, 1.2);
    rimLight.position.set(4, 2, -4);
    scene.add(rimLight);

    // Fill: warm point light #ff9a6a at 2.2 from (-3.2, 1.2, .6), range 6
    const fillLight = new THREE.PointLight(0xff9a6a, 2.2, 6);
    fillLight.position.set(-3.2, 1.2, 0.6);
    scene.add(fillLight);

    /* ========================================================
       2. PROCEDURAL TEXTURES (CONIC GRADIENT & FACE CANVAS)
       ======================================================== */
    // Ring: 512px canvas conic gradient (pink #ff3d8b → coral #ff5a5f → orange #ff8a3d → amber #ffb347 → orange → coral → pink)
    const ringCanvas = document.createElement('canvas');
    ringCanvas.width = 512;
    ringCanvas.height = 512;
    const rCtx = ringCanvas.getContext('2d');
    const conic = rCtx.createConicGradient(0, 256, 256);
    conic.addColorStop(0, '#ff3d8b');
    conic.addColorStop(0.18, '#ff5a5f');
    conic.addColorStop(0.34, '#ff8a3d');
    conic.addColorStop(0.50, '#ffb347');
    conic.addColorStop(0.66, '#ff8a3d');
    conic.addColorStop(0.82, '#ff5a5f');
    conic.addColorStop(1, '#ff3d8b');
    rCtx.fillStyle = conic;
    rCtx.fillRect(0, 0, 512, 512);

    const ringTexture = new THREE.CanvasTexture(ringCanvas);
    ringTexture.colorSpace = THREE.SRGBColorSpace;

    // Face canvas: 512px black fill, white shapes with white glow (shadowBlur 18)
    const faceCanvas = document.createElement('canvas');
    faceCanvas.width = 512;
    faceCanvas.height = 512;
    const fCtx = faceCanvas.getContext('2d');
    const faceTexture = new THREE.CanvasTexture(faceCanvas);
    faceTexture.colorSpace = THREE.SRGBColorSpace;

    let quoteMode = false;
    let quoteAlpha = 0.0;
    let eyeBlinkProgress = 0;
    let isBlinking = false;
    let blinkStartTime = 0;
    let nextBlinkTime = performance.now() + 3000;

    function renderFace() {
      fCtx.fillStyle = '#000000';
      fCtx.fillRect(0, 0, 512, 512);

      // Blink timing: every 2.5-5.5s squash vertically to 10% and back over .18s
      const now = performance.now();
      if (!isBlinking && now > nextBlinkTime) {
        isBlinking = true;
        blinkStartTime = now;
      }
      if (isBlinking) {
        const elapsed = (now - blinkStartTime) / 180;
        if (elapsed >= 1) {
          isBlinking = false;
          eyeBlinkProgress = 0;
          nextBlinkTime = now + 2500 + Math.random() * 3000;
        } else {
          eyeBlinkProgress = Math.sin(elapsed * Math.PI) * 0.9;
        }
      }

      // Smooth fade in/out for quote mode at +.05 alpha per frame
      if (quoteMode && quoteAlpha < 1.0) {
        quoteAlpha = Math.min(1.0, quoteAlpha + 0.05);
      } else if (!quoteMode && quoteAlpha > 0.0) {
        quoteAlpha = Math.max(0.0, quoteAlpha - 0.05);
      }

      fCtx.save();
      fCtx.shadowColor = '#ffffff';
      fCtx.shadowBlur = 18;
      fCtx.fillStyle = '#ffffff';

      // Eyes: two ellipses at (196, 262) and (316, 252), radius 30 x 38
      if (quoteAlpha < 1.0) {
        fCtx.globalAlpha = 1.0 - quoteAlpha;
        const scaleY = Math.max(0.1, 1.0 - eyeBlinkProgress);

        fCtx.beginPath();
        fCtx.ellipse(196, 262, 30, 38 * scaleY, 0, 0, Math.PI * 2);
        fCtx.fill();

        fCtx.beginPath();
        fCtx.ellipse(316, 252, 30, 38 * scaleY, 0, 0, Math.PI * 2);
        fCtx.fill();
      }

      // Quote mode: single 560px "Arial Black" “ centred at (256, 400)
      if (quoteAlpha > 0.0) {
        fCtx.globalAlpha = quoteAlpha;
        fCtx.font = '900 560px "Arial Black", sans-serif';
        fCtx.textAlign = 'center';
        fCtx.textBaseline = 'alphabetic';
        fCtx.fillText('“', 256, 400);
      }

      fCtx.restore();
      faceTexture.needsUpdate = true;
    }

    /* ========================================================
       3. MATERIALS
       ======================================================== */
    const shellMat = new THREE.MeshPhysicalMaterial({
      color: 0xeeebe6,
      roughness: 0.38,
      clearcoat: 0.45,
      clearcoatRoughness: 0.3
    });

    const shellLightMat = new THREE.MeshPhysicalMaterial({
      color: 0xf8f6f2,
      roughness: 0.34,
      clearcoat: 0.45,
      clearcoatRoughness: 0.3
    });

    const jointsMat = new THREE.MeshStandardMaterial({
      color: 0x1b1b1f,
      roughness: 0.55,
      metalness: 0.3
    });

    const deepDarkMat = new THREE.MeshStandardMaterial({
      color: 0x0f0f12,
      roughness: 0.8
    });

    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x2a2928,
      roughness: 0.9
    });

    const ringMat = new THREE.MeshPhysicalMaterial({
      map: ringTexture,
      emissiveMap: ringTexture,
      emissive: 0xffffff,
      emissiveIntensity: 0.22,
      roughness: 0.5,
      clearcoat: 0.35
    });

    const screenMat = new THREE.MeshPhysicalMaterial({
      color: 0x050505,
      roughness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      emissive: 0xffffff,
      emissiveMap: faceTexture,
      emissiveIntensity: 1.6
    });

    /* ========================================================
       4. ROBOT MODEL HIERARCHY
       ======================================================== */
    const robot = new THREE.Group();
    scene.add(robot);

    function createRoundedRectShape(w, h, r) {
      const shape = new THREE.Shape();
      const x = -w / 2;
      const y = -h / 2;
      shape.moveTo(x + r, y);
      shape.lineTo(x + w - r, y);
      shape.quadraticCurveTo(x + w, y, x + w, y + r);
      shape.lineTo(x + w, y + h - r);
      shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      shape.lineTo(x + r, y + h);
      shape.quadraticCurveTo(x, y + h, x, y + h - r);
      shape.lineTo(x, y + r);
      shape.quadraticCurveTo(x, y, x + r, y);
      return shape;
    }

    function remapUVs(geom, minX, maxX, minY, maxY) {
      const pos = geom.attributes.position;
      const uvs = geom.attributes.uv;
      for (let i = 0; i < pos.count; i++) {
        const u = (pos.getX(i) - minX) / (maxX - minX);
        const v = (pos.getY(i) - minY) / (maxY - minY);
        uvs.setXY(i, u, v);
      }
      uvs.needsUpdate = true;
    }

    // --- HEAD GROUP: Pivots at y .78 (head centre at +.78 above pivot) ---
    const headPivot = new THREE.Group();
    headPivot.position.set(0, 0.78, 0);
    robot.add(headPivot);

    const headCenter = new THREE.Group();
    headCenter.position.set(0, 0.78, 0);
    headPivot.add(headCenter);

    // Skull: rounded box 1.5 × 1.42 × 1.3, radius .2
    const skullGeom = new RoundedBoxGeometry(1.5, 1.42, 1.3, 4, 0.2);
    const skullMesh = new THREE.Mesh(skullGeom, shellMat);
    skullMesh.castShadow = true;
    skullMesh.receiveShadow = true;
    headCenter.add(skullMesh);

    // Dark back block: 1.28 × 1.14 × .9, set back
    const backBlockGeom = new RoundedBoxGeometry(1.28, 1.14, 0.9, 3, 0.1);
    const backBlockMesh = new THREE.Mesh(backBlockGeom, deepDarkMat);
    backBlockMesh.position.set(0, 0, -0.28);
    backBlockMesh.castShadow = true;
    headCenter.add(backBlockMesh);

    // Scatter ~26 tiny dark "circuit" bars over back and top
    const circuitMat = jointsMat;
    const circuitGeom = new THREE.BoxGeometry(0.04, 0.04, 0.12);
    for (let i = 0; i < 26; i++) {
      const bar = new THREE.Mesh(circuitGeom, circuitMat);
      if (i < 16) {
        bar.position.set((Math.random() - 0.5) * 1.0, (Math.random() - 0.5) * 0.9, -0.73);
      } else {
        bar.position.set((Math.random() - 0.5) * 1.0, 0.58, -0.28 + (Math.random() - 0.5) * 0.7);
        bar.rotation.x = Math.PI / 2;
      }
      headCenter.add(bar);
    }

    // Face ring: extruded rounded-rect frame (outer 1.5 × 1.44, r .3; inner 1.08 × 1.02, r .2; depth .1; bevel .03) with ring material at z .6
    const outerShape = createRoundedRectShape(1.5, 1.44, 0.3);
    const innerHole = createRoundedRectShape(1.08, 1.02, 0.2);
    outerShape.holes.push(innerHole);

    const ringGeom = new THREE.ExtrudeGeometry(outerShape, {
      depth: 0.1,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.03,
      bevelThickness: 0.03
    });
    ringGeom.center();
    remapUVs(ringGeom, -0.78, 0.78, -0.75, 0.75);

    const faceRingMesh = new THREE.Mesh(ringGeom, ringMat);
    faceRingMesh.position.set(0, 0, 0.6);
    faceRingMesh.castShadow = true;
    headCenter.add(faceRingMesh);

    // Bezel: inner shell-light frame at z .62
    const bezelOuter = createRoundedRectShape(1.12, 1.06, 0.2);
    const bezelInner = createRoundedRectShape(0.92, 0.86, 0.12);
    bezelOuter.holes.push(bezelInner);
    const bezelGeom = new THREE.ExtrudeGeometry(bezelOuter, {
      depth: 0.04,
      bevelEnabled: false
    });
    bezelGeom.center();
    const bezelMesh = new THREE.Mesh(bezelGeom, shellLightMat);
    bezelMesh.position.set(0, 0, 0.62);
    headCenter.add(bezelMesh);

    // Screen: rounded plate .9 × .84 at z .66. Glossy black with face canvas emissive map (intensity 1.6)
    const screenGeom = new RoundedBoxGeometry(0.9, 0.84, 0.02, 3, 0.1);
    const screenMesh = new THREE.Mesh(screenGeom, screenMat);
    screenMesh.position.set(0, 0, 0.66);
    headCenter.add(screenMesh);

    // Ears: cylinder r .22 on both sides with caps
    const earGeom = new THREE.CylinderGeometry(0.22, 0.22, 0.16, 24);
    const earLeft = new THREE.Mesh(earGeom, shellMat);
    earLeft.rotation.z = Math.PI / 2;
    earLeft.position.set(-0.82, 0, 0);
    earLeft.castShadow = true;
    headCenter.add(earLeft);

    const earRight = new THREE.Mesh(earGeom, shellMat);
    earRight.rotation.z = Math.PI / 2;
    earRight.position.set(0.82, 0, 0);
    earRight.castShadow = true;
    headCenter.add(earRight);

    // Caps
    const capGeom = new THREE.CylinderGeometry(0.18, 0.18, 0.04, 24);
    const capLeft = new THREE.Mesh(capGeom, jointsMat);
    capLeft.rotation.z = Math.PI / 2;
    capLeft.position.set(-0.91, 0, 0);
    headCenter.add(capLeft);

    const capRight = new THREE.Mesh(capGeom, jointsMat);
    capRight.rotation.z = Math.PI / 2;
    capRight.position.set(0.91, 0, 0);
    headCenter.add(capRight);

    // On the right, half-torus dark cable looping down
    const cableGeom = new THREE.TorusGeometry(0.26, 0.035, 12, 28, Math.PI);
    const cableMesh = new THREE.Mesh(cableGeom, deepDarkMat);
    cableMesh.position.set(0.82, -0.15, 0);
    cableMesh.rotation.y = Math.PI / 2;
    cableMesh.rotation.z = -0.2;
    headCenter.add(cableMesh);

    // --- NECK: dark cylinder ---
    const neckGeom = new THREE.CylinderGeometry(0.24, 0.24, 0.28, 20);
    const neckMesh = new THREE.Mesh(neckGeom, jointsMat);
    neckMesh.position.set(0, 0.65, 0);
    neckMesh.castShadow = true;
    robot.add(neckMesh);

    // --- TORSO: rounded box 1.22 × 1.12 × .92, r .24 ---
    const torsoGroup = new THREE.Group();
    robot.add(torsoGroup);

    const torsoGeom = new RoundedBoxGeometry(1.22, 1.12, 0.92, 4, 0.24);
    const torsoMesh = new THREE.Mesh(torsoGeom, shellMat);
    torsoMesh.castShadow = true;
    torsoMesh.receiveShadow = true;
    torsoGroup.add(torsoMesh);

    // Shell-light chest-top slab
    const chestSlabGeom = new RoundedBoxGeometry(1.0, 0.24, 0.12, 3, 0.04);
    const chestSlab = new THREE.Mesh(chestSlabGeom, shellLightMat);
    chestSlab.position.set(0, 0.32, 0.44);
    chestSlab.castShadow = true;
    torsoGroup.add(chestSlab);

    // Three small emissive LEDs on chest: #ff8a3d, #ff5a5f, #ff3d8b
    const ledColors = [0xff8a3d, 0xff5a5f, 0xff3d8b];
    const ledGeom = new THREE.SphereGeometry(0.035, 12, 12);
    ledColors.forEach((col, idx) => {
      const ledMat = new THREE.MeshStandardMaterial({
        color: col,
        emissive: col,
        emissiveIntensity: 2.2,
        roughness: 0.2
      });
      const led = new THREE.Mesh(ledGeom, ledMat);
      led.position.set(-0.16 + idx * 0.16, 0.32, 0.51);
      torsoGroup.add(led);
    });

    // Two dark vertical slots with dark half-torus lips above them
    const slotGeom = new RoundedBoxGeometry(0.06, 0.28, 0.04, 2, 0.02);
    [-0.22, 0.22].forEach(xPos => {
      const slot = new THREE.Mesh(slotGeom, deepDarkMat);
      slot.position.set(xPos, -0.05, 0.46);
      torsoGroup.add(slot);

      const lipGeom = new THREE.TorusGeometry(0.04, 0.016, 8, 16, Math.PI);
      const lip = new THREE.Mesh(lipGeom, deepDarkMat);
      lip.position.set(xPos, 0.10, 0.465);
      torsoGroup.add(lip);
    });

    // Dark pelvis
    const pelvisGeom = new RoundedBoxGeometry(0.9, 0.22, 0.7, 3, 0.06);
    const pelvisMesh = new THREE.Mesh(pelvisGeom, jointsMat);
    pelvisMesh.position.set(0, -0.58, 0);
    pelvisMesh.castShadow = true;
    torsoGroup.add(pelvisMesh);

    // --- ARMS: shoulder ball, shell upper arm, elbow ball, forearm, hand, thumb ---
    const shoulderBallGeom = new THREE.SphereGeometry(0.14, 16, 16);
    const upperArmGeom = new RoundedBoxGeometry(0.22, 0.5, 0.22, 3, 0.06);
    const elbowBallGeom = new THREE.SphereGeometry(0.11, 16, 16);
    const handGeom = new RoundedBoxGeometry(0.2, 0.32, 0.2, 3, 0.05);
    const thumbGeom = new RoundedBoxGeometry(0.06, 0.12, 0.08, 2, 0.02);

    function buildArm(isRight) {
      const arm = new THREE.Group();
      const side = isRight ? 1 : -1;
      arm.position.set(side * 0.72, 0.35, 0);

      const shoulder = new THREE.Mesh(shoulderBallGeom, jointsMat);
      shoulder.castShadow = true;
      arm.add(shoulder);

      const upper = new THREE.Mesh(upperArmGeom, shellMat);
      upper.position.set(side * 0.06, -0.26, 0);
      upper.castShadow = true;
      arm.add(upper);

      const elbow = new THREE.Mesh(elbowBallGeom, jointsMat);
      elbow.position.set(side * 0.08, -0.52, 0);
      elbow.castShadow = true;
      arm.add(elbow);

      const forearm = new THREE.Group();
      forearm.position.set(side * 0.08, -0.52, 0);
      forearm.rotation.x = -0.35; // Forearms bend by -.35

      const hand = new THREE.Mesh(handGeom, shellLightMat);
      hand.position.set(0, -0.2, 0);
      hand.castShadow = true;
      forearm.add(hand);

      const thumb = new THREE.Mesh(thumbGeom, shellLightMat);
      thumb.position.set(side * -0.11, -0.15, 0.04);
      forearm.add(thumb);

      arm.add(forearm);

      // Shoulders splay out by ±.16 rad
      arm.rotation.z = side * -0.16;
      return { root: arm, forearm, side };
    }

    const leftArmData = buildArm(false);
    const rightArmData = buildArm(true);
    robot.add(leftArmData.root);
    robot.add(rightArmData.root);

    // --- LEGS: dark hip ball, shell leg block, dark ankle, shell-light foot ---
    const hipBallGeom = new THREE.SphereGeometry(0.14, 16, 16);
    const legBlockGeom = new RoundedBoxGeometry(0.34, 0.58, 0.38, 3, 0.08);
    const ankleGeom = new THREE.CylinderGeometry(0.12, 0.12, 0.14, 16);
    const footGeom = new RoundedBoxGeometry(0.42, 0.18, 0.62, 3, 0.06);

    [-0.36, 0.36].forEach(xPos => {
      const hip = new THREE.Mesh(hipBallGeom, jointsMat);
      hip.position.set(xPos, -0.68, 0);
      hip.castShadow = true;
      robot.add(hip);

      const leg = new THREE.Mesh(legBlockGeom, shellMat);
      leg.position.set(xPos, -1.02, 0);
      leg.castShadow = true;
      leg.receiveShadow = true;
      robot.add(leg);

      const ankle = new THREE.Mesh(ankleGeom, jointsMat);
      ankle.position.set(xPos, -1.34, 0);
      ankle.castShadow = true;
      robot.add(ankle);

      const foot = new THREE.Mesh(footGeom, shellLightMat);
      foot.position.set(xPos, -1.45, 0.08);
      foot.castShadow = true;
      foot.receiveShadow = true;
      robot.add(foot);
    });

    // --- PEDESTAL: 1.7 × 1.6 × 1.7 box under feet (y -2.22) that receives shadows ---
    const pedestalGeom = new THREE.BoxGeometry(1.7, 1.6, 1.7);
    const pedestalMesh = new THREE.Mesh(pedestalGeom, pedestalMat);
    pedestalMesh.position.set(0, -2.22, 0);
    pedestalMesh.receiveShadow = true;
    scene.add(pedestalMesh);

    /* ========================================================
       5. MOTION & BLENDING
       ======================================================== */
    let smoothedP = 0;
    let normMouseX = 0, normMouseY = 0;
    let smoothMouseX = 0, smoothMouseY = 0;

    window.addEventListener('mousemove', (e) => {
      normMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      normMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    function easeInOutCubic(x) {
      return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    }

    function lerp(a, b, t) {
      return a + (b - a) * t;
    }

    // Camera states:
    // Intro: Camera z 11.6, y 1.1, Look-at y .55, Body yaw -.42, Head yaw -.6 / pitch .16 / roll .22
    // Product & Reviews: Camera z 6.9, y 1.95, Look-at y 1.72, Body yaw -.2, Head yaw -.06 / pitch .04 / roll 0
    const stateIntro = {
      camZ: 11.6, camY: 1.1, lookY: 0.55,
      bodyYaw: -0.42,
      headYaw: -0.6, headPitch: 0.16, headRoll: 0.22
    };

    const stateProduct = {
      camZ: 6.9, camY: 1.95, lookY: 1.72,
      bodyYaw: -0.2,
      headYaw: -0.06, headPitch: 0.04, headRoll: 0.0
    };

    const clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Scroll: p = scrollY / innerHeight, clamped 0-2, smoothed by 8% per frame
      const targetP = Math.min(Math.max(window.scrollY / window.innerHeight, 0), 2);
      smoothedP += (targetP - smoothedP) * 0.08;

      // Pointer: normalised cursor, smoothed by 6% per frame
      smoothMouseX += (normMouseX - smoothMouseX) * 0.06;
      smoothMouseY += (normMouseY - smoothMouseY) * 0.06;

      // Face switches to quote mode once smoothed p passes 1.55
      quoteMode = (smoothedP > 1.55);

      // State blending
      let blendT = 0;
      if (smoothedP <= 1.0) {
        blendT = easeInOutCubic(smoothedP);
      } else {
        blendT = 1.0;
      }

      let curCamZ = lerp(stateIntro.camZ, stateProduct.camZ, blendT);
      let curCamY = lerp(stateIntro.camY, stateProduct.camY, blendT);
      let curLookY = lerp(stateIntro.lookY, stateProduct.lookY, blendT);
      let curBodyYaw = lerp(stateIntro.bodyYaw, stateProduct.bodyYaw, blendT);
      let curHeadYaw = lerp(stateIntro.headYaw, stateProduct.headYaw, blendT);
      let curHeadPitch = lerp(stateIntro.headPitch, stateProduct.headPitch, blendT);
      let curHeadRoll = lerp(stateIntro.headRoll, stateProduct.headRoll, blendT);

      // On screens under 900px, camera z is multiplied by 1.25
      const isMobile = window.innerWidth <= 900;
      if (isMobile) {
        curCamZ *= 1.25;
      }

      // Pointer offsets: moves camera ±.25 x and ∓.1 y, adds .12 to body yaw, adds .45 to head yaw and .18 to head pitch
      const camOffsetX = smoothMouseX * 0.25;
      const camOffsetY = -smoothMouseY * 0.1;
      const ptrBodyYaw = smoothMouseX * 0.12;
      const ptrHeadYaw = smoothMouseX * 0.45;
      const ptrHeadPitch = smoothMouseY * 0.18;

      // Idle: body bobs ±.02 (sin 1.4t), head sways (pitch sin .9t * .02, roll sin .7t * .02), arms swing (shoulder sin(1.4t + side) * .05, forearm * .06)
      const idleBob = Math.sin(1.4 * time) * 0.02;
      const idleHeadPitch = Math.sin(0.9 * time) * 0.02;
      const idleHeadRoll = Math.sin(0.7 * time) * 0.02;

      robot.position.y = idleBob;
      robot.rotation.y = curBodyYaw + ptrBodyYaw;

      headPivot.rotation.y = curHeadYaw + ptrHeadYaw;
      headPivot.rotation.x = curHeadPitch + ptrHeadPitch + idleHeadPitch;
      headPivot.rotation.z = curHeadRoll + idleHeadRoll;

      const leftArmSwing = Math.sin(1.4 * time + -1) * 0.05;
      const rightArmSwing = Math.sin(1.4 * time + 1) * 0.05;
      leftArmData.root.rotation.x = leftArmSwing;
      leftArmData.forearm.rotation.x = -0.35 + leftArmSwing * 1.2;
      rightArmData.root.rotation.x = rightArmSwing;
      rightArmData.forearm.rotation.x = -0.35 + rightArmSwing * 1.2;

      camera.position.x = camOffsetX;
      camera.position.y = curCamY + camOffsetY;
      camera.position.z = curCamZ;
      camera.lookAt(0, curLookY, 0);

      renderFace();
      renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
  </script>

  <!-- ==========================================
       UI LOGIC & INTERACTION SCRIPT
       ========================================== -->
  <script>
    /* 1. TOP BAR & NAVBAR SCROLL BEHAVIOR */
    const topBar = document.getElementById('topBar');
    const topBarClose = document.getElementById('topBarClose');
    const navbar = document.getElementById('navbar');
    let topBarDismissed = false;

    function handleScroll() {
      const scrolled = window.scrollY > 40;
      if (scrolled || topBarDismissed) {
        topBar.classList.add('hidden');
        navbar.classList.add('scrolled');
      } else {
        topBar.classList.remove('hidden');
        navbar.classList.remove('scrolled');
      }
      updateRightRail();
    }

    topBarClose.addEventListener('click', () => {
      topBarDismissed = true;
      topBar.classList.add('hidden');
      navbar.classList.add('scrolled');
    });

    window.addEventListener('scroll', handleScroll, { passive: true });

    /* 2. RIGHT RAIL DOTS & FLOATING LABEL (14 tiny dots, slides to 0%, 31%, 62%) */
    const railDots = document.getElementById('railDots');
    const railLabel = document.getElementById('railLabel');
    const railLabelText = document.getElementById('railLabelText');

    for (let i = 0; i < 14; i++) {
      const dot = document.createElement('div');
      dot.className = 'rail-dot';
      railDots.appendChild(dot);
    }

    function updateRightRail() {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      const sectionIndex = Math.min(Math.floor((scrollY + vh * 0.5) / vh), 2);

      if (sectionIndex === 0) {
        railLabel.style.top = '0%';
        railLabelText.textContent = 'INTRO';
      } else if (sectionIndex === 1) {
        railLabel.style.top = '31%';
        railLabelText.textContent = 'PRODUCT';
      } else {
        railLabel.style.top = '62%';
        railLabelText.textContent = 'REVIEWS';
      }
    }

    /* 3. AUTO-TYPING PROMPT BOX (SECTION 1) */
    const prompts = [
      "Create a smart contract for a token named NOVA on Ethereum.",
      "Explain what a smart contract does in simple terms.",
      "Audit this contract for reentrancy vulnerabilities.",
      "What is the market sentiment on BTC today?"
    ];

    let currentPromptIdx = 0;
    const typingEl = document.getElementById('promptTypingText');
    const previewEl = document.getElementById('promptNextPreview');

    function updateNextPreview() {
      const nextIdx = (currentPromptIdx + 1) % prompts.length;
      previewEl.textContent = "NEXT: " + prompts[nextIdx];
    }
    updateNextPreview();

    let typingCharIdx = 0;
    let isDeleting = false;

    function typeLoop() {
      const currentFullText = prompts[currentPromptIdx];

      if (!isDeleting) {
        // Typing: 38ms per character
        typingCharIdx++;
        typingEl.textContent = currentFullText.substring(0, typingCharIdx);

        if (typingCharIdx >= currentFullText.length) {
          // Holds 2.6s
          setTimeout(() => {
            isDeleting = true;
            typeLoop();
          }, 2600);
        } else {
          setTimeout(typeLoop, 38);
        }
      } else {
        // Deletes 2 characters per 14ms
        typingCharIdx = Math.max(0, typingCharIdx - 2);
        typingEl.textContent = currentFullText.substring(0, typingCharIdx);

        if (typingCharIdx === 0) {
          isDeleting = false;
          currentPromptIdx = (currentPromptIdx + 1) % prompts.length;
          updateNextPreview();
          // Waits 250ms then types next prompt
          setTimeout(typeLoop, 250);
        } else {
          setTimeout(typeLoop, 14);
        }
      }
    }

    typeLoop();

    /* 4. PRODUCT TAB CAROUSEL (SECTION 2: 10 tabs, each 33vw wide, slides every 2.4s) */
    const tabLabels = [
      "AI Chatbot",
      "NFT Generator",
      "Smart-contract generator",
      "Blockchain & market analytics",
      "AI Trading assistant",
      "Code auditor",
      "Chart & technical analysis",
      "Crypto news AI",
      "Smart-contract auditor",
      "AI Chatbot"
    ];

    const carouselTrack = document.getElementById('carouselTrack');
    tabLabels.forEach((label, i) => {
      const tab = document.createElement('div');
      tab.className = 'carousel-tab mono' + (i === 0 ? ' active' : '');
      const numFormatted = String(i + 1).padStart(2, '0');
      tab.innerHTML = \`
        <div class="corner-bracket cb-tl"></div>
        <div class="corner-bracket cb-tr"></div>
        <div class="corner-bracket cb-bl"></div>
        <div class="corner-bracket cb-br"></div>
        <span class="carousel-tab-num">[ \${numFormatted} ]</span>
        <span class="carousel-tab-label">\${label}</span>
      \`;
      carouselTrack.appendChild(tab);
    });

    let currentTab = 0;
    setInterval(() => {
      currentTab = (currentTab + 1) % tabLabels.length;
      const tabs = carouselTrack.querySelectorAll('.carousel-tab');
      tabs.forEach((t, i) => {
        t.classList.remove('active', 'passed');
        if (i < currentTab) {
          t.classList.add('passed');
        } else if (i === currentTab) {
          t.classList.add('active');
        }
      });
      carouselTrack.style.transform = \`translateX(-\${currentTab * 33}vw)\`;
    }, 2400);

    /* 5. REVIEWS SWAP CONTROLS (SECTION 3) */
    const reviews = [
      {
        num: "01",
        name: "Ilan Brooks",
        role: "Founder of Halden Capital",
        quote: "“Smart contract auditing has always been a bottleneck for our startups, Nova Agent solves this problem in seconds."
      },
      {
        num: "02",
        name: "Rhea Okafor",
        role: "Co-founder of Tessel Network",
        quote: "Nova Agent is a vital asset for Web3 investors, simplifying the research process effortlessly."
      },
      {
        num: "03",
        name: "Mara Elling",
        role: "CTO at Northline Labs",
        quote: "“The fastest way we have found to go from an idea to a deployable token contract."
      }
    ];

    let currentReviewIdx = 0;
    const reviewNumBadge = document.getElementById('reviewNumBadge');
    const reviewAuthor = document.getElementById('reviewAuthor');
    const reviewRole = document.getElementById('reviewRole');
    const reviewQuoteText = document.getElementById('reviewQuoteText');
    const ghostQuoteText = document.getElementById('ghostQuoteText');
    const reviewMeta = document.getElementById('reviewMeta');
    const quoteWrap = document.getElementById('quoteWrap');

    function showReview(index) {
      // Fade out (0.45s, 10px drop)
      reviewMeta.style.opacity = '0';
      reviewMeta.style.transform = 'translateY(10px)';
      quoteWrap.style.opacity = '0';
      quoteWrap.style.transform = 'translateY(10px)';

      setTimeout(() => {
        currentReviewIdx = index;
        const rev = reviews[currentReviewIdx];
        const nextRev = reviews[(currentReviewIdx + 1) % reviews.length];

        reviewNumBadge.textContent = \`[ \${rev.num} ]\`;
        reviewAuthor.textContent = rev.name;
        reviewRole.textContent = rev.role;
        reviewQuoteText.textContent = rev.quote;
        ghostQuoteText.textContent = nextRev.quote;

        // Fade back in
        reviewMeta.style.opacity = '1';
        reviewMeta.style.transform = 'translateY(0)';
        quoteWrap.style.opacity = '1';
        quoteWrap.style.transform = 'translateY(0)';
      }, 450);
    }

    document.getElementById('prevReviewBtn').addEventListener('click', () => {
      const newIdx = (currentReviewIdx - 1 + reviews.length) % reviews.length;
      showReview(newIdx);
    });

    document.getElementById('nextReviewBtn').addEventListener('click', () => {
      const newIdx = (currentReviewIdx + 1) % reviews.length;
      showReview(newIdx);
    });

    /* 6. REVEAL OBSERVER (.rv) */
    const rvElements = document.querySelectorAll('.rv');
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, { threshold: 0.15 });

    rvElements.forEach(el => revealObserver.observe(el));
  </script>
</body>
</html>
`;

fs.writeFileSync('index.html', htmlContent);
console.log('Successfully updated index.html with all refined specifications!');
