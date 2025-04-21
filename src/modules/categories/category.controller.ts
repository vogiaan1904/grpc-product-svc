import {
  ArgumentsHost,
  Catch,
  Controller,
  Inject,
  Logger,
  RpcExceptionFilter,
  UseFilters,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { CreateCategoryDto } from './dto/create.dto';
import {
  FindAllCategoriesResponse,
  PRODUCT_SERVICE_NAME,
} from 'src/protos/product.pb';
import { throwError } from 'rxjs';

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
export class CategoryController {
  @Inject(CategoryService)
  private readonly service: CategoryService;

  @GrpcMethod(PRODUCT_SERVICE_NAME, 'CreateCategory')
  async createCategory(payload: CreateCategoryDto): Promise<void> {
    await this.service.create(payload);
  }

  @GrpcMethod(PRODUCT_SERVICE_NAME, 'FindAllCategories')
  async getCategories(): Promise<FindAllCategoriesResponse> {
    return await this.service.findAll();
  }
}
