import { ProductData } from 'src/protos/product.pb';

// src/utils/prisma-transformer.ts
export function transformPrismaProduct(prismaProduct: any): ProductData {
  const product = { ...prismaProduct };

  if (product.categories && Array.isArray(product.categories)) {
    product.categories = product.categories.map(
      (junction) => junction.category,
    );
  }
  return product;
}
