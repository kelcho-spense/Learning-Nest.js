import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Category } from './category.entity';
import { Comment } from './comment.entity';
import { Tag } from './tag.entity';
import { Media } from './media.entity';

@Entity('posts')
export class Post {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column('text')
    content: string;

    @Column({ default: false })
    published: boolean;

    @ManyToOne(() => User, user => user.posts)
    author: User;

    @ManyToOne(() => Category, category => category.posts)
    category: Category;

    @OneToMany(() => Comment, comment => comment.post)
    comments: Comment[];

    @ManyToMany(() => Tag)
    @JoinTable()
    tags: Tag[];

    @OneToMany(() => Media, media => media.post)
    media: Media[];

    @Column({ default: 0 })
    likes: number;

    @Column({ default: 0 })
    dislikes: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
