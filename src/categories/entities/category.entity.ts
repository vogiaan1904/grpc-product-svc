import { Category } from '@prisma/client';

export class CategoryEntity implements Category {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}
