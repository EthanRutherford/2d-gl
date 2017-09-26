class VectorParams {
	constructor(gl, verts, colors) {
		const serialVerts = verts.reduce((arr, v) => {
			arr.push(v.x, v.y);
			return arr;
		}, []);
		const serialColors = colors.reduce((arr, c) => {
			arr.push(c.r, c.g, c.b, c.a);
			return arr;
		}, []);

		this.vertCount = verts.length;
		this.vertBuf = gl.createBuffer();
		this.colorBuf = gl.createBuffer();
		this.drawMode = gl.TRIANGLE_FAN;

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuf);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(serialVerts), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuf);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(serialColors), gl.STATIC_DRAW);
	}
}

module.exports = VectorParams;
