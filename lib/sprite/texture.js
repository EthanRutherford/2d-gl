const textures = new Map();

function getTexture(gl, imageData, smoothScaling) {
	if (!textures.has(imageData)) {
		const texture = gl.createTexture();

		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageData);

		const magFilter = smoothScaling ? gl.LINEAR : gl.NEAREST;
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
		gl.generateMipmap(gl.TEXTURE_2D);

		textures.set(imageData, texture);
	}

	return textures.get(imageData);
}

module.exports = {
	getTexture,
};
