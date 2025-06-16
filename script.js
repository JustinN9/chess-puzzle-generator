// Unicode pieces
const PIECES = {
    'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚', 'p': '♟',
    'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔', 'P': '♙'
};

        // Initial board state (FEN-like)
        let board = [
            ['r','n','b','q','k','b','n','r'],
            ['p','p','p','p','p','p','p','p'],
            ['','','','','','','',''],
            ['','','','','','','',''],
            ['','','','','','','',''],
            ['','','','','','','',''],
            ['P','P','P','P','P','P','P','P'],
            ['R','N','B','Q','K','B','N','R']
        ];

        let selected = null;
        let validMoves = [];

        function renderBoard() {
            const boardDiv = document.getElementById('chessboard');
            boardDiv.innerHTML = '';
            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 8; col++) {
                    const piece = board[row][col];
                    const square = document.createElement('div');
                    square.classList.add('square');
                    square.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');
                    square.dataset.row = row;
                    square.dataset.col = col;
                    if (piece) {
                        square.textContent = PIECES[piece];
                    }
                    if (selected && selected.row === row && selected.col === col) {
                        square.classList.add('selected');
                    }
                    if (validMoves.some(m => m.row === row && m.col === col)) {
                        square.classList.add('move-target');
                    }
                    square.addEventListener('click', onSquareClick);
                    boardDiv.appendChild(square);
                }
            }
        }

        // Very basic move generator: only allows pawns and knights to move legally
        function getValidMoves(row, col) {
            const piece = board[row][col];
            if (!piece) return [];
            const isWhite = piece === piece.toUpperCase();
            const moves = [];
            if (piece.toLowerCase() === 'p') {
                const dir = isWhite ? -1 : 1;
                const nextRow = row + dir;
                // Forward move
                if (board[nextRow] && !board[nextRow][col]) {
                    moves.push({row: nextRow, col});
                    // Double move from initial position
                    if ((isWhite && row === 6) || (!isWhite && row === 1)) {
                        const doubleRow = row + dir*2;
                        if (board[doubleRow] && !board[doubleRow][col]) {
                            moves.push({row: doubleRow, col});
                        }
                    }
                }
                // Captures
                for (let dc of [-1, 1]) {
                    const capCol = col + dc;
                    if (board[nextRow] && board[nextRow][capCol]) {
                        const target = board[nextRow][capCol];
                        if (target && (isWhite !== (target === target.toUpperCase()))) {
                            moves.push({row: nextRow, col: capCol});
                        }
                    }
                }
            }
            if (piece.toLowerCase() === 'n') {
                const knightMoves = [
                    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
                    [1, -2], [1, 2], [2, -1], [2, 1]
                ];
                for (let [dr, dc] of knightMoves) {
                    const nr = row + dr, nc = col + dc;
                    if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
                        const target = board[nr][nc];
                        if (!target || (isWhite !== (target === target.toUpperCase()))) {
                            moves.push({row: nr, col: nc});
                        }
                    }
                }
            }
            // Add rook, bishop, queen, king moves for full functionality (left as exercise)
            return moves;
        }

        function onSquareClick(e) {
            const row = +e.currentTarget.dataset.row;
            const col = +e.currentTarget.dataset.col;
            const piece = board[row][col];
            if (selected) {
                // Check if move is valid
                if (validMoves.some(m => m.row === row && m.col === col)) {
                    // Move the piece
                    board[row][col] = board[selected.row][selected.col];
                    board[selected.row][selected.col] = '';
                    selected = null;
                    validMoves = [];
                } else if (piece && (piece === piece.toUpperCase()) === (board[selected.row][selected.col] === board[selected.row][selected.col].toUpperCase())) {
                    // Select new piece of same color
                    selected = {row, col};
                    validMoves = getValidMoves(row, col);
                } else {
                    // Deselect
                    selected = null;
                    validMoves = [];
                }
            } else if (piece) {
                selected = {row, col};
                validMoves = getValidMoves(row, col);
            }
            renderBoard();
        }

        renderBoard();
