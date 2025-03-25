import { Module } from '@nestjs/common';
import { CategoryModule } from 'src/categories/categories.module';
import { ProductController } from './products.controller';
import { ProductService } from './products.service';
@Module({
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
  imports: [CategoryModule],
})
export class ProductModule {}
