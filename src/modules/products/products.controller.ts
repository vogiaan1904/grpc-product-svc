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
  GrpcStreamMethod,
  Payload,
  RpcException,
} from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';
import {
  CreateProductRequest,
  DecreaseStockRequest,
  FindByIdRequest,
  FindByIdResponse,
  FindManyRequest,
  FindManyResponse,
  PRODUCT_SERVICE_NAME,
  ProductData,
  ActivateProductRequest,
  DeleteProductRequest,
  CreateCategoryRequest,
  FindAllCategoriesResponse,
  UpdateProductRequest,
} from 'src/protos/product.pb';
import { ProductService } from './products.service';
import { Empty } from 'src/protos/google/protobuf/empty.pb';

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
  createProduct(req: CreateProductRequest): void {
    this.service.create(req);
  }

  @GrpcMethod(PRODUCT_SERVICE_NAME, 'FindById')
  async findById(req: FindByIdRequest): Promise<FindByIdResponse> {
    return this.service.findById(req.id);
  }

  @GrpcMethod(PRODUCT_SERVICE_NAME, 'FindMany')
  async findMany(@Payload() req: FindManyRequest): Promise<FindManyResponse> {
    return this.service.findManyWithPagination(req);
  }

  @GrpcMethod(PRODUCT_SERVICE_NAME, 'List')
  list(req: Empty): Observable<ProductData> {
    return this.service.list(req);
  }

  @GrpcMethod(PRODUCT_SERVICE_NAME, 'DecreaseStock')
  async decreaseStock(req: DecreaseStockRequest): Promise<void> {
    return this.service.decreaseStock(req);
  }

  @GrpcMethod(PRODUCT_SERVICE_NAME, 'UpdateProduct')
  updateProduct(req: UpdateProductRequest): void {
    // TODO: Implement update product
  }

  @GrpcMethod(PRODUCT_SERVICE_NAME, 'ActivateProduct')
  activateProduct(req: ActivateProductRequest): void {
    // TODO: Implement activate product
  }

  @GrpcMethod(PRODUCT_SERVICE_NAME, 'DeleteProduct')
  deleteProduct(req: DeleteProductRequest): void {
    // TODO: Implement delete product
  }

  @GrpcMethod(PRODUCT_SERVICE_NAME, 'CreateCategory')
  createCategory(req: CreateCategoryRequest): void {
    // TODO: Implement create category
  }

  @GrpcMethod(PRODUCT_SERVICE_NAME, 'FindAllCategories')
  async findAllCategories(req: Empty): Promise<FindAllCategoriesResponse> {
    // TODO: Implement find all categories
    return { categories: [] };
  }
}
