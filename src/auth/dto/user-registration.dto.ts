import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { Role, Gender } from '../../shared/types/types';

export class UserRegistrationDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  email: string;

  @IsEnum(Role)
  role: Role;

  @IsString()
  @IsOptional()
  invitationToken?: string;

  // Doctor-specific fields
  @ValidateIf((o) => o.role === Role.Doctor)
  @IsNotEmpty({ message: 'Specialization is required for doctors' })
  specialization?: string;

  @ValidateIf((o) => o.role === Role.Doctor)
  @IsNotEmpty({ message: 'Rank is required for doctors' })
  rank?: string;

  // Patient-specific fields
  @ValidateIf((o) => o.role === Role.Patient)
  @IsNotEmpty({ message: 'Gender is required for patients' })
  gender?: string;

  @ValidateIf((o) => o.role === Role.Patient)
  @IsNotEmpty({ message: 'Contact is required for patients' })
  contact?: string;

  @ValidateIf((o) => o.role === Role.Patient)
  @IsNotEmpty({ message: 'Address is required for patients' })
  address?: string;
}
