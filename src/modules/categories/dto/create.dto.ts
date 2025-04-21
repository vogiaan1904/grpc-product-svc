import { IsNotEmpty, IsString } from 'class-validator';
import { CreateCategoryRequest } from 'src/protos/product.pb';

export class CreateCategoryDto implements CreateCategoryRequest {
  @IsString()
  @IsNotEmpty()
  name: string;
}
