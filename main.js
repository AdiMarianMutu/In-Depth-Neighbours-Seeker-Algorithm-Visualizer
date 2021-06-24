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
    async _keepLooking(r, c, propagationCallback, linkedCellCallback) {
        /* VISUALIZER STUFF - NOT REQUIRED */
        if (this.SPEED_DELAY > 0)
            await this.sleep(this.SPEED_DELAY);
        // Marks the filtered cell
        linkedCellCallback(r, c);
        /* END VISUALIZER STUFF - NOT REQUIRED */

        this.addToPartOfLinkedCells(r, c);
        await this.checkForNeighbors(r, c, propagationCallback, linkedCellCallback);
    }
    async checkForNeighbors(r, c, propagationCallback, linkedCellCallback) {
        const dirs = [
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
        const dirsLen = dirs.length;

        for (let d = 0; d < dirsLen; d++) {
            // If a cell was alredy marked as visited, it's pointless to recalculate everything
            if (this.coordExists(this.cellAlreadyVisited, dirs[d].r, dirs[d].c))
                continue;
            else
                this.cellAlreadyVisited.push({ r:  dirs[d].r, c: dirs[d].c});

            /* VISUALIZER STUFF - NOT REQUIRED */
            propagationCallback(dirs[d].r, dirs[d].c, this.SPEED_DELAY);
            /* END VISUALIZER STUFF - NOT REQUIRED */

            if (this.coordExists(this.partOfLinkedCells, dirs[d].r, dirs[d].c))
                continue;
    
            if (!this.isOutsideMatrix(dirs[d].r, dirs[d].c) && this.isOne(this.matrix[dirs[d].r][dirs[d].c]))
                await this._keepLooking(dirs[d].r, dirs[d].c, propagationCallback, linkedCellCallback);
        }
    };

    async run(matrix, propagationCallback, linkedCellCallback, speed = 500, diagonalSearch = false) {
        this._init(matrix, speed, diagonalSearch);

        for (let r = 0; r < this.mRows; r++) {
            for (let c = 0; c < this.mColumns; c++) {
                if (LinkedCells.isBorder(r, this.mRows, c, this.mColumns) && this.isOne(this.matrix[r][c]))
                    await this._keepLooking(r, c, propagationCallback, linkedCellCallback);
            }
        }

        return this.mProcessed;
    }
}

/* *********************************************************************************************************************** */

const matrixRandomGenerate = (rows, columns) => {
    let result = [];

    for (let i = 0; i < rows; i++) {
        result[i] = [];

        for (let j = 0; j < columns; j++)
            result[i][j] = Math.round(Math.random() * (1 - 0) + 0);
    }

    return result;
}


const matrixDraw = (m, empty = 0, island = 1) => {
    const table = $('table');
        table.html(''); // Resets the table structure
    const rows = m.length;
    const columns = m[0].length;

    for (let r = 0; r < rows; r++) {
        const _r = $('<tr>');
        table.append(_r);

        for (let c = 0; c < columns; c++) {
            const v = m[r][c] == 0 ? empty : island;
            _r.append(`<td${LinkedCells.isBorder(r, m.length, c, m[0].length) && m[r][c] == 1 ? ` class="border-cell"` : ''}>${v}</td>`);
        }
    }
}
const matrixCellClass = (row, column, _class) => {
    const cellEl = $($($('table tr')[row]).find('td')[column]);

    // If the class string name starts with '-' => remove that class
    if (_class.substring(0, 1) != '-')
        cellEl.addClass(_class);
    else
        cellEl.removeClass(_class.substring(1));
}
const matrixDrawPropagationCell = (r, c, speed) => {
    matrixCellClass(r, c, 'propagation');
    if (speed == 0) {
        matrixCellClass(r, c, '-propagation');
        matrixCellClass(r, c, 'visited');
    } else {
        setTimeout(() => {
            matrixCellClass(r, c, '-propagation');
            matrixCellClass(r, c, 'visited');
        }, speed + 100);
    }
}
const matrixDrawLinkedCell = (r, c) => {
    matrixCellClass(r, c, 'part-of-linked-cells');
}

$(document).ready(() => {
    // The original input array from Clément Mihailescu video
    // (https://www.youtube.com/watch?v=4tYoVx0QoN0)
    // Press any key to load
    $(document).on('keypress', function(e) {
        $('#remove-cells-btn').removeAttr('disabled');

        updateMatrix([[1,0,0,0,0,0], [0,1,0,1,1,1], [0,0,1,0,1,0], [1,1,0,0,1,0], [1,0,1,1,0,0], [1,0,0,0,0,1]]);
    });

    const grid = { r: Math.round((window.innerHeight - 235) / 28), c: Math.round(window.innerWidth / 11) };
    const defaultSpeed = 500;
    const defaultRows = grid.r;
    const defaultColumns = grid.c;
    const default0Char = '&nbsp;';
    const default1Char = 'x';

    const btnChangeStatus = (btn, enable) => {
        let b = $(btn);
        if (enable)
            b.removeAttr('disabled');
        else
            b.attr('disabled', true);
    };

    const updateMatrix = (_input) => {
        input = _input;
        matrixDraw(input, default0Char, default1Char);
    }

    /* NEW RANDOM MATRIX BTN */
    $('#random-matrix-btn').on('click', function() {
        btnChangeStatus('#random-matrix-btn', false);
        btnChangeStatus('#clear-matrix-btn', false);
        btnChangeStatus('#remove-cells-btn', true);

        updateMatrix(matrixRandomGenerate(defaultRows, defaultColumns));

        btnChangeStatus('#random-matrix-btn', true);
    });
    /* CLEAR MATRIX BTN */
    $('#clear-matrix-btn').on('click', () => {
        btnChangeStatus('#remove-cells-btn', true);
        
        updateMatrix(input);

        btnChangeStatus('#clear-matrix-btn', false);
    });
    /* HIGHLIGHT CELLS BTN */
    $('#remove-cells-btn').on('click', async function() {
        btnChangeStatus('#remove-cells-btn', false);
        btnChangeStatus('#random-matrix-btn', false);
        btnChangeStatus('#enable-diagonal-search', false);
        
        await ir.run(input, matrixDrawPropagationCell, matrixDrawLinkedCell, parseInt($('#search-speed').attr('delay-ms')), $('#enable-diagonal-search').prop('checked'));

        btnChangeStatus('#clear-matrix-btn', true);
        btnChangeStatus('#random-matrix-btn', true);
        btnChangeStatus('#enable-diagonal-search', true);
    });
    /* SPEED SLIDER  */
    $('#search-speed').val(4);
    $('#search-speed').on('input', function() {
        const t = $(this);
        const v = t.val();
        let sInt = -1;
        let sStr = '';

        switch (true) {
            case v == 1:
                sStr = 'Slow Motion';
                sInt = 60000;
            break;
            case v == 2:
                sStr = 'Slowest';
                sInt = 20000;
            break;
            case v == 3:
                sStr = 'Slow';
                sInt = 6000;
            break;
            case v == 4:
                sStr = 'Normal';
                sInt = 3500;
            break;
            case v == 5:
                sStr = 'Fast';
                sInt = 1500;
            break;
            case v == 6:
                sStr = 'Super fast';
                sInt = 100;
            break;
            case v == 7:
                sStr = 'Instant';
                sInt = 0;
            break;
        }

        t.attr('delay-ms', sInt);
        $('label[for="search-speed"]').text(`Speed: ${sStr}`);
    });

    const ir = new LinkedCells();
    let input;
    updateMatrix(matrixRandomGenerate(defaultRows, defaultColumns));
});