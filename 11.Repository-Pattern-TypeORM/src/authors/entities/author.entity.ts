import { Book } from "src/books/entities/book.entity";
import { Profile } from "src/profiles/entities/profile.entity";
import { Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Author {
    @PrimaryGeneratedColumn()
    id: number;

    // One-to-One Relationship with Profile
    @OneToOne(() => Profile)
    @JoinColumn() // The profile will have a foreign key to Author
    profile: Profile;

    // One-to-Many Relationship with Books
    @OneToMany(() => Book, (book) => book.author)
    books: Book[];
}
