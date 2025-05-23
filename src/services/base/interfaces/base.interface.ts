export interface BaseServiceInterface<T> {
  create(data: any): Promise<T>;
  findOne(filter: any): Promise<T | null>;
  findAll(filter?: any, options?: any): Promise<T[]>;
  findMany(
    filter?,
    orderBy?,
    page?,
    perPage?,
    options?,
  ): Promise<{
    items: T[];
    metadata: {
      total: number;
      currentPage: number;
      totalPages: number;
      perPage: number;
      next: number | null;
      prev: number | null;
    };
  }>;
  update(filter: any, data: any): Promise<T>;
  delete(filter: any): Promise<void>;
}
