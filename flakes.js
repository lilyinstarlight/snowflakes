window.Snow = function (element, rate, spawn, horizontal, vertical, size, characters, colors) {
	this.element = element;

	this.rate = rate || 30;

	this.delay = 1000/this.rate;

	this.spawn = spawn || 2;

	this.horizontal = horizontal || [-10, 30];
	this.vertical = vertical || [50, 100];

	this.size = size || [10, 14];

	this.characters = characters || ['\u2744', '\u2745', '\u2746'];
	this.colors = colors || ['#f2aeda', '#77b7ef', '#f2f2f2'];

	this.free = [];
	this.used = [];

	this.spawning = false;
	this.falling = false;

	this.state = 'stopped';

	this.timeout = null;
};

window.Snow.prototype.genSpawn = function () {
	return Math.floor(Math.random()*(this.spawn/10 + 1));
};

window.Snow.prototype.genLoc = function (speed, size) {
	var choice = Math.random()*(Math.abs(speed[0]) + Math.abs(speed[1])) > Math.abs(speed[0]);

	if (speed[0] > 0) {
		if (speed[1] > 0)
			edge = choice ? 'top' : 'left';
		else
			edge = choice ? 'bottom' : 'left';
	}
	else {
		if (speed[1] > 0)
			edge = choice ? 'top' : 'right';
		else
			edge = choice ? 'bottom' : 'right';
	}

	if (edge === 'top')
		return [Math.floor(Math.random()*this.element.offsetWidth), -size];
	else if (edge === 'left')
		return [-size, Math.floor(Math.random()*this.element.offsetHeight)];
	else if (edge === 'right')
		return [this.element.offsetWidth, Math.floor(Math.random()*this.element.offsetHeight)];
	else if (edge === 'bottom')
		return [Math.floor(Math.random()*this.element.offsetWidth), this.element.offsetHeight];
};

window.Snow.prototype.genSpeed = function () {
	return [Math.floor(Math.random()*(this.horizontal[1] + 1 - this.horizontal[0]) + this.horizontal[0])/this.rate, Math.floor(Math.random()*(this.vertical[1] + 1 - this.vertical[0]) + this.vertical[0])/this.rate];
};

window.Snow.prototype.genSize = function () {
	return Math.floor(Math.random()*(this.size[1] + 1 - this.size[0]) + this.size[0]);
};

window.Snow.prototype.genCharacter = function () {
	return this.characters[Math.floor(Math.random()*this.characters.length)]
};

window.Snow.prototype.genColor = function () {
	return this.colors[Math.floor(Math.random()*this.colors.length)]
};

window.Snow.prototype.update = function () {
	if (this.state === 'snowing') {
		this.spawning = true;
		this.falling = true;
	}
	else if (this.state === 'stopping') {
		this.spawning = false;

		if (this.used.length === 0) {
			this.falling = false;

			this.clear();

			this.state = 'stopped';
		}
	}
	else if (this.state === 'paused' || this.state === 'stopped') {
		if (this.timeout !== null) {
			clearInterval(this.timeout);
			this.timeout = null;
		}
	}
};

window.Snow.prototype.tick = function () {
	this.update();

	if (this.spawning) {
		var spawn = this.genSpawn();
		for (var idx = 0; idx < spawn; idx++) {
			if (this.free.length > 0) {
				var flake = this.free.pop();

				var speed = this.genSpeed();
				var size = this.genSize();
				var character = this.genCharacter();
				var color = this.genColor();

				var loc = this.genLoc(speed, size);

				flake.update(loc, speed, size, character, color);
				flake.show();

				this.used.push(flake);
			}
			else {
				var speed = this.genSpeed();
				var size = this.genSize();
				var character = this.genCharacter();
				var color = this.genColor();

				var loc = this.genLoc(speed, size);

				var flake = new window.Snow.Flake(this.element, loc, speed, size, character, color);

				this.used.push(flake);
			}
		}
	}

	if (this.falling) {
		var nidx = 0;

		this.used.forEach(function (item, idx) {
			if (item.tick()) {
				if (idx != nidx)
					this.used[nidx] = item;

				nidx++;
			}
			else {
				item.hide();
				this.free.push(item);
			}
		}, this);

		this.used.length = nidx;
	}
};

window.Snow.prototype.draw = function () {
	this.used.forEach(function (item) {
		item.draw();
	}, this);
};

window.Snow.prototype.clear = function () {
	this.free.forEach(function (item) {
		item.destroy();
	});

	this.used.forEach(function (item) {
		item.destroy();
	});

	this.free = [];
	this.used = [];

	this.draw();
};

window.Snow.prototype.loop = function () {
	this.tick();
	this.draw();
};

window.Snow.prototype.start = function () {
	if (this.timeout === null) {
		this.state = 'snowing';

		this.timeout = setInterval(this.loop.bind(this), this.delay);
	}
};

window.Snow.prototype.stop = function () {
	if (this.timeout !== null) {
		this.state = 'stopping';
	}
};

window.Snow.prototype.pause = function () {
	if (this.timeout !== null) {
		this.state = 'paused';
	}
};

window.Snow.Flake = function (pelement, loc, speed, size, character, color) {
	this.element = document.createElement('span');

	this.element.style.position = 'absolute';
	this.element.style.zIndex = 9001;
	this.element.style.pointerEvents = 'none';
	this.element.style.overflow = 'hidden';

	this.update(loc, speed, size, character, color);

	pelement.appendChild(this.element);
};

window.Snow.Flake.prototype.update = function (loc, speed, size, character, color) {
	this.loc = loc;
	this.speed = speed;
	this.size = size;
	this.character = character;
	this.color = color;

	this.element.style.left = Math.floor(this.loc[0]).toString() + 'px';
	this.element.style.top = Math.floor(this.loc[1]).toString() + 'px';

	this.element.style.fontSize = Math.floor(this.size).toString() + 'px';

	this.element.innerText = character;

	this.element.style.color = color;
};

window.Snow.Flake.prototype.show = function () {
	this.element.style.display = 'initial';
};

window.Snow.Flake.prototype.hide = function () {
	this.element.style.display = 'none';
};

window.Snow.Flake.prototype.destroy = function () {
	this.element.parentElement.removeChild(this.element);
};

window.Snow.Flake.prototype.tick = function () {
	this.loc[0] += this.speed[0];
	this.loc[1] += this.speed[1];

	return this.loc[0] <= this.element.parentElement.offsetWidth && this.loc[1] <= this.element.parentElement.offsetHeight && this.loc[0] >= -this.size && this.loc[1] >= -this.size;
};

window.Snow.Flake.prototype.draw = function () {
	this.element.style.left = Math.floor(this.loc[0]).toString() + 'px';
	this.element.style.top = Math.floor(this.loc[1]).toString() + 'px';
};
