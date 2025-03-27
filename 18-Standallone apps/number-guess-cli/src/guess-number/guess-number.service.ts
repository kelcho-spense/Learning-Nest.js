import { Injectable } from '@nestjs/common';
import inquirer from 'inquirer';

@Injectable()
export class GuessNumberService {
    async playNumberGuessingGame(): Promise<void> {
        let playAgain = true;

        while (playAgain) {
            const numberToGuess = this.generateNumber();
            let attempts = 0;
            let guessedNumber: number;

            do {
                const answers = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'guess',
                        message: 'Guess the number (between 1 and 100):',
                        validate: (input) => {
                            const num = Number(input);
                            return (!isNaN(num) && num >= 1 && num <= 100) || 'Please enter a number between 1 and 100.';
                        },
                    },
                ]);
                guessedNumber = parseInt(answers.guess, 10);
                attempts++;
                if (guessedNumber < numberToGuess) {
                    console.log('Too low! Try again.');
                } else if (guessedNumber > numberToGuess) {
                    console.log('Too high! Try again.');
                } else {
                    console.log(`Congratulations! You guessed the number in ${attempts} attempts.`);
                }
            } while (guessedNumber !== numberToGuess);

            // Ask if the player wants to play again
            const playAgainAnswer = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'restart',
                    message: 'Do you want to play again?',
                    default: false,
                },
            ]);

            playAgain = playAgainAnswer.restart;
        }
    }
    generateNumber(): number {
        return Math.floor(Math.random() * 100) + 1;
    }
}
