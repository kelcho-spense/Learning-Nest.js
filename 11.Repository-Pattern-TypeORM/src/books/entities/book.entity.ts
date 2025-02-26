import { Column, Entity, ManyToOne, ManyToMany, OneToMany, JoinTable, PrimaryGeneratedColumn } from 'typeorm';
import { Author } from 'src/authors/entities/author.entity';
import { Category } from 'src/categories/entities/category.entity';
import { BookReview } from 'src/book-reviews/entities/book-review.entity';

@Entity()
export class Book {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column({ nullable: true })
    description: string;

    @Column()
    publicationYear: number;

    @Column({ default: true })
    isAvailable: boolean;

    @ManyToOne(() => Author, author => author.books)
    author: Author;

    @ManyToMany(() => Category, category => category.books)
    @JoinTable()
    categories: Category[];

    @OneToMany(() => BookReview, review => review.book)
    reviews: BookReview[];
}
