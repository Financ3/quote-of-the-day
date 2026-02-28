const sharp = require('sharp');
const path = require('path');

const GOLD = '#f5a623';
const NAVY_DARK = '#0d0d1a';
const NAVY_MID = '#16213e';
const NAVY_LIGHT = '#1a2a4a';

// ─── SVG builders ─────────────────────────────────────────────────────────────

function buildIconSvg(size) {
  const cx = size / 2;
  const sunCY = size * 0.40;
  const sunR = size * 0.118;

  // Sun rays: 8 rays, alternating long/short
  const rays = [];
  for (let i = 0; i < 8; i++) {
    const angle = (i * 45 * Math.PI) / 180;
    const isLong = i % 2 === 0;
    const inner = sunR + size * 0.028;
    const outer = sunR + size * (isLong ? 0.088 : 0.055);
    const strokeW = size * (isLong ? 0.022 : 0.018);
    const x1 = cx + Math.sin(angle) * inner;
    const y1 = sunCY - Math.cos(angle) * inner;
    const x2 = cx + Math.sin(angle) * outer;
    const y2 = sunCY - Math.cos(angle) * outer;
    rays.push(
      `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" ` +
      `x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" ` +
      `stroke="${GOLD}" stroke-width="${strokeW.toFixed(1)}" stroke-linecap="round"/>`
    );
  }

  // Quote marks: two pill shapes (raised commas / open double quote)
  // Each mark = a filled circle on top + a short curved tail
  const qCY = size * 0.655;        // vertical center of quote marks
  const qRadius = size * 0.062;    // circle radius of each mark
  const qSpacing = size * 0.130;   // horizontal spacing between marks
  const qLX = cx - qSpacing / 2;  // left mark center X
  const qRX = cx + qSpacing / 2;  // right mark center X
  const tailLen = size * 0.07;
  const tailW = size * 0.042;

  const quoteMark = (x, y) => `
    <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${qRadius.toFixed(1)}" fill="${GOLD}"/>
    <path d="M ${(x - tailW * 0.15).toFixed(1)} ${(y + qRadius * 0.7).toFixed(1)}
             Q ${(x - tailW * 0.6).toFixed(1)} ${(y + qRadius + tailLen * 0.55).toFixed(1)}
               ${(x + tailW * 0.3).toFixed(1)} ${(y + qRadius + tailLen).toFixed(1)}"
      stroke="${GOLD}" stroke-width="${tailW.toFixed(1)}"
      stroke-linecap="round" fill="none"/>`;

  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg" cx="50%" cy="38%" r="72%">
      <stop offset="0%" stop-color="${NAVY_LIGHT}"/>
      <stop offset="100%" stop-color="${NAVY_DARK}"/>
    </radialGradient>
    <!-- Subtle glow behind sun -->
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${GOLD}" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="${GOLD}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Background -->
  <rect width="${size}" height="${size}" fill="url(#bg)"/>

  <!-- Sun glow -->
  <ellipse cx="${cx}" cy="${sunCY}" rx="${size * 0.28}" ry="${size * 0.22}" fill="url(#glow)"/>

  <!-- Sun rays -->
  ${rays.join('\n  ')}

  <!-- Sun circle -->
  <circle cx="${cx}" cy="${sunCY.toFixed(1)}" r="${sunR.toFixed(1)}" fill="${GOLD}"/>

  <!-- Thin accent line between sun and quote -->
  <line x1="${(cx - size * 0.12).toFixed(1)}" y1="${(sunCY + size * 0.18).toFixed(1)}"
        x2="${(cx + size * 0.12).toFixed(1)}" y2="${(sunCY + size * 0.18).toFixed(1)}"
        stroke="${GOLD}" stroke-width="${(size * 0.008).toFixed(1)}" stroke-linecap="round" opacity="0.35"/>

  <!-- Opening double quote mark -->
  ${quoteMark(qLX, qCY)}
  ${quoteMark(qRX, qCY)}
</svg>`;
}

function buildAdaptiveIconSvg(size) {
  // Same design but no background (Android provides its own background layer)
  // Design sits in the "safe zone" — keep important content within center 66%
  const scale = 0.72;
  const offset = size * (1 - scale) / 2;
  const inner = buildIconSvg(Math.round(size * scale))
    .replace('<rect width=', `<rect opacity="0" width=`)   // hide bg rect
    .replace('fill="url(#bg)"', 'fill="none"');

  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(${offset.toFixed(0)}, ${offset.toFixed(0)})">
    ${inner}
  </g>
</svg>`;
}

function buildSplashIconSvg(size) {
  // For splash: just the icon design on transparent bg
  // expo-splash-screen will composite this over the splash backgroundColor
  return buildIconSvg(size)
    .replace('fill="url(#bg)"', 'fill="none"')
    .replace('<radialGradient id="bg"', '<radialGradient id="bg_hidden"')
    .replace('url(#bg)', 'none');
}

// ─── Generate ─────────────────────────────────────────────────────────────────

async function generate() {
  const assetsDir = path.join(__dirname, 'assets', 'images');

  // 1. Main icon — 1024×1024 with background
  await sharp(Buffer.from(buildIconSvg(1024)))
    .png()
    .toFile(path.join(assetsDir, 'icon.png'));
  console.log('✓ icon.png (1024×1024)');

  // 2. Android adaptive icon foreground — 1024×1024, transparent bg
  await sharp(Buffer.from(buildAdaptiveIconSvg(1024)))
    .png()
    .toFile(path.join(assetsDir, 'adaptive-icon.png'));
  console.log('✓ adaptive-icon.png (1024×1024)');

  // 3. Splash icon — 512×512 transparent (expo backgrounds it per app.json)
  await sharp(Buffer.from(buildSplashIconSvg(512)))
    .png()
    .toFile(path.join(assetsDir, 'splash-icon.png'));
  console.log('✓ splash-icon.png (512×512)');

  // 4. Web favicon — 48×48
  await sharp(Buffer.from(buildIconSvg(256)))
    .resize(48, 48)
    .png()
    .toFile(path.join(assetsDir, 'favicon.png'));
  console.log('✓ favicon.png (48×48)');

  console.log('\nAll assets generated.');
}

generate().catch(console.error);
