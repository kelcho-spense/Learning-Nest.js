import { MongoAbility } from '@casl/ability';
import { Book } from 'src/books/entities/book.entity';
import { Action } from '../casl-ability.factory/action.enum';

export class ReadBookPolicyHandler {
    handle(ability: MongoAbility) {
        return ability.can(Action.Read, Book);
    }
}

export class CreateBookPolicyHandler {
    handle(ability: MongoAbility) {
        return ability.can(Action.Create, Book);
    }
}

export class UpdateBookPolicyHandler {
    handle(ability: MongoAbility) {
        return ability.can(Action.Update, Book);
    }
}

export class DeleteBookPolicyHandler {
    handle(ability: MongoAbility) {
        return ability.can(Action.Delete, Book);
    }
}
