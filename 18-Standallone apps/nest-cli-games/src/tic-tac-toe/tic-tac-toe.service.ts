import { Injectable } from '@nestjs/common';
import inquirer from 'inquirer';

@Injectable()
export class TicTacToeService {
    private board: string[][];
    private currentPlayer: string;
    private gameOver: boolean;
    private playAgain: boolean;

    constructor() {
        this.initializeGame();
    }

    private initializeGame(): void {
        this.board = [
            [' ', ' ', ' '],
            [' ', ' ', ' '],
            [' ', ' ', ' ']
        ];
        this.currentPlayer = 'X';
        this.gameOver = false;
    }

    async playTicTacToe(): Promise<void> {
        this.playAgain = true;

        while (this.playAgain) {
            this.initializeGame();

            // Game loop
            while (!this.gameOver) {
                // Display the board
                this.displayBoard(this.board);

                // Get player move
                const move = await this.getPlayerMove(this.board, this.currentPlayer);
                const [row, col] = move;

                // Make the move
                this.board[row][col] = this.currentPlayer;

                // Check for win
                if (this.checkWin(this.board, this.currentPlayer)) {
                    this.displayBoard(this.board);
                    console.log(`Player ${this.currentPlayer} wins!`);
                    this.gameOver = true;
                    continue;
                }

                // Check for draw
                if (this.checkDraw(this.board)) {
                    this.displayBoard(this.board);
                    console.log("It's a draw!");
                    this.gameOver = true;
                    continue;
                }

                // Switch player
                this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
            }

            // Ask to play again
            const answer = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'playAgain',
                    message: 'Play again?',
                    default: false
                }
            ]);

            this.playAgain = answer.playAgain;
        }
    }

    private displayBoard(board: string[][]): void {
        console.log('\n');
        console.log(' ' + board[0][0] + ' | ' + board[0][1] + ' | ' + board[0][2]);
        console.log('---+---+---');
        console.log(' ' + board[1][0] + ' | ' + board[1][1] + ' | ' + board[1][2]);
        console.log('---+---+---');
        console.log(' ' + board[2][0] + ' | ' + board[2][1] + ' | ' + board[2][2]);
        console.log('\n');
    }

    private async getPlayerMove(board: string[][], player: string): Promise<[number, number]> {
        const choices: { name: string; value: [number, number] }[] = [];

        // Create a list of available positions
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[i][j] === ' ') {
                    choices.push({
                        name: `Row ${i + 1}, Column ${j + 1}`,
                        value: [i, j]
                    });
                }
            }
        }

        const answer = await inquirer.prompt([
            {
                type: 'list',
                name: 'position',
                message: `Player ${player}, choose your position:`,
                choices: choices
            }
        ]);

        return answer.position;
    }

    private checkWin(board: string[][], player: string): boolean {
        // Check rows
        for (let i = 0; i < 3; i++) {
            if (board[i][0] === player && board[i][1] === player && board[i][2] === player) {
                return true;
            }
        }

        // Check columns
        for (let i = 0; i < 3; i++) {
            if (board[0][i] === player && board[1][i] === player && board[2][i] === player) {
                return true;
            }
        }

        // Check diagonals
        if (board[0][0] === player && board[1][1] === player && board[2][2] === player) {
            return true;
        }

        if (board[0][2] === player && board[1][1] === player && board[2][0] === player) {
            return true;
        }

        return false;
    }

    private checkDraw(board: string[][]): boolean {
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[i][j] === ' ') {
                    return false;
                }
            }
        }
        return true;
    }
}
