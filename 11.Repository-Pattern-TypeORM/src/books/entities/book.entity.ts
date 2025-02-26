import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { Author } from '../../authors/entities/author.entity';
import { BookReview } from '../../book-reviews/entities/book-review.entity';
import { Category } from '../../categories/entities/category.entity';

@Entity()
export class Book {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column()
  publicationYear: number;

  @Column({ default: true })
  isAvailable: boolean;

  @ManyToOne(() => Author, author => author.books)
  author: Author;

  @OneToMany(() => BookReview, review => review.book)
  reviews: BookReview[];

  @ManyToMany(() => Category, category => category.books)
  @JoinTable()
  categories: Category[];
}
