const Renderable = require("../core/renderable");
const SpriteParams = require("./sprite-params");
const SpriteShader = require("./sprite-shader");

class SpriteMaterial {
	constructor(texCoords, imageData) {
		this.texCoords = texCoords;
		this.imageData = imageData;
		this.shaderType = SpriteShader;
		this.renderableType = Renderable;
	}
	getParams(gl) {
		if (!this.params) {
			this.params = new SpriteParams(gl, this.texCoords, this.imageData);
		}

		return this.params;
	}
}

module.exports = SpriteMaterial;
