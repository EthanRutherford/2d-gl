const ShapeParams = require("./shape-params");

class Shape {
	constructor(verts) {
		this.verts = verts;
	}
	update(verts) {
		this.verts = verts;
		if (this.params) {
			this.params.update(verts);
		}
	}
	getParams(gl) {
		if (!this.params) {
			this.params = new ShapeParams(gl, this.verts);
		}

		return this.params;
	}
}

module.exports = Shape;
