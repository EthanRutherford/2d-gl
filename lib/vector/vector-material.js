const VectorParams = require("./vector-params");
const VectorShader = require("./vector-shader");

class VectorMaterial {
	constructor(colors) {
		this.colors = colors;
		this.shaderType = VectorShader;
	}
	update(colors) {
		this.colors = colors;
		if (this.params) {
			this.params.update(colors);
		}
	}
	getParams(gl) {
		if (!this.params) {
			this.params = new VectorParams(gl, this.colors);
		}

		return this.params;
	}
	free() {
		this.params.free();
		this.colors = null;
		this.params = null;
	}
}

module.exports = VectorMaterial;
