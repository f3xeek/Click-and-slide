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
        shuffle_int: null,
        running:false
    }

    document.getElementById("imageScroll").scrollTo(game.dimensions, 0)
    const arrowRight = document.getElementById("arrowRight")
    const arrowLeft = document.getElementById("arrowLeft")
    const mainImg = document.getElementById("mainImg")
    arrowLeft.addEventListener("click", () => {
        let i = 0
        let scrollInterval = setInterval(()=>{
            if (i>=30){
                clearInterval(scrollInterval)
                if (game.imageId === 0){
                game.imageId= game.images.length-1
                document.getElementById("imageScroll").scrollTo(game.dimensions*game.images.length,0)
                }else{
                    game.imageId--
            } 
            }else{
            document.getElementById("imageScroll").scrollBy(-game.dimensions/30, 0)
            i++}
        },10)
               
    })
    arrowRight.addEventListener("click", () => {
        let i = 0;
        let scrollInterval = setInterval(() => {
            if (i >= 30) {
                clearInterval(scrollInterval);
                if (game.imageId === game.images.length - 1) {
                    game.imageId = 0;
                    document.getElementById("imageScroll").scrollTo(game.dimensions, 0);
                } else {
                    game.imageId++;
                }
            } else {
                document.getElementById("imageScroll").scrollBy(game.dimensions / 30, 0);
                i++;
            }
        }, 10);
    });

    function checkWin() {
        return game.board.every((arr, arrIndex) => {
            return arr.every((tile, tileIndex) => {
                if (arrIndex * game.mode + tileIndex === game.mode ** 2 - 1) {
                    return true
                }
                if (tile.id === arrIndex * game.mode + tileIndex) {
                    return true
                }
                return false
            })
        })
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
                        document.getElementById("popup").style.display = "block"
                        document.getElementById("popupTimer").innerText = `Twój czas to: ${time}`
                        document.getElementById("popupButton").addEventListener("click", ()=>{
                            document.getElementById("popup").style.display = "none"
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
                elem.setAttribute("src", `cyferki/c${time[i]}.gif`)
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
        }

    }
    for (let i = 3; i < 7; i++) {
        let btn = document.getElementById("b" + i)
        btn.addEventListener("click", () => { 
            prepare_board(i)
            game.running = true
        })
    }
}