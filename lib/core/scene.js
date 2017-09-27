class Scene {
	constructor({renderables, getVisibleFunc, bgColor}) {
		this.getVisibleFunc = getVisibleFunc || (() => [...this.renderables]);
		this.renderables = new Set(renderables);
		this.bgColor = bgColor;
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
