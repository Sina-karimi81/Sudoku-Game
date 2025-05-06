document.addEventListener('DOMContentLoaded', () => {
    // Reference to the grid and cells
    const grid = document.getElementById('sudoku-grid');
    const cells = document.querySelectorAll('.cell');
    const numberPopup = document.getElementById('number-popup');
    const numberCells = document.querySelectorAll('.number-cell');
    const messageContainer = document.getElementById('message-container');

    // Example of initial game state (you can modify this)
    // 0 represents empty cells
    const initialBoard = [
        [5, 3, 0, 0, 7, 0, 0, 0, 0],
        [6, 0, 0, 1, 9, 5, 0, 0, 0],
        [0, 9, 8, 0, 0, 0, 0, 6, 0],
        [8, 0, 0, 0, 6, 0, 0, 0, 3],
        [4, 0, 0, 8, 0, 3, 0, 0, 1],
        [7, 0, 0, 0, 2, 0, 0, 0, 6],
        [0, 6, 0, 0, 0, 0, 2, 8, 0],
        [0, 0, 0, 4, 1, 9, 0, 0, 5],
        [0, 0, 0, 0, 8, 0, 0, 7, 9]
    ];

    // Initialize the game board with the initial state
    function initializeBoard() {
        for (let cell of cells) {
            let row = cell.getAttribute("data-row")
            let column = cell.getAttribute("data-col")
            let numberElement = initialBoard[Number(row)][Number(column)]
            if (numberElement !== 0) {
                cell.innerText = numberElement
                cell.classList.add('prefilled')
            }

            cell.addEventListener('click', handleCellClick)
        }

        numberCells.forEach(c => c.addEventListener('click', handleNumberSelection))
    }

    // Handle cell click events
    function handleCellClick(event) {
        let cell = event.target;

        if (cell.classList.contains('prefilled') || cell.classList.contains('completed')) {
            return;
        }

        document.querySelectorAll('.cell.selected').forEach(selectedCell => {
            selectedCell.classList.remove('selected');
        });

        cell.classList.add("selected")

        const cellRect = cell.getBoundingClientRect();
        const gridRect = grid.getBoundingClientRect();

        const popupLeft = cellRect.right - gridRect.left
        const popupTop = cellRect.bottom - gridRect.top

        numberPopup.style.left = popupLeft + 'px'
        numberPopup.style.top = popupTop + 'px'
        numberPopup.style.transform = 'translate(0, 0)'

        numberPopup.style.display = 'block';

        // Store the cell reference for later use when a number is selected
        currentSelectedCell = cell;
    }

    // Handle number selection
    function handleNumberSelection(event) {
        let selectedNumberCell = event.target;

        if (selectedNumberCell.innerText === 'X') {
            if (currentSelectedCell.classList.contains('success')) {
                currentSelectedCell.classList.remove('success')
            }
            removeErrors(currentSelectedCell)
        } else if (selectedNumberCell.innerText === 'exit') {
            currentSelectedCell.classList.remove('selected')
            numberPopup.style.display = 'none';
        } else {
            removeErrors(currentSelectedCell)

            currentSelectedCell.innerText = selectedNumberCell.innerText
            let hasViolation = checkViolations(currentSelectedCell)
            if (!hasViolation) {
                checkCompletion()
            }
        }

        numberPopup.style.display = 'none';
    }

    // Check for violations in the current board state
    function checkViolations(selectedCell) {
        let hasError = false;
        // Get the value of the current cell
        const val = Number(selectedCell.innerText);

        // Skip checking if the cell is empty or not a valid number
        if (isNaN(val) || val < 1 || val > 9) {
            return;
        }

        const row = Number(selectedCell.getAttribute("data-row"));
        const column = Number(selectedCell.getAttribute("data-col"));

        // Check entire row
        for (let i = 0; i < 9; i++) {
            if (i !== column) { // Skip checking against itself
                const cellToCheck = getCellByRowAndCol(row, i)
                if (cellToCheck.innerText === val.toString()) {
                    hasError = true;
                    if (cellToCheck.classList.contains('success')) {
                        cellToCheck.classList.remove('success')
                    }
                    cellToCheck.classList.add('error');
                }
            }
        }

        // Check entire column
        for (let i = 0; i < 9; i++) {
            if (i !== row) { // Skip checking against itself
                const cellToCheck = getCellByRowAndCol(i, column)
                if (cellToCheck.innerText === val.toString()) {
                    hasError = true;
                    if (cellToCheck.classList.contains('success')) {
                        cellToCheck.classList.remove('success')
                    }
                    cellToCheck.classList.add('error');
                }
            }
        }

        // Check the 3×3 subgrid
        // First, determine the top-left position of the 3×3 subgrid containing the current cell
        const subgridRow = Math.floor(row / 3) * 3;
        const subgridCol = Math.floor(column / 3) * 3;

        // Check all cells in the 3×3 subgrid
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                const checkRow = subgridRow + r;
                const checkCol = subgridCol + c;

                // Skip checking against itself
                if (checkRow === row && checkCol === column) continue;

                const cellToCheck = document.querySelector(`.cell[data-row="${checkRow}"][data-col="${checkCol}"]`);
                if (cellToCheck.innerText === val.toString()) {
                    hasError = true;
                    if (cellToCheck.classList.contains('success')) {
                        cellToCheck.classList.remove('success')
                    }
                    cellToCheck.classList.add('error');
                }
            }
        }

        if (hasError) {
            selectedCell.classList.add('error');
        } else {
            selectedCell.classList.remove('error');
        }

        // Update message display
        if (hasError) {
            messageContainer.textContent = "Error: This number violates Sudoku rules!";
            messageContainer.className = "message-container error-message";
            messageContainer.style.display = "block";
        } else {
            messageContainer.style.display = "none";
            if (selectedCell.classList.contains('prefilled')) return
            selectedCell.classList.add('success');
        }


        return hasError;
    }

    // Check if the game is completed
    function checkCompletion() {
        let noError = true
        let allFilled = true

        for (let cell of cells) {
            if (cell.classList.contains('error')) {
                noError = noError && false
            }

            let val = Number(cell.innerText)
            if (isNaN(val) || val < 1 || val > 9) {
                allFilled = allFilled && false
            }
        }

        if (noError && allFilled) {
            messageContainer.textContent = "Congratulations!! Puzzled Solved";
            messageContainer.className = "message-container success-message";
            messageContainer.style.display = "block"

            cells.forEach(c => c.classList.add('completed'))
        } else {
            messageContainer.style.display = "none"
        }
    }

    function removeErrors(removedCell) {
        let hasError = false
        let oldVal = Number(removedCell.innerText)

        removedCell.innerText = ''
        removedCell.classList.remove('selected')

        document.querySelectorAll('.cell.error').forEach(selectedCell => {
            selectedCell.classList.remove('error');
        });

        const row = Number(removedCell.getAttribute("data-row"));
        const column = Number(removedCell.getAttribute("data-col"));

        const subgridRow = Math.floor(row / 3) * 3;
        const subgridCol = Math.floor(column / 3) * 3;

        // Check all cells in the 3×3 subgrid
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                const checkRow = subgridRow + r;
                const checkCol = subgridCol + c;

                // Skip checking against itself
                if (checkRow === row && checkCol === column) continue;

                const cellToCheck = document.querySelector(`.cell[data-row="${checkRow}"][data-col="${checkCol}"]`);
                if (cellToCheck.innerText === oldVal.toString()) {
                    hasError = hasError || checkViolations(cellToCheck)
                }
            }

            if (!hasError) {
                messageContainer.style.display = "none";
            }
        }
    }

    function getCellByRowAndCol(row, column) {
        return document.querySelector(`.cell[data-row="${row}"][data-col="${column}"]`)
    }

    // Initialize the game
    initializeBoard();
});