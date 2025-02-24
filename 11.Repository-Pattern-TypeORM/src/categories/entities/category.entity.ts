import { Book } from "src/books/entities/book.entity";
import { Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Category {
    @PrimaryGeneratedColumn()
    id: number;

    // Many-to-Many Relationship with Books
    @ManyToMany(() => Book, (book) => book.categories)
    books: Book[];
}
