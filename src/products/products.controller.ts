import {
  ArgumentsHost,
  Catch,
  Controller,
  Inject,
  Logger,
  RpcExceptionFilter,
  UseFilters,
} from '@nestjs/common';
import {
  GrpcMethod,
  MessagePattern,
  Payload,
  RpcException,
} from '@nestjs/microservices';
import { throwError } from 'rxjs';
import { ProductService } from './products.service';
import { CreateProductDto } from './dto/create.dto';
import {
  CreateProductResponse,
  PRODUCT_SERVICE_NAME,
} from 'src/protos/product.pb';

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
  private async create(
    payload: CreateProductDto,
  ): Promise<CreateProductResponse> {
    console.log(payload);
    return await this.service.create(payload);
  }
}
