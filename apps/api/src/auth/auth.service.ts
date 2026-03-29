import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JWTPayload, TokenPair, DiscordOAuth2User, AdminUser } from '@level-bot/shared';
import axios from 'axios';
import * as bcrypt from 'bcryptjs';
import { DRIZZLE } from '../drizzle.provider';
import { Inject } from '@nestjs/common';
import { sql } from 'drizzle-orm';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @Inject(DRIZZLE) private db: any,
  ) {}

  async validateDiscordToken(accessToken: string): Promise<DiscordOAuth2User> {
    try {
      const response = await axios.get('https://discordapp.com/api/users/@me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      throw new UnauthorizedException('Invalid Discord token');
    }
  }

  async validateAdminUser(username: string, password: string) {
    const result = await this.db.execute(
      sql`SELECT id, username, password_hash, role, is_active FROM admin_users WHERE username = ${username}`
    );

    if (!result || result.length === 0) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = result[0];

    if (!user.is_active) {
      throw new UnauthorizedException('User is inactive');
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      id: user.id,
      username: user.username,
      role: user.role,
    };
  }

  async loginAdmin(user: any) {
    const payload = { sub: user.id, username: user.username, role: user.role };
    return {
      access_token: this.jwtService.sign(payload, {
        expiresIn: '24h',
        secret: process.env.JWT_SECRET || 'your-secret-key-change-in-prod',
      }),
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };
  }

  generateTokens(payload: JWTPayload): TokenPair {
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
      secret: process.env.JWT_SECRET,
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
      secret: process.env.JWT_REFRESH_SECRET,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900,
      tokenType: 'Bearer',
    };
  }

  verifyRefreshToken(token: string): JWTPayload {
    try {
      return this.jwtService.verify(token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
