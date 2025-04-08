import { IsNotEmpty, IsNumber, IsPositive, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price: number;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 0 })
  @Min(0)
  stock: number;
}
