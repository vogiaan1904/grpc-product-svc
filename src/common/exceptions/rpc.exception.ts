import { status } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';

export class RpcNotFoundException extends RpcException {
  constructor(message: string, details?: any) {
    super({
      code: status.NOT_FOUND,
      message,
      details,
    });
  }
}

export class RpcInvalidArgumentException extends RpcException {
  constructor(message: string, details?: any) {
    super({
      code: status.INVALID_ARGUMENT,
      message,
      details,
    });
  }
}

export class RpcPermissionDeniedException extends RpcException {
  constructor(message: string, details?: any) {
    super({
      code: status.PERMISSION_DENIED,
      message,
      details,
    });
  }
}

export class RpcInternalException extends RpcException {
  constructor(message: string, details?: any) {
    super({
      code: status.INTERNAL,
      message,
      details,
    });
  }
}

export class RpcUnauthenticatedException extends RpcException {
  constructor(message: string, details?: any) {
    super({
      code: status.UNAUTHENTICATED,
      message,
      details,
    });
  }
}
