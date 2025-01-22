export enum Role {
  Admin = 'admin',
  Doctor = 'doctor',
  Patient = 'patient',
}

export enum Gender {
  Male = 'male',
  Female = 'female',
  Other = 'other',
}

export enum Status {
  Active = 'active',
  Inactive = 'inactive',
}

export type BasicUserInfo = {
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
};

export interface JwtPayload {
  user: {
    id: string;
    email: string;
  };
}

export interface WorkingHours {
  startTime: string;
  endTime: string;
}
