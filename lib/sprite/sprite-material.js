const SpriteParams = require("./sprite-params");
const SpriteShader = require("./sprite-shader");

class SpriteMaterial {
	constructor(texCoords, imageData, smoothScaling = true) {
		this.texCoords = texCoords;
		this.imageData = imageData;
		this.smoothScaling = smoothScaling;
		this.shaderType = SpriteShader;
	}
	update(texCoords) {
		this.texCoords = texCoords;
		if (this.params) {
			this.params.update(texCoords);
		}
	}
	getParams(gl) {
		if (!this.params) {
			this.params = new SpriteParams(gl, this.texCoords, this.imageData, this.smoothScaling);
		}

		return this.params;
	}
}

module.exports = SpriteMaterial;
