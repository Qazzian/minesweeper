
const STATES = {
	HIDDEN: '-',
	FLAG: 'F',
	QUESTION: '?',
	CLEAR: 'C',
	HIT: 'H',
	WRONG: 'W',
	MINE: 'M',
};


class Minesweeper {
	constructor() {
		this.inPlay = false;
		this.hasWon = false;
		this.gridWidth = 20;
		this.gridHeight = 10;
		this.spotCount = this.gridHeight * this.gridWidth;
		this.mineCount = 10;

		this.grid = [];

		this.userMessage = document.getElementById('userMessage');

		this.gridContainer = document.getElementById('grid');
		this.gridContainer.addEventListener('mousedown', (event) => this.clickHandler(event));

		this.resetButton = document.getElementById('reset');
		this.resetButton.addEventListener('click', () => this.reset());
	}

	getSpot(x, y) {
		if (0<=x && x<this.gridWidth && 0 <= y && y < this.gridHeight) {
			return this.grid[y][x];
		}
	}

	setSpot(x, y, spot) {
		this.grid[y][x] = spot;
	}

	reset() {
		this.gridContainer.innerHTML = '';

		for (let row=0; row<this.gridHeight; row++) {
			this.grid[row] = [];
			for (let col=0; col<this.gridWidth; col++) {
				this.setSpot(col, row, new Spot(false, col, row));
			}
		}

		let m = this.mineCount;
		while (m > 0) {
			const col = this.getRandomInt(this.gridWidth);
			const row = this.getRandomInt(this.gridHeight);
			const spot = this.getSpot(col, row)
			if (!spot.isMine) {
				spot.isMine = true;
				this.getAdjacent(col, row).forEach((spot) => {spot.adjacents += 1;});
				m--;
			}
		}

		this.inPlay = true;
		this.hasWon = false;
		this.render();
	}

	clickHandler(event) {
		const elmt = event.target;
		if (!elmt.classList.contains('spot')) {
			return;
		}

		event.preventDefault();

		if (!this.inPlay) {
			return;
		}

		const spot = this.getSpot(elmt.dataset.x, elmt.dataset.y);
		switch (event.which) {
			case 1:
				this.handelReveal(spot, event);
				break;
			case 3:
				this.handelFlag(spot, event);
				break;
		}

		if (this.checkHasWon()) {
			this.hasWon = true;
			this.endGame();
		}
	}

	handelReveal (spot, event) {
		const withShift = !!event.shiftKey;
		console.info(spot, event);
		if (withShift && spot.state === STATES.CLEAR) {
			this.expandSpot(spot);
		}
		else {
			this.revealSpot(spot);
		}

		this.render();
	}

	handelFlag(spot, event) {
		switch(spot.state) {
			case STATES.HIDDEN:
			case STATES.FLAG:
			case STATES.QUESTION:
				spot.flag();
				this.render();
				break;
			default:
				break;
		}
	}

	revealSpot(spot) {
		if (spot.state !== STATES.HIDDEN) {
			return;
		}

		if (spot.isMine) {
			return this.endGame();
		}

		spot.state = STATES.CLEAR;
		if (spot.adjacents === 0) {
			this.getAdjacent(spot.x, spot.y).forEach((aSpot) => {this.revealSpot(aSpot)});
		}
	}

	expandSpot(spot) {
		if (spot.state !== STATES.CLEAR) {
			return;
		}
		console.info('expand ', spot);
		const adj = this.getAdjacent(spot.x, spot.y);
		const flagCount = adj.filter((adjSpot) => {
			return adjSpot.state === STATES.FLAG;
		}).length;
		if (flagCount === spot.adjacents) {
			adj.forEach((spot) => {
				console.info('reveal ', spot);
				this.revealSpot(spot);
			});
		}
	}

	getAdjacent(x, y) {
		const adjacentSpots = [];
		adjacentSpots.push(this.getSpot(x-1, y-1));
		adjacentSpots.push(this.getSpot(x, y-1));
		adjacentSpots.push(this.getSpot(x+1, y-1));
		adjacentSpots.push(this.getSpot(x-1, y));
		adjacentSpots.push(this.getSpot(x+1, y));
		adjacentSpots.push(this.getSpot(x-1, y+1));
		adjacentSpots.push(this.getSpot(x, y+1));
		adjacentSpots.push(this.getSpot(x+1, y+1));
		return adjacentSpots.filter((spot) => spot !== undefined);
	}

	iterGrid(grid, callback) {
		this.grid.forEach((gridRow) => {
			gridRow.forEach((spot) => {
				callback(spot);
			})
		});
	}

	endGame() {
		this.inPlay = false;
		this.grid.forEach((gridRow) => {
			gridRow.forEach((spot) => {
				if (spot.state === STATES.FLAG && !spot.isMine) {
					spot.state = STATES.WRONG;
				}
				else if (spot.isMine) {
					spot.state = STATES.MINE;
				}
			})
		});

		this.render();
	}

	checkHasWon() {
		let count = 0;

		this.iterGrid(this.grid, (spot) => {
			if (spot.state === STATES.CLEAR) {
				count += 1;
			}
		});

		console.info('checkHasWon: ', count, this.spotCount, this.mineCount);

		if (count === this.spotCount - this.mineCount) {
			return true;
		}
	}

	render() {
		const gridStr = this.grid.map((row) => {
			return row.map((spot) => {
				return spot.render();
			}).join('');
		}).join('</div><div class="grid-row">');
		this.gridContainer.innerHTML = `<div class="grid-row">${gridStr}</div>`;

		this.renderMessage();
	}

	renderMessage() {
		this.userMessage.innerText = '';
		console.info(this.inPlay, this.hasWon);

		if (this.inPlay) {
			let flagCount = 0;
			this.iterGrid(this.grid, (spot) => {
				if (spot.state === STATES.FLAG) { flagCount += 1; }
			});
			this.userMessage.innerText = `Found ${flagCount} of ${this.mineCount}`;
		}
		else if (this.hasWon) {
			this.userMessage.innerText = 'You WIN!';
		}
		else {
			this.userMessage.innerText = 'You lose';
		}
	}

	getRandomInt(max) {
		return Math.floor(Math.random() * max);
	}
}

class Spot{
	constructor(isMine, x, y) {
		this.isMine = isMine;
		this.state = STATES.HIDDEN;
		this.adjacents = 0;
		this.x = x;
		this.y = y;
	}

	flag() {
		switch (this.state) {
			case STATES.HIDDEN:
				this.state = STATES.FLAG;
				break;
			case STATES.FLAG:
				this.state = STATES.QUESTION;
				break;
			default:
				this.state = STATES.HIDDEN;
		}

		return this.state;
	}

	render() {
		let icon = '';
		let classList = ['spot'];

		switch (this.state) {
			case STATES.FLAG:
				classList.push('icon icon-flag1');
				classList.push('flag');
				break;
			case STATES.QUESTION:
				icon = '?';
				break;
			case STATES.HIT:
				classList.push('icon icon-bomb');
				classList.push('mine');
				classList.push('hit');
				break;
			case STATES.WRONG:
				classList.push('icon icon-bomb');
				classList.push('icon-close1');
				break;
			case STATES.MINE:
				classList.push('icon icon-bomb');
				break;
			case STATES.CLEAR:
				icon = this.adjacents ? this.adjacents : '';
				classList.push('spot-clear');
				classList.push(`adj-${this.adjacents}`);
				break;
			case STATES.HIDDEN:
			default:
				icon = '';
		}

		return `<span class="${classList.join(' ')}" data-x="${this.x}" data-y="${this.y}">${icon}</span>`;
	}
}

window.game = new Minesweeper();