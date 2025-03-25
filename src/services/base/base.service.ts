import { DatabaseService } from 'src/databases/database.service';
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
  ) {}

  async findAll(filter?: any, options?: any) {
    return await this.prisma[this.model].findMany({
      where: filter,
      ...options,
    });
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
      items: response.data as T[],
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

  async findOne(filter: any, options?: any) {
    const data = await this.prisma[this.model].findUnique({
      where: filter,
      ...options,
    });
    if (!data) {
      return null;
    }
    return data;
  }

  async create(data: any, options?: any) {
    return await this.prisma[this.model].create({
      data,
      ...options,
    });
  }

  async update(filter: any, data: any, options?: any) {
    return await this.prisma[this.model].update({
      where: filter,
      data,
      ...options,
    });
  }

  async delete(filter: any) {
    await this.prisma[this.model].delete({
      where: filter,
    });
  }
}
