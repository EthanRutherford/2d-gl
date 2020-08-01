const ShapeParams = require("./shape-params");

class Shape {
	constructor(verts, drawMode = Shape.triangleFan) {
		this.verts = verts;
		this.drawMode = drawMode;
	}
	update(verts) {
		this.verts = verts;
		if (this.params) {
			this.params.update(verts);
		}
	}
	getParams(gl) {
		if (!this.params) {
			const drawMode = mapDrawMode(gl, this.drawMode);
			this.params = new ShapeParams(gl, this.verts, drawMode);
		}

		return this.params;
	}
	free() {
		this.params.free();
		this.verts = null;
		this.params = null;
	}
}

Shape.points = 0;
Shape.lines = 1;
Shape.lineStrip = 2;
Shape.lineLoop = 3;
Shape.triangles = 4;
Shape.triangleStrip = 5;
Shape.triangleFan = 6;

function mapDrawMode(gl, mode) {
	switch (mode) {
		case Shape.points: return gl.POINTS;
		case Shape.lines: return gl.LINES;
		case Shape.lineStrip: return gl.LINE_STRIP;
		case Shape.lineLoop: return gl.LINE_LOOP;
		case Shape.triangles: return gl.TRIANGLES;
		case Shape.triangleStrip: return gl.TRIANGLE_STRIP;
		case Shape.triangleFan: return gl.TRIANGLE_FAN;
		default: throw new Error(`unknown draw mode: ${mode}`);
	}
}

module.exports = Shape;
