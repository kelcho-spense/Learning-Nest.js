import { MongoAbility } from '@casl/ability';
import { Category } from 'src/categories/entities/category.entity';
import { Action } from '../casl-ability.factory/action.enum';

export class ReadCategoryPolicyHandler {
  handle(ability: MongoAbility) {
    return ability.can(Action.Read, Category);
  }
}

export class CreateCategoryPolicyHandler {
  handle(ability: MongoAbility) {
    return ability.can(Action.Create, Category);
  }
}

export class UpdateCategoryPolicyHandler {
  handle(ability: MongoAbility) {
    return ability.can(Action.Update, Category);
  }
}

export class DeleteCategoryPolicyHandler {
  handle(ability: MongoAbility) {
    return ability.can(Action.Delete, Category);
  }
}
