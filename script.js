const modal = document.getElementById("modal-overlay")

const GameBoard = (numMines = 10, numRows = 10, numCols = 10) => {
  
  const numCells = numRows * numCols
  let mineLocations = []
  while (mineLocations.length < numMines) {
    const location = Math.floor(Math.random() * numCells)
    if (!mineLocations.includes(location)) mineLocations.push(location)
  }
  mineLocations.sort((a,b) => a - b)

  const adjacentCellIndices = (index) => {
    const row = Math.floor(index/numCols)
    const col = index % numCols
    let isAdjacent = []
    
    // nw, ne, sw, se
    if (col !== 0 && row !== 0) isAdjacent.push(index - numCols - 1)
    if (col !== numCols - 1 && row !== 0) isAdjacent.push(index - numCols + 1)
    if (col !== 0 && row !== numRows - 1) isAdjacent.push(index + numCols - 1)
    if (col !== numCols - 1 && row !== numRows - 1) isAdjacent.push(index + numCols + 1)
  
    // n, s, w, e
    if (row !== 0) isAdjacent.push(index - numCols)
    if (row !== numRows - 1) isAdjacent.push(index + numCols)
    if (col !== 0) isAdjacent.push(index - 1)
    if (col !== numCols - 1) isAdjacent.push(index + 1)
  
    return isAdjacent.sort((a, b) => a - b)
  }

  let cells = []
  for(let i=0; i< numCells; i++) {
    const newCell = {
      "index": i, 
      "row": Math.floor(i/numCols), 
      "col": i % numCols, 
      "hasMine": mineLocations.includes(i),
      "adjacent": adjacentCellIndices(i),
      "revealed": false,
      "flagged": false
    }
    cells.push(newCell)
    cells.forEach(cell => {
      cell.adjacentMineCount = cell.adjacent.filter(item => mineLocations.includes(item)).length
    })
  }
  
  const drawCells = () => {
    cells.forEach(cell => gameBoard.innerHTML += `<button class="cell" data-index="${cell.index}"></button>`)
  }

  let flaggedLocations = []
  document.querySelector(".remaining span").textContent = numMines - flaggedLocations.length
  
  const toggleFlag = (currentIndex) => {
    const cell = cells[currentIndex]
    if (cell.revealed) return
    
    const cellButton = document.querySelector(`.cell[data-index="${currentIndex}"]`)
    if (cell.flagged) {
      cellButton.classList.remove("flagged")
      flaggedLocations.splice(flaggedLocations.indexOf(currentIndex),1)
      cell.flagged = !cell.flagged
    }
    else {
      if(flaggedLocations.length === numMines) return
      cellButton.classList.add("flagged")
      flaggedLocations.push(currentIndex)
      flaggedLocations.sort((a,b) => a-b)
      cell.flagged = !cell.flagged
    }

    document.querySelector(".remaining span").textContent = numMines - flaggedLocations.length
    checkWin()
    // console.log(flaggedLocations)
  }

  let revealedLocations = []
  const showContent = (currentIndex) => {
    const cell = cells[currentIndex]
    
    // cell already revealed, or cell was flagged -> do nothing
    if (cell.revealed || cell.flagged) return
    
    cell.revealed = true
    revealedLocations.push(currentIndex)
    
    const cellButton = document.querySelector(`.cell[data-index="${currentIndex}"]`)
    cellButton.classList.add("revealed")

    // cell has a mine -> lose game
    if (cell.hasMine) {
      cellButton.textContent = "*"
      cellButton.style.backgroundColor = "pink"
      loseGame()
    }

    else if (cell.adjacentMineCount > 0) cellButton.textContent = cell.adjacentMineCount
    else {cell.adjacent.forEach(adj => showContent(adj))}

    checkWin()
  }

  const loseGame = () => {
    showModal("lose")
    gameBoard.style.pointerEvents = "none"

    document.querySelectorAll(".cell").forEach(item => {
      const currentCell = cells[item.dataset.index]
      currentCell.revealed = true
      item.classList.add("revealed")
      if (currentCell.hasMine) {
        item.textContent = "*"
        if (!currentCell.flagged) item.style.backgroundColor = "var(--color-mine-light)"
      }
      else item.textContent = (currentCell.adjacentMineCount > 0) ? currentCell.adjacentMineCount : ""
    })
  }

  const checkWin = () => {
    if (revealedLocations.length + flaggedLocations.length === numCells) {
      showModal("win")
      gameBoard.style.pointerEvents = "none"
    }
  }

  return {
    mines: numMines,
    rows: numRows,
    cols: numCols,
    get numCells() {return this.rows * this.cols},
    get mineLocations() {return mineLocations},
    get cells() {return cells},
    get drawCells() {return drawCells()},
    toggleFlag: function(i) {return toggleFlag(i)},
    showContent: function(i) {return showContent(i)}
  }
}

const startGame = (numMines = 10, numRows = 10, numCols = 10) => {
 
  

  const gameBoard = document.getElementById("gameBoard")
  gameBoard.innerHTML = ""
  gameBoard.dataset.level = numMines
  gameBoard.style.pointerEvents = "auto"
  
  const game = GameBoard(numMines, numRows, numCols)
  game.drawCells


  // add event listeners to the gameboard
  document.querySelectorAll(".cell").forEach(button => {
    button.addEventListener("contextmenu", (e) => {
      e.preventDefault()
      game.toggleFlag(e.target.dataset.index)
    })
    button.addEventListener("mousedown", (e) => {
      const currentIndex = e.target.dataset.index
      if(e.button === 0) game.showContent(currentIndex)
      if(e.button === 1) {
        e.preventDefault()
        game.cells[currentIndex].adjacent.forEach(index=> game.showContent(index))
        if (!e.target.classList.contains("revealed")) game.showContent(currentIndex)
      }

    })

      // debug mode
      button.addEventListener("mouseover", (e) => { if (game.cells[e.target.dataset.index].hasMine) debug.style.backgroundColor = "var(--color-mine)"})
      button.addEventListener("mouseout", () => { debug.style.backgroundColor = "var(--color-light)"})
  })
}

startGame()

// restart the game at the current level
document.getElementById("reset").addEventListener("click", () => {
  if (gameBoard.dataset.level === "100") startGame(100,25,40)
  else if (gameBoard.dataset.level === "40") startGame(40,20,20)
  else startGame()
})

// change the level and restart the game
document.querySelectorAll(".level-button").forEach(levelButton => levelButton.addEventListener("click", () => {
  if(levelButton.dataset.level === "100") startGame(100,25,40)
  else if(levelButton.dataset.level === "40") startGame(40,20,20)
  else startGame()
}))


const showModal = (message) => {
  const messages = {
    "win": `<h2>You Win!</h2><h3>Congratulations! Play again?</h3>`,
    "lose": `<h2>You Lose!</h2><h3>Sorry. Play again?</h3>`,
    "info": `<h2>How to Play</h2>
             <p>Left-click to reveal the number of mines adjacent to the square. Right-click to mark a mine. Middle-click to reveal adjacent squares.</p>
             <p>If you reveal a mine, the game is over.</p>
             <p>Change the number of mines, and the grid size, by clicking the buttons below the grid. To restart, click the reset button.</p>
             <p>Good luck!</p>
             `,
    "loading": `<h2>Loading...</h2>`
  }
  document.querySelector(".modal-message").innerHTML = messages[message]
  modal.classList.add("active")
}
document.querySelector(".info-button").addEventListener("click", () => showModal("info"))
document.querySelector(".close-button").addEventListener("click", () => modal.classList.remove("active"))

