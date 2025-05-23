import { IsNotEmpty, IsString } from 'class-validator';
import { FindByIdRequest } from 'src/protos/product.pb';

export class FindByIdDto implements FindByIdRequest {
  @IsString()
  @IsNotEmpty()
  id: string;
}
