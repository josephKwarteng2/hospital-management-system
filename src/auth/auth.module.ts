import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from 'src/shared/entities/user.entity';
import { Patient } from 'src/shared/entities/patient.entity';
import { Doctor } from 'src/shared/entities/doctor.entity';
import { InvitationModule } from 'src/invitation/invitation.module';
import { MailModule } from 'src/shared/services/mail/mail.module';
import { TokenService } from 'src/shared/services/token/token.service';
import { UserRepository } from 'src/shared/repository/user.repository';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailService } from '../shared/services/mail/mail.service';
import { AppModule } from 'src/app.module';
import { ProfileCreatorFactory } from './profile-creators/profile-creator.factory';
import { DoctorProfileCreator } from './profile-creators/creators/doctor-profile.creator';
import { PatientProfileCreator } from './profile-creators/creators/patient-profile.creator';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Patient, Doctor]),
    InvitationModule,
    MailModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: {
            user: configService.get<string>('EMAIL_USER'),
            pass: configService.get<string>('NODEMAILER_PASS'),
          },
        },
      }),
      inject: [ConfigService],
    }),
    forwardRef(() => AppModule),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokenService,
    EmailService,
    UserRepository,
    TokenService,
    ProfileCreatorFactory,
    DoctorProfileCreator,
    PatientProfileCreator,
    {
      provide: 'JWT_SECRET',
      useValue: process.env.JWT_SECRET,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
