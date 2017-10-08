const {mat4} = require("gl-matrix");

class OrthoCamera {
	constructor(x = 0, y = 0, zoom = 1) {
		this.x = x;
		this.y = y;
		this.zoom = zoom;
		this.aspect = 1;
		this.pMatrix = mat4.create();
		this._recreateMatrix();
	}
	set({x, y, zoom}) {
		let translate = false;
		let deltX = 0;
		let deltY = 0;
		if (x != null && x !== this.x) {
			translate = true;
			deltX = x - this.x;
			this.x = x;
		}
		if (y != null && y !== this.y) {
			translate = true;
			deltY = y - this.y;
			this.y = y;
		}

		if (zoom != null && zoom !== this.zoom) {
			//I'm not sure of a better way to handle this,
			//so just recreate the matrix for now
			//recreating on a change in zoom should be cheap enough
			this.zoom = zoom;
			this._recreateMatrix();
			return;
		}

		if (translate) {
			mat4.translate(this.pMatrix, this.pMatrix, [deltX, deltY, 0]);
		}
	}
	getBounds() {
		const {hw, hh} = this._getHalfDims();

		return {
			x0: this.x - hw,
			x1: this.x + hw,
			y0: this.y - hh,
			y1: this.y + hh,
			w: hw * 2,
			h: hh * 2,
		};
	}
	getMatrix(aspect) {
		if (aspect !== this.aspect) {
			this.aspect = aspect;
			this._recreateMatrix();
		}

		return this.pMatrix;
	}
	_getHalfDims() {
		return {
			hw: this.zoom * this.aspect / 2,
			hh: this.zoom / 2,
		};
	}
	_recreateMatrix() {
		const {hw, hh} = this._getHalfDims();
		const {x, y} = this;
		mat4.ortho(this.pMatrix, x - hw, x + hw, y - hh, y + hh, 0, -1);
	}
}

module.exports = OrthoCamera;
