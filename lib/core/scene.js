class Scene {
	constructor({renderables, getVisibleFunc}) {
		this.getVisibleFunc = getVisibleFunc || (() => [...this.renderables]);
		this.renderables = new Set(renderables);
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
