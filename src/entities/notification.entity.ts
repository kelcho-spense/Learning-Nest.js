import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    type: string;

    @Column('text')
    message: string;

    @Column({ default: false })
    read: boolean;

    @ManyToOne(() => User)
    user: User;

    @Column({ nullable: true })
    relatedEntityId: string;

    @Column({ nullable: true })
    relatedEntityType: string;

    @CreateDateColumn()
    createdAt: Date;
}
