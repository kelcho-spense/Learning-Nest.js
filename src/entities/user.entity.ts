import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Post } from './post.entity';
import { Comment } from './comment.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    username: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ default: 'reader' })
    role: string;

    @Column({ nullable: true })
    avatar: string;

    @Column({ nullable: true })
    bio: string;

    @OneToMany(() => Post, post => post.author)
    posts: Post[];

    @OneToMany(() => Comment, comment => comment.author)
    comments: Comment[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
