class VectorParams {
	constructor(gl, colors) {
		this.gl = gl;

		this.colorBuf = gl.createBuffer();

		this.update(colors);
	}
	update(colors) {
		const serialColors = colors.reduce((arr, c) => {
			arr.push(c.r, c.g, c.b, c.a);
			return arr;
		}, []);

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuf);
		this.gl.bufferData(
			this.gl.ARRAY_BUFFER,
			new Float32Array(serialColors),
			this.gl.STATIC_DRAW,
		);
	}
	free() {
		this.gl.deleteBuffer(this.colorBuf);
	}
}

module.exports = VectorParams;
