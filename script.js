"use strict";
const GAME_CONFIG = {
    PLAYERS_PER_TEAM: 10,
    BALLS_PER_PLAYER: 6,
    TIMER_DURATION: 60,
    TEAMS: 2
};
// DOM Manipulation Helper
class DOMHelper {
    static createElement(type, attributes = {}, innerHTML = '') {
        const element = document.createElement(type);
        Object.entries(attributes).forEach(([key, value]) => {
            if (value)
                element.setAttribute(key, value);
        });
        if (innerHTML)
            element.innerHTML = innerHTML;
        return element;
    }
    static getElement(id) {
        const element = document.getElementById(id);
        if (!element) {
            throw new Error(`Element with id '${id}' not found`);
        }
        return element;
    }
    static appendToParent(parentId, element) {
        const parent = this.getElement(parentId);
        parent.appendChild(element);
    }
}
class GameStateManager {
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
    getState() {
        return Object.assign({}, this.state);
    }
    updateState(updates) {
        this.state = Object.assign(Object.assign({}, this.state), updates);
    }
    resetInningsState() {
        this.updateState({
            players: 1,
            balls: 1,
            total: 0,
            teamTotal: 0
        });
    }
    nextTeam() {
        this.updateState({
            team: this.state.team + 1,
            players: 1,
            balls: 1,
            total: 0,
            teamTotal: 0
        });
    }
    setTimerInterval(interval) {
        this.state.tInterval = interval;
    }
    getTimerInterval() {
        return this.state.tInterval;
    }
}
// UI Components
class GameUI {
    static initialize() {
        // Initialize event listeners and any dynamic content
        this.initializeScoreTables();
    }
    static initializeScoreTables() {
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
    static createPlayerRow(teamNum, playerNum) {
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
    static updateCell(id, value) {
        const cell = DOMHelper.getElement(id);
        cell.innerText = value;
        cell.classList.add('highlight');
        setTimeout(() => cell.classList.remove('highlight'), 500);
    }
    static updateScore(team, score) {
        const scoreElement = DOMHelper.getElement(`score${team}`);
        scoreElement.innerText = score.toString();
        scoreElement.classList.add('highlight');
        setTimeout(() => scoreElement.classList.remove('highlight'), 500);
    }
    static updateTimer(time) {
        const timerElement = DOMHelper.getElement('timer');
        timerElement.innerText = time.toString();
        if (time <= 10) {
            timerElement.style.color = '#e74c3c';
        }
    }
    static toggleTeamButton(team, enable) {
        const button = DOMHelper.getElement(`hit${team}`);
        button.className = `hit-button${!enable ? ' disabled' : ''}`;
    }
    static showGameResult(winner, margin, mom) {
        var _a;
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
        (_a = document.querySelector('.game-container')) === null || _a === void 0 ? void 0 : _a.appendChild(resultContainer);
    }
}
// Game Logic
class CricketGame {
    constructor() {
        this.stateManager = new GameStateManager();
        this.bindEvents();
    }
    bindEvents() {
        const hitBtn = DOMHelper.getElement('hit1');
        hitBtn.addEventListener('click', () => this.handleHit());
    }
    handleHit() {
        const state = this.stateManager.getState();
        if (state.players === 1 && state.balls === 1) {
            this.startTimer();
        }
        const run = this.generateRun();
        const cellId = `${state.team}${state.players}${state.balls}`;
        this.updateScore(run, cellId);
        this.checkInningsProgress();
    }
    generateRun() {
        return Math.floor(Math.random() * 7);
    }
    updateScore(run, cellId) {
        const state = this.stateManager.getState();
        if (run === 0) {
            GameUI.updateCell(cellId, 'W');
            GameUI.updateCell(`t${state.team}${state.players}`, state.total.toString());
            this.stateManager.updateState({
                total: 0,
                players: state.players + 1,
                balls: 1
            });
        }
        else {
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
    checkInningsProgress() {
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
    switchTeam() {
        const state = this.stateManager.getState();
        this.resetTimer();
        GameUI.toggleTeamButton(state.team, false);
        if (state.team === 1) {
            this.stateManager.nextTeam();
            GameUI.toggleTeamButton(2, true);
            const hitBtn = DOMHelper.getElement('hit2');
            hitBtn.addEventListener('click', () => this.handleHit());
        }
        else {
            this.showResult();
        }
    }
    showResult() {
        const score1 = parseInt(DOMHelper.getElement('score1').innerText);
        const score2 = parseInt(DOMHelper.getElement('score2').innerText);
        const winner = score2 > score1 ? 2 : 1;
        const margin = Math.abs(score1 - score2);
        const mom = this.findPlayerOfTheMatch(winner);
        GameUI.showGameResult(winner, margin, mom);
    }
    findPlayerOfTheMatch(winner) {
        let maxScore = 0;
        let player = -1;
        for (let i = 1; i <= GAME_CONFIG.PLAYERS_PER_TEAM; i++) {
            const score = parseInt(DOMHelper.getElement(`t${winner}${i}`).innerText);
            if (score >= maxScore) {
                maxScore = score;
                player = i;
            }
        }
        return { player, score: maxScore };
    }
    startTimer() {
        const interval = window.setInterval(() => this.updateTimer(), 1000);
        this.stateManager.setTimerInterval(interval);
    }
    updateTimer() {
        const timerElement = DOMHelper.getElement('timer');
        const currentTime = parseInt(timerElement.innerText) - 1;
        GameUI.updateTimer(currentTime);
        if (currentTime === 0) {
            this.switchTeam();
        }
    }
    resetTimer() {
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
