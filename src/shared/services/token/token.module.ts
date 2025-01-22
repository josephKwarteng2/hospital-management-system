import { Module } from '@nestjs/common';
import { TokenService } from './token.service';

@Module({
  providers: [
    TokenService,
    {
      provide: 'JWT_SECRET',
      useValue: process.env.JWT_SECRET,
    },
  ],
  exports: [TokenService],
})
export class TokenModule {}
