const {getTexture} = require("./texture");

class SpriteParams {
	constructor(gl, texCoords, imageData) {
		const serialCoords = texCoords.reduce((arr, v) => {
			arr.push(v.x, v.y);
			return arr;
		}, []);

		this.texBuf = gl.createBuffer();
		this.texture = getTexture(gl, imageData);
		this.drawMode = gl.TRIANGLE_FAN;

		gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuf);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(serialCoords), gl.STATIC_DRAW);
	}
}

module.exports = SpriteParams;
