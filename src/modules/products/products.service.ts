import { Injectable } from '@nestjs/common';
import { Product } from '@prisma/client';
import { Observable } from 'rxjs';
import { ProductErrors } from 'src/common/constants/errors.constants';
import { RpcInvalidArgumentException } from 'src/common/exceptions/rpc.exception';
import { CategoryService } from 'src/modules/categories/category.service';
import { DatabaseService } from 'src/modules/databases/database.service';
import { Empty } from 'src/protos/google/protobuf/empty.pb';
import {
  CreateProductRequest,
  FindByIdResponse,
  FindManyRequest,
  FindManyResponse,
  ListRequest,
  ProductData,
  ReleaseInventoryRequest,
  ReserveInventoryRequest,
  UpdateStockRequest,
} from 'src/protos/product.pb';
import { BaseService } from 'src/services/base/base.service';
import { generateSku } from 'src/utils/sku.util';
import { ProductEntity } from './dtos/response.dto';

@Injectable()
export class ProductService extends BaseService<Product> {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly categoryService: CategoryService,
  ) {
    super(databaseService, 'product', ProductEntity);
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

  async create(dto: CreateProductRequest): Promise<Product> {
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

    const product = await super.create({
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

    return product;
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

  list(dto: ListRequest): Observable<ProductData> {
    return new Observable<ProductData>((subscriber) => {
      const processBatches = async () => {
        try {
          const batchSize = 100;
          const { ids } = dto;

          for (let skip = 0; skip < ids.length; skip += batchSize) {
            const batchIds = ids.slice(skip, skip + batchSize);
            const productBatch = await this.databaseService.product.findMany({
              include: this.defaultInclude,
              where: {
                id: { in: batchIds },
              },
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

  async reserveInventory(dto: ReserveInventoryRequest): Promise<void> {
    const { id, quantity } = dto;
    const product = await this.findOne({ id });
    if (!product) {
      throw new RpcInvalidArgumentException(ProductErrors.PRODUCT_NOT_FOUND);
    }

    const availableStock = product.totalStock - product.reservedStock;
    if (availableStock < quantity) {
      throw new RpcInvalidArgumentException(
        ProductErrors.PRODUCT_STOCK_NOT_ENOUGH,
      );
    }

    await this.update({ id }, { reservedStock: { increment: quantity } });
  }

  async releaseInventory(dto: ReleaseInventoryRequest): Promise<void> {
    const { id, quantity } = dto;
    const product = await this.findOne({ id });
    if (!product) {
      throw new RpcInvalidArgumentException(ProductErrors.PRODUCT_NOT_FOUND);
    }

    await this.update({ id }, { reservedStock: { decrement: quantity } });
  }

  async updateStock(dto: UpdateStockRequest): Promise<void> {
    const { id, quantity } = dto;
    await this.update({ id }, { totalStock: quantity });
  }
}
