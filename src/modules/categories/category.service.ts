import { HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/modules/databases/database.service';
import { BaseService } from 'src/services/base/base.service';
import { CategoryEntity } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create.dto';
import { generateSlug } from 'src/utils/slug.util';
@Injectable()
export class CategoryService extends BaseService<CategoryEntity> {
  constructor(prisma: DatabaseService) {
    super(prisma, 'category', CategoryEntity);
  }

  async create(dto: CreateCategoryDto): Promise<CategoryEntity> {
    return await super.create({
      ...dto,
      slug: generateSlug(dto.name),
    });
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
