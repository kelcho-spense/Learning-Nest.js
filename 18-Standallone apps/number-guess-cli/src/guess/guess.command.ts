import { Command, CommandRunner } from 'nest-commander';
import inquirer from 'inquirer';
import { GuessService } from './guess.service';

@Command({
  name: 'guess',
  description: 'A CLI tool to guess a randomly generated number',
})
export class GuessCommand extends CommandRunner {
  constructor(private readonly guessService: GuessService) {
    super();
  }

  async run(): Promise<void> {
    const numberToGuess = this.guessService.generateNumber();
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
  }
}
