const {mat4} = require("gl-matrix");
const VectorShader = require("../vector/vector-shader");
const SpriteShader = require("../sprite/sprite-shader");

class Renderer {
	constructor() {
		this.canvas = document.createElement("canvas");
		this.gl = this.canvas.getContext("webgl");
		if (!this.gl) {
			throw new Error("could not initialize WebGL");
		}

		this.gl.clearColor(0, 0, 0, 1);
		this.gl.enable(this.gl.BLEND);
		this.gl.enable(this.gl.DEPTH_TEST);
		this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

		this.aspect = 0;
		this.shaders = new Map();

		//initialize built-in shaders
		this.createShader(VectorShader);
		this.createShader(SpriteShader);
	}
	createShader(ShaderType) {
		if (!this.shaders.has(ShaderType)) {
			this.shaders.set(ShaderType, new ShaderType(this.gl));
		}
	}
	getRenderable(shape) {
		return shape.getInstance(this.gl);
	}
	resize() {
		const style = window.getComputedStyle(this.canvas);
		this.canvas.width = parseInt(style.width, 10);
		this.canvas.height = parseInt(style.height, 10);
		this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
		this.aspect = this.canvas.width / this.canvas.height;
	}
	render(camera, scene) {
		//clear gl
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
		//get matrix from camera
		const pMatrix = camera.getMatrix(this.aspect);
		const mvMatrix = mat4.create();

		//get visible renderables
		const visible = scene.getVisible(camera.getBounds());
		//sort by renderable id
		const sorted = visible.sort((a, b) => b.id - a.id);
		//group renderables by shader program
		const groups = sorted.reduce((map, item) => {
			const shader = this.shaders.get(item.shaderType);

			if (!map.has(shader)) {
				map.set(shader, []);
			}

			map.get(shader).push(item);

			return map;
		}, new Map());

		//iterate through groups
		for (const [shader, renderables] of groups) {
			//prepare shader program
			this.gl.useProgram(shader.program);
			shader.setProjection(pMatrix);

			//iterate through renderables
			for (const renderable of renderables) {
				//set up and upload modelview matrix
				mat4.fromTranslation(mvMatrix, [renderable.x, renderable.y, 0]);
				mat4.rotateZ(mvMatrix, mvMatrix, renderable.r);
				shader.setModelView(mvMatrix);

				//render the renderable
				shader.render(renderable);
			}
		}
	}
}

module.exports = Renderer;
