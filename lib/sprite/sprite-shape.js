const Renderable = require("../core/renderable");
const SpriteParams = require("./sprite-params");
const SpriteShader = require("./sprite-shader");

class SpriteShape {
	constructor(verts, texCoords, imageData) {
		if (verts.length < 3) {
			throw new Error("shape must have at least three verts");
		}
		if (verts.length !== texCoords.length) {
			throw new Error("vertex and texCoord count must match");
		}

		this.verts = verts;
		this.texCoords = texCoords;
		this.imageData = imageData;
		this.shaderType = SpriteShader;
	}
	getInstance(gl, shader) {
		if (!this.params) {
			this.params = new SpriteParams(gl, this.verts, this.texCoords, this.imageData);
		}

		return new Renderable(shader, this.params);
	}
}

module.exports = SpriteShape;
