class VectorParams {
	constructor(gl, colors, drawMode) {
		const serialColors = colors.reduce((arr, c) => {
			arr.push(c.r, c.g, c.b, c.a);
			return arr;
		}, []);

		this.colorBuf = gl.createBuffer();
		this.drawMode = drawMode;

		gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuf);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(serialColors), gl.STATIC_DRAW);
	}
}

module.exports = VectorParams;
