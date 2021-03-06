// Global variables
initialForm = null;
tooltip = undefined;
tooltipTimeout = undefined;
numberSelector = document.getElementById("input_cell_width");
toggleButton = document.getElementById("input_toggle");
mainTable = document.getElementById("main_table");
board = document.getElementById("chess_board");
date = new Date();
backgroundImageSourcePrefix = "marble_"; // example: marble_white.jpg, marble_black.jpg
selectImageSource = "images/underlay_selected.png";
highlightImageSource = "images/underlay_highlight.png";
captionImageSource = "images/underlay_capture.png";
castlingImageSource = "images/underlay_castling.png";
checkImageSource = "images/underlay_check.png";
enPassantImageSource = "images/underlay_en_passant.png";
selectedImage = null;
isWhiteAtBottom = null;
currentPlayerColor = null;
chooseWhiteRadioButton = null;
isRotated = false;
isRotationEnabled = true;
isGameOver = false;
gameOverReason = "";
kingInCheckColor = null;
promotionPieceType = null;

// String extension method
String.prototype.capitalizeFirstLetter = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

// Player Color Enumeration
PlayerColor = {
    white: "white",
    black: "black"
};

// Piece Type Enumeration
PieceType = {
    none: "none",
    pawn: "pawn",
    rook: "rook",
    knight: "knight",
    bishop: "bishop",
    king: "king",
    queen: "queen"
};

// Piece Color Enumeration
PieceColor = {
    black: "black",
    white: "white"
};

// Piece Location constructor
function PieceLocation(row, col) {
    this.row = row;
    this.col = col;
}

// Piece constructor
function Piece(pieceType, pieceColor, row, col) {
    this.pieceType = pieceType;
    this.pieceColor = pieceColor;
    this.pieceLocation = new PieceLocation(row, col);
}

// Piece toString() override
Piece.prototype.toString = function () {
    var str = this.pieceColor + " " + this.pieceType + " on Row " +
	this.pieceLocation.row + ", Column " + this.pieceLocation.col;

    return str;
}

// Function, which returns correct object type
var getTypeOf = function (obj) {
    return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1];
}

function toggleCurrentPlayerColor() {
    currentPlayerColor = getNextPlayerColor();
    rotateTheBoard();
    isRotated = !isRotated;
}

function getNextPlayerColor() {
    return currentPlayerColor == PlayerColor.black ? PlayerColor.white : PlayerColor.black;
}

function rotateTheBoard() {
    // Rotating the board
    var angleZ = isRotated ? 0 : 180;
    rotateZ(mainTable, angleZ, 1.0, 0.5);
    for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
            var cell = document.getElementById("cell_" + i + j);
            rotateZ(cell, angleZ, 1.0, 0.5);
        }
    }

    // Rotating the captured pieces
    var capturedImages = document.getElementsByClassName("captured");
    Array.prototype.forEach.call(capturedImages, function (captured) {
        rotateZ(captured, angleZ, 1.0, 0.5);
    });
}

function rotateZ(element, angle, durationInSeconds, delayInSeconds) {
    if (!isRotationEnabled) {
        return;
    }

    if (element === undefined) {
        throw "Can not rotateZ() element, which is undefined!";
        return;
    }

    durationInSeconds = durationInSeconds || 0;
    delayInSeconds = delayInSeconds || 0;
    angle = angle % 360;
    durationInSeconds = durationInSeconds < 0 ? 0 : durationInSeconds;
    delayInSeconds = delayInSeconds < 0 ? 0 : delayInSeconds;

    element.style.webkitTransform = 'rotateZ(' + angle + 'deg)';
    element.style.mozTransform = 'rotateZ(' + angle + 'deg)';
    element.style.msTransform = 'rotateZ(' + angle + 'deg)';
    element.style.oTransform = 'rotateZ(' + angle + 'deg)';
    element.style.transform = 'rotateZ(' + angle + 'deg)';

    element.style.webkitTransition = " transform " + durationInSeconds + "s ease-in-out";
    element.style.mozTransition = " transform " + durationInSeconds + "s ease-in-out";
    element.style.msTransition = " transform " + durationInSeconds + "s ease-in-out";
    element.style.oTransition = " transform " + durationInSeconds + "s ease-in-out";
    element.style.transition = " transform " + durationInSeconds + "s ease-in-out";

    element.style.webkitTransitionDelay = delayInSeconds + "s";
    element.style.mozTransitionDelay = delayInSeconds + "s";
    element.style.msTransitionDelay = delayInSeconds + "s";
    element.style.oTransitionDelay = delayInSeconds + "s";
    element.style.transitionDelay = delayInSeconds + "s";
}

function isCellHighlighted(row, col) {
    var target = document.getElementById("cell_" + row + col);
    // Assuming that if bg is different from default, the cell is highlighted
    return target.style.background.indexOf(backgroundImageSourcePrefix) == -1;
}

// Returns PieceColor.white || PieceColor.black || null
function getPieceColor(chessBoard, row, col) {
    var target = chessBoard.rows[row].cells[col];
    var subImages = target.getElementsByTagName("img");
    if (subImages.length == 0) {
        return null;
    }

    return target.getElementsByTagName("img")[0].dataset.pieceColor;
}

function getPieceImage(chessBoard, row, col) {
    var target = chessBoard.rows[row].cells[col];
    var subImages = target.getElementsByTagName("img");
    if (subImages.length == 0) {
        return null;
    }

    var img = target.getElementsByTagName("img")[0];
    return img;
}

function findMaxWayUp(chessBoard, startRow, startCol) {
    while (startRow > 0) {
        if (getPieceColor(chessBoard, --startRow, startCol) != null) {
            break;
        }
    }

    return new Array(startRow, startCol);
}

function findMaxWayDown(chessBoard, startRow, startCol) {
    while (startRow < 7) {
        if (getPieceColor(chessBoard, ++startRow, startCol) != null) {
            break;
        }
    }

    return new Array(startRow, startCol);
}

function findMaxWayLeft(chessBoard, startRow, startCol) {
    while (startCol > 0) {
        if (getPieceColor(chessBoard, startRow, --startCol) != null) {
            break;
        }
    }

    return new Array(startRow, startCol);
}

function findMaxWayRight(chessBoard, startRow, startCol) {
    while (startCol < 7) {
        if (getPieceColor(chessBoard, startRow, ++startCol) != null) {
            break;
        }
    }

    return new Array(startRow, startCol);
}

function findMaxWayUpLeft(chessBoard, startRow, startCol) {
    while (startRow > 0 && startCol > 0) {
        if (getPieceColor(chessBoard, --startRow, --startCol) != null) {
            break;
        }
    }

    return new Array(startRow, startCol);
}

function findMaxWayUpRight(chessBoard, startRow, startCol) {
    while (startRow > 0 && startCol < 7) {
        if (getPieceColor(chessBoard, --startRow, ++startCol) != null) {
            break;
        }
    }

    return new Array(startRow, startCol);
}

function findMaxWayDownLeft(chessBoard, startRow, startCol) {
    while (startRow < 7 && startCol > 0) {
        if (getPieceColor(chessBoard, ++startRow, --startCol) != null) {
            break;
        }
    }

    return new Array(startRow, startCol);
}

function findMaxWayDownRight(chessBoard, startRow, startCol) {
    while (startRow < 7 && startCol < 7) {
        if (getPieceColor(chessBoard, ++startRow, ++startCol) != null) {
            break;
        }
    }

    return new Array(startRow, startCol);
}

function move(element, oldRow, newRow, oldCol, newCol, targetCell) {
    var chessBoard = document.getElementById("chess_table");

    oldRow = Number(oldRow);
    newRow = Number(newRow);
    oldCol = Number(oldCol);
    newCol = Number(newCol);
    var sourceCell = document.getElementById("cell_" + oldRow + oldCol);

    // Removing the king check marks if we have previously added
    var blackKingLoc = findKingLocation(chessBoard, PieceColor.black);
    var whiteKingLoc = findKingLocation(chessBoard, PieceColor.white);
    setVisualKingCheck(chessBoard, blackKingLoc, PieceColor.black, false);
    setVisualKingCheck(chessBoard, whiteKingLoc, PieceColor.white, false);

    // Marking opponent's king if it will be in check after the current move
    var nextPlayerColor = getNextPlayerColor();
    var kingColor = nextPlayerColor == PlayerColor.black ? PieceColor.black : PieceColor.white;
    var isKingInCheck = willBeKingInCheck(chessBoard, kingColor, oldRow, newRow, oldCol, newCol);
    var kingLoc = findKingLocation(chessBoard, kingColor);
    setVisualKingCheck(chessBoard, kingLoc, kingColor, isKingInCheck);

    var virtualBoard = virtualMove(chessBoard, oldRow, newRow, oldCol, newCol);
    var opponentHasMoves = false;
    var opponentPieces = getOpponentPieces(virtualBoard, currentPlayerColor);
    for (var i in opponentPieces) {
        var opponentPiece = opponentPieces[i];
        var highlightsCount = highlightPossibleMoves(virtualBoard, opponentPiece.pieceLocation.row, opponentPiece.pieceLocation.col);
        if (highlightsCount > 0) {
            opponentHasMoves = true;
            break;
        }
    }

    if (!opponentHasMoves) {
        // Game over
        if (isKingInCheck) {
            gameOverReason = currentPlayerColor.capitalizeFirstLetter() + " player wins the game by checkmate!";
        }
        else {
            gameOverReason = "Game counted as draw, due to stalemate!";
        }

        targetCell.style.background = "transparent url('" + checkImageSource + "') no-repeat center";
        targetCell.style.backgroundSize = numberSelector.value + "px " + numberSelector.value + "px";
        targetCell.innerHTML = "";
        targetCell.appendChild(element);
        sourceCell.innerHTML = "";
        numberSelector.disabled = "disabled";
        document.getElementById("input_toggle").disabled = "disabled";
        alert("Game over! " + gameOverReason);
        return false;
    }

    element.dataset.row = newRow;
    element.dataset.col = newCol;
    element.dataset.isMoved = true;

    var targetImages = targetCell.getElementsByTagName("img");
    if (targetImages.length == 1) {
        var capturedPiece = targetImages[0];
        var isGameDraw = capturePiece(capturedPiece);
        if (isGameDraw) {
            gameOverReason = "Game counted as draw due to insufficient material!";
            alert(gameOverReason);
            return false;
        }
    }

    if (targetCell.style.backgroundImage.indexOf(castlingImageSource) != -1) {
        // King makes a castling - Moving the rook now
        var rookOldCol = newCol > 4 ? 7 : 0;
        var rookNewCol = rookOldCol == 0 ? newCol + 1 : newCol - 1;
        var rookSourceImg = getPieceImage(chessBoard, newRow, rookOldCol);
        var rookTargetCell = document.getElementById("cell_" + newRow + rookNewCol);
        move(rookSourceImg, oldRow, newRow, rookOldCol, rookNewCol, rookTargetCell);
    }

    if (targetCell.style.backgroundImage.indexOf(enPassantImageSource) != -1) {
        // Making En Passant move and capturing the opponent pawn
        var enPassantRow = element.dataset.enPassantPieceRow;
        var enPassantCol = element.dataset.enPassantPieceCol;
        capturePiece(getPieceImage(chessBoard, enPassantRow, enPassantCol));
    }

    targetCell.innerHTML = "";
    targetCell.appendChild(element);
    sourceCell.innerHTML = "";

    // Removing all en passant datasets
    for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
            var img = getPieceImage(chessBoard, i, j);
            if (img != null && img.dataset.pieceType == PieceType.pawn) {
                delete img.dataset.isEnPassant;
                delete img.dataset.enPassantMoveRow;
                delete img.dataset.enPassantMoveCol;
                delete img.dataset.enPassantPieceRow;
                delete img.dataset.enPassantPieceCol;
            }
        }
    }

    if (element.dataset.pieceType == PieceType.pawn) {
        if (newRow % 7 == 0) {
            showPromotionDialog(chessBoard, newRow, newCol);
        } else {
            // Checking for En Passant
            var deltaRow = oldRow - newRow;
            if (Math.abs(deltaRow) == 2) {
                var leftCol = newCol - 1;
                var rightCol = newCol + 1;
                var enPassantLeft;
                var enPassantRight;

                if (leftCol >= 0) {
                    enPassantLeft = getPieceImage(chessBoard, newRow, newCol - 1);
                }

                if (rightCol <= 7) {
                    enPassantRight = getPieceImage(chessBoard, newRow, newCol + 1);
                }

                if (enPassantLeft &&
                        enPassantLeft.dataset.pieceType == PieceType.pawn &&
                        enPassantLeft.dataset.pieceColor != element.dataset.pieceColor) {
                    enPassantLeft.dataset.isEnPassant = true;
                    enPassantLeft.dataset.enPassantMoveRow = deltaRow > 0 ? newRow + 1 : newRow - 1;
                    enPassantLeft.dataset.enPassantMoveCol = newCol;
                    enPassantLeft.dataset.enPassantPieceRow = newRow;
                    enPassantLeft.dataset.enPassantPieceCol = newCol;
                }

                if (enPassantRight &&
                        enPassantRight.dataset.pieceType == PieceType.pawn &&
                        enPassantRight.dataset.pieceColor != element.dataset.pieceColor) {
                    enPassantRight.dataset.isEnPassant = true;
                    enPassantRight.dataset.enPassantMoveRow = deltaRow > 0 ? newRow + 1 : newRow - 1;
                    enPassantRight.dataset.enPassantMoveCol = newCol;
                    enPassantRight.dataset.enPassantPieceRow = newRow;
                    enPassantRight.dataset.enPassantPieceCol = newCol;
                }
            }
        }
    }

    return true;
}

function capturePiece(capturedPieceImage) {
    var pieceColor = capturedPieceImage.dataset.pieceColor;
    var container = document.getElementById("captured_" + pieceColor);

    // Lazy load pattern
    if (container.getElementsByTagName("table").length == 0) {
        var table = document.createElement("table");
        table.insertRow(0);
        container.appendChild(table);
    }

    var existingTable = container.getElementsByTagName("table")[0];
    var rows = existingTable.rows;
    var cells = rows[rows.length - 1].cells;
    if (cells.length == 8) {
        // Moving the current table to new td
        var newTable = document.createElement("table");
        newTable.insertRow(0);
        newTable.rows[0].insertCell(0);
        newTable.rows[0].cells[0].innerHTML = existingTable.outerHTML;
        var newTd = document.createElement("td");
        newTd.appendChild(newTable);
        existingTable.deleteRow(0);
        existingTable.insertRow(0);
        var position = pieceColor == PieceColor.white ? "beforeBegin" : "afterEnd";
        container.insertAdjacentElement(position, newTd);
    }

    // Inserting the captured piece into its capture container
    capturedPieceImage.className = "captured";
    var newCell = rows[0].insertCell(0);
    newCell.style.display = "block";
    newCell.appendChild(capturedPieceImage);

    return checkForInsufficientMaterial();
}

function isPossibleMove(chessBoard, oldRow, newRow, oldCol, newCol, fType, fColor) {
    oldRow = Number(oldRow);
    newRow = Number(newRow);
    oldCol = Number(oldCol);
    newCol = Number(newCol);
    var deltaRow = newRow - oldRow;
    var deltaCol = newCol - oldCol;
    var absDeltaRow = Math.abs(deltaRow);
    var absDeltaCol = Math.abs(deltaCol);

    var topBorder = findMaxWayUp(chessBoard, oldRow, oldCol)[0];
    var bottomBorder = findMaxWayDown(chessBoard, oldRow, oldCol)[0];
    var leftBorder = findMaxWayLeft(chessBoard, oldRow, oldCol)[1];
    var rightBorder = findMaxWayRight(chessBoard, oldRow, oldCol)[1];
    var topLeftBorder = findMaxWayUpLeft(chessBoard, oldRow, oldCol);
    var topRightBorder = findMaxWayUpRight(chessBoard, oldRow, oldCol);
    var bottomLeftBorder = findMaxWayDownLeft(chessBoard, oldRow, oldCol);
    var bottomRightBorder = findMaxWayDownRight(chessBoard, oldRow, oldCol);

    var targetColor = getPieceColor(chessBoard, newRow, newCol);

    if (targetColor == fColor) {
        return false;
    }

    switch (fType) {
        case PieceType.pawn:
            {
                var isBlack = fColor == PieceColor.black;
                if (!isWhiteAtBottom) {
                    if (isBlack && deltaRow > 0) {
                        // Deny the black pawn backwards move
                        return false;
                    }

                    if (!isBlack && deltaRow < 0) {
                        // Deny the white pawn backwards move
                        return false;
                    }
                } else {
                    if (isBlack && deltaRow < 0) {
                        // Deny the black pawn backwards move
                        return false;
                    }

                    if (!isBlack && deltaRow > 0) {
                        // Deny the white pawn backwards move
                        return false;
                    }
                }

                var isDefaultSquare;
                if (!isWhiteAtBottom) {
                    isDefaultSquare = (isBlack && oldRow == 6) || (!isBlack && oldRow == 1);
                } else {
                    isDefaultSquare = (isBlack && oldRow == 1 || !isBlack && oldRow == 6);
                }

                var nextRow;
                if (!isWhiteAtBottom) {
                    nextRow = isBlack ? oldRow - 1 : oldRow + 1;
                } else {
                    nextRow = isBlack ? oldRow + 1 : oldRow - 1;
                }

                nextRow = nextRow < 0 ? 0 : nextRow;
                nextRow = nextRow > 7 ? 7 : nextRow;

                var doubleMoveRow;
                if (!isWhiteAtBottom) {
                    doubleMoveRow = isBlack ? 4 : 3;
                } else {
                    doubleMoveRow = isBlack ? 3 : 4;
                }

                var isTargetEmpty = targetColor == null;
                var isNextRowEmpty = getPieceColor(chessBoard, nextRow, oldCol) == null;
                var isSingleMove = (oldCol == newCol) && absDeltaRow == 1 && isTargetEmpty;
                var isDoubleMove = (oldCol == newCol) && isDefaultSquare && absDeltaRow == 2 && !isCellHighlighted(doubleMoveRow, oldCol) && isNextRowEmpty && isTargetEmpty;
                var isDiagonalMove = absDeltaRow == 1 && absDeltaCol == 1 && isTargetEmpty == false;

                return (isSingleMove || isDoubleMove || isDiagonalMove);
            }

            break;
        case PieceType.rook:
            {
                return isLegalOrthogonalMove(newRow, newCol, deltaRow, deltaCol, topBorder, bottomBorder, leftBorder, rightBorder);
            }

            break;

        case PieceType.knight:
            {
                if (absDeltaRow == 2 && absDeltaCol == 1 ||
                    absDeltaRow == 1 && absDeltaCol == 2) {
                    return true;
                }
            }

            break;

        case PieceType.bishop:
            {
                return isLegalDiagonalMove(oldRow, newRow, oldCol, newCol, absDeltaRow, absDeltaCol, topLeftBorder, topRightBorder, bottomLeftBorder, bottomRightBorder);
            }

            break;

        case PieceType.queen:
            {
                var diagonal = isLegalDiagonalMove(oldRow, newRow, oldCol, newCol, absDeltaRow, absDeltaCol, topLeftBorder, topRightBorder, bottomLeftBorder, bottomRightBorder);
                var ortho = isLegalOrthogonalMove(newRow, newCol, deltaRow, deltaCol, topBorder, bottomBorder, leftBorder, rightBorder);

                return diagonal || ortho;
            }

            break;

        case PieceType.king:
            {
                if (absDeltaRow <= 1 && absDeltaCol <= 1) {
                    return true;
                }
            }

            break;
        default:
            throw "piece is not defined: " + fType;

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

function toggleAutoRotation() {
    if (isGameOver) {
        return;
    }

    if (isRotated) {
        rotateTheBoard();
    }

    isRotationEnabled = !isRotationEnabled;
}

function onCellClick(cell) {
    var type = getTypeOf(cell);
    if (type != "HTMLTableCellElement" && type != "HTMLTableDataCellElement") {
        throw "You have clicked on a non table cell: " + type;
        return;
    }

    hideTooltip();
    if (isGameOver) {
        showTooltip(cell, "Game is over!", gameOverReason);
        return;
    }

    var chessBoard = document.getElementById("chess_table");
    var newRow = cell.dataset.row;
    var newCol = cell.dataset.col;
    var haspiece = getPieceColor(chessBoard, newRow, newCol) != null;
    var isHighlighted = isCellHighlighted(newRow, newCol);
    if (!haspiece && !isHighlighted) {
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
        var fType = selectedImage.dataset.pieceType;
        var fColor = selectedImage.dataset.pieceColor;

        if (isHighlighted) {
            var isMoved = move(selectedImage, oldRow, newRow, oldCol, newCol, cell);
            if (!isMoved) {
                isGameOver = true;
                return;
            }

            toggleCurrentPlayerColor();
        }

        resetCells();
        return;
    }

    var newImageColor = getPieceColor(chessBoard, newRow, newCol);
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

    highlightPossibleMoves(chessBoard, img.dataset.row, img.dataset.col);
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

    hideTooltip();

    tooltip.style.top = (cellRect.top - bodyRect.top + borderSize) + "px";
    tooltip.style.left = (cellRect.left - bodyRect.left + borderSize) + "px";
    tooltip.style.width = (Math.max(messageLine1.length, messageLine2.length) * tooltip.style.fontSize) + "pt";
    tooltip.innerHTML = messageLine1 + "<br />" + messageLine2;
    document.body.appendChild(tooltip);
    tooltipTimeout = setTimeout(function () {
        document.body.removeChild(tooltip);
    }, 1500);
}

function hideTooltip() {
    if (tooltipTimeout != undefined && document.body.getElementsByClassName("tooltip").length == 1) {
        // Hiding the active tooltip
        tooltipTimeout = clearTimeout(tooltipTimeout);
        document.body.removeChild(tooltip);
    }
}

function showColorChooserForm() {
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

// Returns highlighted cells count
function highlightPossibleMoves(chessBoard, row, col) {
    var img = chessBoard.rows[row].cells[col].getElementsByTagName("img")[0];
    if (img == undefined) {
        return 0;
    }

    var fType = img.dataset.pieceType;
    var fColor = img.dataset.pieceColor;
    var highlights = 0;

    for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
            if (fType == PieceType.king && isLegalCastlingMove(chessBoard, fColor, i, j)) {
                // Highlighting castling move
                chessBoard.rows[i].cells[j].style.background = "transparent url('" + castlingImageSource + "') no-repeat center";
                chessBoard.rows[i].cells[j].style.backgroundSize = numberSelector.value + "px " + numberSelector.value + "px";
            }

            if (isPossibleMove(chessBoard, row, i, col, j, fType, fColor)) {

                if (willBeKingInCheck(chessBoard, fColor, row, i, col, j)) {
                    continue;
                }

                // Highlighting the possible moves
                highlights++;
                chessBoard.rows[i].cells[j].style.background = "transparent url('" + highlightImageSource + "') no-repeat center";
                chessBoard.rows[i].cells[j].style.backgroundSize = numberSelector.value + "px " + numberSelector.value + "px";
                var targetColor = getPieceColor(chessBoard, i, j);
                if (targetColor != null && targetColor != fColor) {
                    // Highligthing the piece, which we can capture
                    chessBoard.rows[i].cells[j].style.background = "transparent url('" + captionImageSource + "') no-repeat center";
                    chessBoard.rows[i].cells[j].style.backgroundSize = numberSelector.value + "px " + numberSelector.value + "px";
                }
            }

            if (img.dataset.isEnPassant && img.dataset.enPassantMoveRow == i && img.dataset.enPassantMoveCol == j) {
                highlights++;
                // Hightlighting the en passant capture move
                chessBoard.rows[i].cells[j].style.background = "transparent url('" + enPassantImageSource + "') no-repeat center";
                chessBoard.rows[i].cells[j].style.backgroundSize = numberSelector.value + "px " + numberSelector.value + "px";
            }
        }
    }

    return highlights;
}

function createPiece(row, col) {
    var n = 8;
    var isFirstOrLastRow = !(row % (n - 1));
    var isPenultimateRow = row == 1 || row == 6;
    var color;
    if (row > 1) {
        color = !isWhiteAtBottom ? PieceColor.black : PieceColor.white
    } else {
        color = !isWhiteAtBottom ? PieceColor.white : PieceColor.black;
    }

    var isRook = !(col % (n - 1));
    var isKnight = col == 1 || col == 6;
    var isBishop = col == 2 || col == 5;
    var isQueen = isWhiteAtBottom ? col == 3 : col == 4;
    var isKing = isWhiteAtBottom ? col == 4 : col == 3;

    if (isPenultimateRow) {
        return new Piece(PieceType.pawn, color, row, col);;
    }

    if (isFirstOrLastRow) {
        if (isRook) {
            return new Piece(PieceType.rook, color, row, col);
        }

        if (isKnight) {
            return new Piece(PieceType.knight, color, row, col);
        }

        if (isBishop) {
            return new Piece(PieceType.bishop, color, row, col);
        }

        if (isQueen) {
            return new Piece(PieceType.queen, color, row, col);
        }

        if (isKing) {
            return new Piece(PieceType.king, color, row, col);
        }
    }

    return new Piece(PieceType.none, color, row, col);
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
    addDefaultPieces();
    resetCells();
}

function addDefaultPieces() {
    var chessBoard = document.getElementById("chess_table");
    for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
            var piece = createPiece(i, j);
            if (piece.pieceType == PieceType.none) {
                continue;
            }

            addPiece(chessBoard, piece, false);
        }
    }
}

function addPiece(chessBoard, piece, isPromotion) {
    var imageSource = "images/" + piece.pieceType + "_" + piece.pieceColor + ".png";
    var row = piece.pieceLocation.row;
    var col = piece.pieceLocation.col;
    var pieceImage = document.createElement("img");
    pieceImage.src = imageSource;
    pieceImage.width = numberSelector.value - 5;
    pieceImage.alt = "chess_piece";
    pieceImage.id = !isPromotion ? "img_" + row + col : "promotion_img_" + row + col;
    pieceImage.dataset.pieceType = piece.pieceType;
    pieceImage.dataset.pieceColor = piece.pieceColor;
    pieceImage.dataset.row = row;
    pieceImage.dataset.col = col;
    pieceImage.dataset.isMoved = false;
    pieceImage.onmousedown = "event.preventDefault ? event.preventDefault() : event.returnValue = false";

    chessBoard.rows[row].cells[col].innerHTML = pieceImage.outerHTML;

    if (isPromotion) {
        var kingColor = piece.pieceColor == PieceColor.black ? PieceColor.white : PieceColor.black;
        var kingLocation = findKingLocation(chessBoard, kingColor);
        var isOpponentKingInCheckAfterThePromotion = isCellUnderAttack(chessBoard, kingLocation[0], kingLocation[1], kingColor);
        if (isOpponentKingInCheckAfterThePromotion) {
            setVisualKingCheck(chessBoard, kingLocation, kingColor, true);
        }

        var clonedBoard = chessBoard.cloneNode(true);
        var opponentHasMoves = false;
        var opponentPieces = getOpponentPieces(chessBoard, piece.pieceColor);
        for (var i in opponentPieces) {
            var opponentPiece = opponentPieces[i];
            var highlightsCount = highlightPossibleMoves(clonedBoard, opponentPiece.pieceLocation.row, opponentPiece.pieceLocation.col);
            if (highlightsCount > 0) {
                opponentHasMoves = true;
                break;
            }
        }

        if (!opponentHasMoves) {
            // Game over
            if (isOpponentKingInCheckAfterThePromotion) {
                gameOverReason = piece.pieceColor.capitalizeFirstLetter() + " player wins the game by checkmate!";
            }
            else {
                gameOverReason = "Game counted as draw, due to stalemate!";
            }

            isGameOver = true;
            alert(gameOverReason);
        }
    }
}

function resetCells() {
    var cellSize = Number(numberSelector.value);
    var blackCellBg = "transparent url(images/" + backgroundImageSourcePrefix + "black.jpg) no-repeat center center";
    var whiteCellBg = "transparent url(images/" + backgroundImageSourcePrefix + "white.jpg) no-repeat center center";
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

    var realSize = cellSize + 6.5;
    board.style.width = (realSize * 8) + "px";
    board.style.height = board.style.width;
    document.getElementById("captured_black").style.width = ((realSize * 2) - 50) + "px";
    document.getElementById("captured_white").style.width = ((realSize * 2) - 50) + "px";
    mainTable.style.width = (realSize * 12) + "px";
    mainTable.style.height = (realSize * 12) + "px";
    mainTable.style.visibility = "visible";

    //Resizing the captured images too
    var capturedImages = document.getElementsByClassName("captured");
    Array.prototype.forEach.call(capturedImages, function (captured) {
        captured.style.width = (cellSize - 5) + "px";
    });

    selectedImage = null;
}

showColorChooserForm();

function findKingLocation(chessBoard, kingColor) {
    if (kingColor != PieceColor.black &&
        kingColor != PieceColor.white) {
        throw "Error: findKingLocation() expected PieceColor.white or PieceColor.black!";
        return;
    }

    for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
            var color = getPieceColor(chessBoard, i, j);
            if (color == kingColor) {
                var cell = chessBoard.rows[i].cells[j];
                var images = cell.getElementsByTagName("img");
                if (images.length == 0) {
                    continue;
                }

                var piece = images[0];
                var type = piece.dataset.pieceType;
                if (type == PieceType.king) {
                    return new Array(i, j);
                }
            }
        }
    }

    throw "Fatal chess error: can not find the " + kingColor.toUpperCase() + " King!";
}

function isLegalCastlingMove(chessBoard, kingColor, newRow, newCol) {
    if (kingColor != PieceColor.black && kingColor != PieceColor.white) {
        throw "Invalid kingColor passed on isLegalCastlingMove()";
        return false;
    }

    newRow = Number(newRow);
    newCol = Number(newCol);
    if (newRow % 7 != 0) {
        return false;
    }

    var isBlack = kingColor == PieceColor.black;

    var isInCheck = isBlack ? kingInCheckColor == PieceColor.black : kingInCheckColor == PieceColor.white;
    if (isInCheck) {
        // Castling is not allowed, when king is in check
        return false;
    }

    var kingLocation = findKingLocation(chessBoard, kingColor);
    var kingRow = kingLocation[0];
    if (newRow != kingRow) {
        // Castling is allowed only on the same row
        return false;
    }

    var kingCol = kingLocation[1];
    var absDeltaCol = Math.abs(kingCol - newCol);

    if (absDeltaCol != 2) {
        return false;
    }

    var isKingMoved = getPieceImage(chessBoard, kingRow, kingCol).dataset.isMoved == "true";
    if (isKingMoved) {
        // Castling is not allowed, when the King has been moved
        return false;
    }

    var isLeft = newCol < kingCol;

    if (isRookHasBeenMoved(chessBoard, isBlack, isLeft)) {
        // Castling is not allowed, when the target rook has been moved
        return false;
    }

    // Checking if the way from king to the rook is clear
    if (isLeft) {
        if (findMaxWayLeft(chessBoard, kingRow, kingCol)[1] != 0) {
            return false;
        }
    } else {
        if (findMaxWayRight(chessBoard, kingRow, kingCol)[1] != 7) {
            return false;
        }
    }

    // Checking if king passes cells under attack
    if (newCol < kingCol) {
        for (var i = newCol; i <= kingCol; i++) {
            if (isCellUnderAttack(chessBoard, kingRow, i, kingColor)) {
                return false;
            }
        }
    } else {
        for (var i = kingCol; i <= newCol; i++) {
            if (isCellUnderAttack(chessBoard, kingRow, i, kingColor)) {
                return false;
            }
        }
    }

    return true;
}

function isRookHasBeenMoved(chessBoard, isBlack, isLeft) {
    var targetRow;
    if (!isWhiteAtBottom) {
        targetRow = isBlack ? 7 : 0;
    } else {
        targetRow = isBlack ? 0 : 7;
    }

    var targetCol = isLeft ? 0 : 7;
    var pieceToCheck = getPieceImage(chessBoard, targetRow, targetCol);
    if (pieceToCheck == null) {
        return true;
    }

    if (pieceToCheck.dataset.pieceType != PieceType.rook) {
        return true;
    }

    var isMoved = pieceToCheck.dataset.isMoved == "true";
    return isMoved;
}

function willBeKingInCheck(chessBoard, kingColor, oldRow, newRow, oldCol, newCol) {
    if (kingColor != PieceColor.black &&
        kingColor != PieceColor.white) {
        throw "Error: willBeKingInCheck() expected PieceColor.white or PieceColor.black!";
        return;
    }

    var virtualBoard = virtualMove(chessBoard, oldRow, newRow, oldCol, newCol);
    var kingLocation = findKingLocation(virtualBoard, kingColor);
    return isCellUnderAttack(virtualBoard, kingLocation[0], kingLocation[1], kingColor);
}

// Returns chess board clonning, where specified element is moved
function virtualMove(boardToClone, oldRow, newRow, oldCol, newCol) {
    var virtualBoard = boardToClone.cloneNode(true);

    var sourceCell = virtualBoard.rows[oldRow].cells[oldCol];
    var targetCell = virtualBoard.rows[newRow].cells[newCol];
    var elementToMove = sourceCell.getElementsByTagName("img")[0];
    elementToMove.dataset.row = newRow;
    elementToMove.dataset.col = newCol;
    sourceCell.innerHTML = "";
    targetCell.innerHTML = "";
    targetCell.appendChild(elementToMove);

    return virtualBoard;
}

// Returns piece Array
function getOpponentPieces(chessBoard, playerColor) {
    var opponentPieces = [];
    for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
            var cell = chessBoard.rows[i].cells[j];
            var subImages = cell.getElementsByTagName("img");
            if (subImages.length == 0) {
                continue;
            }

            var img = subImages[0];
            var fType = img.dataset.pieceType;
            var fColor = img.dataset.pieceColor;
            if (fColor != playerColor) {
                opponentPieces.push(new Piece(fType, fColor, i, j));
            }
        }
    }

    return opponentPieces;
}

function isCellUnderAttack(chessBoard, row, col, playerColor) {
    var opponentPieces = getOpponentPieces(chessBoard, playerColor);

    for (var i in opponentPieces) {
        var opponentPiece = opponentPieces[i];
        var oldRow = opponentPiece.pieceLocation.row;
        var oldCol = opponentPiece.pieceLocation.col;
        var fType = opponentPiece.pieceType;
        var fColor = opponentPiece.pieceColor;
        if (isPossibleMove(chessBoard, oldRow, row, oldCol, col, fType, fColor)) {
            return true;
        }
    }

    return false;
}

function showPromotionDialog(chessBoard, newRow, newCol) {
    var content = "Please choose promotion piece:";
    var form = document.createElement("form");
    form.style.textAlign = "center";
    form.style.margin = "auto";
    form.name = "promotionForm";
    form.id = "form_promotion";
    form.style.height = "100px";
    form.style.border = "3px ridge black";
    form.style.borderRadius = "10px";
    form.innerHTML = content + "<br/>";
    var div = document.createElement("div");
    div.style.textAlign = "left";
    div.style.margin = "auto";
    div.style.width = "100px";
    var button = document.createElement("input");
    button.type = "button";
    button.value = "Ok";
    button.onclick = function () {
        document.body.removeChild(form);
        mainTable.style.display = "table";
        addPiece(chessBoard, new Piece(promotionPieceType, getNextPlayerColor(), newRow, newCol), true);
        promotionPieceType = null;
    };

    for (var pieceName in PieceType) {
        if (PieceType.hasOwnProperty(pieceName)) {
            if (pieceName == PieceType.none ||
                pieceName == PieceType.pawn || pieceName == PieceType.king) {

                continue;
            }

            var id = "promotion_" + pieceName.toLowerCase();
            var radio = document.createElement("input");
            radio.type = "radio";
            radio.name = "radio_promotion";
            radio.id = id;
            radio.value = pieceName.toUpperCase();
            radio.onclick = function () {
                promotionPieceType = this.id.slice("promotion_".length);
            };

            if (pieceName == PieceType.queen) {
                radio.checked = "checked";
                promotionPieceType = "queen";
            }

            var label = document.createElement("label");
            label.htmlFor = id;
            label.innerHTML = pieceName.capitalizeFirstLetter();
            div.appendChild(radio);
            div.appendChild(label);
            div.appendChild(document.createElement("br"));
        }
    }

    form.appendChild(div);
    form.appendChild(document.createElement("br"));
    form.appendChild(button);

    document.body.appendChild(form);
    mainTable.style.display = "none";
}

function setVisualKingCheck(chessBoard, kingLocation, kingColor, mark) {
    var kingImg = getPieceImage(chessBoard, kingLocation[0], kingLocation[1]);
    if (mark) {
        kingImg.style.border = "3px solid red";
        kingInCheckColor = kingColor;
    } else {
        kingImg.style.border = "";
        kingInCheckColor = null;
    }

}

function getPieces(chessBoard) {
    var pieces = [];
    for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
            var img = getPieceImage(chessBoard, i, j);
            if (img == null) {
                // No piece on this cell
                continue;
            }

            pieces.push(new Piece(img.dataset.pieceType, img.dataset.pieceColor, i, j));
        }
    }

    return pieces;
}

function checkForInsufficientMaterial() {
    var chessBoard = document.getElementById("chess_table");
    var pieces = getPieces(chessBoard);
    if (pieces.length == 2) {
        // King against king
        return true;
    }

    var bishops = pieces.filter(function (x) {
        if (x.pieceType == PieceType.bishop) {
            return true;
        }

        return false;
    });

    var knights = pieces.filter(function (x) {
        if (x.pieceType == PieceType.knight) {
            return true;
        }

        return false;
    });

    if (pieces.length == 3 && (bishops.length == 1 || knights.length == 1)) {
        // King against king and bishop
        // or
        // King against king and knight
        return true;
    }

    if (pieces.length == 4 && bishops.length == 2) {
        var whiteBishops = bishops.filter(function (x) {
            if (x.pieceColor == PieceColor.white) {
                return true;
            }

            return false;
        });


        if (whiteBishops.length == 1) {
            // King and bishop against king and bishop
            // We have to check if bishops are of the same color
            var blackBishops = bishops.filter(function (x) {
                if (x.pieceColor == PieceColor.black) {
                    return true;
                }

                return false;
            });

            var whiteBishop = whiteBishops[0];
            var blackBishop = blackBishops[0];

            var whiteBishopCell = document.getElementById("cell_" + whiteBishop.pieceLocation.row + whiteBishop.pieceLocation.col);
            var blackBishopCell = document.getElementById("cell_" + blackBishop.pieceLocation.row + blackBishop.pieceLocation.col);

            var isWhiteBishopOnWhiteSquare = whiteBishopCell.style.backgroundImage.indexOf("white") != -1;
            var isBlackBishopOnWhiteSquare = blackBishopCell.style.backgroundImage.indexOf("white") != -1;

            if ((isWhiteBishopOnWhiteSquare && isBlackBishopOnWhiteSquare) ||
                (!isWhiteBishopOnWhiteSquare && !isBlackBishopOnWhiteSquare)) {
                // Both bishops are on squares of the same color
                return true;
            }
        }
    }

    return false;
}

// TODO: Implement En Passant