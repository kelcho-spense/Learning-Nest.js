import { faker } from '@faker-js/faker';
import { Types } from 'mongoose';

export const createPostData = (
  authorId: Types.ObjectId,
  categoryIds: Types.ObjectId[],
) => ({
  title: faker.lorem.sentence(),
  content: faker.lorem.paragraphs(3),
  author: authorId,
  category: categoryIds.slice(
    0,
    faker.number.int({ min: 1, max: categoryIds.length }),
  ),
  tags: Array(faker.number.int({ min: 1, max: 5 }))
    .fill(null)
    .map(() => faker.word.sample()),
});
