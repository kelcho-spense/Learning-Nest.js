import { MongoAbility } from '@casl/ability';
import { BookReview } from 'src/book-reviews/entities/book-review.entity';
import { Action } from '../casl-ability.factory/action.enum';

export class ReadBookReviewPolicyHandler {
  handle(ability: MongoAbility) {
    return ability.can(Action.Read, BookReview);
  }
}

export class CreateBookReviewPolicyHandler {
  handle(ability: MongoAbility) {
    return ability.can(Action.Create, BookReview);
  }
}

export class UpdateBookReviewPolicyHandler {
  handle(ability: MongoAbility) {
    return ability.can(Action.Update, BookReview);
  }
}

export class DeleteBookReviewPolicyHandler {
  handle(ability: MongoAbility) {
    return ability.can(Action.Delete, BookReview);
  }
}
