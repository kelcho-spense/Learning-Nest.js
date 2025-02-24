import { Author } from "src/authors/entities/author.entity";
import { Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Profile {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => Author)
    author: Author;
}
