//title container
// document.getElementsByName('body')[0].style.border="2px solid blue";
var titlecontainer = document.createElement("div");
titlecontainer.setAttribute("id", "title");
titlecontainer.setAttribute("class", "text-center mt-5");
document.body.appendChild(titlecontainer);
//title
var title = document.createElement("h3");
title.innerHTML = "CRICKET10";
document.getElementById("title").appendChild(title);
//colum container
var row = document.createElement("div");
row.setAttribute("class", "row mt-5");
row.setAttribute("id", "row");
document.body.appendChild(row);
//three column
var column1 = document.createElement("div");
column1.setAttribute("class", "col-sm-4 text-center");
column1.setAttribute("id", "column1");
document.getElementById("row").appendChild(column1);
var column2 = document.createElement("div");
column2.setAttribute("class", "col-sm-4 text-center");
column2.setAttribute("id", "column2");
document.getElementById("row").appendChild(column2);
var column3 = document.createElement("div");
column3.setAttribute("class", "col-sm-4 text-center");
column3.setAttribute("id", "column3");
document.getElementById("row").append(column3);
//column1 items
var titlescrore1 = document.createElement("h5");
titlescrore1.innerHTML = "Team Score 1";
document.getElementById("column1").appendChild(titlescrore1);
var scrore1 = document.createElement("h2");
scrore1.innerHTML = "0";
scrore1.setAttribute("id", "score1");
document.getElementById("column1").appendChild(scrore1);
var button1 = document.createElement("button");
button1.setAttribute("class", "btn btn-primary");
button1.setAttribute("id", "hit1");
// button1.setAttribute("onclick", game.displayRuns);
button1.innerHTML = "HIT 1";
document.getElementById("column1").appendChild(button1);
//column2 items
var timerTitle = document.createElement("h5");
timerTitle.innerHTML = "TIMER";
document.getElementById("column2").appendChild(timerTitle);
//clock
var timer = document.createElement("h2");
timer.innerHTML = "60";
timer.setAttribute("id", "timer");
document.getElementById("column2").appendChild(timer);
//column3 items
var titlescrore2 = document.createElement("h5");
titlescrore2.innerHTML = "Team Score 2";
document.getElementById("column3").appendChild(titlescrore2);
var scrore2 = document.createElement("h2");
scrore2.innerHTML = "0";
scrore2.setAttribute("id", "score2");
document.getElementById("column3").appendChild(scrore2);
var button2 = document.createElement("button");
button2.setAttribute("class", "btn btn-primary disabled");
button2.setAttribute("id", "hit2");
button2.innerHTML = "HIT 2";
document.getElementById("column3").appendChild(button2);
var row_table = document.createElement("div");
row_table.setAttribute("class", "row mt-5");
row_table.setAttribute("id", "row_table");
document.body.appendChild(row_table);
//three column
var table_column1 = document.createElement("div");
table_column1.setAttribute("class", "col-sm-5 text-center");
table_column1.setAttribute("id", "table_column1");
document.getElementById("row_table").appendChild(table_column1);
var table_column2 = document.createElement("div");
table_column2.setAttribute("class", "col-sm-2 text-center");
table_column2.setAttribute("id", "table_column2");
document.getElementById("row_table").appendChild(table_column2);
var table_column3 = document.createElement("div");
table_column3.setAttribute("class", "col-sm-5 text-center");
table_column3.setAttribute("id", "table_column3");
document.getElementById("row_table").append(table_column3);
//table 1
var table1 = document.createElement("table");
table1.setAttribute("class", "table table-bordered");
table1.setAttribute("id", "table1");
document.getElementById("table_column1").appendChild(table1);
// thead 1
var thead1 = document.createElement("thead");
thead1.innerHTML =
    "<tr><th>Team 1</th><th>B1</th><th>B2</th><th>B3</th><th>B4</th><th>B5</th><th>B6</th><th>Total</th></tr>";
document.getElementById("table1").appendChild(thead1);
var tbody1 = document.createElement("tbody");
document.getElementById("table1").appendChild(tbody1);
for (var i = 1; i <= 10; i++) {
    var temptr = document.createElement("tr");
    var temp_player = document.createElement("th");
    temp_player.innerHTML = "Player" + i;
    temptr.appendChild(temp_player);
    for (var j = 1; j < 7; j++) {
        var temp_td = document.createElement("td");
        var idx = "1" + i + j;
        temp_td.setAttribute("id", idx);
        temptr.appendChild(temp_td);
    }
    var tot_td = document.createElement("td");
    tot_td.setAttribute("id", "t1" + i);
    temptr.appendChild(tot_td);
    tbody1.append(temptr);
}
var table2 = document.createElement("table");
table2.setAttribute("class", "table table-bordered");
table2.setAttribute("id", "table2");
document.getElementById("table_column3").appendChild(table2);
// thead 1
var thead2 = document.createElement("thead");
thead2.innerHTML =
    "<tr><th>Team 2</th><th>B1</th><th>B2</th><th>B3</th><th>B4</th><th>B5</th><th>B6</th><th>Total</th></tr>";
document.getElementById("table2").appendChild(thead2);
var tbody2 = document.createElement("tbody");
document.getElementById("table2").appendChild(tbody2);
for (var i = 1; i <= 10; i++) {
    var temptr = document.createElement("tr");
    var temp_player = document.createElement("th");
    temp_player.innerHTML = "Player" + i;
    temptr.appendChild(temp_player);
    for (var j = 1; j < 7; j++) {
        var temp_td = document.createElement("td");
        var idx = "2" + i + j;
        temp_td.setAttribute("id", idx);
        temptr.appendChild(temp_td);
    }
    var tot_td = document.createElement("td");
    tot_td.setAttribute("id", "t2" + i);
    temptr.appendChild(tot_td);
    tbody2.append(temptr);
}
var Game = /** @class */ (function () {
    function Game() {
        var _this = this;
        //VARIABLES DECALRED FOR DISPLAYING RUNS AND FOR SUM OF THEM
        this.players = 1;
        this.balls = 1;
        this.total = 0;
        this.teamTotal = 0;
        this.team = 1;
        this.randomRunGenerator = function () {
            var run = Math.floor(Math.random() * 7);
            return run;
        };
        this.displayRuns = function () {
            //IF CONDITION FOR 1P PLAYERS
            if (_this.players === 1 && _this.balls === 1) {
                _this.startTimer();
            }
            var run = _this.randomRunGenerator();
            var current_td_id = "" + _this.team + _this.players + _this.balls;
            var current_td = document.getElementById(current_td_id);
            if (run === 0) {
                current_td.innerText = "W";
                var t_id = "t" + _this.team + _this.players;
                document.getElementById(t_id).innerText = "" + _this.total;
                _this.total = 0;
                _this.players++;
                _this.balls = 1;
            }
            else {
                _this.total += run;
                _this.teamTotal += run;
                current_td.innerText = "" + run;
                _this.balls++;
                var t_id = "t" + _this.team + _this.players;
                document.getElementById(t_id).innerText = "" + _this.total;
            }
            document.getElementById("score" + _this.team).innerText = _this.teamTotal;
            if (_this.balls == 7) {
                _this.players++;
                _this.balls = 1;
                _this.total = 0;
            }
            if (_this.players === 11) {
                _this.updateTeam();
            }
        };
        this.updateTeam = function () {
            var _a, _b;
            _this.resetTimer();
            var hitBtn = document.getElementById("hit" + _this.team);
            hitBtn.setAttribute("class", "btn btn-primary disabled");
            hitBtn === null || hitBtn === void 0 ? void 0 : hitBtn.removeEventListener("click", _this.displayRuns);
            _this.team = _this.team + 1;
            if (_this.team === 2) {
                (_a = document.getElementById("hit" + _this.team)) === null || _a === void 0 ? void 0 : _a.setAttribute("class", "btn btn-primary");
                (_b = document.getElementById("hit" + _this.team)) === null || _b === void 0 ? void 0 : _b.addEventListener("click", _this.displayRuns);
            }
            else {
                _this.showGenerateResultButton();
            }
            _this.players = 1;
            _this.balls = 1;
            _this.total = 0;
            _this.teamTotal = 0;
        };
        this.showGenerateResultButton = function () {
            var gen_res = document.createElement('button');
            gen_res.innerHTML = "Generate Result";
            gen_res.setAttribute("id", "generate_result");
            gen_res.setAttribute("class", "btn btn-primary");
            gen_res.addEventListener("click", _this.displayResult);
            table_column2.appendChild(gen_res);
            var p_win = document.createElement('h4');
            p_win.setAttribute("id", "winner");
            table_column2.appendChild(p_win);
            var p_mom = document.createElement('p');
            p_mom.setAttribute("id", "mom");
            table_column2.appendChild(p_mom);
        };
        this.displayResult = function () {
            var x = parseInt(document.getElementById('score1').innerText);
            var y = parseInt(document.getElementById('score2').innerText);
            var winner = 1;
            var margin = Math.abs(x - y);
            if (y > x) {
                winner = 2;
            }
            var message = "Team ".concat(winner, " wins by ").concat(margin, " runs");
            document.getElementById('winner').innerText = message;
            var max_score = 0;
            var player = -1;
            for (var i = 1; i <= 10; i++) {
                var temp = parseInt(document.getElementById('t' + winner + i).innerText);
                if (temp >= max_score) {
                    max_score = temp;
                    player = i;
                }
            }
            var mom_message = "Player of the Match: Player".concat(player, " from Team").concat(winner, " Score:").concat(max_score);
            document.getElementById('mom').innerText = mom_message;
        };
        this.startTimer = function () {
            _this.tInterval = setInterval(_this.displayTime, 1000);
        };
        this.displayTime = function () {
            var x = document.getElementById('timer');
            var y = parseInt(x.innerHTML);
            y--;
            x.innerText = "" + y;
            if (y === 0) {
                _this.updateTeam();
            }
        };
        this.resetTimer = function () {
            var x = document.getElementById('timer');
            x.innerHTML = "60";
            clearInterval(_this.tInterval);
        };
    }
    return Game;
}());
var game = new Game();
document.getElementById('hit1').addEventListener("click", game.displayRuns);
