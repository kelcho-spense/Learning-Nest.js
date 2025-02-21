import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  /**
   * The name of the category
   * @example "Web Development"
   */
  @IsNotEmpty()
  @IsString()
  name: string;

  /**
   * The description of the category
   * @example "All about web development technologies"
   */
  @IsOptional()
  @IsString()
  description?: string;

  /**
   * URL-friendly version of the name
   * Auto-generated from the name field
   * @example "web-development"
   */
  @IsOptional()
  @IsString()
  slug?: string;
}
