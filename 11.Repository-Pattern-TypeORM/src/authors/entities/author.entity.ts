import { Profile } from "src/profiles/entities/profile.entity";
import { Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Author {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => Profile)
    @JoinColumn()
    profile: Profile;
}
