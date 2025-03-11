import { Injectable } from "@nestjs/common";
import { Action } from './action.enum';
import { Author } from "src/authors/entities/author.entity";
import { Book } from "src/books/entities/book.entity";
import { Category } from "src/categories/entities/category.entity";
import { User } from "src/users/entities/user.entity";
import { Profile } from "src/profiles/entities/profile.entity";
import { BookReview } from "src/book-reviews/entities/book-review.entity";
import { AbilityBuilder, createMongoAbility } from '@casl/ability';
import { Role } from "src/users/role.enum";

@Injectable()
export class CaslAbilityFactory {
    createForUser(user: User) {
        const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

        if (user.role === Role.ADMIN) {
            // Admin can manage all resources
            can(Action.Manage, 'all');
        } else if (user.role === Role.USER) {
            // Books permissions
            can(Action.Read, Book);

            // Categories permissions
            can(Action.Read, Category);

            // Authors permissions
            can(Action.Read, Author);

            // Profile permissions - users can manage their own profile
            can([Action.Read, Action.Update], Profile, { user: { id: user.id } });

            // BookReviews permissions - full control over own reviews
            can(Action.Create, BookReview);
            can(Action.Read, BookReview);
            can([Action.Update, Action.Delete], BookReview, { user: { id: user.id } });

            // User permissions - can only read and update themselves
            can(Action.Read, User, { id: user.id });
            can(Action.Update, User, { id: user.id });

            // Explicitly deny certain actions
            cannot(Action.Delete, User);
            cannot([Action.Create, Action.Update, Action.Delete], Book);
            cannot([Action.Create, Action.Update, Action.Delete], Author);
            cannot([Action.Create, Action.Update, Action.Delete], Category);
        }

        return build();
    }
}
