import { MongoAbility } from '@casl/ability';
import { Author } from 'src/authors/entities/author.entity';
import { Action } from '../casl-ability.factory/action.enum';

export class ReadAuthorPolicyHandler {
  handle(ability: MongoAbility) {
    return ability.can(Action.Read, Author);
  }
}

export class CreateAuthorPolicyHandler {
  handle(ability: MongoAbility) {
    return ability.can(Action.Create, Author);
  }
}

export class UpdateAuthorPolicyHandler {
  handle(ability: MongoAbility) {
    return ability.can(Action.Update, Author);
  }
}

export class DeleteAuthorPolicyHandler {
  handle(ability: MongoAbility) {
    return ability.can(Action.Delete, Author);
  }
}
