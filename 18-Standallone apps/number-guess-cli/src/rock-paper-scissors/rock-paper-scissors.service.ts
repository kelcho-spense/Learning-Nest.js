import { Injectable } from '@nestjs/common';
import inquirer from 'inquirer';

@Injectable()
export class RockPaperScissorsService {
    /**
     * Starts the Rock Paper Scissors game.
     * Prompts the user to play and handles the game logic.
     */
    async playRockPaperScissors(): Promise<void> {
        let playAgain = true;
        const options = ['rock', 'paper', 'scissors'];

        console.log('🫠Welcome to Rock Paper Scissors!');
        console.log('🤔Rules: Rock beats Scissors, Scissors beats Paper, Paper beats Rock');

        while (playAgain) {
            // Get player's choice
            const playerChoice = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'choice',
                    message: 'Choose your weapon:',
                    choices: ['Rock', 'Paper', 'Scissors'],
                },
            ]);

            // Convert to lowercase for comparison
            const playerMove = playerChoice.choice.toLowerCase();

            // Computer makes a random choice
            const computerMove = options[Math.floor(Math.random() * options.length)];

            console.log(`You chose: ${playerMove}`);
            console.log(`Computer chose: ${computerMove}`);

            // Determine the winner
            if (playerMove === computerMove) {
                console.log("It's a tie!");
            } else if (
                (playerMove === 'rock' && computerMove === 'scissors') ||
                (playerMove === 'paper' && computerMove === 'rock') ||
                (playerMove === 'scissors' && computerMove === 'paper')
            ) {
                console.log('You win!');
            } else {
                console.log('Computer wins!');
            }
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
}
