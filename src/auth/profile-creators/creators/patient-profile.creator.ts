import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileCreator } from '../types/types';
import { Patient } from 'src/shared/entities/patient.entity';
import { UserRegistrationDto } from 'src/auth/dto/user-registration.dto';
import { ValidationError } from 'class-validator';
import { User } from 'src/shared/entities/user.entity';
import { Gender } from 'src/shared/types/types';

@Injectable()
export class PatientProfileCreator implements ProfileCreator {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  async createProfile(
    registerDto: UserRegistrationDto,
    user: User,
  ): Promise<void> {
    if (!registerDto.gender || !registerDto.contact || !registerDto.address) {
      const error = new ValidationError();
      error.property = 'Patient gender, contact, and address are required';
      error.constraints = {
        MISSING_PATIENT_DETAILS:
          'Patient gender, contact, and address are required',
      };
      throw error;
    }

    if (!Object.values(Gender).includes(registerDto.gender as Gender)) {
      const error = new ValidationError();
      error.property = 'gender';
      error.constraints = {
        INVALID_GENDER: `Gender must be one of: ${Object.values(Gender).join(', ')}`,
      };
      throw error;
    }

    const patient = this.patientRepository.create({
      user,
      gender: registerDto.gender as Gender,
      contact: registerDto.contact,
      address: registerDto.address,
    });

    await this.patientRepository.save(patient);
  }
}
