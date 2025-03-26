import { MongoAbility } from '@casl/ability';
import { Profile } from 'src/profiles/entities/profile.entity';
import { Action } from '../casl-ability.factory/action.enum';

export class ReadProfilePolicyHandler {
  handle(ability: MongoAbility) {
    return ability.can(Action.Read, Profile);
  }
}

export class CreateProfilePolicyHandler {
  handle(ability: MongoAbility) {
    return ability.can(Action.Create, Profile);
  }
}

export class UpdateProfilePolicyHandler {
  handle(ability: MongoAbility) {
    return ability.can(Action.Update, Profile);
  }
}

export class DeleteProfilePolicyHandler {
  handle(ability: MongoAbility) {
    return ability.can(Action.Delete, Profile);
  }
}
