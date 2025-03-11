// Decorator that marks a route as public, exempting it from authentication requirements.

import { SetMetadata } from '@nestjs/common';

export const Public = () => SetMetadata('isPublic', true);
