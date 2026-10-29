import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { existsSync } from 'fs';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { resolve } from 'path';
import { PrismaService } from '../../prisma/prisma.service';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

export function getJwtSecret(): string {
  if (!process.env.JWT_SECRET && typeof process.loadEnvFile === 'function') {
    const envPath = resolve(process.cwd(), '.env');
    if (existsSync(envPath)) {
      process.loadEnvFile(envPath);
    }
  }
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) {
    throw new Error('Missing required environment variable: JWT_SECRET');
  }
  return secret;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getJwtSecret(),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('User not found or token invalid');
    }

    return {
      id: user.id,
      sub: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      loyaltyPoints: user.loyaltyPoints,
    };
  }
}
