import { Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";
import inquirer from "inquirer";
import { GuessNumberService } from "./guess-number/guess-number.service";
import { RockPaperScissorsService } from "./rock-paper-scissors/rock-paper-scissors.service";
import { TicTacToeService } from "./tic-tac-toe/tic-tac-toe.service";
import { JumpingGameService } from "./jumping-game/jumping-game.service";


@Injectable()
@Command({
    name: 'start',
    description: 'A CLI tool with various games',
})

class GameStart extends CommandRunner {

    constructor(private readonly guessNumberService: GuessNumberService,
        private readonly rockPaperScissorsService: RockPaperScissorsService,
        private readonly ticTacToeService: TicTacToeService,
        private readonly jumpingGameService: JumpingGameService,
    ) {
        super();
    }

    async run(): Promise<void> {
        console.log("Game started!");
        let exitGame = false;
        while (!exitGame) {
            const gameChoice = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'game',
                    message: 'Choose a game to play:',
                    choices: [
                        'Guess the Number', new inquirer.Separator(),
                        'Rock Paper Scissors', new inquirer.Separator(),
                        'Tic Tac Toe', new inquirer.Separator(),
                        'Kevin Jump Game', new inquirer.Separator(),
                        'Games Instructions / rules', new inquirer.Separator(),
                        'Exit'
                    ],

                }
            ]);

            switch (gameChoice.game) {
                case 'Guess the Number':
                    await this.guessNumberService.playNumberGuessingGame();
                    break;
                case 'Rock Paper Scissors':
                    await this.rockPaperScissorsService.playRockPaperScissors();
                    break;
                case 'Tic Tac Toe':
                    await this.ticTacToeService.playTicTacToe();
                    break;
                case 'Kevin Jump Game':
                    await this.jumpingGameService.playJumpingGame();
                    break;
                case 'Games Instructions / rules':
                    this.displayInstructions();
                    break;
                case 'Exit':
                    exitGame = true;
                    console.log("Exiting the game. Goodbye!");
                    break;
                default:
                    console.log("Invalid choice, please try again.");
                    break;
            }

            console.log('❄️ Thanks for Playing❄️');
        }
        // Add your game logic here
    }

    private displayInstructions(): void {
        console.log("Game Instructions:");
        
        console.log("1. Guess the Number:");
        console.log("   • Try to guess the number between 1 and 100");
        
        console.log("2. Rock Paper Scissors:");
        console.log("   • Choose rock, paper, or scissors to play against the computer");
        console.log("   • Rules:");
        console.log("     - Rock beats Scissors (rock crushes scissors)");
        console.log("     - Scissors beats Paper (scissors cut paper)");
        console.log("     - Paper beats Rock (paper covers rock)");
        console.log("     - If both players choose the same option, it's a tie");
        
        console.log("3. Tic Tac Toe:");
        console.log("   • A classic two-player game played on a 3x3 grid");
        console.log("   • How to play:");
        console.log("     - Players take turns marking empty squares on the grid");
        console.log("     - The first player uses 'X' marks");
        console.log("     - The second player (or computer) uses 'O' marks");
        console.log("     - The first player to get three marks in a row (horizontally, vertically, or diagonally) wins");
        console.log("     - If all squares are filled with no winner, the game ends in a draw");
        
        console.log("4. Kevin Jump Game:");
        console.log("   • Help Kevin jump over obstacles on a moving path");
        console.log("   • How to play:");
        console.log("     - Use UP ARROW or SPACE to make Kevin jump");
        console.log("     - Avoid obstacles by timing your jumps correctly");
        console.log("     - Your score increases the longer you survive");
        console.log("     - Press Q to quit at any time");
        
        console.log("5. Exit: Exit the game.");
    }
}

export default GameStart;