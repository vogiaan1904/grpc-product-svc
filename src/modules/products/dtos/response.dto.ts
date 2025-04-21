import { Product } from '@prisma/client';

export class ProductEntity implements Product {
  constructor(partial: Partial<ProductEntity>) {
    Object.assign(this, partial);
  }

  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  sku: string;
  active: boolean;
  categories: ProductCategory[];
  images: ProductImage[];
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
