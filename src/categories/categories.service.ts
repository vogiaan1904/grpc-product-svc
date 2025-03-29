import { HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/databases/database.service';
import { BaseService } from 'src/services/base/base.service';
import { CategoryEntity } from './entities/category.entity';
import { CreateCategoryResponse } from 'src/protos/product.pb';
import { CreateCategoryDto } from './dto/create.dto';
import { generateSlug } from 'src/utils';
@Injectable()
export class CategoryService extends BaseService<CategoryEntity> {
  constructor(prisma: DatabaseService) {
    super(prisma, 'category');
  }

  async create(dto: CreateCategoryDto): Promise<CreateCategoryResponse> {
    const category = await super.create({
      ...dto,
      slug: generateSlug(dto.name),
    });

    return {
      status: HttpStatus.CREATED,
      error: null,
      data: category,
    };
  }

  async findAll(filter?: any, options?: any): Promise<any> {
    const categories = await super.findAll(filter, options);
    return {
      status: HttpStatus.OK,
      error: null,
      data: categories,
    };
  }
}
