import { UserRegistrationDto } from 'src/auth/dto/user-registration.dto';
import { User } from 'src/shared/entities/user.entity';

export interface ProfileCreator {
  createProfile(registerDto: UserRegistrationDto, user: User): Promise<void>;
}
