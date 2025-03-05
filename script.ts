// Game Configuration
interface GameConfig {
    readonly PLAYERS_PER_TEAM: number;
    readonly BALLS_PER_PLAYER: number;
    readonly TIMER_DURATION: number;
    readonly TEAMS: number;
}

const GAME_CONFIG: GameConfig = {
    PLAYERS_PER_TEAM: 10,
    BALLS_PER_PLAYER: 6,
    TIMER_DURATION: 60,
    TEAMS: 2
};

// DOM Helper Types
interface ElementAttributes {
    id?: string;
    class?: string;
    [key: string]: string | undefined;
}

// DOM Manipulation Helper
class DOMHelper {
    static createElement<K extends keyof HTMLElementTagNameMap>(
        type: K,
        attributes: ElementAttributes = {},
        innerHTML: string = ''
    ): HTMLElementTagNameMap[K] {
        const element = document.createElement(type);
        Object.entries(attributes).forEach(([key, value]) => {
            if (value) element.setAttribute(key, value);
        });
        if (innerHTML) element.innerHTML = innerHTML;
        return element;
    }

    static getElement<T extends HTMLElement>(id: string): T {
        const element = document.getElementById(id) as T;
        if (!element) {
            throw new Error(`Element with id '${id}' not found`);
        }
        return element;
    }

    static appendToParent(parentId: string, element: HTMLElement): void {
        const parent = this.getElement(parentId);
        parent.appendChild(element);
    }
}

// Game State Management
interface GameState {
    players: number;
    balls: number;
    total: number;
    teamTotal: number;
    team: number;
    tInterval: number | null;
}

class GameStateManager {
    private state: GameState;

    constructor() {
        this.state = {
            players: 1,
            balls: 1,
            total: 0,
            teamTotal: 0,
            team: 1,
            tInterval: null
        };
    }

    getState(): Readonly<GameState> {
        return { ...this.state };
    }

    updateState(updates: Partial<GameState>): void {
        this.state = { ...this.state, ...updates };
    }

    resetInningsState(): void {
        this.updateState({
            players: 1,
            balls: 1,
            total: 0,
            teamTotal: 0
        });
    }

    nextTeam(): void {
        this.updateState({
            team: this.state.team + 1,
            players: 1,
            balls: 1,
            total: 0,
            teamTotal: 0
        });
    }

    setTimerInterval(interval: number | null): void {
        this.state.tInterval = interval;
    }

    getTimerInterval(): number | null {
        return this.state.tInterval;
    }
}

// UI Components
class GameUI {
    static initialize(): void {
        // Initialize event listeners and any dynamic content
        this.initializeScoreTables();
    }

    private static initializeScoreTables(): void {
        // Initialize the score tables with empty rows
        for (let teamNum = 1; teamNum <= 2; teamNum++) {
            const tbody = document.querySelector(`#table${teamNum} tbody`);
            if (tbody) {
                for (let i = 1; i <= GAME_CONFIG.PLAYERS_PER_TEAM; i++) {
                    const row = this.createPlayerRow(teamNum, i);
                    tbody.appendChild(row);
                }
            }
        }
    }

    private static createPlayerRow(teamNum: number, playerNum: number): HTMLTableRowElement {
        const row = DOMHelper.createElement('tr');
        row.appendChild(DOMHelper.createElement('th', {}, `Player${playerNum}`));
        
        for (let j = 1; j <= GAME_CONFIG.BALLS_PER_PLAYER; j++) {
            const cell = DOMHelper.createElement('td', {
                id: `${teamNum}${playerNum}${j}`
            });
            row.appendChild(cell);
        }
        
        row.appendChild(DOMHelper.createElement('td', {
            id: `t${teamNum}${playerNum}`
        }));
        
        return row;
    }

    static updateCell(id: string, value: string): void {
        const cell = DOMHelper.getElement<HTMLTableCellElement>(id);
        cell.textContent = value.toString().replace(/\./g, '');
        cell.classList.add('highlight');
        setTimeout(() => cell.classList.remove('highlight'), 500);
    }

    static updateScore(team: number, score: number): void {
        const scoreElement = DOMHelper.getElement<HTMLElement>(`score${team}`);
        scoreElement.textContent = score.toString().replace(/\./g, '');
        scoreElement.classList.add('highlight');
        setTimeout(() => scoreElement.classList.remove('highlight'), 500);
    }

    static updateTimer(time: number): void {
        const timerElement = DOMHelper.getElement<HTMLElement>('timer');
        timerElement.textContent = time.toString();
        if (time <= 10) {
            timerElement.style.color = '#e74c3c';
        }
    }

    static toggleTeamButton(team: number, enable: boolean): void {
        const button = DOMHelper.getElement<HTMLButtonElement>(`hit${team}`);
        button.className = `hit-button${!enable ? ' disabled' : ''}`;
    }

    static showGameResult(winner: number, resultText: string, mom: { player: number; score: number }): void {
        if (document.getElementById('result')) {
            return;
        }

        const resultContainer = DOMHelper.createElement('div', {
            class: 'result-container',
            id: 'result'
        });
        
        const winnerText = DOMHelper.createElement('h4', {
            class: 'mb-3'
        }, resultText);
        
        const momText = DOMHelper.createElement('p', {
            class: 'mb-0'
        }, `Player of the Match: Player${mom.player} from Team${winner} (Score: ${mom.score})`);
        
        resultContainer.appendChild(winnerText);
        resultContainer.appendChild(momText);
        document.querySelector('.game-container')?.appendChild(resultContainer);

        this.toggleTeamButton(1, false);
        this.toggleTeamButton(2, false);

        const game = CricketGame.getInstance();
        if (game) {
            game.clearTimer();
        }
    }
}

// Game Logic
class CricketGame {
    private static instance: CricketGame | null = null;
    private stateManager: GameStateManager;
    private gameEnded: boolean = false;

    constructor() {
        this.stateManager = new GameStateManager();
        this.bindEvents();
        CricketGame.instance = this;
    }

    static getInstance(): CricketGame | null {
        return CricketGame.instance;
    }

    private bindEvents(): void {
        // Bind events for both team buttons at initialization
        const hitBtn1 = DOMHelper.getElement<HTMLButtonElement>('hit1');
        const hitBtn2 = DOMHelper.getElement<HTMLButtonElement>('hit2');
        
        hitBtn1.addEventListener('click', () => this.handleHit());
        hitBtn2.addEventListener('click', () => this.handleHit());
    }

    private handleHit(): void {
        const state = this.stateManager.getState();
        
        if (state.players === 1 && state.balls === 1) {
            this.startTimer();
        }

        const run = this.generateRun();
        const cellId = `${state.team}${state.players}${state.balls}`;
        
        this.updateScore(run, cellId);
        this.checkInningsProgress();
    }

    private generateRun(): number {
        return Math.floor(Math.random() * 7);
    }

    private updateScore(run: number, cellId: string): void {
        const state = this.stateManager.getState();
        
        if (run === 0) {
            GameUI.updateCell(cellId, 'W');
            GameUI.updateCell(`t${state.team}${state.players}`, state.total.toString());
            
            this.stateManager.updateState({
                total: 0,
                players: state.players + 1,
                balls: 1
            });

            // Check if all players of team 2 are out
            if (state.team === 2 && state.players >= GAME_CONFIG.PLAYERS_PER_TEAM) {
                this.showResult();
                return;
            }
        } else {
            const newTotal = state.total + run;
            const newTeamTotal = state.teamTotal + run;
            
            GameUI.updateCell(cellId, run.toString());
            GameUI.updateCell(`t${state.team}${state.players}`, newTotal.toString());
            GameUI.updateScore(state.team, newTeamTotal);
            
            this.stateManager.updateState({
                total: newTotal,
                teamTotal: newTeamTotal,
                balls: state.balls + 1
            });

            // Check if team 2 has won by exceeding team 1's score
            if (state.team === 2) {
                const score1 = parseInt(DOMHelper.getElement<HTMLElement>('score1').textContent || '0');
                if (newTeamTotal > score1) {
                    this.showResult();
                    return;
                }
            }
        }
    }

    private checkInningsProgress(): void {
        const state = this.stateManager.getState();
        
        if (state.balls === 7) {
            this.stateManager.updateState({
                players: state.players + 1,
                balls: 1,
                total: 0
            });
        }
        
        if (state.players > GAME_CONFIG.PLAYERS_PER_TEAM) {
            this.switchTeam();
            return;
        }

        // Check if team 2 has won by exceeding team 1's score
        if (state.team === 2) {
            const score1 = parseInt(DOMHelper.getElement<HTMLElement>('score1').textContent || '0');
            if (state.teamTotal > score1) {
                this.showResult();
            }
        }
    }

    private switchTeam(): void {
        const state = this.stateManager.getState();
        
        this.resetTimer();
        GameUI.toggleTeamButton(state.team, false);
        
        if (state.team === 1) {
            this.stateManager.nextTeam();
            GameUI.toggleTeamButton(2, true);
            // Clear timer when switching to team 2
            const interval = this.stateManager.getTimerInterval();
            if (interval) {
                clearInterval(interval);
                this.stateManager.setTimerInterval(null);
            }
        } else if (!this.gameEnded) {
            this.showResult();
        }
    }

    private showResult(): void {
        if (this.gameEnded) return;
        
        this.gameEnded = true;
        this.clearTimer();  // Clear any existing timer
        
        const score1 = parseInt(DOMHelper.getElement<HTMLElement>('score1').textContent || '0');
        const score2 = parseInt(DOMHelper.getElement<HTMLElement>('score2').textContent || '0');
        
        const winner = score2 > score1 ? 2 : 1;
        const margin = Math.abs(score1 - score2);
        const mom = this.findPlayerOfTheMatch(winner);

        let resultText = '';
        if (winner === 1) {
            resultText = `Team ${winner} wins by ${margin} runs!`;
        } else {
            const state = this.stateManager.getState();
            const remainingWickets = GAME_CONFIG.PLAYERS_PER_TEAM - (state.players - 1);
            resultText = `Team ${winner} wins by ${remainingWickets} wickets!`;
        }
        
        GameUI.showGameResult(winner, resultText, mom);
    }

    private findPlayerOfTheMatch(winner: number): { player: number; score: number } {
        let maxScore = 0;
        let player = -1;
        
        for (let i = 1; i <= GAME_CONFIG.PLAYERS_PER_TEAM; i++) {
            const score = parseInt(DOMHelper.getElement<HTMLElement>(`t${winner}${i}`).innerText);
            if (score >= maxScore) {
                maxScore = score;
                player = i;
            }
        }
        
        return { player, score: maxScore };
    }

    private startTimer(): void {
        const interval = window.setInterval(() => this.updateTimer(), 1000);
        this.stateManager.setTimerInterval(interval);
    }

    private updateTimer(): void {
        if (this.gameEnded) return;
        
        const timerElement = DOMHelper.getElement<HTMLElement>('timer');
        const currentTime = parseInt(timerElement.innerText) - 1;
        
        GameUI.updateTimer(currentTime);
        
        if (currentTime === 0) {
            this.switchTeam();
        }
    }

    private resetTimer(): void {
        const interval = this.stateManager.getTimerInterval();
        if (interval) {
            clearInterval(interval);
            this.stateManager.setTimerInterval(null);
        }
        GameUI.updateTimer(GAME_CONFIG.TIMER_DURATION);
    }

    clearTimer(): void {
        const interval = this.stateManager.getTimerInterval();
        if (interval) {
            clearInterval(interval);
            this.stateManager.setTimerInterval(null);
        }
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    GameUI.initialize();
    new CricketGame();
});