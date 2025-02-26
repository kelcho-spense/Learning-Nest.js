import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Book } from '../../books/entities/book.entity';

@Entity()
export class BookReview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  content: string;

  @Column()
  rating: number;

  @ManyToOne(() => User, user => user.bookReviews)
  @JoinColumn()
  user: User;

  @ManyToOne(() => Book, book => book.reviews)
  @JoinColumn()
  book: Book;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
