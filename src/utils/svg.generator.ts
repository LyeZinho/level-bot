import { Injectable } from '@nestjs/common';

@Injectable()
export class SvgGeneratorService {
  generateLevelCard(
    username: string,
    level: number,
    xp: number,
    nextLevelXp: number,
    rank: number,
    coins: number,
  ): string {
    const progress = Math.round(((xp % nextLevelXp) / nextLevelXp) * 100);
    const progressWidth = (progress / 100) * 280;

    return `
      <svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
          </linearGradient>
        </defs>
        
        <rect width="400" height="200" fill="url(#bg)" />
        
        <!-- Username -->
        <text x="20" y="40" font-family="Arial" font-size="28" font-weight="bold" fill="#ffffff">${username}</text>
        
        <!-- Level -->
        <text x="20" y="80" font-family="Arial" font-size="18" fill="#ffffff">Level: <tspan font-weight="bold">${level}</tspan></text>
        <text x="200" y="80" font-family="Arial" font-size="18" fill="#ffffff">Rank: <tspan font-weight="bold">#${rank}</tspan></text>
        
        <!-- XP Info -->
        <text x="20" y="110" font-family="Arial" font-size="14" fill="#e0e0e0">XP: ${xp} / ${nextLevelXp}</text>
        <text x="200" y="110" font-family="Arial" font-size="14" fill="#e0e0e0">Coins: ${coins}</text>
        
        <!-- Progress Bar Background -->
        <rect x="20" y="130" width="360" height="20" rx="10" fill="#333333" />
        
        <!-- Progress Bar Fill -->
        <rect x="20" y="130" width="${progressWidth}" height="20" rx="10" fill="#00ff00" />
        
        <!-- Progress Text -->
        <text x="200" y="148" font-family="Arial" font-size="12" fill="#ffffff" text-anchor="middle">${progress}%</text>
      </svg>
    `.trim();
  }

  generateRankingCard(users: any[]): string {
    let rankingRows = '';
    users.forEach((user, index) => {
      const y = 100 + index * 50;
      rankingRows += `
        <text x="20" y="${y}" font-family="Arial" font-size="16" font-weight="bold" fill="#ffffff">#${index + 1}</text>
        <text x="70" y="${y}" font-family="Arial" font-size="16" fill="#ffffff">${user.username}</text>
        <text x="250" y="${y}" font-family="Arial" font-size="14" fill="#e0e0e0">Lv ${user.level}</text>
        <text x="320" y="${y}" font-family="Arial" font-size="14" fill="#e0e0e0">${user.xp} XP</text>
      `;
    });

    return `
      <svg width="400" height="${100 + users.length * 50}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
          </linearGradient>
        </defs>
        
        <rect width="400" height="${100 + users.length * 50}" fill="url(#bg)" />
        
        <!-- Title -->
        <text x="20" y="40" font-family="Arial" font-size="24" font-weight="bold" fill="#ffffff">🏆 Ranking</text>
        
        <!-- Ranking Data -->
        ${rankingRows}
      </svg>
    `.trim();
  }

  generateProfileCard(
    username: string,
    level: number,
    xp: number,
    rank: number,
    coins: number,
    badges: number,
    vipStatus?: string,
  ): string {
    return `
      <svg width="500" height="300" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
          </linearGradient>
          <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#ffd700;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#ffed4e;stop-opacity:1" />
          </linearGradient>
        </defs>
        
        <rect width="500" height="300" fill="url(#bg)" />
        
        <!-- Header -->
        <rect width="500" height="80" fill="url(#accent)" />
        <text x="250" y="50" font-family="Arial" font-size="36" font-weight="bold" fill="#333333" text-anchor="middle">${username}</text>
        
        <!-- VIP Badge -->
        ${vipStatus ? `<text x="480" y="50" font-family="Arial" font-size="20" fill="#ff6b6b" text-anchor="end">👑 ${vipStatus.toUpperCase()}</text>` : ''}
        
        <!-- Stats -->
        <text x="20" y="130" font-family="Arial" font-size="16" fill="#ffffff">Level</text>
        <text x="20" y="160" font-family="Arial" font-size="32" font-weight="bold" fill="#ffd700">${level}</text>
        
        <text x="150" y="130" font-family="Arial" font-size="16" fill="#ffffff">Rank</text>
        <text x="150" y="160" font-family="Arial" font-size="32" font-weight="bold" fill="#ffd700">#${rank}</text>
        
        <text x="280" y="130" font-family="Arial" font-size="16" fill="#ffffff">XP</text>
        <text x="280" y="160" font-family="Arial" font-size="20" font-weight="bold" fill="#ffd700">${xp}</text>
        
        <!-- Bottom Row -->
        <text x="20" y="210" font-family="Arial" font-size="14" fill="#e0e0e0">💰 Coins: <tspan font-weight="bold">${coins}</tspan></text>
        <text x="250" y="210" font-family="Arial" font-size="14" fill="#e0e0e0">🏅 Badges: <tspan font-weight="bold">${badges}</tspan></text>
        
        <!-- Footer -->
        <rect y="260" width="500" height="40" fill="#00000033" />
        <text x="250" y="285" font-family="Arial" font-size="12" fill="#cccccc" text-anchor="middle">Level Bot - Profile Card</text>
      </svg>
    `.trim();
  }
}
