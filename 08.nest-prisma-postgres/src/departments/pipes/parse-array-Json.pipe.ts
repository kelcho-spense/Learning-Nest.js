import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseArrayJsonPipe implements PipeTransform {
  transform(value: string): number[] {
    try {
      // Remove square brackets and split by comma
      const arrayString = value.replace(/[\[\]]/g, '');
      return arrayString.split(',').map((item) => parseInt(item.trim(), 10));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Invalid array format: ${message}`);
    }
  }
}
