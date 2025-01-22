import { Injectable } from '@nestjs/common';
import { ValidationError } from 'src/shared/common/filters/http-exception.filter';

@Injectable()
export class PasswordPolicy {
  private readonly MIN_LENGTH = 8;
  private readonly REQUIRES_UPPERCASE = true;
  private readonly REQUIRES_LOWERCASE = true;
  private readonly REQUIRES_NUMBER = true;
  private readonly REQUIRES_SPECIAL = true;

  public async validate(password: string): Promise<void> {
    const errors: string[] = [];

    if (password.length < this.MIN_LENGTH) {
      errors.push(
        `Password must be at least ${this.MIN_LENGTH} characters long`,
      );
    }

    if (this.REQUIRES_UPPERCASE && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (this.REQUIRES_LOWERCASE && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (this.REQUIRES_NUMBER && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (this.REQUIRES_SPECIAL && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    if (errors.length > 0) {
      throw new ValidationError(errors.join('. '), 'INVALID_PASSWORD');
    }
  }
}
