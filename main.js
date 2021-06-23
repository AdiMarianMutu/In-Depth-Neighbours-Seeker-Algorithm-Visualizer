class LinkedCells {
    // The algorithm is slowed down with sleep by purpose to better show the visualizer
    // I don't really know what kinda of algorithm I've written, I don't have much experience with algorithms
    // So i'm just gonna call it In Depth Neighbors Seeker
    // But it is just a simple recursion method which runs until there are no more values to be filtered
    // It took me ~5 hours to come with this solution
    // You can find different version of this challenge online, just search "cell grid count or linked cells" and so on

    constructor() {
        // The searching delay
        this.SPEED_DELAY;
        // Enables also diagonal search (the original challenge didn't require this, but it is a small easy upgrade)
        this.DIAGONAL_SEARCH;
        // The input matrix
        this.matrix;
        this.mRows;
        this.mColumns;
        // This array of objects will contains the coordinates of the 1 which will not be removed from the final matrix
        this.partOfLinkedCells;
        this.cellAlreadyVisited;
        // The processed matrix
        // Will be initialized with 0 values
        this.mProcessed;
    }


    async sleep(ms) { return new Promise((resolve) => { setTimeout(resolve, ms); }); }
    _init(m, speed, diagonalSearch) {
        this.SPEED_DELAY = speed / 50;
        this.DIAGONAL_SEARCH = diagonalSearch;
        this.matrix = m;
        this.mRows = m.length;
        this.mColumns = m[0].length;
        this.partOfLinkedCells = [];
        this.cellAlreadyVisited = [];
        this.mProcessed = [...Array(this.mRows)].map(e => Array(this.mColumns).fill(0));
    }
    static isBorder(r, rMax, c, cMax) { return (r == 0 || r == rMax - 1) || (c == 0 || c == cMax - 1); }
    isOne(n) { return n == 1; }
    isOutsideMatrix(r, c) { return (r < 0 || r > this.mRows - 1) || (r < 0 && (c < 0 || c > this.mColumns - 1)); }
    coordExists(dictionary, r, c) { return dictionary === undefined ? false : dictionary.some(e => e.r === r && e.c === c); }
    addToPartOfLinkedCells(r, c) {
        if (this.coordExists(this.partOfLinkedCells, r, c))
            return;
        
        this.partOfLinkedCells.push(
            {
                r: r, // row
                c: c  // column
            }
        );
        // Replaces the 0 with the right cell which will be part of an archipelago
        this.mProcessed[r][c] = 1;
    }
    // Used for recursion
    // Called when a 1 is found
    async _keepLooking(r, c) {
        /* VISUALIZER STUFF - NOT REQUIRED */
        await this.sleep(this.SPEED_DELAY);
        // Marks the filtered cell
        drawCellClass(r, c, 'part-of-linked-cells');
        /* END VISUALIZER STUFF - NOT REQUIRED */

        this.addToPartOfLinkedCells(r, c);
        await this.checkForNeighbors(r, c);
    }
    async checkForNeighbors(r, c) {
        let dirs = [
            {r: r - 1, c: c}, // up
            {r: r + 1, c: c}, // down
            {r: r, c: c + 1}, // right
            {r: r, c: c - 1} // left
        ];
        if (this.DIAGONAL_SEARCH) {
            dirs.push(
                {r: r - 1, c: c + 1}, // up-right
                {r: r - 1, c: c - 1}, // up-left
                {r: r + 1, c: c + 1}, // down-right
                {r: r + 1, c: c - 1} // down-left
            );
        }
        let dirsLen = dirs.length;

        for (let d = 0; d < dirsLen; d++) {
            // If a cell was alredy marked as visited, it's pointless to recalculate everything
            if (this.coordExists(this.cellAlreadyVisited, dirs[d].r, dirs[d].c))
                continue;
            else
                this.cellAlreadyVisited.push({ r:  dirs[d].r, c: dirs[d].c});

            /* VISUALIZER STUFF - NOT REQUIRED */
            drawCellClass(dirs[d].r, dirs[d].c, 'propagation');
            setTimeout(() => {
                drawCellClass(dirs[d].r, dirs[d].c, '-propagation');
                drawCellClass(dirs[d].r, dirs[d].c, 'visited');
            }, this.SPEED_DELAY + 350);
            /* END VISUALIZER STUFF - NOT REQUIRED */

            if (this.coordExists(this.partOfLinkedCells, dirs[d].r, dirs[d].c))
                continue;
    
            if (!this.isOutsideMatrix(dirs[d].r, dirs[d].c) && this.isOne(this.matrix[dirs[d].r][dirs[d].c]))
                await this._keepLooking(dirs[d].r, dirs[d].c);
        }
    };

    async run(matrix, speed = 500, diagonalSearch = false) {
        this._init(matrix, speed, diagonalSearch);

        for (let r = 0; r < this.mRows; r++) {
            for (let c = 0; c < this.mColumns; c++) {
                if (LinkedCells.isBorder(r, this.mRows, c, this.mColumns) && this.isOne(this.matrix[r][c]))
                    await this._keepLooking(r, c);
            }
        }

        return this.mProcessed;
    }
}

/* *********************************************************************************************************************** */

let generateRandomMatrix = (rows, columns) => {
    let result = [];

    for (let i = 0; i < rows; i++) {
        result[i] = [];

        for (let j = 0; j < columns; j++)
            result[i][j] = Math.round(Math.random() * (1 - 0) + 0);
    }

    return result;
}


let drawMatrix = (m, empty = 0, island = 1) => {
    let table = $('table');
        table.html(''); // Resets the table structure
    let rows = m.length;
    let columns = m[0].length;

    for (let r = 0; r < rows; r++) {
        let _r = $('<tr>');
        table.append(_r);

        for (let c = 0; c < columns; c++) {
            let v = m[r][c] == 0 ? empty : island;
            _r.append(`<td${LinkedCells.isBorder(r, m.length, c, m[0].length) && m[r][c] == 1 ? ` class="border-cell"` : ''}>${v}</td>`);
        }
    }
}
let drawCellClass = (row, column, _class) => {
    let cellEl = $($($('table tr')[row]).find('td')[column]);

    // If the class string name starts with '-' => remove that class
    if (_class.substring(0, 1) != '-')
        cellEl.addClass(_class);
    else
        cellEl.removeClass(_class.substring(1));
}

$(document).ready(() => {
    // The original input array from Clément Mihailescu video
    // (https://www.youtube.com/watch?v=4tYoVx0QoN0)
    // Press any key to load
    $(document).on('keypress', function(e) {
        $('#remove-cells-btn').removeAttr('disabled');

        let cl = [[1,0,0,0,0,0], [0,1,0,1,1,1], [0,0,1,0,1,0], [1,1,0,0,1,0], [1,0,1,1,0,0], [1,0,0,0,0,1]];
        drawMatrix(cl, default0Char, default1Char);
        input = cl;
    });

    let grid = { r: Math.round($(window).height() / 45), c: Math.round($(window).width() / 60) };
    let defaultSpeed = 500;
    //let _rc = win;//winW <= 500 ? 6 : (winW > 500 && winW <= 1024 ? 14 : (winW > 1024 && winW <= 1200 ? 18 : 27));
    let defaultRows = grid.r;//_rc;
    let defaultColumns = grid.c;//_rc;
    let default0Char = '&nbsp;'//'🌊';
    let default1Char = 'x'//'🏝️';

    let btnChangeStatus = (btn, enable) => {
        let b = $(btn);
        if (enable)
            b.removeAttr('disabled');
        else
            b.attr('disabled', true);
    };

    let updateMatrix = (_input) => {
        input = _input;
        drawMatrix(input, default0Char, default1Char);
    }

    $('#random-matrix-btn').on('click', function() {
        btnChangeStatus('#random-matrix-btn', false);
        btnChangeStatus('#clear-matrix-btn', false);
        btnChangeStatus('#remove-cells-btn', true);

        updateMatrix(generateRandomMatrix(defaultRows, defaultColumns));

        btnChangeStatus('#random-matrix-btn', true);
    });
    $('#clear-matrix-btn').on('click', () => {
        btnChangeStatus('#remove-cells-btn', true);
        
        updateMatrix(input);

        btnChangeStatus('#clear-matrix-btn', false);
    });
    $('#remove-cells-btn').on('click', async function() {
        btnChangeStatus('#remove-cells-btn', false);
        btnChangeStatus('#random-matrix-btn', false);
        btnChangeStatus('#enable-diagonal-search', false);
        
        await ir.run(input, parseInt($('#search-speed').val()), $('#enable-diagonal-search').prop('checked'));

        btnChangeStatus('#clear-matrix-btn', true);
        btnChangeStatus('#random-matrix-btn', true);
        btnChangeStatus('#enable-diagonal-search', true);
    });
    
    $('#search-speed').val(defaultSpeed);

    let ir = new LinkedCells();
    let input;
    updateMatrix(generateRandomMatrix(defaultRows, defaultColumns));
});