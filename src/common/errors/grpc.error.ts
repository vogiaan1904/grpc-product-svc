import { RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';

export interface GrpcErrorOptions {
  code: GrpcStatus;
  message: string;
  details?: string | string[] | Record<string, any>;
  metadata?: Record<string, any>;
}

export class GrpcError extends RpcException {
  constructor(options: GrpcErrorOptions) {
    const { code, message, details, metadata } = options;

    const error = {
      code,
      message,
      details: details || message,
      metadata: metadata || {},
    };

    super(error);
  }

  static notFound(
    message = 'Resource not found',
    details?: any,
    metadata?: any,
  ): GrpcError {
    return new GrpcError({
      code: GrpcStatus.NOT_FOUND,
      message,
      details,
      metadata,
    });
  }

  static invalidArgument(
    message = 'Invalid argument',
    details?: any,
    metadata?: any,
  ): GrpcError {
    return new GrpcError({
      code: GrpcStatus.INVALID_ARGUMENT,
      message,
      details,
      metadata,
    });
  }

  static alreadyExists(
    message = 'Resource already exists',
    details?: any,
    metadata?: any,
  ): GrpcError {
    return new GrpcError({
      code: GrpcStatus.ALREADY_EXISTS,
      message,
      details,
      metadata,
    });
  }

  static permissionDenied(
    message = 'Permission denied',
    details?: any,
    metadata?: any,
  ): GrpcError {
    return new GrpcError({
      code: GrpcStatus.PERMISSION_DENIED,
      message,
      details,
      metadata,
    });
  }

  static internalError(
    message = 'Internal server error',
    details?: any,
    metadata?: any,
  ): GrpcError {
    return new GrpcError({
      code: GrpcStatus.INTERNAL,
      message,
      details,
      metadata,
    });
  }

  static fromProductError(productError: any): GrpcError {
    // Map your custom product error codes to gRPC status codes
    const { code, message } = productError;

    // Determine appropriate gRPC status code based on your error code
    let grpcCode = GrpcStatus.INTERNAL;
    if (code >= 301400 && code <= 301402) grpcCode = GrpcStatus.NOT_FOUND;
    else if (code === 301403) grpcCode = GrpcStatus.FAILED_PRECONDITION;
    else if (code === 301404) grpcCode = GrpcStatus.FAILED_PRECONDITION;
    // Add other mappings as needed

    return new GrpcError({
      code: grpcCode,
      message,
      details: {
        originalCode: code,
        message,
      },
    });
  }
}
