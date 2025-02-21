import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Post } from './post.entity';

@Entity('media')
export class Media {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    filename: string;

    @Column()
    type: string;

    @Column()
    url: string;

    @Column('bigint')
    size: number;

    @ManyToOne(() => Post, post => post.media)
    post: Post;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
