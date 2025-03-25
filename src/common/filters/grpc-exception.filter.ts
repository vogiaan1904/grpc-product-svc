// src/common/filters/grpc-exception.filter.ts
import {
  ArgumentsHost,
  Catch,
  Logger,
  RpcExceptionFilter,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { throwError, Observable } from 'rxjs';
import { Prisma } from '@prisma/client';
import { status as GrpcStatus } from '@grpc/grpc-js';

@Catch()
export class AllExceptionsFilter implements RpcExceptionFilter<any> {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: any, host: ArgumentsHost): Observable<any> {
    this.logger.error(`Error: ${exception.message}`, exception.stack);

    // Set default values
    let code = GrpcStatus.INTERNAL;
    let message = 'Internal service error';

    // Handle RPC exceptions directly
    if (exception instanceof RpcException) {
      return throwError(() => exception.getError());
    }

    // Handle Prisma errors
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002': // Unique constraint failed
          code = GrpcStatus.ALREADY_EXISTS;
          message = `Duplicate entry: ${exception.meta?.target}`;
          break;
        case 'P2025': // Record not found
          code = GrpcStatus.NOT_FOUND;
          message = 'Record not found';
          break;
        case 'P2003': // Foreign key constraint failed
          code = GrpcStatus.FAILED_PRECONDITION;
          message = 'Invalid reference to a related record';
          break;
        case 'P2001': // Record not found in the specified relation
          code = GrpcStatus.NOT_FOUND;
          message = 'Related record not found';
          break;
        default:
          code = GrpcStatus.INTERNAL;
          message = `Database error: ${exception.code}`;
      }
    }
    // Handle validation errors
    else if (
      exception.name === 'ValidationError' ||
      exception.name === 'BadRequestException'
    ) {
      code = GrpcStatus.INVALID_ARGUMENT;
      message = exception.message;
    }
    // Handle "not found" errors
    else if (exception.name === 'NotFoundException') {
      code = GrpcStatus.NOT_FOUND;
      message = exception.message;
    }

    // Return error in gRPC format
    return throwError(() => ({
      code,
      message,
      details: Array.isArray(message) ? message : [message],
    }));
  }
}
