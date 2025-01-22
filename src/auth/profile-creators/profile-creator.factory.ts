import { Injectable } from '@nestjs/common';
import { ProfileCreator } from './types/types';
import { Role } from 'src/shared/types/types';
import { DoctorProfileCreator } from './creators/doctor-profile.creator';
import { PatientProfileCreator } from './creators/patient-profile.creator';

@Injectable()
export class ProfileCreatorFactory {
  constructor(
    private readonly doctorProfileCreator: DoctorProfileCreator,
    private readonly patientProfileCreator: PatientProfileCreator,
  ) {}

  getCreator(role: Role): ProfileCreator {
    switch (role) {
      case Role.Doctor:
        return this.doctorProfileCreator;
      case Role.Patient:
        return this.patientProfileCreator;
      default:
        throw new Error('Invalid role: INVALID_ROLE');
    }
  }
}
