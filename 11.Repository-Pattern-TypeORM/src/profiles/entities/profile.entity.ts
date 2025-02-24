import { Author } from "src/authors/entities/author.entity";
import { Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Profile {
    @PrimaryGeneratedColumn()
    id: number;

    // One-to-One Relationship with Author
    @OneToOne(() => Author)
    author: Author;
}
