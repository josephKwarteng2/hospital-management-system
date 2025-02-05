import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserRegistrationDto } from 'src/auth/dto/user-registration.dto';

@Injectable()
export class UserRepository extends Repository<User> {
  async createUserWithRole(
    userData: UserRegistrationDto,
    hashedPassword: string,
  ): Promise<User> {
    const user = this.create({
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role,
      password: hashedPassword,
    });

    return this.save(user);
  }
}
