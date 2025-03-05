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
    TIMER_DURATION: 20,
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
    wickets: number;
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
            tInterval: null,
            wickets: 0
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
            teamTotal: 0,
            wickets: 0
        });
    }

    nextTeam(): void {
        this.updateState({
            team: this.state.team + 1,
            players: 1,
            balls: 1,
            total: 0,
            teamTotal: 0,
            wickets: 0
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
        // Initialize timer with config value
        this.updateTimer(GAME_CONFIG.TIMER_DURATION);
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

    static updateScore(team: number, score: number, wickets: number): void {
        const scoreElement = DOMHelper.getElement<HTMLElement>(`score${team}`);
        scoreElement.textContent = `${score.toString().replace(/\./g, '')}/${wickets}`;
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
        button.disabled = !enable;
    }

    static showGameResult(winner: number, resultText: string, mom: { player: number; score: number }): void {
        // Remove any existing result container
        const existingResult = document.getElementById('result');
        if (existingResult) {
            existingResult.remove();
        }

        const resultContainer = DOMHelper.createElement('div', {
            class: 'result-container',
            id: 'result'
        });

        const winnerText = DOMHelper.createElement('h4', {
            class: 'mb-3'
        }, resultText);

        const momText = DOMHelper.createElement('p', {
            class: 'mb-3'
        }, `Player of the Match: Player${mom.player} from Team${winner} (Score: ${mom.score})`);

        const restartButton = DOMHelper.createElement('button', {
            class: 'hit-button',
            id: 'restart-btn'
        }, 'Restart Game');

        resultContainer.appendChild(winnerText);
        resultContainer.appendChild(momText);
        resultContainer.appendChild(restartButton);

        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
            gameContainer.appendChild(resultContainer);

            // Enhanced smooth scrolling with better timing and positioning
            setTimeout(() => {
                // Calculate the result container's position relative to the viewport
                const rect = resultContainer.getBoundingClientRect();
                const absoluteTop = window.pageYOffset + rect.top;
                const offset = 50; // Add some padding from the top

                window.scrollTo({
                    top: absoluteTop - offset,
                    behavior: 'smooth'
                });
            }, 200); // Increased delay to ensure DOM is fully rendered
        }

        // Add event listener to restart button
        restartButton.addEventListener('click', () => {
            CricketGame.getInstance()?.restartGame();
        });
    }

    static resetUI(): void {
        // Reset score displays
        this.updateScore(1, 0, 0);
        this.updateScore(2, 0, 0);

        // Reset timer
        this.updateTimer(GAME_CONFIG.TIMER_DURATION);
        DOMHelper.getElement<HTMLElement>('timer').style.color = '';

        // Reset buttons
        this.toggleTeamButton(1, true);
        this.toggleTeamButton(2, false);

        // Clear all cells
        for (let team = 1; team <= 2; team++) {
            for (let player = 1; player <= GAME_CONFIG.PLAYERS_PER_TEAM; player++) {
                // Clear player total
                this.updateCell(`t${team}${player}`, '');
                // Clear each ball
                for (let ball = 1; ball <= GAME_CONFIG.BALLS_PER_PLAYER; ball++) {
                    this.updateCell(`${team}${player}${ball}`, '');
                }
            }
        }

        // Remove result container if exists
        const resultContainer = document.getElementById('result');
        if (resultContainer) {
            resultContainer.remove();
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

        hitBtn1.addEventListener('click', () => {
            if (!hitBtn1.classList.contains('disabled')) {
                this.handleHit();
            }
        });
        hitBtn2.addEventListener('click', () => {
            if (!hitBtn2.classList.contains('disabled')) {
                this.handleHit();
            }
        });
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

            // Update state with new wicket
            const newWickets = state.wickets + 1;
            this.stateManager.updateState({
                total: 0,
                players: state.players + 1,
                balls: 1,
                wickets: newWickets
            });

            // Update score display with wickets
            GameUI.updateScore(state.team, state.teamTotal, newWickets);

            // Check if all players of team 2 are out or last player finished
            if (state.team === 2 &&
                (state.players >= GAME_CONFIG.PLAYERS_PER_TEAM ||
                    (state.players === GAME_CONFIG.PLAYERS_PER_TEAM && state.balls >= GAME_CONFIG.BALLS_PER_PLAYER))) {
                this.showResult();
                return;
            }
        } else {
            const newTotal = state.total + run;
            const newTeamTotal = state.teamTotal + run;

            GameUI.updateCell(cellId, run.toString());
            GameUI.updateCell(`t${state.team}${state.players}`, newTotal.toString());
            GameUI.updateScore(state.team, newTeamTotal, state.wickets);

            this.stateManager.updateState({
                total: newTotal,
                teamTotal: newTeamTotal,
                balls: state.balls + 1
            });

            // Check if player has completed their 6 balls
            if (state.balls === GAME_CONFIG.BALLS_PER_PLAYER) {
                // Move to next player and count wicket
                const newWickets = state.wickets + 1;
                this.stateManager.updateState({
                    players: state.players + 1,
                    balls: 1,
                    total: 0,
                    wickets: newWickets
                });
                // Update score display with new wicket count
                GameUI.updateScore(state.team, newTeamTotal, newWickets);
            }

            // Check if team 2 has won by exceeding team 1's score
            if (state.team === 2) {
                const score1 = parseInt(DOMHelper.getElement<HTMLElement>('score1').textContent?.split('/')[0] || '0');
                if (newTeamTotal > score1) {
                    this.showResult();
                    return;
                }
            }
        }
    }

    private checkInningsProgress(): void {
        const state = this.stateManager.getState();

        // Check if current player has completed their balls
        if (state.balls === 7) {
            // Move to next player without counting wicket (wicket already counted in updateScore)
            this.stateManager.updateState({
                players: state.players + 1,
                balls: 1,
                total: 0
            });
        }

        // Check if team 1's innings is complete (all players done or last player finished balls)
        if (state.team === 1 &&
            (state.players > GAME_CONFIG.PLAYERS_PER_TEAM ||
                (state.players === GAME_CONFIG.PLAYERS_PER_TEAM && state.balls > GAME_CONFIG.BALLS_PER_PLAYER))) {
            GameUI.toggleTeamButton(1, false);
            this.switchTeam();
            return;
        }

        // Check if team 2's innings is complete (all players done or last player finished balls)
        if (state.team === 2 &&
            (state.players > GAME_CONFIG.PLAYERS_PER_TEAM ||
                (state.players === GAME_CONFIG.PLAYERS_PER_TEAM && state.balls > GAME_CONFIG.BALLS_PER_PLAYER))) {
            this.showResult();
            return;
        }

        // Check if team 2 has won by exceeding team 1's score
        if (state.team === 2) {
            const score1 = parseInt(DOMHelper.getElement<HTMLElement>('score1').textContent?.split('/')[0] || '0');
            if (state.teamTotal > score1) {
                this.showResult();
                return;
            }
        }
    }

    private switchTeam(): void {
        const state = this.stateManager.getState();

        this.resetTimer();
        GameUI.toggleTeamButton(state.team, false);

        if (state.team === 1) {
            this.stateManager.nextTeam();
            GameUI.toggleTeamButton(1, false);
            GameUI.toggleTeamButton(2, true);
            // Don't clear timer for team 2, let it start when they begin
        } else if (!this.gameEnded) {
            this.showResult();
        }
    }

    private showResult(): void {
        if (this.gameEnded) return;

        this.gameEnded = true;
        this.clearTimer();  // Clear any existing timer

        const score1 = parseInt(DOMHelper.getElement<HTMLElement>('score1').textContent?.split('/')[0] || '0');
        const score2 = parseInt(DOMHelper.getElement<HTMLElement>('score2').textContent?.split('/')[0] || '0');

        const winner = score2 > score1 ? 2 : 1;
        const margin = Math.abs(score1 - score2);
        const mom = this.findPlayerOfTheMatch(winner);

        let resultText = '';
        if (winner === 1) {
            resultText = `Team ${winner} wins by ${margin} runs!`;
        } else {
            const state = this.stateManager.getState();
            const remainingWickets = GAME_CONFIG.PLAYERS_PER_TEAM - state.wickets;
            resultText = `Team ${winner} wins by ${remainingWickets} wickets!`;
        }

        // Ensure both buttons are disabled
        GameUI.toggleTeamButton(1, false);
        GameUI.toggleTeamButton(2, false);

        // Add a small delay to ensure DOM updates are complete
        setTimeout(() => {
            GameUI.showGameResult(winner, resultText, mom);
        }, 100);
    }

    private findPlayerOfTheMatch(winner: number): { player: number; score: number } {
        let maxScore = 0;
        let player = -1;

        for (let i = 1; i <= GAME_CONFIG.PLAYERS_PER_TEAM; i++) {
            const score = parseInt(DOMHelper.getElement<HTMLElement>(`t${winner}${i}`).textContent || '0');
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

    restartGame(): void {
        // Reset game state
        this.gameEnded = false;
        this.clearTimer();

        // Reset state manager
        this.stateManager = new GameStateManager();

        // Reset UI
        GameUI.resetUI();
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    GameUI.initialize();
    new CricketGame();
});