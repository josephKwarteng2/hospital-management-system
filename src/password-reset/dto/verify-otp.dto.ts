import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { TOAST_MSGS } from 'src/shared/constants/constants';

export class VerifyOtpDto {
  @IsEmail({}, { message: TOAST_MSGS.PROVIDE_VALID_EMAIL })
  @IsNotEmpty({ message: TOAST_MSGS.EMAIL_REQUIRED })
  email: string;

  @IsString({ message: TOAST_MSGS.OTP_MUST_BE_STRING })
  @IsNotEmpty({ message: TOAST_MSGS.OTP_REQUIRED })
  @Length(6, 6, { message: TOAST_MSGS.OTP_MINLENGTH })
  otp: string;
}
