// src/common/filters/grpc-exception.filter.ts
import {
  ArgumentsHost,
  Catch,
  Logger,
  RpcExceptionFilter,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, of, throwError } from 'rxjs';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';

@Catch()
export class AllExceptionsFilter implements RpcExceptionFilter<any> {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: any, host: ArgumentsHost): Observable<any> {
    this.logger.error(`Exception caught: ${exception.name}`);
    this.logger.error(`Message: ${exception.message}`);

    if (
      exception instanceof BadRequestException ||
      exception.name === 'ValidationError' ||
      exception.name === 'BadRequestException'
    ) {
      let errorDetails = [];

      if (exception.response) {
        this.logger.debug(
          'Validation response:',
          JSON.stringify(exception.response),
        );
      }

      if (exception.response && exception.response.message) {
        errorDetails = Array.isArray(exception.response.message)
          ? exception.response.message
          : [exception.response.message];
      } else if (exception.message) {
        errorDetails = Array.isArray(exception.message)
          ? exception.message
          : [exception.message];
      }

      this.logger.error(
        `Validation failed with errors: ${errorDetails.join(', ')}`,
      );

      return throwError(() => ({
        code: GrpcStatus.INVALID_ARGUMENT,
        message: errorDetails.join(', '),
        details: errorDetails,
      }));
    } else if (exception.code !== undefined) {
      return throwError(() => ({
        code: exception.code,
        message: exception.message,
        details: exception.details,
      }));
    } else {
      this.logger.error(
        `Unhandled exception: ${exception.name}`,
        exception.stack,
      );
      return throwError(() => ({
        code: GrpcStatus.INTERNAL,
        message: 'Internal server error',
        details: null,
      }));
    }
  }
}
