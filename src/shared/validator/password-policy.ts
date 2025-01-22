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
    const rules = [
      {
        condition: () => password.length < this.MIN_LENGTH,
        message: `Password must be at least ${this.MIN_LENGTH} characters long.`,
      },
      {
        condition: () => this.REQUIRES_UPPERCASE && !/[A-Z]/.test(password),
        message: 'Password must contain at least one uppercase letter.',
      },
      {
        condition: () => this.REQUIRES_LOWERCASE && !/[a-z]/.test(password),
        message: 'Password must contain at least one lowercase letter.',
      },
      {
        condition: () => this.REQUIRES_NUMBER && !/\d/.test(password),
        message: 'Password must contain at least one number.',
      },
      {
        condition: () =>
          this.REQUIRES_SPECIAL && !/[!@#$%^&*(),.?":{}|<>]/.test(password),
        message: 'Password must contain at least one special character.',
      },
    ];

    for (const rule of rules) {
      if (rule.condition()) {
        throw new ValidationError(rule.message, 'INVALID_PASSWORD');
      }
    }
  }
}
