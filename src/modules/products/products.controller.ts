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
import { Observable, throwError } from 'rxjs';
import { Empty } from 'src/protos/google/protobuf/empty.pb';
import {
  ActivateProductRequest,
  CreateCategoryRequest,
  FindAllCategoriesResponse,
  FindManyResponse,
  PRODUCT_SERVICE_NAME,
  ProductData,
} from 'src/protos/product.pb';
import {
  CreateProductDto,
  DeleteProductDto,
  FindByIdDto,
  FindManyDto,
  ReleaseStockDto,
  ReserveStockDto,
  UpdateProductDto,
  UpdateStockDto,
} from './dtos';
import { ProductService } from './products.service';
import { ListDto } from './dtos/list.dto';
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
  async createProduct(req: CreateProductDto) {
    await this.service.create(req);
  }

  @GrpcMethod(PRODUCT_SERVICE_NAME, 'FindById')
  async findById(req: FindByIdDto) {
    return this.service.findById(req.id);
  }

  @GrpcMethod(PRODUCT_SERVICE_NAME, 'FindMany')
  async findMany(@Payload() req: FindManyDto): Promise<FindManyResponse> {
    return this.service.findManyWithPagination(req);
  }

  @GrpcMethod(PRODUCT_SERVICE_NAME, 'List')
  list(req: ListDto): Observable<ProductData> {
    return this.service.list(req);
  }

  @GrpcMethod(PRODUCT_SERVICE_NAME, 'UpdateProduct')
  updateProduct(req: UpdateProductDto) {
    // TODO: Implement update product
  }

  @GrpcMethod(PRODUCT_SERVICE_NAME, 'ActivateProduct')
  activateProduct(req: ActivateProductRequest) {
    // TODO: Implement activate product
  }

  @GrpcMethod(PRODUCT_SERVICE_NAME, 'DeleteProduct')
  deleteProduct(req: DeleteProductDto) {
    // TODO: Implement delete product
  }

  @GrpcMethod(PRODUCT_SERVICE_NAME, 'ReserveInventory')
  async reserveInventory(req: ReserveStockDto) {
    await this.service.reserveInventory(req);
  }

  @GrpcMethod(PRODUCT_SERVICE_NAME, 'ReleaseInventory')
  async releaseInventory(req: ReleaseStockDto) {
    await this.service.releaseInventory(req);
  }

  @GrpcMethod(PRODUCT_SERVICE_NAME, 'UpdateStock')
  async updateStock(req: UpdateStockDto) {
    await this.service.updateStock(req);
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
