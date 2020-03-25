let acc = 0;

class Renderable {
	constructor(shader, params) {
		this.id = acc++;
		this.shader = shader;
		this.params = params;

		this.x = 0;
		this.y = 0;
		this.r = 0;
		this.zIndex = 0;
	}
	// overload to add children
	getChildren() {
		return [];
	}
}

module.exports = Renderable;
