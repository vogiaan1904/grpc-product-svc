import {
  ArgumentsHost,
  Catch,
  Controller,
  Inject,
  Logger,
  RpcExceptionFilter,
  UseFilters,
} from '@nestjs/common';
import { GrpcMethod, Payload, RpcException } from '@nestjs/microservices';
import { throwError } from 'rxjs';
import {
  CreateProductRequest,
  FindByIdRequest,
  FindByIdResponse,
  FindManyRequest,
  FindManyResponse,
  PRODUCT_SERVICE_NAME,
} from 'src/protos/product.pb';
import { ProductService } from './products.service';

@Catch(RpcException)
export class GrpcExceptionFilter implements RpcExceptionFilter<RpcException> {
  private readonly logger = new Logger(GrpcExceptionFilter.name);
  catch(exception: RpcException, host: ArgumentsHost): any {
    const error = exception.getError();
    this.logger.error('gRPC Error:', error);
    return throwError(() => error);
  }
}

@UseFilters(GrpcExceptionFilter)
@Controller()
export class ProductController {
  @Inject(ProductService)
  private readonly service: ProductService;

  @GrpcMethod(PRODUCT_SERVICE_NAME, 'CreateProduct')
  private async create(req: CreateProductRequest): Promise<void> {
    await this.service.create(req);
  }

  @GrpcMethod(PRODUCT_SERVICE_NAME, 'FindById')
  private async findById(req: FindByIdRequest): Promise<FindByIdResponse> {
    return await this.service.findById(req.id);
  }

  @GrpcMethod(PRODUCT_SERVICE_NAME, 'FindMany')
  private async findMany(
    @Payload() req: FindManyRequest,
  ): Promise<FindManyResponse> {
    return await this.service.findManyWithPagination(req);
  }
}
