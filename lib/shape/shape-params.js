class ShapeParams {
	constructor(gl, verts) {
		const serialVerts = verts.reduce((arr, v) => {
			arr.push(v.x, v.y);
			return arr;
		}, []);

		this.vertCount = verts.length;
		this.vertBuf = gl.createBuffer();

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuf);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(serialVerts), gl.STATIC_DRAW);
	}
}

module.exports = ShapeParams;
