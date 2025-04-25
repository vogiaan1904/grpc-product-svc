import { Injectable } from '@nestjs/common';
import { Product } from '@prisma/client';
import { ProductErrors } from 'src/common/constants/errors.constants';
import { RpcInvalidArgumentException } from 'src/common/exceptions/rpc.exception';
import { CategoryService } from 'src/modules/categories/category.service';
import { DatabaseService } from 'src/modules/databases/database.service';
import {
  CreateProductRequest,
  FindByIdResponse,
  FindManyRequest,
  FindManyResponse,
  ProductData,
} from 'src/protos/product.pb';
import { BaseService } from 'src/services/base/base.service';
import { generateSku } from 'src/utils/sku.util';
import { FindManyDto } from './dtos/findMany.dto';
import { Empty } from 'src/protos/google/protobuf/empty.pb';
import { Observable } from 'rxjs';
import { DecreaseStockDto } from './dtos/decreaseStock.dto';

@Injectable()
export class ProductService extends BaseService<Product> {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly categoryService: CategoryService,
  ) {
    super(databaseService, 'product');
  }

  private defaultInclude = {
    categories: {
      select: {
        category: true,
      },
    },
    images: true,
  };

  private processProductResponse(product: any): ProductData {
    const { categories, images, ...rest } = product;

    const transformedCategories = categories.map((category: any) => ({
      id: category.category.id,
      name: category.category.name,
    }));

    const transformedImages = images.map((image: any) => ({
      id: image.id,
      url: image.url,
      isPrimary: image.isPrimary,
    }));

    return {
      ...rest,
      categories: transformedCategories,
      images: transformedImages,
    };
  }

  private buildFilter(dto: FindManyRequest): any {
    const { searchTerm, categoryId, shopId } = dto;
    const filter: any = {};

    if (searchTerm) {
      filter.name = {
        contains: searchTerm,
        mode: 'insensitive',
      };
    }

    if (categoryId) {
      filter.categories = {
        some: {
          categoryId,
        },
      };
    }
    if (shopId) {
      filter.shopId = shopId;
    }
    return filter;
  }

  async create(dto: CreateProductRequest): Promise<void> {
    const { categoryIds, imageUrls, ...productData } = dto;
    const safeCategoryIds = categoryIds ?? [];
    const safeImageUrls = imageUrls ?? [];

    if (safeCategoryIds.length > 0) {
      const categories = await this.categoryService.findMany({
        filter: {
          id: { in: safeCategoryIds },
        },
      });
      if (categories.items.length !== safeCategoryIds.length) {
        throw new RpcInvalidArgumentException(ProductErrors.CATEGORY_NOT_FOUND);
      }
    }

    const sku = generateSku(safeCategoryIds);

    await super.create({
      ...productData,
      sku,
      categories: {
        create: safeCategoryIds.map((id) => ({
          category: {
            connect: { id },
          },
        })),
      },
      images: {
        create: safeImageUrls.map((url, index) => ({
          url,
          isPrimary: index === 0,
        })),
      },
    });
  }

  async findById(id: string): Promise<FindByIdResponse> {
    const product = await this.findOne(
      { id },
      { include: this.defaultInclude },
    );

    if (!product) {
      throw new RpcInvalidArgumentException(ProductErrors.PRODUCT_NOT_FOUND);
    }

    const processedProduct = this.processProductResponse(product);

    return { product: processedProduct };
  }

  async findManyWithPagination(
    dto: FindManyRequest,
  ): Promise<FindManyResponse> {
    const { pagination } = dto;

    const filter = this.buildFilter(dto);

    const orderBy = {
      createdAt: 'desc',
    };

    const response = await super.findMany({
      filter,
      orderBy,
      page: pagination.page,
      perPage: pagination.perPage,
      options: {
        include: this.defaultInclude,
      },
    });

    const processedProducts = response.items.map((product) =>
      this.processProductResponse(product),
    );

    return {
      products: processedProducts,
      pagination: {
        total: response.metadata.total,
        totalPage: response.metadata.totalPages,
        currentPage: response.metadata.currentPage,
        perPage: response.metadata.perPage,
        next: response.metadata.next,
        prev: response.metadata.prev,
      },
    };
  }

  list(req: Empty): Observable<ProductData> {
    return new Observable<ProductData>((subscriber) => {
      const processBatches = async () => {
        try {
          const totalCount = await this.databaseService.product.count();
          const batchSize = 100;

          for (let skip = 0; skip < totalCount; skip += batchSize) {
            const productBatch = await this.databaseService.product.findMany({
              include: this.defaultInclude,
              skip,
              take: batchSize,
              orderBy: {
                createdAt: 'desc',
              },
            });

            for (const product of productBatch) {
              const processedProduct = this.processProductResponse(product);
              subscriber.next(processedProduct);
            }
          }

          subscriber.complete();
        } catch (error) {
          subscriber.error(error);
        }
      };

      processBatches();

      return () => {
        console.log('ProductService - Stream teardown');
      };
    });
  }

  async decreaseStock(dto: DecreaseStockDto): Promise<void> {
    const { id, quantity } = dto;
    const product = await this.findOne({ id });
    if (!product) {
      throw new RpcInvalidArgumentException(ProductErrors.PRODUCT_NOT_FOUND);
    }
    if (product.stock < quantity) {
      throw new RpcInvalidArgumentException(
        ProductErrors.PRODUCT_STOCK_NOT_ENOUGH,
      );
    }

    await this.databaseService.product.update({
      where: { id },
      data: { stock: { decrement: quantity } },
    });
  }
}
