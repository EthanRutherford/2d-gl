const ShapeParams = require("./shape-params");

class Shape {
	constructor(verts) {
		this.verts = verts;
	}
	getParams(gl) {
		if (!this.params) {
			this.params = new ShapeParams(gl, this.verts);
		}

		return this.params;
	}
}

module.exports = Shape;
