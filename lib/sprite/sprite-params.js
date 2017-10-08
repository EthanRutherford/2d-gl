const {getTexture} = require("./texture");

class SpriteParams {
	constructor(gl, texCoords, imageData) {
		this.gl = gl;

		this.texBuf = gl.createBuffer();
		this.texture = getTexture(gl, imageData);
		this.drawMode = gl.TRIANGLE_FAN;

		this.update(texCoords);
	}
	update(texCoords) {
		const serialCoords = texCoords.reduce((arr, v) => {
			arr.push(v.x, v.y);
			return arr;
		}, []);

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texBuf);
		this.gl.bufferData(
			this.gl.ARRAY_BUFFER,
			new Float32Array(serialCoords),
			this.gl.STATIC_DRAW,
		);
	}
}

module.exports = SpriteParams;
