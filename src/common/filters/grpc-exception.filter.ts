import {
  ArgumentsHost,
  Catch,
  Logger,
  RpcExceptionFilter,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcInternalException } from '../exceptions/rpc.exception';
import { RpcException } from '@nestjs/microservices';

@Catch()
export class GlobalExceptionFilter implements RpcExceptionFilter<any> {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost): Observable<any> {
    if (exception.code !== undefined) {
      return throwError(() => exception);
    } else if (exception instanceof RpcException) {
      const rpcError = exception.getError() as any;
      if (rpcError.code !== undefined) {
        return throwError(() => rpcError);
      } else {
        return throwError(
          () => new RpcInternalException('Internal server error'),
        );
      }
    } else {
      this.logger.error(
        `Unhandled exception: ${exception.message}`,
        exception.stack,
      );

      return throwError(
        () => new RpcInternalException('Internal server error'),
      );
    }
  }
}
