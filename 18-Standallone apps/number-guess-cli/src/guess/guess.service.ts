import { Injectable } from '@nestjs/common';

@Injectable()
export class GuessService {
    generateNumber(): number {
        return Math.floor(Math.random() * 100) + 1;
    }
}
