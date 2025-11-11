class GomokuGame {
    constructor() {
        this.canvas = document.getElementById('gomoku-board');
        this.ctx = this.canvas.getContext('2d');
        this.boardSize = 15;
        this.cellSize = this.canvas.width / this.boardSize;
        this.board = [];
        this.currentPlayer = 1; // 1: 黑子, 2: 白子
        this.gameOver = false;
        this.winner = null;
        
        this.init();
        this.bindEvents();
    }
    
    init() {
        // 初始化棋盘
        this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(0));
        this.drawBoard();
        this.updateGameInfo();
    }
    
    drawBoard() {
        const ctx = this.ctx;
        
        // 清空画布
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制棋盘背景
        ctx.fillStyle = '#deb887';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制网格线
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        
        for (let i = 0; i < this.boardSize; i++) {
            // 横线
            ctx.beginPath();
            ctx.moveTo(this.cellSize / 2, i * this.cellSize + this.cellSize / 2);
            ctx.lineTo(this.canvas.width - this.cellSize / 2, i * this.cellSize + this.cellSize / 2);
            ctx.stroke();
            
            // 竖线
            ctx.beginPath();
            ctx.moveTo(i * this.cellSize + this.cellSize / 2, this.cellSize / 2);
            ctx.lineTo(i * this.cellSize + this.cellSize / 2, this.canvas.height - this.cellSize / 2);
            ctx.stroke();
        }
        
        // 绘制天元和星位
        const starPoints = [3, 7, 11];
        ctx.fillStyle = '#000';
        
        starPoints.forEach(x => {
            starPoints.forEach(y => {
                ctx.beginPath();
                ctx.arc(
                    x * this.cellSize + this.cellSize / 2,
                    y * this.cellSize + this.cellSize / 2,
                    4, 0, Math.PI * 2
                );
                ctx.fill();
            });
        });
        
        // 绘制已有棋子
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j] !== 0) {
                    this.drawPiece(i, j, this.board[i][j]);
                }
            }
        }
    }
    
    drawPiece(row, col, player) {
        const ctx = this.ctx;
        const x = col * this.cellSize + this.cellSize / 2;
        const y = row * this.cellSize + this.cellSize / 2;
        const radius = this.cellSize * 0.4;
        
        // 绘制棋子阴影
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        // 绘制棋子
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        
        if (player === 1) {
            // 黑子
            const gradient = ctx.createRadialGradient(x - 2, y - 2, 0, x, y, radius);
            gradient.addColorStop(0, '#666');
            gradient.addColorStop(1, '#000');
            ctx.fillStyle = gradient;
        } else {
            // 白子
            const gradient = ctx.createRadialGradient(x - 2, y - 2, 0, x, y, radius);
            gradient.addColorStop(0, '#fff');
            gradient.addColorStop(1, '#ccc');
            ctx.fillStyle = gradient;
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        
        ctx.fill();
        
        // 重置阴影
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }
    
    bindEvents() {
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        document.getElementById('restart').addEventListener('click', () => this.restart());
    }
    
    handleClick(e) {
        if (this.gameOver) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const col = Math.round((x - this.cellSize / 2) / this.cellSize);
        const row = Math.round((y - this.cellSize / 2) / this.cellSize);
        
        if (row >= 0 && row < this.boardSize && col >= 0 && col < this.boardSize) {
            if (this.board[row][col] === 0) {
                this.placePiece(row, col);
            }
        }
    }
    
    placePiece(row, col) {
        this.board[row][col] = this.currentPlayer;
        this.drawPiece(row, col, this.currentPlayer);
        
        if (this.checkWin(row, col)) {
            this.gameOver = true;
            this.winner = this.currentPlayer;
            this.updateGameInfo();
        } else {
            this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
            this.updateGameInfo();
        }
    }
    
    checkWin(row, col) {
        const player = this.board[row][col];
        const directions = [
            [0, 1],   // 水平
            [1, 0],   // 垂直
            [1, 1],   // 右下对角线
            [1, -1]   // 右上对角线
        ];
        
        for (const [dx, dy] of directions) {
            let count = 1;
            
            // 正向检查
            for (let i = 1; i <= 4; i++) {
                const newRow = row + dx * i;
                const newCol = col + dy * i;
                if (newRow >= 0 && newRow < this.boardSize && 
                    newCol >= 0 && newCol < this.boardSize && 
                    this.board[newRow][newCol] === player) {
                    count++;
                } else {
                    break;
                }
            }
            
            // 反向检查
            for (let i = 1; i <= 4; i++) {
                const newRow = row - dx * i;
                const newCol = col - dy * i;
                if (newRow >= 0 && newRow < this.boardSize && 
                    newCol >= 0 && newCol < this.boardSize && 
                    this.board[newRow][newCol] === player) {
                    count++;
                } else {
                    break;
                }
            }
            
            if (count >= 5) {
                return true;
            }
        }
        
        return false;
    }
    
    updateGameInfo() {
        const playerElement = document.getElementById('player');
        const statusElement = document.getElementById('status');
        
        if (this.gameOver) {
            const winnerText = this.winner === 1 ? '黑子' : '白子';
            playerElement.textContent = winnerText;
            statusElement.textContent = `${winnerText}获胜！`;
            statusElement.style.color = '#dc3545';
            statusElement.style.fontWeight = 'bold';
        } else {
            const currentPlayerText = this.currentPlayer === 1 ? '黑子' : '白子';
            playerElement.textContent = currentPlayerText;
            playerElement.style.color = this.currentPlayer === 1 ? '#000' : '#666';
            statusElement.textContent = '游戏进行中';
            statusElement.style.color = '#666';
            statusElement.style.fontWeight = 'normal';
        }
    }
    
    restart() {
        this.currentPlayer = 1;
        this.gameOver = false;
        this.winner = null;
        this.init();
    }
}

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new GomokuGame();
});