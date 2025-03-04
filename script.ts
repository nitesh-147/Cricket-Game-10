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
        cell.innerText = value;
        cell.classList.add('highlight');
        setTimeout(() => cell.classList.remove('highlight'), 500);
    }

    static updateScore(team: number, score: number): void {
        const scoreElement = DOMHelper.getElement<HTMLElement>(`score${team}`);
        scoreElement.innerText = score.toString();
        scoreElement.classList.add('highlight');
        setTimeout(() => scoreElement.classList.remove('highlight'), 500);
    }

    static updateTimer(time: number): void {
        const timerElement = DOMHelper.getElement<HTMLElement>('timer');
        timerElement.innerText = time.toString();
        if (time <= 10) {
            timerElement.style.color = '#e74c3c';
        }
    }

    static toggleTeamButton(team: number, enable: boolean): void {
        const button = DOMHelper.getElement<HTMLButtonElement>(`hit${team}`);
        button.className = `hit-button${!enable ? ' disabled' : ''}`;
    }

    static showGameResult(winner: number, margin: number, mom: { player: number; score: number }): void {
        const resultContainer = DOMHelper.createElement('div', {
            class: 'result-container',
            id: 'result'
        });
        
        const winnerText = DOMHelper.createElement('h4', {
            class: 'mb-3'
        }, `Team ${winner} wins by ${margin} runs!`);
        
        const momText = DOMHelper.createElement('p', {
            class: 'mb-0'
        }, `Player of the Match: Player${mom.player} from Team${winner} (Score: ${mom.score})`);
        
        resultContainer.appendChild(winnerText);
        resultContainer.appendChild(momText);
        document.querySelector('.game-container')?.appendChild(resultContainer);
    }
}

// Game Logic
class CricketGame {
    private stateManager: GameStateManager;

    constructor() {
        this.stateManager = new GameStateManager();
        this.bindEvents();
    }

    private bindEvents(): void {
        const hitBtn = DOMHelper.getElement<HTMLButtonElement>('hit1');
        hitBtn.addEventListener('click', () => this.handleHit());
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
        
        if (state.players === 11) {
            this.switchTeam();
        }
    }

    private switchTeam(): void {
        const state = this.stateManager.getState();
        
        this.resetTimer();
        GameUI.toggleTeamButton(state.team, false);
        
        if (state.team === 1) {
            this.stateManager.nextTeam();
            GameUI.toggleTeamButton(2, true);
            const hitBtn = DOMHelper.getElement<HTMLButtonElement>('hit2');
            hitBtn.addEventListener('click', () => this.handleHit());
        } else {
            this.showResult();
        }
    }

    private showResult(): void {
        const score1 = parseInt(DOMHelper.getElement<HTMLElement>('score1').innerText);
        const score2 = parseInt(DOMHelper.getElement<HTMLElement>('score2').innerText);
        
        const winner = score2 > score1 ? 2 : 1;
        const margin = Math.abs(score1 - score2);
        const mom = this.findPlayerOfTheMatch(winner);
        
        GameUI.showGameResult(winner, margin, mom);
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
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    GameUI.initialize();
    new CricketGame();
});