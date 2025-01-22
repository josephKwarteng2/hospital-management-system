import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: ctx.getRequest().url,
    };

    if (typeof exceptionResponse === 'object') {
      const responseObject = exceptionResponse as Record<string, string>;
      if (Array.isArray(responseObject.message)) {
        errorResponse['message'] = responseObject.message[0];
      } else {
        errorResponse = {
          ...errorResponse,
          ...responseObject,
        };
      }
    } else {
      errorResponse['message'] = exceptionResponse;
    }

    this.logger.error(
      `HTTP Status: ${status} Error Message: ${JSON.stringify(errorResponse)}`,
    );
    response.status(status).json(errorResponse);
  }
}

export class AuthenticationError extends HttpException {
  constructor(message: string, description: string) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message,
        description,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
