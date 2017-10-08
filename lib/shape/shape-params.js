class ShapeParams {
	constructor(gl, verts) {
		this.gl = gl;

		this.vertCount = verts.length;
		this.vertBuf = gl.createBuffer();

		this.update(verts);
	}
	update(verts) {
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
