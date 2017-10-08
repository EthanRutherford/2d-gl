const Renderable = require("../core/renderable");
const VectorParams = require("./vector-params");
const VectorShader = require("./vector-shader");

class VectorMaterial {
	constructor(colors, drawMode = VectorMaterial.triangleFan) {
		this.colors = colors;
		this.shaderType = VectorShader;
		this.renderableType = Renderable;
		this.drawMode = drawMode;
	}
	getParams(gl) {
		if (!this.params) {
			const drawMode = mapDrawMode(gl, this.drawMode);
			this.params = new VectorParams(gl, this.colors, drawMode);
		}

		return this.params;
	}
}

VectorMaterial.triangleFan = 0;
VectorMaterial.lineLoop = 1;
VectorMaterial.lineStrip = 2;
VectorMaterial.points = 3;

function mapDrawMode(gl, mode) {
	switch (mode) {
		case VectorMaterial.triangleFan: return gl.TRIANGLE_FAN;
		case VectorMaterial.lineLoop: return gl.LINE_LOOP;
		case VectorMaterial.lineStrip: return gl.LINE_STRIP;
		case VectorMaterial.points: return gl.POINTS;
		default: return gl.TRIANGLE_FAN;
	}
}

module.exports = VectorMaterial;
