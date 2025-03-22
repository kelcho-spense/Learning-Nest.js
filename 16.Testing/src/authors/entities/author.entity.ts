import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Book } from '../../books/entities/book.entity';

@Entity()
export class Author {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  birthDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Book, (book) => book.author, { cascade: true })
  books: Book[];
}
