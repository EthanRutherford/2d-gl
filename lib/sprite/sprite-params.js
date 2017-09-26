class SpriteParams {
	constructor(gl, verts, texCoords, imageData) {
		const serialVerts = verts.reduce((arr, v) => {
			arr.push(v.x, v.y);
			return arr;
		}, []);
		const serialCoords = texCoords.reduce((arr, v) => {
			arr.push(v.x, v.y);
			return arr;
		}, []);

		this.vertCount = verts.length;
		this.vertBuf = gl.createBuffer();
		this.texBuf = gl.createBuffer();
		this.texture = gl.createTexture();
		this.drawMode = gl.TRIANGLE_FAN;

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuf);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(serialVerts), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuf);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(serialCoords), gl.STATIC_DRAW);

		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageData);

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
		gl.generateMipmap(gl.TEXTURE_2D);
	}
}

module.exports = SpriteParams;
