import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Post } from './post.entity';

@Entity('comments')
export class Comment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text')
    content: string;

    @ManyToOne(() => User, user => user.comments)
    author: User;

    @ManyToOne(() => Post, post => post.comments)
    post: Post;

    @ManyToOne(() => Comment, comment => comment.replies)
    parent: Comment;

    @OneToMany(() => Comment, comment => comment.parent)
    replies: Comment[];

    @Column({ default: 0 })
    likes: number;

    @Column({ default: 0 })
    dislikes: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
