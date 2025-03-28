import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as readline from 'readline';

@Injectable()
export class JumpingGameService implements OnModuleInit, OnModuleDestroy {
    private player = {
        position: 0, // 0: ground, 1: jumping
        character: 'K',
        jumpTick: 0,
        jumpDuration: 3, // how long the jump lasts
    };

    private obstacles: { position: number; character: string }[] = [];
    private path: string[] = [];
    private gameOver = false;
    private score = 0;
    private frameCount = 0;
    private gameSpeed = 100; // milliseconds per frame
    private pathWidth = 40;
    private gameInterval: NodeJS.Timeout | null = null;
    private gameStarted = false;
    private waitingForStart = false;

    /**
     * Starts the Kevin Jump Game.
     * Controls: up/space to jump
     */
    async playJumpingGame(): Promise<void> {
        console.clear();
        console.log('🎮 Welcome to Kevin Jump! 🎮');
        console.log('Help Kevin jump over obstacles using the UP arrow key or SPACE');
        console.log('Press Q to quit at any time');
        console.log('Press any key to start...');

        // Wait for keypress to start
        this.waitingForStart = true;
        await new Promise<void>((resolve) => {
            const checkInterval = setInterval(() => {
                if (!this.waitingForStart) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
        });

        this.initGame();
        this.gameStarted = true;

        // Start game loop
        this.startGameLoop();

        // Wait until game is over
        await new Promise<void>((resolve) => {
            const checkInterval = setInterval(() => {
                if (this.gameOver) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
        });

        // Clean up
        this.gameStarted = false;
        console.log(`\nGame Over! Your score: ${this.score}`);

        // Ask to play again
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        await new Promise<void>((resolve) => {
            rl.question('Play again? (y/n) ', (answer: string) => {
                rl.close();
                if (answer.toLowerCase() === 'y') {
                    this.playJumpingGame();
                }
                resolve();
            });
        });
    }

    private initGame(): void {
        this.player = {
            position: 0,
            character: 'K',
            jumpTick: 0,
            jumpDuration: 3,
        };
        this.obstacles = [];
        this.path = new Array(this.pathWidth).fill(' ');
        this.gameOver = false;
        this.score = 0;
        this.frameCount = 0;
    }

    private jump(): void {
        if (this.player.position === 1) {
            // Already jumping, do nothing
            return;
        }

        this.player.position = 1;
        this.player.jumpTick = 0;
    }

    private startGameLoop(): void {
        this.gameInterval = setInterval(() => {
            this.updateGameState();
            this.render();

            this.frameCount++;
        }, this.gameSpeed);
    }

    private updateGameState(): void {
        // Update player jump state
        if (this.player.position === 1) {
            this.player.jumpTick++;
            if (this.player.jumpTick >= this.player.jumpDuration) {
                this.player.position = 0;
            }
        }

        // Move obstacles left
        this.obstacles = this.obstacles
            .map(obj => ({ ...obj, position: obj.position - 1 }))
            .filter(obj => obj.position >= 0);

        // Generate new obstacles
        if (this.frameCount % 15 === 0 && Math.random() < 0.5) {
            this.obstacles.push({ position: this.pathWidth - 1, character: '■' });
        }

        // Check collisions
        for (const obstacle of this.obstacles) {
            if (obstacle.position === 3 && this.player.position === 0) {
                this.gameOver = true;
                if (this.gameInterval) {
                    clearInterval(this.gameInterval);
                    this.gameInterval = null;
                }
                break;
            }
        }

        // Increase score
        if (!this.gameOver) {
            this.score++;
        }
    }

    private render(): void {
        console.clear();
        console.log(`Score: ${this.score}`);

        // Create top line (player jumping)
        const topLine = new Array(this.pathWidth).fill(' ');
        if (this.player.position === 1) {
            topLine[3] = this.player.character;
        }

        // Create bottom line (ground + player + obstacles)
        const bottomLine = new Array(this.pathWidth).fill('_');
        if (this.player.position === 0) {
            bottomLine[3] = this.player.character;
        }

        // Add obstacles to bottom line
        for (const obstacle of this.obstacles) {
            if (obstacle.position >= 0 && obstacle.position < this.pathWidth) {
                bottomLine[obstacle.position] = obstacle.character;
            }
        }

        console.log(topLine.join(''));
        console.log(bottomLine.join(''));
        console.log('\nUse UP ARROW or SPACE to jump, Q to quit');
    }

    private endGame(): void {
        this.gameOver = true;
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
            this.gameInterval = null;
        }
    }

    onModuleInit(): void {
        // Setup key handling once at the beginning
        readline.emitKeypressEvents(process.stdin);
        if (process.stdin.isTTY) {
            process.stdin.setRawMode(true);
        }

        process.stdin.on('keypress', (_, key) => {
            // For game exit
            if (key && (key.name === 'q' || (key.ctrl && key.name === 'c'))) {
                this.endGame();
                if (process.stdin.isTTY) {
                    process.stdin.setRawMode(false);
                }
                process.exit();
                return;
            }

            // For game start
            if (this.waitingForStart) {
                this.waitingForStart = false;
                return;
            }

            // Only handle jump if game is in progress
            if (this.gameStarted && key && (key.name === 'up' || key.name === 'space')) {
                console.log("Jump triggered!"); // Debug log
                this.jump();
            }
        });
    }

    onModuleDestroy(): void {
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
        }
        if (process.stdin.isTTY) {
            process.stdin.setRawMode(false);
        }
        process.stdin.removeAllListeners('keypress');
    }
}
