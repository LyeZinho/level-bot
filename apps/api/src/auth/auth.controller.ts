import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { JWTPayload, UserRole } from '@level-bot/shared';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('discord/callback')
  @Public()
  async discordCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    try {
      if (!code) {
        return res.status(400).json({ error: 'Missing authorization code' });
      }

      const discordUser = await this.authService.validateDiscordToken(code);
      const now = Math.floor(Date.now() / 1000);

      const jwtPayload: JWTPayload = {
        sub: discordUser.id,
        guildId: process.env.GUILD_ID || '',
        role: UserRole.User,
        iat: now,
        exp: now + 900,
        jti: `jwt_${Date.now()}`,
      };

      const tokens = this.authService.generateTokens(jwtPayload);

      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      const redirectUrl = new URL(process.env.WEB_URL || 'http://localhost:5173');
      redirectUrl.searchParams.append('accessToken', tokens.accessToken);
      res.redirect(redirectUrl.toString());
    } catch (error) {
      res.status(500).json({ error: 'Authentication failed' });
    }
  }

  @Get('refresh')
  @Public()
  async refresh(@Query('refreshToken') refreshToken: string) {
    const payload = this.authService.verifyRefreshToken(refreshToken);
    return this.authService.generateTokens(payload);
  }
}
