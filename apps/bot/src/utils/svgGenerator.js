export function generateLevelCard(data) {
  const { username, level, xp, rank, progress, messages, voiceTime, avatarURL } = data;

  const width = 800;
  const height = 250;
  // Avatar position and radius
  const avatarX = 100;
  const avatarR = 60;
  // Position the progress bar to the right of the avatar so they don't overlap
  const progressBarX = avatarX + avatarR + 20; // 100 + 60 + 20 = 180
  const rightMargin = 40;
  const progressBarWidth = width - progressBarX - rightMargin; // dynamic width so it fits
  const progressFill = (progress.current / progress.needed) * progressBarWidth;

  const voiceHours = Math.floor(voiceTime / 3600);
  const voiceMinutes = Math.floor((voiceTime % 3600) / 60);

  const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1a1a;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#2d2d2d;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1a1a1a;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#45bae4;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2272f3;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="level-badge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#eb2c2c;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ffab8f;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="${width}" height="${height}" rx="20" fill="url(#bg-gradient)"/>
  
  <!-- Avatar Circle / Image -->
  ${avatarURL ? `
  <clipPath id="avatar-clip">
    <circle cx="${avatarX}" cy="125" r="${avatarR}" />
  </clipPath>
  <image href="${avatarURL}" x="${avatarX - avatarR}" y="${125 - avatarR}" width="${avatarR * 2}" height="${avatarR * 2}" clip-path="url(#avatar-clip)" preserveAspectRatio="xMidYMid slice"/>
  ` : `
  <circle cx="${avatarX}" cy="125" r="${avatarR + 5}" fill="#404040" opacity="0.3"/>
  <circle cx="${avatarX}" cy="125" r="${avatarR}" fill="#2a2a2a"/>
  `}
  
  <!-- Username -->
  <text x="200" y="60" font-family="DejaVu Sans, Arial, sans-serif" font-size="32" font-weight="bold" fill="#ffffff">
    ${escapeXml(username)}
  </text>
  
  <!-- Rank -->
  <text x="200" y="95" font-family="DejaVu Sans, Arial, sans-serif" font-size="18" fill="#b0b0b0">
    Rank #${rank}
  </text>
  
  <!-- Level Badge -->
  <rect x="680" y="20" width="100" height="50" rx="10" fill="url(#level-badge-gradient)"/>
  <text x="730" y="45" font-family="DejaVu Sans, Arial, sans-serif" font-size="16" fill="#ffffff" text-anchor="middle">
    NÍVEL
  </text>
  <text x="730" y="65" font-family="DejaVu Sans, Arial, sans-serif" font-size="24" font-weight="bold" fill="#ffffff" text-anchor="middle">
    ${level}
  </text>
  
  <!-- Progress Bar Background -->
  <rect x="${progressBarX}" y="140" width="${progressBarWidth}" height="30" rx="15" fill="#404040" opacity="0.4"/>
  
  <!-- Progress Bar Fill -->
  <rect x="${progressBarX}" y="140" width="${progressFill}" height="30" rx="15" fill="url(#progress-gradient)"/>
  
  <!-- XP Text -->
  <text x="${
    progressBarX + progressBarWidth / 2
  }" y="162" font-family="DejaVu Sans, Arial, sans-serif" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">
    ${progress.current} / ${progress.needed} XP
  </text>
  
  <!-- Stats (positioned around the progress bar area so they don't overlap) -->
  <text x="${progressBarX}" y="200" font-family="DejaVu Sans, Arial, sans-serif" font-size="14" fill="#cccccc">
    Mensagens: ${messages}
  </text>
  <text x="${
    progressBarX + 250
  }" y="200" font-family="DejaVu Sans, Arial, sans-serif" font-size="14" fill="#cccccc">
    Voz: ${voiceHours}h ${voiceMinutes}m
  </text>
  <text x="${
    progressBarX + 470
  }" y="200" font-family="DejaVu Sans, Arial, sans-serif" font-size="14" fill="#cccccc">
    XP: ${xp}
  </text>
</svg>`.trim();

  // Return both svg and dimensions so callers can use the correct PNG export size
  return { svg, width, height };
}

export function generateRankingImage(data, options = {}) {
  const { guildName, ranking } = data;
  const {
    width = 800,
    height: providedHeight = null,
    headerHeight = 120,
    footerPadding = 30,
    maxRows = 10,
    desiredRowHeight = 70,
    minRowHeight = 50,
    maxRowHeight = 90,
  } = options;
  

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // If a specific height was provided, compute rowHeight from it; otherwise
  // start from desiredRowHeight and compute a total height that fits all rows
  let rowHeight = desiredRowHeight;
  let height = providedHeight;
  if (height) {
    const availableHeight = height - headerHeight - footerPadding;
    rowHeight = Math.floor(availableHeight / maxRows);
    rowHeight = clamp(rowHeight, minRowHeight, maxRowHeight);
    // recompute height to exactly fit rows if clamped changed rowHeight
    height = headerHeight + rowHeight * maxRows + footerPadding;
  } else {
    rowHeight = clamp(desiredRowHeight, minRowHeight, maxRowHeight);
    height = headerHeight + rowHeight * maxRows + footerPadding;
  }

  let rows = "";
  // Render fixed number of slots (maxRows). If there are fewer users than maxRows,
  // we still render the empty rows so the content fills the SVG height evenly.
  for (let index = 0; index < maxRows; index++) {
    const y = headerHeight + index * rowHeight;
    const user = ranking[index] || null;
    const isTop3 = index < 3;
    const medalText = user
      ? index === 0
        ? "1º"
        : index === 1
        ? "2º"
        : index === 2
        ? "3º"
        : `#${user.rank}`
      : "";

    // row background: full-bleed so each ranking row occupies the image width
    const rowX = 0;
    const rowWidth = width;
    const rowFill = isTop3 ? "#45bae4" : "#333333";
    const rowOpacity = isTop3 ? "0.15" : "0.05";

    rows += `
    <!-- Row ${index + 1} -->
    <rect x="${rowX + 10}" y="${y + 6}" width="${rowWidth - 20}" height="${
      rowHeight - 12
    }" rx="10" fill="${rowFill}" opacity="${rowOpacity}"/>

    <!-- Rank -->
    <text x="70" y="${
      y + Math.floor(rowHeight / 2) + 6
    }" font-family="DejaVu Sans, Arial, sans-serif" font-size="${Math.floor(
      rowHeight / 2.6
    )}" font-weight="bold" fill="${
      isTop3 ? "#ffab8f" : "#cccccc"
    }" text-anchor="middle">
      ${user ? medalText : ""}
    </text>

    <!-- Avatar placeholder (only render for actual users) -->
    ${user ? (user.avatarURL ? `
    <clipPath id="avatar-clip-${index}">
      <circle cx="150" cy="${y + Math.floor(rowHeight / 2)}" r="${Math.max(18, Math.floor(rowHeight / 2) - 12)}" />
    </clipPath>
    <image href="${user.avatarURL}" x="${150 - (Math.max(18, Math.floor(rowHeight / 2) - 12))}" y="${y + Math.floor(rowHeight / 2) - (Math.max(18, Math.floor(rowHeight / 2) - 12))}" width="${(Math.max(18, Math.floor(rowHeight / 2) - 12) * 2)}" height="${(Math.max(18, Math.floor(rowHeight / 2) - 12) * 2)}" clip-path="url(#avatar-clip-${index})" preserveAspectRatio="xMidYMid slice"/>
    ` : `
    <circle cx="150" cy="${y + Math.floor(rowHeight / 2)}" r="${Math.max(18, Math.floor(rowHeight / 2) - 12)}" fill="#404040"/>
    `) : ``}
    
    <!-- Username -->
    <text x="200" y="${
      y + Math.floor(rowHeight / 2) + 6
    }" font-family="DejaVu Sans, Arial, sans-serif" font-size="${Math.floor(
      rowHeight / 3
    )}" font-weight="bold" fill="#ffffff" text-anchor="start">
      ${user ? escapeXml(user.username) : ""}
    </text>
    
    <!-- Level -->
    <text x="550" y="${
      y + Math.floor(rowHeight / 2) + 6
    }" font-family="DejaVu Sans, Arial, sans-serif" font-size="${Math.floor(
      rowHeight / 3.5
    )}" fill="#b0b0b0" text-anchor="start">
      ${user ? `Nível ${user.level}` : ""}
    </text>
    
    <!-- XP -->
    <text x="${rowWidth - 30}" y="${
      y + Math.floor(rowHeight / 2) + 6
    }" font-family="DejaVu Sans, Arial, sans-serif" font-size="${Math.floor(
      rowHeight / 3.5
    )}" font-weight="bold" fill="#19547b" text-anchor="end">
      ${user ? `${user.xp} XP` : ""}
    </text>
    `;
  }

  const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="header-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#1a1a1a;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#2d2d2d;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1a1a1a;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="#0f0f0f"/>
  
  <!-- Header -->
  <rect width="${width}" height="${headerHeight}" fill="url(#header-gradient)"/>
  
  <!-- Title -->
  <text x="400" y="40" font-family="DejaVu Sans, Arial, sans-serif" font-size="36" font-weight="bold" fill="#ffffff" text-anchor="middle">
    RANKING
  </text>
  <text x="400" y="75" font-family="DejaVu Sans, Arial, sans-serif" font-size="20" fill="#b0b0b0" text-anchor="middle">
    ${escapeXml(guildName)}
  </text>
  
  <!-- Ranking Rows -->
  ${rows}
</svg>`.trim();

  return { svg, width, height };
}

export function generateProfileCard(data) {
  const {
    username,
    level,
    xp,
    rank,
    progress,
    messages,
    voiceHours,
    voiceMinutes,
    joinedAt,
    avatarURL,
    badges = [],
  } = data;

  const width = 900;
  const height = 500;
  // Card metrics
  const cardX = 50;
  const cardWidth = 800;
  const cardRight = cardX + cardWidth;
  // Avatar and progress placement
  const avatarX = 120; // aligned with card (50 + 100)
  const avatarR = 80;
  const progressBarX = avatarX + avatarR + 20; // 150 + 80 + 20 = 250
  const rightMargin = 50; // inside card right margin
  const progressBarWidth = cardRight - rightMargin - progressBarX; // ensure within card
  const progressFill = (progress.current / progress.needed) * progressBarWidth;

  const joinDate = new Date(joinedAt * 1000).toLocaleDateString("pt-BR");

  const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="profile-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1a1a;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#2d2d2d;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1a1a1a;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="card-bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1a1a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0f0f0f;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#45bae4;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2272f3;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="rank-badge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#2272f3;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#45bae4;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="level-badge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#eb2c2c;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ffab8f;stop-opacity:1" />
    </linearGradient>
    ${badges.length > 0 ? badges.slice(0, 6).map((badge, index) => {
    const clipId = `badge-clip-${index}`;
    return `
    <clipPath id="${clipId}">
      <circle cx="${270 + (index * 75)}" cy="240" r="30" />
    </clipPath>`;
  }).join('') : ''}
  </defs>
  
  <!-- Background -->
  <rect width="${width}" height="${height}" rx="50" fill="url(#profile-bg)"/>
  
  <!-- Card -->
  <rect x="50" y="50" width="800" height="400" rx="40" fill="url(#card-bg)"/>
  
  <!-- Avatar Circle -->
  ${avatarURL ? `
  <clipPath id="profile-avatar-clip">
    <circle cx="150" cy="180" r="80" />
  </clipPath>
  <image href="${avatarURL}" x="${150 - 80}" y="${180 - 80}" width="${160}" height="${160}" clip-path="url(#profile-avatar-clip)" preserveAspectRatio="xMidYMid slice"/>
  ` : `
  <circle cx="150" cy="180" r="80" fill="#404040"/>
  <text x="150" y="195" font-family="DejaVu Sans, Arial, sans-serif" font-size="64" text-anchor="middle"></text>
  `}
  
  <!-- Username -->
  <text x="270" y="140" font-family="DejaVu Sans, Arial, sans-serif" font-size="42" font-weight="bold" fill="#ffffff">
    ${escapeXml(username)}
  </text>
  
  <!-- Rank Badge -->
  <rect x="270" y="160" width="180" height="40" rx="20" fill="url(#rank-badge-gradient)"/>
  <text x="360" y="187" font-family="DejaVu Sans, Arial, sans-serif" font-size="20" font-weight="bold" fill="#ffffff" text-anchor="middle">
    Rank #${rank}
  </text>
  
  <!-- Level Badge -->
  <rect x="470" y="160" width="150" height="40" rx="20" fill="url(#level-badge-gradient)"/>
  <text x="545" y="187" font-family="DejaVu Sans, Arial, sans-serif" font-size="20" font-weight="bold" fill="#ffffff" text-anchor="middle">
    Nível ${level}
  </text>
  
  <!-- Badges Section -->
  ${badges.length > 0 ? badges.slice(0, 6).map((badge, index) => {
    const badgeX = 270 + (index * 75);
    const badgeY = 240;
    const badgeRadius = 30;
    const clipId = `badge-clip-${index}`;
    return `
  <circle cx="${badgeX}" cy="${badgeY}" r="${badgeRadius}" fill="#333333"/>
  <image href="${badge.icon}" x="${badgeX - badgeRadius}" y="${badgeY - badgeRadius}" width="${badgeRadius * 2}" height="${badgeRadius * 2}" clip-path="url(#${clipId})" preserveAspectRatio="xMidYMid slice"/>`;
  }).join('') : ''}
  
  <!-- Progress Section -->
  
  <!-- Progress Bar Background -->
  <rect x="${progressBarX}" y="315" width="${progressBarWidth}" height="35" rx="17.5" fill="#404040"/>
  
  <!-- Progress Bar Fill -->
  <rect x="${progressBarX}" y="315" width="${progressFill}" height="35" rx="17.5" fill="url(#progress-gradient)"/>
  
  <!-- XP Text -->
  <text x="${
    progressBarX + progressBarWidth / 2
  }" y="340" font-family="DejaVu Sans, Arial, sans-serif" font-size="18" font-weight="bold" fill="#ffffff" text-anchor="middle">
    ${progress.current} / ${progress.needed} XP
  </text>
  
  <!-- Stats Grid -->
  <!-- Columns: left (avatar), center, right -->
  <text x="${avatarX}" y="390" font-family="DejaVu Sans, Arial, sans-serif" font-size="16" fill="#b0b0b0" text-anchor="middle">
    Total XP
  </text>
  <text x="${avatarX}" y="415" font-family="DejaVu Sans, Arial, sans-serif" font-size="24" font-weight="bold" fill="#45bae4" text-anchor="middle">
    ${xp}
  </text>
  
  <text x="${Math.floor(
    cardX + cardWidth / 2
  )}" y="390" font-family="DejaVu Sans, Arial, sans-serif" font-size="16" fill="#b0b0b0" text-anchor="middle">
    Mensagens
  </text>
  <text x="${Math.floor(
    cardX + cardWidth / 2
  )}" y="415" font-family="DejaVu Sans, Arial, sans-serif" font-size="24" font-weight="bold" fill="#45bae4" text-anchor="middle">
    ${messages}
  </text>
  
  <text x="${
    cardRight - 120
  }" y="390" font-family="DejaVu Sans, Arial, sans-serif" font-size="16" fill="#b0b0b0" text-anchor="middle">
    Tempo em Voz
  </text>
  <text x="${
    cardRight - 120
  }" y="415" font-family="DejaVu Sans, Arial, sans-serif" font-size="24" font-weight="bold" fill="#45bae4" text-anchor="middle">
    ${voiceHours}h ${voiceMinutes}m
  </text>
</svg>`.trim();

  return { svg, width, height };
}

function escapeXml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
