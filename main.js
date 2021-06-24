class LinkedCells {
    // The algorithm is slowed down with sleep by purpose to better show the visualizer
    // I don't really know what kinda of algorithm I've written, I don't have much experience with algorithms
    // So i'm just gonna call it In Depth Neighbors Seeker
    // But it is just a simple recursion method which runs until there are no more values to be filtered
    // It took me ~5 hours to come with this solution
    // You can find different version of this challenge online, just search "cell grid count or linked cells" and so on

    constructor() {
        this.ABORT = false;
        // The searching delay
        this.SPEED_DELAY;
        // Enables also diagonal search (the original challenge didn't require this, but it is a small easy upgrade)
        this.DIAGONAL_SEARCH;
        // The input matrix
        this.matrix;
        this.mRows;
        this.mColumns;
        // Dictionary
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
        this.cellAlreadyVisited = {};
        this.mProcessed = [...Array(this.mRows)].map(e => Array(this.mColumns).fill(0));
    }
    static isBorder(r, rMax, c, cMax) { return (r == 0 || r == rMax - 1) || (c == 0 || c == cMax - 1); }
    isOne(n) { return n == 1; }
    isOutsideMatrix(r, c) { return (r < 0 || r > this.mRows - 1) || (r < 0 && (c < 0 || c > this.mColumns - 1)); }
    coordExists(dictionary, r, c) { return dictionary[`k${r}_${c}`] == `${r}_${c}`; }
    // Used for recursion
    // Called when a 1 is found
    async _keepLooking(r, c, propagationCallback, linkedCellCallback) {
        if (this.ABORT)
            return;

        /* VISUALIZER STUFF - NOT MANDATORY */
        if (this.SPEED_DELAY > 0)
            await this.sleep(this.SPEED_DELAY);
        // Marks the filtered cell
        linkedCellCallback(r, c);
        /* END VISUALIZER STUFF - NOT MANDATORY */
        
        this.mProcessed[r][c] = 1;
        this.cellAlreadyVisited[`k${r}_${c}`] = `${r}_${c}`;
        await this.checkForNeighbors(r, c, propagationCallback, linkedCellCallback);
    }
    async checkForNeighbors(r, c, propagationCallback, linkedCellCallback) {
        if (this.ABORT)
            return;

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

            /* VISUALIZER STUFF - NOT MANDATORY */
            propagationCallback(dirs[d].r, dirs[d].c, this.SPEED_DELAY);
            /* END VISUALIZER STUFF - NOT MANDATORY */

            if (!this.isOutsideMatrix(dirs[d].r, dirs[d].c) && this.isOne(this.matrix[dirs[d].r][dirs[d].c]))
                await this._keepLooking(dirs[d].r, dirs[d].c, propagationCallback, linkedCellCallback);
        }
    };

    async run(matrix, propagationCallback, linkedCellCallback, speed = 500, diagonalSearch = false) {
        this._init(matrix, speed, diagonalSearch);

        for (let r = 0; r < this.mRows; r++) {
            if (this.ABORT)
                return;

            for (let c = 0; c < this.mColumns; c++) {
                if (this.ABORT)
                    return;

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
        $('#highlight-cells-btn').removeAttr('disabled');

        updateMatrix([[1,0,0,0,0,0], [0,1,0,1,1,1], [0,0,1,0,1,0], [1,1,0,0,1,0], [1,0,1,1,0,0], [1,0,0,0,0,1]]);
    });

    const grid = { r: Math.round((window.innerHeight - 235) / 28), c: Math.round(window.innerWidth / 11) };
    const defaultSpeed = 4;
    const defaultRows = grid.r;
    const defaultColumns = grid.c;
    const default0Char = '&nbsp;';
    const default1Char = 'x';

    const btnStatus = (btns) => {
        btns.forEach((b) => {
            const a = b.act.str;
            const v = b.act.val;
            const s = b.sel;

            if (a == 'enable')
                switch (v) {
                    case true: $(s).removeAttr('disabled'); break;
                    case false: $(s).attr('disabled', true); break;
                }
            else if (a == 'display')
                switch (v) {
                    case true: $(s).removeClass('d-none'); break;
                    case false: $(s).addClass('d-none'); break;
                }
        });
    };

    const btnHighlightEnable = (yes) => {
        if (yes) {
            btnStatus([
                {
                    sel: '#highlight-cells-btn',
                    act: { str: 'enable', val: true }
                },
                {
                    sel: '#highlight-cells-btn',
                    act: { str: 'display', val: true }
                },
                {
                    sel: '#highlight-cells-abort-btn',
                    act: { str: 'display', val: false }
                }
            ]);
        } else {
            btnStatus([
                {
                    sel: '#highlight-cells-btn',
                    act: { str: 'display', val: false }
                },
                {
                    sel: '#highlight-cells-abort-btn',
                    act: { str: 'enable', val: true }
                },
                {
                    sel: '#highlight-cells-abort-btn',
                    act: { str: 'display', val: true }
                },
            ]);
        }
    }

    const updateMatrix = (_input) => {
        input = _input;
        matrixDraw(input, default0Char, default1Char);
    }

    /* NEW RANDOM MATRIX BTN */
    $('#random-matrix-btn').on('click', () => {
        btnStatus([
            {
                sel: '#random-matrix-btn',
                act: { str: 'enable', val: false }
            },
            {
                sel: '#clear-matrix-btn',
                act: { str: 'enable', val: false }
            }
        ]);
        btnHighlightEnable(true);
        updateMatrix(matrixRandomGenerate(defaultRows, defaultColumns));
        btnStatus([
            {
                sel: '#random-matrix-btn',
                act: { str: 'enable', val: true }
            }
        ]);
    });
    /* CLEAR MATRIX BTN */
    $('#clear-matrix-btn').on('click', () => {
        btnHighlightEnable(true);
        updateMatrix(input);
        btnStatus([
            {
                sel: '#clear-matrix-btn',
                act: { str: 'enable', val: false }
            }
        ]);
    });
    /* HIGHLIGHT CELLS BTN */
    $('#highlight-cells-btn').on('click', async () => {
        btnHighlightEnable(false);
        btnStatus([
            {
                sel: '#random-matrix-btn',
                act: { str: 'enable', val: false }
            },
            {
                sel: '#enable-diagonal-search',
                act: { str: 'enable', val: false }
            }
        ]);
        
        await linkedCells.run(input, matrixDrawPropagationCell, matrixDrawLinkedCell, parseInt($('#search-speed').attr('delay-ms')), $('#enable-diagonal-search').prop('checked'));

        btnStatus([
            {
                sel: '#clear-matrix-btn',
                act: { str: 'enable', val: true }
            },
            {
                sel: '#random-matrix-btn',
                act: { str: 'enable', val: true }
            },
            {
                sel: '#enable-diagonal-search',
                act: { str: 'enable', val: true }
            },
            {
                sel: '#highlight-cells-abort-btn',
                act: { str: 'enable', val: false }
            }
        ]);

        linkedCells.ABORT = false;
    });
    /* HIGHLIGHT CELLS ABORT BTN */
    $('#highlight-cells-abort-btn').on('click', () => { linkedCells.ABORT = true; });
    /* SPEED SLIDER  */
    $('#search-speed').val(defaultSpeed);
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

    const linkedCells = new LinkedCells();
    let input;
    updateMatrix(matrixRandomGenerate(defaultRows, defaultColumns));
});