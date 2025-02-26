import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Book } from 'src/books/entities/book.entity';
import { User } from 'src/users/entities/user.entity';

@Entity('book_reviews')
export class BookReview {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'int' })
    rating: number;

    @Column({ type: 'text', nullable: true })
    comment: string;

    @ManyToOne(() => Book, book => book.reviews)
    book: Book;

    @ManyToOne(() => User, user => user.bookReviews)
    user: User;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
