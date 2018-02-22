class Scene {
	constructor({renderables, getVisibleFunc, bgColor}) {
		this.getVisibleFunc = getVisibleFunc || (() => [...this.renderables]);
		this.renderables = new Set(renderables);
		this.bgColor = bgColor;

		this.postProcessing = [];
	}
	addPostProcShader(shader) {
		this.postProcessing.push(shader);
	}
	removePostProcShader(shader) {
		this.postProcessing.splice(
			this.postProcessing.indexOf(shader),
			1,
		);
	}
	getFbo(index) {
		if (index >= this.postProcessing.length) {
			return null;
		}

		return this.postProcessing[index].fbo;
	}
	add(renderable) {
		this.renderables.add(renderable);
	}
	has(renderable) {
		return this.renderables.has(renderable);
	}
	delete(renderable) {
		this.renderables.delete(renderable);
	}
	getVisible(bounds) {
		return this.getVisibleFunc(bounds, this.renderables);
	}
}

module.exports = Scene;
