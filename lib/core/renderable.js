let acc = 0;

class Renderable {
	constructor(shaderType, params) {
		this.id = acc++;
		this.shaderType = shaderType;
		this.params = params;

		this.x = 0;
		this.y = 0;
		this.r = 0;
	}
}

module.exports = Renderable;
