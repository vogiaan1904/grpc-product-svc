import { Product } from '@prisma/client';

export class ProductEntity implements Product {
  constructor(partial: Partial<ProductEntity>) {
    Object.assign(this, partial);
  }

  id: string;
  name: string;
  description: string;
  price: number;
  totalStock: number;
  reservedStock: number;
  sku: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

class ProductImage {
  id: string;
  url: string;
  isPrimary: boolean;
}

class ProductCategory {
  id: string;
  name: string;
  slug: string;
}

export class ProductResponseDto extends ProductEntity {
  categories: ProductCategory[];
  images: ProductImage[];
}
