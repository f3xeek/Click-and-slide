window.onload = function() {
    const game = {
        images: ["mc.jpg", "sally.jpg", "zlomek.jpg"],
        imageId: 0,
        imageStartedId: 0,
        dimensions: 300,
        mode: 0,
        board: [],
        remaining: 0,
        pos0: 0,
        start_time: 0,
        shuffle_int: null,
        running: false
    };

    function hidePopupAndResume(popupId) {
        document.getElementById(popupId).style.display = "none";
        game.running = true;
        game.start_time = new Date().getTime() - game.start_time;
        game.interval_timer = setInterval(updateTimer, 6);
    }

    function clearAndPopulateTable(popupTableId, isSave) {
        const table = document.getElementById(popupTableId);
        table.querySelectorAll("tr").forEach((row, index) => {
            if (index > 0) row.remove();
        });

        for (let i = 1; i <= 3; i++) {
            const state = JSON.parse(window.localStorage.getItem(`board${i}`));
            const row = document.createElement("tr");
            const Lp = document.createElement("td");
            Lp.innerText = i;

            if (isSave) {
                const button = createSaveButton(i);
                const nameInput = createNameInput(state, i);

                row.append(Lp, nameInput, button);
            } else {
                const button = createLoadButton(state);
                const name = createCell(state?.name || "NoName");
                const mode = createCell(state ? `${state.mode}x${state.mode}` : "Null");
                const time = createCell(state ? ms2time(state.start_time) : "Null");
                const date = createCell(state ? ms2date(state.date) : "Null");

                row.append(Lp, name, time, date, mode, button);
            }

            table.append(row);
        }
    }

    function createSaveButton(index) {
        const button = document.createElement("button");
        button.innerText = "Save";
        button.addEventListener("click", () => {
            hidePopupAndResume("popupSave");
            window.localStorage.setItem(`board${index}`, JSON.stringify({
                name: document.getElementById(`saveInput${index}`).value || "Insert your name here",
                board: game.board,
                imageStartedId: game.imageStartedId,
                mode: game.mode,
                pos0: game.pos0,
                date: new Date().getTime(),
                start_time: new Date().getTime() - game.start_time
            }));
        });
        const cell = document.createElement("td");
        cell.append(button);
        return cell;
    }

    function createLoadButton(state) {
        const button = document.createElement("button");
        button.innerText = "Load";
        button.addEventListener("click", () => {
            document.getElementById("popupLoad").style.display = "none";
            document.getElementById("saveButton").removeAttribute("disabled")
            start_game();
            Object.assign(game, {
                board: state.board,
                imageStartedId: state.imageStartedId,
                mode: state.mode,
                pos0: state.pos0,
                start_time: new Date().getTime() - state.start_time,
                running: true
            });
            draw();
        });
        const cell = document.createElement("td");
        cell.append(button);
        return cell;
    }

    function createNameInput(state, index) {
        const nameInput = document.createElement("input");
        nameInput.value = state ? state.name : "Insert your name here";
        nameInput.id = `saveInput${index}`;
        const cell = document.createElement("td");
        cell.append(nameInput);
        return cell;
    }

    function createCell(content) {
        const cell = document.createElement("td");
        cell.innerText = content;
        return cell;
    }

    document.getElementById("popupLoadButton").addEventListener("click", () => hidePopupAndResume("popupLoad"));
    document.getElementById("popupSaveButton").addEventListener("click", () => hidePopupAndResume("popupSave"));

    document.getElementById("saveButton").addEventListener("click", () => {
        game.running = false;
        const time = ms2time(new Date().getTime() - game.start_time);
        updateTimer(time);
        game.start_time = new Date().getTime() - game.start_time
        clearInterval(game.interval_timer);
        clearAndPopulateTable("popupSaveTable", true);
        document.getElementById("popupSave").style.display = "flex";
    });

    document.getElementById("loadButton").addEventListener("click", () => {
        game.running = false;
        const time = ms2time(new Date().getTime() - game.start_time);
        updateTimer(time);
        game.start_time = new Date().getTime() - game.start_time
        clearInterval(game.interval_timer);
        clearAndPopulateTable("popupLoadTable", false);
        document.getElementById("popupLoad").style.display = "flex";
    });

    document.getElementById("imageScroll").scrollTo(game.dimensions, 0);


    function scrollImage(direction) {
        let i = 0;
        const scrollInterval = setInterval(() => {
            if (i >= 30) {
                clearInterval(scrollInterval);
                game.imageId = (game.imageId + direction + game.images.length) % game.images.length;
                document.getElementById("imageScroll").scrollTo((game.imageId+1) * game.dimensions, 0);
            } else {
                document.getElementById("imageScroll").scrollBy(direction * game.dimensions / 30, 0);
                i++;
            }
        }, 10);
    }

    document.getElementById("arrowLeft").addEventListener("click", () => scrollImage(-1));
    document.getElementById("arrowRight").addEventListener("click", () => scrollImage(1));

    function checkWin() {
        return game.board.every((row, y) =>
            row.every((tile, x) =>
                tile === 0 || tile.id === y * game.mode + x
            )
        );
    }

    function draw() {
        let table = document.getElementById("tabela")
        table.innerHTML = ''
        for (let y = 0; y < game.mode; y++) {
            let row = document.createElement("tr")
            for (let x = 0; x < game.mode; x++) {
                let td = document.createElement("td")
                if (game.board[y][x] === 0) {
                    td.classList.add("empty")
                } else {
                    td.classList.add('tile')
                    td.style.backgroundImage = `url(${game.images[game.imageStartedId]})`
                    td.style.backgroundPositionX = game.board[y][x].x_cord + "px"
                    td.style.backgroundPositionY = game.board[y][x].y_cord + "px"
                }
                td.id = y * game.mode + x
                td.style.width = game.dimensions / game.mode + "px"
                td.style.height = game.dimensions / game.mode + "px"
                td.addEventListener("click", function klik() {
                    if (game.running){
                    let direcitons = [[0, -1], [-1, 0], [1, 0], [0, 1]]
                    direcitons.forEach(direction => {
                        if (game.board[Math.floor(this.id / game.mode) + direction[0]]?.[this.id % game.mode + direction[1]] === 0) {
                            game.board[Math.floor(this.id / game.mode) + direction[0]][this.id % game.mode + direction[1]] = game.board[Math.floor(this.id / game.mode)][this.id % game.mode]
                            game.board[Math.floor(this.id / game.mode)][this.id % game.mode] = 0
                            draw()
                        }
                    })
                    if (checkWin()) {
                        game.running= false
                        let time = ms2time(new Date().getTime() -game.start_time)
                        updateTimer(time)
                        clearInterval(game.interval_timer)
                        document.getElementById("popupWin").style.display = "block"
                        document.getElementById("popupTimer").innerText = `Twój czas to: ${time}`
                        document.getElementById("popupButton").addEventListener("click", ()=>{
                            document.getElementById("popupWin").style.display = "none"
                        })
                    }
            }})
                row.append(td)
            }
            table.append(row)
        }
        document.getElementById("App").append(table)
    }

    function prepare_board(n) {
        game.mode = n
        game.board = []
        game.imageStartedId = game.imageId
        for (let y = 0; y < n; y++) {
            let row = []
            for (let x = 0; x < n; x++) {
                if (x === n - 1 && y === n - 1) { row.push(0); continue }
                row.push({ id: y * n + x, x_cord: -x * game.dimensions / n, y_cord: -y * game.dimensions / n })
            }
            game.board.push(row)
        }
        draw()
        game.pos0 = (game.mode ** 2) - 1
        game.remaining = game.mode * 50
        if (game.shuffle_int) clearInterval(game.shuffle_int)
        game.shuffle_int = setInterval(shuffle, 5)
    }

    function updateTimer(time = ms2time(new Date().getTime() - game.start_time)) {
        for (let i = 0; i < time.length; i++) {
            if ((i + 1) % 3 == 0 && i < 7) continue
            else if (i == 8) continue
            else {
                let elem = document.getElementById(`c${i}`)
                if (elem) elem.setAttribute("src", `cyferki/c${time[i]}.gif`)
            }
        }
    }

    function start_game() {
        const timer_html = document.getElementById("timer")
        timer_html.innerHTML = ''
        for (let i = 0; i < 12; i++) {
            let digit = document.createElement("img")
            digit.id = "c" + i
            if ((i + 1) % 3 == 0 && i < 7) { digit.setAttribute("src", "cyferki/colon.gif") }
            else if (i == 8) { digit.setAttribute("src", "cyferki/dot.gif") }
            else digit.setAttribute("src", "cyferki/c0.gif")
            timer_html.append(digit)
        }
        game.start_time = new Date().getTime()
        if (game.interval_timer){
            clearInterval(game.interval_timer)
        }
        game.interval_timer = setInterval(updateTimer, 6)

    }

    function ms2time(time) {
        var pad = function (num, size) { return ('000' + num).slice(size * -1); },
            hours = Math.floor(time / 60 / 60 / 1000),
            minutes = Math.floor(time / 60 / 1000) % 60,
            seconds = Math.floor(time / 1000 - minutes * 60),
            milliseconds = String(time).slice(-3);

        return pad(hours, 2) + ':' + pad(minutes, 2) + ':' + pad(seconds, 2) + '.' + pad(milliseconds, 3);
    }

    function ms2date(time) {
        data = new Date(time)
        return String(data.getDate()).padStart(2,"0")+'.'+String(data.getMonth()).padStart(2,"0")+'.'+String(data.getFullYear()).padStart(2,"0")
    }

    function shuffle() {
        pos0 = game.pos0
        const direcitons = [[0, -1], [-1, 0], [1, 0], [0, 1]]
        let direction = direcitons[Math.floor(Math.random() * 4)]

        if (game.board[Math.floor(pos0 / game.mode) + direction[0]]?.[pos0 % game.mode + direction[1]]) {
            game.board[Math.floor(pos0 / game.mode)][pos0 % game.mode] = game.board[Math.floor(pos0 / game.mode) + direction[0]][pos0 % game.mode + direction[1]]
            game.board[Math.floor(pos0 / game.mode) + direction[0]][pos0 % game.mode + direction[1]] = 0
            game.remaining -= 1
            game.pos0 = pos0 + direction[0] * game.mode + direction[1]
            draw()
        }
        if (game.remaining < 0) {
            clearInterval(game.shuffle_int)
            game.shuffle_int = null
            start_game()
            document.getElementById("saveButton").removeAttribute("disabled")
            document.getElementById("loadButton").removeAttribute("disabled")
        }

    }

    for (let i = 3; i < 7; i++) {
        document.getElementById("b" + i).addEventListener("click", () => {
            document.getElementById("saveButton").setAttribute("disabled", "disabled")
            document.getElementById("loadButton").setAttribute("disabled", "disabled")
            prepare_board(i);
            game.running = true;
        });
    }
};
