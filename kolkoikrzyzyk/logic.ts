const board: HTMLElement = document.getElementById('board') as HTMLElement;
const cells: NodeListOf<HTMLElement> = document.querySelectorAll('.cell');
const Status: HTMLElement = document.getElementById('status') as HTMLElement;
const resetButton: HTMLButtonElement = document.getElementById('reset') as HTMLButtonElement;

type Player = 'X' | 'O' | '';

let currentPlayer: Player = 'X';
let gameBoard: Player[] = ['', '', '', '', '', '', '', '', ''];
let gameActive: boolean = true;

const winPatterns: number[][] = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // wiersze
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // kolumny
    [0, 4, 8], [2, 4, 6]             // przekątne
];

interface GameResult {
    winner: Player | 'Tie';
    pattern: number[] | null;
}

function checkWinner(board: Player[]): GameResult | null {
    for (let i = 0; i < winPatterns.length; i++) {
        const [a, b, c] = winPatterns[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return { winner: board[a], pattern: winPatterns[i] };
        }
    }
    return board.includes('') ? null : { winner: 'Tie', pattern: null };
}

function highlightWinningCells(pattern: number[] | null): void {
    if (!pattern) return;

    pattern.forEach(index => {
        cells[index].classList.add('winning-cell');
    });
}

function updateStatus(result: GameResult | null): void {
    if (!result) {
        Status.textContent = `koleej ${currentPlayer}`;
        return;
    }

    const { winner, pattern } = result;

    if (winner === 'Tie') {
        Status.textContent = 'Remis!';
    } else {
        Status.textContent = `${winner} wygrywa!`;
        highlightWinningCells(pattern);
    }
}

function minimax(board: Player[], depth: number, isMaximizing: boolean): number {
    const result = checkWinner(board);

    if (result) {
        if (result.winner === 'O') return 10 - depth;
        if (result.winner === 'X') return depth - 10;
        if (result.winner === 'Tie') return 0;
    }

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                const score = minimax(board, depth + 1, false);
                board[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'X';
                const score = minimax(board, depth + 1, true);
                board[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function aiMove(): void {
    let bestScore: number = -Infinity;
    let bestMove: number | null = null;

    for (let i = 0; i < 9; i++) {
        if (gameBoard[i] === '') {
            gameBoard[i] = 'O';
            const score: number = minimax(gameBoard, 0, false);
            gameBoard[i] = '';
            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }

    if (bestMove === null) return;

    gameBoard[bestMove] = 'O';
    cells[bestMove].textContent = 'O';
    currentPlayer = 'X';

    const result: GameResult | null = checkWinner(gameBoard);
    updateStatus(result);

    if (result) gameActive = false;
}

function handleCellClick(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    const cellIndexStr = target.getAttribute('data-index');
    if (cellIndexStr === null) return;

    const cellIndex = parseInt(cellIndexStr);

    if (gameBoard[cellIndex] !== '' || !gameActive || currentPlayer !== 'X') return;

    gameBoard[cellIndex] = 'X';
    target.textContent = 'X';

    const result: GameResult | null = checkWinner(gameBoard);
    if (result) {
        updateStatus(result);
        gameActive = false;
        return;
    }

    currentPlayer = 'O';
    updateStatus(null);

    setTimeout(aiMove, 500);
}

function resetGame(): void {
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    currentPlayer = 'X';

    cells.forEach((cell: HTMLElement) => {
        cell.textContent = '';
        cell.classList.remove('winning-cell');
    });

    updateStatus(null);
}

board.addEventListener('click', handleCellClick);
resetButton.addEventListener('click', resetGame);
updateStatus(null);
