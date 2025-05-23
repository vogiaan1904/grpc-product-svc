import { DatabaseService } from 'src/modules/databases/database.service';
import { BaseServiceInterface } from './interfaces/base.interface';
import { paginator, PaginatorTypes } from '@nodeteam/nestjs-prisma-pagination';

const paginate: PaginatorTypes.PaginateFunction = paginator({
  page: 1,
  perPage: 10,
});

export abstract class BaseService<T> implements BaseServiceInterface<T> {
  constructor(
    private prisma: DatabaseService,
    private model: string,
    private entity: any,
  ) {}

  async findAll(filter?: any, options?: any): Promise<T[]> {
    const data = await this.prisma[this.model].findMany({
      where: filter,
      ...options,
    });
    return data.map((item) => new this.entity(item));
  }

  async findMany({
    filter,
    orderBy,
    page,
    perPage,
    options,
  }: {
    filter?: any;
    orderBy?: any;
    page?: number;
    perPage?: number;
    options?: any;
  }) {
    const response = await paginate(
      this.prisma[this.model],
      {
        where: filter,
        orderBy,
        ...options,
      },
      {
        page,
        perPage,
      },
    );
    return {
      items: response.data.map((item) => new this.entity(item)),
      metadata: {
        total: response.meta.total,
        currentPage: response.meta.currentPage,
        perPage: response.meta.perPage,
        totalPages: response.meta.lastPage,
        next: response.meta.next,
        prev: response.meta.prev,
      },
    };
  }

  async findOne(filter: any, options?: any): Promise<T | null> {
    const item = await this.prisma[this.model].findUnique({
      where: filter,
      ...options,
    });
    if (!item) {
      return null;
    }
    return new this.entity(item);
  }

  async create(data: any, options?: any): Promise<T> {
    const item = await this.prisma[this.model].create({
      data,
      ...options,
    });
    return new this.entity(item);
  }

  async update(filter: any, data: any, options?: any): Promise<T> {
    const item = await this.prisma[this.model].update({
      where: filter,
      data,
      ...options,
    });
    return new this.entity(item);
  }

  async delete(filter: any): Promise<void> {
    await this.prisma[this.model].delete({
      where: filter,
    });
  }
}
