const Renderable = require("../core/renderable");
const VectorParams = require("./vector-params");
const VectorShader = require("./vector-shader");

class VectorShape {
	constructor(verts, colors) {
		if (verts.length < 3) {
			throw new Error("shape must have at least three verts");
		}
		if (verts.length !== colors.length) {
			throw new Error("vertex and color count must match");
		}

		this.verts = verts;
		this.colors = colors;
	}
	getInstance(gl) {
		if (!this.params) {
			this.params = new VectorParams(gl, this.verts, this.colors);
		}

		return new Renderable(VectorShader, this.params);
	}
}

module.exports = VectorShape;
