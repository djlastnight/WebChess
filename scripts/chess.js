// Global variables
initialForm = null;
timeout = undefined;
tooltip = undefined;
numberSelector = document.getElementById("input_cell_width");
toggleButton = document.getElementById("input_toggle");
board = document.getElementById("chess_board");
date = new Date();
selectImageSource = "images/underlay_yellow.png";
highlightImageSource = "images/underlay_blue.png";
captionImageSource = "images/underlay_red.png";
selectedImage = null;
isWhiteAtBottom = null;
currentPlayerColor = null;
chooseWhiteRadioButton = null;

// Player Color Enumeration
PlayerColor = {
    white: "white",
    black: "black"
};

// Figure Type Enumeration
FigureType = {
    none: "none",
    pawn: "pawn",
    rook: "rook",
    knight: "knight",
    bishop: "bishop",
    king: "king",
    queen: "queen"
};

// Figure Color Enumeration
FigureColor = {
    black: "black",
    white: "white",
};

// Figure Location constructor
function FigureLocation(row, col) {
    this.row = row;
    this.col = col;
}

// Figure constructor
function Figure(figureType, figureColor, row, col) {
    this.figureType = figureType;
    this.figureColor = figureColor;
    this.figureLocation = new FigureLocation(row, col);
}

// Figure toString() override
Figure.prototype.toString = function () {
    var str = this.figureColor + " " + this.figureType + " on Row " +
	this.figureLocation.row + ", Column " + this.figureLocation.col;

    return str;
}

// Function, which returns correct object type
var getTypeOf = function (obj) {
    return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1];
}

function toggleCurrentPlayerColor() {
    var isCurrentBlack = currentPlayerColor == PlayerColor.black;
    currentPlayerColor = isCurrentBlack ? PlayerColor.white : PlayerColor.black;
}

function isHighlightedCell(row, col) {
    var target = document.getElementById("cell_" + row + col);
    // If have marbe in the bg name, which means the cell is highlighted
    return target.style.background.indexOf("marble") == -1;
}

function getFigureColor(row, col) {
    var target = document.getElementById("cell_" + row + col);
    var subImages = target.getElementsByTagName("img");
    if (subImages.length == 0) {
        return null;
    }

    return target.getElementsByTagName("img")[0].dataset.figureColor;
}

function findMaxWayUp(startRow, startCol) {
    while (startRow > 0) {
        if (getFigureColor(--startRow, startCol) != null) {
            break;
        }
    }

    return new Array(startRow, startCol);
}

function findMaxWayDown(startRow, startCol) {
    while (startRow < 7) {
        if (getFigureColor(++startRow, startCol) != null) {
            break;
        }
    }

    return new Array(startRow, startCol);
}

function findMaxWayLeft(startRow, startCol) {
    while (startCol > 0) {
        if (getFigureColor(startRow, --startCol) != null) {
            break;
        }
    }

    return new Array(startRow, startCol);
}

function findMaxWayRight(startRow, startCol) {
    while (startCol < 7) {
        if (getFigureColor(startRow, ++startCol) != null) {
            break;
        }
    }

    return new Array(startRow, startCol);
}

function findMaxWayUpLeft(startRow, startCol) {
    while (startRow > 0 && startCol > 0) {
        if (getFigureColor(--startRow, --startCol) != null) {
            break;
        }
    }

    return new Array(startRow, startCol);
}

function findMaxWayUpRight(startRow, startCol) {
    while (startRow > 0 && startCol < 7) {
        if (getFigureColor(--startRow, ++startCol) != null) {
            break;
        }
    }

    return new Array(startRow, startCol);
}

function findMaxWayDownLeft(startRow, startCol) {
    while (startRow < 7 && startCol > 0) {
        if (getFigureColor(++startRow, --startCol) != null) {
            break;
        }
    }

    return new Array(startRow, startCol);
}

function findMaxWayDownRight(startRow, startCol) {
    while (startRow < 7 && startCol < 7) {
        if (getFigureColor(++startRow, ++startCol) != null) {
            break;
        }
    }

    return new Array(startRow, startCol);
}

function move(element, oldRow, newRow, oldCol, newCol, targetCell) {
    element.dataset.row = newRow;
    element.dataset.col = newCol;
    targetCell.innerHTML = "";
    targetCell.appendChild(element);

    var sourceCell = document.getElementById("cell_" + oldRow + oldCol);
    sourceCell.innerHTML = "";
}

function animateMovement() {
    var rotated = false;
    var div = document.getElementById('chess_table'), deg = rotated ? 0 : 66;

    div.style.webkitTransform = 'rotate(' + deg + 'deg)';
    div.style.mozTransform = 'rotate(' + deg + 'deg)';
    div.style.msTransform = 'rotate(' + deg + 'deg)';
    div.style.oTransform = 'rotate(' + deg + 'deg)';
    div.style.transform = 'rotate(' + deg + 'deg)';
}

function isPossibleMove(oldRow, newRow, oldCol, newCol, fType, fColor) {
    var deltaRow = newRow - oldRow;
    var deltaCol = newCol - oldCol;
    var absDeltaRow = Math.abs(deltaRow);
    var absDeltaCol = Math.abs(deltaCol);

    var topBorder = findMaxWayUp(oldRow, oldCol)[0];
    var bottomBorder = findMaxWayDown(oldRow, oldCol)[0];
    var leftBorder = findMaxWayLeft(oldRow, oldCol)[1];
    var rightBorder = findMaxWayRight(oldRow, oldCol)[1];
    var topLeftBorder = findMaxWayUpLeft(oldRow, oldCol);
    var topRightBorder = findMaxWayUpRight(oldRow, oldCol);
    var bottomLeftBorder = findMaxWayDownLeft(oldRow, oldCol);
    var bottomRightBorder = findMaxWayDownRight(oldRow, oldCol);

    var targetColor = getFigureColor(newRow, newCol);

    if (targetColor == fColor) {
        return false;
    }

    switch (fType) {
        case FigureType.pawn:
            {
                var isBlack = fColor == FigureColor.black;
                if (!isWhiteAtBottom) {
                    // deny the black pawn backwards move
                    if (isBlack && deltaRow > 0) {
                        return false;
                    }

                    // deny the white pawn backwards move
                    if (!isBlack && deltaRow < 0) {
                        return false;
                    }
                } else {
                    if (isBlack && deltaRow < 0) {
                        return false;
                    }

                    if (!isBlack && deltaRow > 0) {
                        return false;
                    }
                }

                var isTargetEmpty = targetColor == null;
                var isDefaultSquare;

                if (!isWhiteAtBottom) {
                    isDefaultSquare = (isBlack && oldRow == 6) || (!isBlack && oldRow == 1);
                } else {
                    isDefaultSquare = (isBlack && oldRow == 1 || !isBlack && oldRow == 6);
                }

                var doubleMoveRow;
                if (!isWhiteAtBottom) {
                    doubleMoveRow = isBlack ? 4 : 3;
                } else {
                    doubleMoveRow = isBlack ? 3 : 4;
                }

                var isSingleMove = (oldCol == newCol) && absDeltaRow == 1 && isTargetEmpty;
                var isDoubleMove = (oldCol == newCol) && isDefaultSquare && absDeltaRow == 2 && !isHighlightedCell(doubleMoveRow, oldCol) && isTargetEmpty;
                var isDiagonalMove = absDeltaRow == 1 && absDeltaCol == 1 && isTargetEmpty == false;

                return (isSingleMove || isDoubleMove || isDiagonalMove);
            }

            break;
        case FigureType.rook:
            {
                return isLegalOrthogonalMove(newRow, newCol, deltaRow, deltaCol, topBorder, bottomBorder, leftBorder, rightBorder);
            }

            break;

        case FigureType.knight:
            {
                if (absDeltaRow == 2 && absDeltaCol == 1 ||
            		absDeltaRow == 1 && absDeltaCol == 2) {
                    return true;
                }
            }

            break;

        case FigureType.bishop:
            {
                return isLegalDiagonalMove(oldRow, newRow, oldCol, newCol, absDeltaRow, absDeltaCol, topLeftBorder, topRightBorder, bottomLeftBorder, bottomRightBorder);
            }

            break;

        case FigureType.queen:
            {
                var diagonal = isLegalDiagonalMove(oldRow, newRow, oldCol, newCol, absDeltaRow, absDeltaCol, topLeftBorder, topRightBorder, bottomLeftBorder, bottomRightBorder);
                var ortho = isLegalOrthogonalMove(newRow, newCol, deltaRow, deltaCol, topBorder, bottomBorder, leftBorder, rightBorder);

                return diagonal || ortho;
            }

            break;

        case FigureType.king:
            {
                if (absDeltaRow <= 1 && absDeltaCol <= 1) {
                    return true;
                }
            }

            break;
        default:
            throw "Figure is not defined: " + fType;

    }

    return false;
}

function isLegalDiagonalMove(oldRow, newRow, oldCol, newCol, absDeltaRow, absDeltaCol, topLeftBorder, topRightBorder, bottomLeftBorder, bottomRightBorder) {
    if (absDeltaRow == absDeltaCol) {
        var isOver = newRow < oldRow;
        var isLeft = newCol < oldCol;
        if (isOver && isLeft && newRow >= topLeftBorder[0]) {
            return true;
        }
        if (isOver && !isLeft && newRow >= topRightBorder[0]) {
            return true;
        }

        if (!isOver && isLeft && newRow <= bottomLeftBorder[0]) {
            return true;
        }

        if (!isOver && !isLeft && newRow <= bottomRightBorder[0]) {
            return true;
        }
    }

    return false;
}

function isLegalOrthogonalMove(newRow, newCol, deltaRow, deltaCol, topBorder, bottomBorder, leftBorder, rightBorder) {
    if (deltaRow == 0 && newCol >= leftBorder && newCol <= rightBorder) {
        return true;
    }

    if (deltaCol == 0 && newRow >= topBorder && newRow <= bottomBorder) {
        return true;
    }
}

function toggleChessBoardVisibility() {
    if (!toggleButton.checked) {
        board.style.visibility = "hidden";
    }
    else {
        board.style.visibility = "visible";
    }
}

function onCellClick(cell) {
    if (getTypeOf(cell) != "HTMLTableCellElement") {
        throw "Exception: clicked on a non table cell";
        return;
    }

    var newRow = cell.dataset.row;
    var newCol = cell.dataset.col;
    var hasFigure = getFigureColor(newRow, newCol) != null;
    var isHighlighted = isHighlightedCell(newRow, newCol);
    if (!hasFigure && !isHighlighted) {
        resetCells();
        return;
    }

    var img = cell.getElementsByTagName('img')[0];

    if (selectedImage != null) {
        if (selectedImage === img) {
            // Clicked on the same cell
            resetCells();
            return;
        }

        var oldRow = selectedImage.dataset.row;
        var oldCol = selectedImage.dataset.col;
        var fType = selectedImage.dataset.figureType;
        var fColor = selectedImage.dataset.figureColor;

        if (isHighlighted) {
            move(selectedImage, oldRow, newRow, oldCol, newCol, cell);
            toggleCurrentPlayerColor();
        }

        resetCells();
        return;
    }

    var newImageColor = getFigureColor(newRow, newCol);
    if (currentPlayerColor != newImageColor) {
        var messageLine1 = "It's " + currentPlayerColor + "'s turn!";
        var messageLine2 = "Click a " + currentPlayerColor + " piece to move it!";
        showTooltip(cell, messageLine1, messageLine2);
        return;
    }

    // Selecting the new image
    cell.style.background = "transparent url(" + selectImageSource + ") no-repeat center";
    cell.style.backgroundSize = numberSelector.value + "px " + numberSelector.value + "px";
    selectedImage = img;

    highlightPossibleMoves(img);
}

function showTooltip(cell, messageLine1, messageLine2) {
    var cellRect = cell.getBoundingClientRect();
    var bodyRect = document.body.getBoundingClientRect();
    var borderSize = 10;

    if (tooltip == undefined) {
        tooltip = document.createElement("div");
        tooltip.className = "tooltip";
        tooltip.style.backgroundColor = "lightgray";
        tooltip.style.border = borderSize + "px solid lightblue"
        tooltip.style.borderRadius = "10px";
        tooltip.style.position = "absolute";
        tooltip.style.fontSize = "12pt";
    }

    if (timeout != undefined && document.body.getElementsByClassName("tooltip").length == 1) {
        // Hiding the active tooltip
        timeout = clearTimeout(timeout);
        document.body.removeChild(tooltip);
    }

    tooltip.style.top = (cellRect.top - bodyRect.top + borderSize) + "px";
    tooltip.style.left = (cellRect.left - bodyRect.left + borderSize) + "px";
    tooltip.style.width = (Math.max(messageLine1.length, messageLine2.length) * tooltip.style.fontSize) + "pt";
    tooltip.innerHTML = messageLine1 + "<br />" + messageLine2;
    document.body.appendChild(tooltip);
    timeout = setTimeout(function () {
        document.body.removeChild(tooltip);
    }, 1500);
}

function showColorChooser() {
    var content = "Please choose the color of prefered by you pieces:";
    var form = document.createElement("form");
    form.style.textAlign = "center";
    form.style.margin = "auto";
    form.name = "colorForm";
    form.id = "form_color";
    form.style.height = "100px";
    form.style.border = "3px ridge black";
    form.style.borderRadius = "10px";
    form.innerHTML = content + "<br/>";

    var radioWhite = document.createElement("input");
    radioWhite.id = "radio_white";
    radioWhite.type = "radio";
    radioWhite.value = "White";
    radioWhite.name = "color";
    radioWhite.checked = "checked";
    var whiteLabel = document.createElement("label");
    whiteLabel.htmlFor = "radio_white";
    whiteLabel.innerHTML = "White";
    chooseWhiteRadioButton = radioWhite;

    var radioBlack = document.createElement("input");
    radioBlack.id = "radio_black";
    radioBlack.type = "radio";
    radioBlack.value = "Black";
    radioBlack.name = "color";
    var blackLabel = document.createElement("label");
    blackLabel.htmlFor = "radio_black";
    blackLabel.innerHTML = "Black";

    var okButton = document.createElement("button");
    okButton.type = "button";
    okButton.innerHTML = "Play chess";
    okButton.style.width = "150px";
    okButton.style.height = "20px";
    okButton.onclick = function () {
        document.getElementById("menu").style.visibility = "visible";
        board.innerHTML = "";
        isWhiteAtBottom = chooseWhiteRadioButton.checked;
        currentPlayerColor = PlayerColor.white;
        document.body.removeChild(initialForm);
        drawChessBoard();
    };

    form.appendChild(radioWhite);
    form.appendChild(whiteLabel);
    form.appendChild(document.createElement("br"));
    form.appendChild(radioBlack);
    form.appendChild(blackLabel);
    form.appendChild(document.createElement("br"));
    form.appendChild(document.createElement("br"));
    form.appendChild(okButton);
    document.getElementById("menu").style.visibility = "hidden";
    initialForm = form;
    document.body.appendChild(form);
}

function highlightPossibleMoves(img) {
    if (img == undefined) {
        throw "Cannot highlight, because passed img is undefined";
        return;
    }

    var row = Number(img.dataset.row);
    var col = Number(img.dataset.col);
    var fType = img.dataset.figureType;
    var fColor = img.dataset.figureColor;

    var table = document.getElementById("chess_table");
    for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
            if (isPossibleMove(row, i, col, j, fType, fColor)) {
                // Highlighting the possible moves
                table.rows[i].cells[j].style.background = "transparent url('" + highlightImageSource + "') no-repeat center";
                table.rows[i].cells[j].style.backgroundSize = numberSelector.value + "px " + numberSelector.value + "px";
                var targetColor = getFigureColor(i, j);
                if (targetColor != null && targetColor != fColor) {
                    // Highligthing the figure, which we can capture
                    table.rows[i].cells[j].style.background = "transparent url('" + captionImageSource + "') no-repeat center";
                    table.rows[i].cells[j].style.backgroundSize = numberSelector.value + "px " + numberSelector.value + "px";
                }
            }
        }
    }
}

function createFigure(row, col) {
    var n = 8;
    var isFirstOrLastRow = !(row % (n - 1));
    var isPenultimateRow = row == 1 || row == 6;
    var color;
    if (row > 1) {
        color = !isWhiteAtBottom ? FigureColor.black : FigureColor.white
    }
    else {
        color = !isWhiteAtBottom ? FigureColor.white : FigureColor.black;
    }

    var isRook = !(col % (n - 1));
    var isKnight = col == 1 || col == 6;
    var isBishop = col == 2 || col == 5;
    var isQueen = col == 4;
    var isKing = col == 3;

    if (isPenultimateRow) {
        return new Figure(FigureType.pawn, color, row, col);;
    }

    if (isFirstOrLastRow) {
        if (isRook) {
            return new Figure(FigureType.rook, color, row, col);
        }

        if (isKnight) {
            return new Figure(FigureType.knight, color, row, col);
        }

        if (isBishop) {
            return new Figure(FigureType.bishop, color, row, col);
        }

        if (isQueen) {
            return new Figure(FigureType.queen, color, row, col);
        }

        if (isKing) {
            return new Figure(FigureType.king, color, row, col);
        }
    }

    return new Figure(FigureType.none, color, row, col);
}

function drawChessBoard() {
    var desiredSize = numberSelector.value;
    var table = document.createElement("table");
    table.id = "chess_table";
    table.style.margin = "auto";
    var tableBody = document.createElement("tbody");

    for (var i = 0; i < 8; i++) {
        var tr = document.createElement("tr");
        for (var j = 0; j < 8; j++) {
            var td = document.createElement("td");
            td.id = "cell_" + i + j;
            td.setAttribute("onclick", "onCellClick(this);");
            td.dataset.row = i;
            td.dataset.col = j;
            tr.appendChild(td);
        }

        tableBody.appendChild(tr);
    }

    table.appendChild(tableBody);

    board.appendChild(table);
    addDefaultFigures();
    resetCells();
}

function addDefaultFigures() {
    var table = document.getElementById("chess_table");
    for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
            var figure = createFigure(i, j);
            if (figure.figureType == FigureType.none) {
                continue;
            }

            var imageSource = "images/" + figure.figureType + "_" + figure.figureColor + ".png";
            var figureImage = document.createElement("img");
            figureImage.src = imageSource;
            figureImage.width = numberSelector.value - 5;
            figureImage.alt = "chess_figure";
            figureImage.id = "img_" + i + j;
            figureImage.dataset.figureType = figure.figureType;
            figureImage.dataset.figureColor = figure.figureColor;
            figureImage.dataset.row = i;
            figureImage.dataset.col = j;
            figureImage.onmousedown = "event.preventDefault ? event.preventDefault() : event.returnValue = false";

            table.rows[i].cells[j].innerHTML = figureImage.outerHTML;
        }
    }
}

function resetCells() {
    var cellSize = Number(numberSelector.value);
    var blackCellBg = "transparent url(images/marble_black.jpg) no-repeat center center";
    var whiteCellBg = "transparent url(images/marble_white.jpg) no-repeat center center";
    for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
            var cell = document.getElementById("cell_" + i + j);
            cell.style.background = (i + j) % 2 ? blackCellBg : whiteCellBg;
            cell.style.width = cellSize + "px";
            cell.style.minWidth = cell.style.width;
            cell.style.height = cellSize + "px";
            cell.style.minHeight = cell.style.height;
            var subImages = cell.getElementsByTagName("img");
            if (subImages.length == 0) {
                continue;
            }

            subImages[0].style.width = (cellSize - 5) + "px";
        }
    }
    
    board.style.width = ((cellSize + 4) * 8) + 'px';
    //board.style.height = board.style.width;
    board.style.textAlign = "center";
    board.style.verticalAlign = "center";

    // Ensure board visibility
    if (!toggleButton.checked) {
        toggleButton.checked = true;
        toggleChessBoardVisibility();
    }
    selectedImage = null;
}

function changeBgColor() {
    var red = Math.random() * 255;
    var green = Math.random() * 255;
    var blue = Math.random() * 255;
    var hexColor = "#" + byteToHex(red) + byteToHex(green) + byteToHex(blue);

    if (hexColor.length != 7) {
        throw "Invalid hex color: " + hexColor;
        return;
    }

    document.body.style.backgroundColor = hexColor;
    document.body.style.color = (red + green + blue) < 300 ? "White" : "Black";
}

function byteToHex(byte) {
    byte = Math.abs(Math.floor(byte) % 255);
    var hex = byte.toString(16);
    if (hex.length == 1) {
        hex = "0" + hex;
    }

    return hex;
}

function createTimer() {
    timer = window.setInterval(timerTick, intervalInMilliseconds);
}

function timerTick() {
    date.setMilliseconds(date.getMilliseconds() + intervalInMilliseconds);
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();

    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    clockContainer.innerHTML = "Time now is " + hours + ":" + minutes + ":" + seconds;
    if (seconds % 30 == 0) {
        changeBgColor();
    }
}

showColorChooser();