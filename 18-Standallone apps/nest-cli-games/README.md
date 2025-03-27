# Number Guess CLI Game Collection

A command-line interface application built with Nest.js featuring multiple fun games to play in your terminal.

## 📋 Features

This CLI application includes the following games:

- **Guess the Number**: Try to guess a random number between 1 and 100
- **Rock Paper Scissors**: Play the classic hand game against the computer
- **Tic Tac Toe**: Play the classic 3x3 grid game

## 🚀 Installation

```bash
# Clone the repository
git clone [repository-url]

# Navigate to the project directory
cd number-guess-cli

# Install dependencies
pnpm install
```

## 🎮 Usage

```bash
# Development mode
pnpm run start

# Watch mode (automatically restart on file changes)
pnpm run start:dev

# Production mode
pnpm run start:prod
```

After starting the application, follow the on-screen prompts to select and play a game.

## 🎲 Game Instructions

### Guess the Number
- Try to guess a number between 1 and 100
- You'll receive hints if your guess is too high or too low

### Rock Paper Scissors
- Choose rock, paper, or scissors to play against the computer
- Rules:
  - Rock beats Scissors (rock crushes scissors)
  - Scissors beats Paper (scissors cut paper)
  - Paper beats Rock (paper covers rock)
  - If both players choose the same option, it's a tie

### Tic Tac Toe
- A classic two-player game played on a 3x3 grid
- Take turns marking a square with X or O
- The first player to get three in a row (horizontally, vertically, or diagonally) wins

## 🛠️ Technologies Used

- [Nest.js](https://nestjs.com/) - A progressive Node.js framework
- TypeScript - For type-safe code
- Nest CLI - For command-line interface implementation

## 🧪 Testing

```bash
# Run unit tests
pnpm run test

# Run end-to-end tests
pnpm run test:e2e

# Check test coverage
pnpm run test:cov
```

## 📁 Project Structure

The project follows the standard Nest.js module structure:

- `src/` - Source code directory
  - Game services for each game type
  - CLI command implementation
  - Main application entry point

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
