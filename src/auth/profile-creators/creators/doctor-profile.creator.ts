import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Doctor } from 'src/shared/entities/doctor.entity';
import { User } from 'src/shared/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { ValidationError } from 'src/shared/common/filters/http-exception.filter';
import { UserRegistrationDto } from 'src/auth/dto/user-registration.dto';

interface ProfileCreator {
  createProfile(registerDto: UserRegistrationDto, user: User): Promise<void>;
}

@Injectable()
export class DoctorProfileCreator implements ProfileCreator {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    private readonly configService: ConfigService,
  ) {}

  async createProfile(
    registerDto: UserRegistrationDto,
    user: User,
  ): Promise<void> {
    if (!registerDto.specialization || !registerDto.rank) {
      throw new ValidationError(
        'Doctor specialization and rank are required',
        'MISSING_DOCTOR_DETAILS',
      );
    }

    const workingHours = this.configService.get('doctor.defaultWorkingHours');

    const doctor = this.doctorRepository.create({
      user,
      specialization: registerDto.specialization,
      rank: registerDto.rank,
      workingHours,
    });

    await this.doctorRepository.save(doctor);
  }
}
