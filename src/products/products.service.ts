import { HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/databases/database.service';
import { CreateProductResponse } from 'src/protos/product.pb';
import { BaseService } from 'src/services/base/base.service';
import { CreateProductDto } from './dto/create.dto';
import { ProductEntity } from './entities/product.entity';
import { transformPrismaProduct } from 'src/utils';
import { CategoryService } from 'src/categories/categories.service';

@Injectable()
export class ProductService extends BaseService<ProductEntity> {
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
    images: {
      select: {
        id: true,
        url: true,
        isPrimary: true,
      },
    },
  };

  async create(dto: CreateProductDto): Promise<CreateProductResponse> {
    const { categoryIds, imageUrls, ...productData } = dto;

    const existingProductWithSku = await this.findOne({
      filter: {
        sku: productData.sku,
      },
    });

    if (existingProductWithSku) {
      return {
        status: HttpStatus.BAD_REQUEST,
        error: ['Product with SKU already exists'],
        data: null,
      };
    }

    if (categoryIds.length > 0) {
      const categories = await this.categoryService.findMany({
        filter: {
          id: { in: categoryIds },
        },
      });
      if (categories.items.length !== categoryIds.length) {
        return {
          status: HttpStatus.BAD_REQUEST,
          error: ['Some categories not found'],
          data: null,
        };
      }
    }

    const product = await super.create(
      {
        ...productData,
        categories: {
          create: categoryIds.map((id) => ({
            category: {
              connect: { id },
            },
          })),
        },
        images: {
          create: imageUrls.map((url, index) => ({
            url,
            isPrimary: index === 0,
          })),
        },
      },
      {
        include: this.defaultInclude,
      },
    );

    const mappedProduct = transformPrismaProduct(product);

    return { status: HttpStatus.CREATED, error: null, data: mappedProduct };
  }
}
