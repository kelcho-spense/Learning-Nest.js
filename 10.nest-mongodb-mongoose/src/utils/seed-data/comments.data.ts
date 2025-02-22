import { faker } from '@faker-js/faker';
import { Types } from 'mongoose';

export const createCommentData = (
  authorId: Types.ObjectId,
  postId: Types.ObjectId,
) => ({
  content: faker.lorem.paragraph(),
  author: authorId,
  post: postId,
});
