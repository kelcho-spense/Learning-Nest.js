import { MongoAbility } from '@casl/ability';
import { User } from 'src/users/entities/user.entity';
import { Action } from '../casl-ability.factory/action.enum';

export class ReadUserPolicyHandler {
  handle(ability: MongoAbility) {
    return ability.can(Action.Read, User);
  }
}

export class CreateUserPolicyHandler {
  handle(ability: MongoAbility) {
    return ability.can(Action.Create, User);
  }
}

export class UpdateUserPolicyHandler {
  handle(ability: MongoAbility) {
    return ability.can(Action.Update, User);
  }
}

export class DeleteUserPolicyHandler {
  handle(ability: MongoAbility) {
    return ability.can(Action.Delete, User);
  }
}
