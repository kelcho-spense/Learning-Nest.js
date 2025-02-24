import { Author } from "src/authors/entities/author.entity";
import { Category } from "src/categories/entities/category.entity";
import { Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Book {
    @PrimaryGeneratedColumn()
    id: number;

    // Many-to-One Relationship with Author
    @ManyToOne(() => Author, (author) => author.books)
    author: Author;
    
    // Many-to-Many Relationship with Categories
    @ManyToMany(() => Category, (category) => category.books)
    @JoinTable() // This decorator will create a join table for many-to-many relationship
    categories: Category[];
}
