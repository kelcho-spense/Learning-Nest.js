import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Profile } from 'src/profiles/entities/profile.entity';
import { BookReview } from 'src/book-reviews/entities/book-review.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'text' })
  password: string;

  @Column({ type: 'text', default: null })
  refreshToken: string | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToOne(() => Profile, (profile) => profile.user, { cascade: true })
  profile: Profile;

  @OneToMany(() => BookReview, (bookReview) => bookReview.user, {
    cascade: true,
  })
  bookReviews: BookReview[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
