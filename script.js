const modal = document.getElementById("modal-overlay")
const gameBoard = document.querySelector(".game-board")
const markersRemaining = document.querySelector(".remaining span")

const GameBoard = (level) => {
  let numMines, numRows, numCols
  switch(level) {
    case(100):
      numMines = 100
      numRows = 25
      numCols = 40
      break
    case(40):
      numMines = 40
      numRows = 20
      numCols = 20
      break
    case(10):
      numMines = 10
      numRows = 10
      numCols = 10
      break
    default:
      break
  }

  const numCells = numRows * numCols
  markersRemaining.textContent = numMines

  // generate mine locations
  let mineLocations = []
  while (mineLocations.length < numMines) {
    const location = Math.floor(Math.random() * numCells)
    if (!mineLocations.includes(location)) mineLocations.push(location)
  }
  mineLocations.sort((a,b) => a - b)
  
  

  const drawCells = () => {
    let cells = ""
    for(let i=0; i < numRows * numCols; i++) { cells += `<button data-index="${i}" class="cell"></button>` }
    return cells
  }

  gameBoard.innerHTML = drawCells()

  const adjacentIndices = (index) => {
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

  let revealedLocations = []
  const showCell = (currentIndex) => {
    const index = parseInt(currentIndex)
    const currentCell = document.querySelector(`[data-index="${index}"]`)
    
    if (currentCell.hasAttribute("data-revealed") || currentCell.hasAttribute("data-marked")) return
    
    currentCell.setAttribute("data-revealed", "")
    revealedLocations.push(index)

    if (mineLocations.includes(index)) {
      loseGame()
      return
    }
    else {
      const adjacent = adjacentIndices(index)
      const adjacentMines = adjacent.filter(index => mineLocations.includes(index))
      const adjacentMineCount = adjacentMines.length
      if (adjacentMineCount > 0) currentCell.textContent = adjacentMineCount
      else {adjacent.forEach(index=>showCell(index))}
    }
    checkWin()
  }
  
  let markedLocations = []
  const toggleMark = (e) => {
    const currentCell = e.target
    const currentIndex = currentCell.dataset.index
    
    if (currentCell.hasAttribute("data-revealed")) return

    if(currentCell.hasAttribute("data-marked")) {
      currentCell.removeAttribute("data-marked")
      markedLocations = markedLocations.filter(item => item !== currentIndex)
    }
    else {
      if(markedLocations.length === numMines) return
      currentCell.dataset.marked = true
      markedLocations.push(currentIndex)
      markedLocations.sort((a,b) => a-b)
    }

    markersRemaining.textContent = numMines - markedLocations.length
    checkWin()
  }

  const handleClick = (e) => {
    const currentIndex = parseInt(e.target.dataset.index)
    if (e.button === 0) showCell(currentIndex)
    if (e.button === 1) {
      e.preventDefault()
      const adjacent = adjacentIndices(currentIndex)
      adjacent.forEach(index => showCell(index))
    }
  }

  const loseGame = () => {
    showModal("lose")
    gameBoard.style.pointerEvents = "none"
    
    document.querySelectorAll(".cell").forEach(item => {
      item.dataset.revealed = true
      const currentIndex = parseInt(item.dataset.index)  
      if (mineLocations.includes(currentIndex)) {
        item.textContent = "*"
        if (!item.hasAttribute("data-marked")) item.style.backgroundColor = "var(--color-mine-light)"
      }
      else {
        const adjacent = adjacentIndices(currentIndex)
        const adjacentMineCount = adjacent.filter(index => mineLocations.includes(index)).length
        item.textContent = (adjacentMineCount > 0) ? adjacentMineCount : ""
      }
    })
  }

  const checkWin = () => {
    if (markedLocations.length < numMines) return
    if (revealedLocations.length === numCells - numMines) {
      if (revealedLocations.some(location => mineLocations.includes(location))) {
        loseGame()
        return
      }
      showModal("win")
      gameBoard.style.pointerEvents = "none"
    }
  }

  return { toggleMark, handleClick }
}

const startGame = () => {
  gameBoard.innerHTML = ""
  gameBoard.style.pointerEvents = "auto"
  let currentLevel = window.localStorage.getItem("currentLevel") || 10
  gameBoard.dataset.level = currentLevel
  const level = parseInt(currentLevel)
  const game = GameBoard(level)

  const cellButtons = document.querySelectorAll(".cell")
  cellButtons.forEach(button=> button.addEventListener("mousedown", (e) => game.handleClick(e)))
  cellButtons.forEach(button=> button.addEventListener("contextmenu", (e) => {
    e.preventDefault()
    game.toggleMark(e)
  }))
}


startGame()

// restart the game at the current level
document.getElementById("reset").addEventListener("click", () => startGame)

// change the level and restart the game
document.querySelectorAll(".level-button").forEach(levelButton => levelButton.addEventListener("click", (e) => {
  const level = parseInt(e.target.dataset.level)
  window.localStorage.setItem("currentLevel", level)
  startGame()
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
window.addEventListener("keydown", (e) => {
  if(e.key === "Escape" && modal.classList.contains("active")) modal.classList.remove("active")
})