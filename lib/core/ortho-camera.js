const {mat4} = require("gl-matrix");

class OrthoCamera {
	constructor(x = 0, y = 0, zoom = 1) {
		this._x = x;
		this._y = y;
		this._zoom = zoom;
		this._dirty = false;
		this._aspect = 1;
		this._pMatrix = mat4.create();
		this._recreateMatrix();
	}
	get x() {
		return this._x;
	}
	set x(value) {
		if (this._x !== value) {
			this._x = value;
			this._dirty = true;
		}
	}
	get y() {
		return this._y;
	}
	set y(value) {
		if (this._y !== value) {
			this._y = value;
			this._dirty = true;
		}
	}
	get zoom() {
		return this._zoom;
	}
	set zoom(value) {
		if (this._zoom !== value) {
			this._zoom = value;
			this._dirty = true;
		}
	}
	set({x, y, zoom}) {
		if (x != null) this.x = x;
		if (y != null) this.y = y;
		if (zoom != null) this.zoom = zoom;
	}
	getBounds() {
		const {hw, hh} = this._getHalfDims();

		return {
			x0: this._x - hw,
			x1: this._x + hw,
			y0: this._y - hh,
			y1: this._y + hh,
			w: hw * 2,
			h: hh * 2,
		};
	}
	getMatrix(aspect) {
		if (aspect !== this._aspect) {
			this._aspect = aspect;
			this._dirty = true;
		}

		this._recreateMatrix();

		return this._pMatrix;
	}
	_getHalfDims() {
		return {
			hw: this._zoom * this._aspect / 2,
			hh: this._zoom / 2,
		};
	}
	_recreateMatrix() {
		if (!this._dirty) {
			return;
		}

		this._dirty = false;
		const {hw, hh} = this._getHalfDims();
		const {x, y} = this;
		mat4.ortho(this._pMatrix, x - hw, x + hw, y - hh, y + hh, 0, -1);
	}
}

module.exports = OrthoCamera;
