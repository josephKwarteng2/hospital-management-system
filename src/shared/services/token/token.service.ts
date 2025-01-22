import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthenticationError } from 'src/shared/common/filters/http-exception.filter';
import * as jwt from 'jsonwebtoken';
import { TOAST_MSGS } from 'src/shared/constants/constants';

interface TokenPayload {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

@Injectable()
export class TokenService {
  private readonly jwtSecret: string;

  constructor(private configService: ConfigService) {
    this.jwtSecret = this.configService.get<string>('JWT_SECRET');
    if (!this.jwtSecret) {
      throw new Error(TOAST_MSGS.JWT_NOT_DEFINED);
    }
  }

  generateToken(payload: TokenPayload): string {
    try {
      if (!payload) {
        throw new Error(TOAST_MSGS.EMPTY_PAYLOAD);
      }
      return jwt.sign(payload, this.jwtSecret, { expiresIn: '24h' });
    } catch (error) {
      throw new AuthenticationError(
        `Failed to generate token: ${error.message}`,
        'TOKEN_GENERATION_FAILED',
      );
    }
  }

  verifyToken<T>(token: string): T {
    try {
      if (!token) {
        throw new Error(TOAST_MSGS.EMPTY_TOKEN);
      }
      return jwt.verify(token, this.jwtSecret) as T;
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        throw new AuthenticationError('Invalid token', 'INVALID_TOKEN');
      }
      if (error.name === 'TokenExpiredError') {
        throw new AuthenticationError('Token has expired', 'TOKEN_EXPIRED');
      }
      throw error;
    }
  }
}
