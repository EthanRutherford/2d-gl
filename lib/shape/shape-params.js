class ShapeParams {
	constructor(gl, verts, drawMode) {
		this.gl = gl;

		this.vertCount = verts.length;
		this.center = [0, 0];
		this.vertBuf = gl.createBuffer();
		this.drawMode = drawMode;

		this.update(verts);
	}
	update(verts) {
		this.center[0] = 0;
		this.center[1] = 0;
		for (const vert of verts) {
			this.center[0] += vert.x;
			this.center[1] += vert.y;
		}

		this.center[0] /= verts.length;
		this.center[1] /= verts.length;

		const serialVerts = verts.reduce((arr, v) => {
			arr.push(v.x, v.y);
			return arr;
		}, []);

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertBuf);
		this.gl.bufferData(
			this.gl.ARRAY_BUFFER,
			new Float32Array(serialVerts),
			this.gl.STATIC_DRAW,
		);
	}
}

module.exports = ShapeParams;
