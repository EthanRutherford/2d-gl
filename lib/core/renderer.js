const {mat4} = require("gl-matrix");
const VectorShader = require("../vector/vector-shader");
const SpriteShader = require("../sprite/sprite-shader");

class Renderer {
	constructor(canvas = null) {
		this.canvas = canvas || document.createElement("canvas");
		this.gl = this.canvas.getContext("webgl");
		if (!this.gl) {
			throw new Error("could not initialize WebGL");
		}

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
	getInstance(shape, material) {
		const shader = this.shaders.get(material.shaderType);
		const shapeParams = shape.getParams(this.gl);
		const materialParams = material.getParams(this.gl);
		const params = Object.assign({}, shapeParams, materialParams);
		const Renderable = material.renderableType;
		return new Renderable(shader, params);
	}
	resize() {
		const width = this.canvas.clientWidth;
		const height = this.canvas.clientHeight;

		if (height !== this.canvas.height || width !== this.canvas.width) {
			this.canvas.width = width;
			this.canvas.height = height;
			this.gl.viewport(0, 0, width, height);
			this.aspect = width / height;
		}
	}
	viewportToWorld(x, y, camera) {
		const xNormalized = x / this.canvas.width;
		const yNormalized = 1 - (y / this.canvas.height);

		const {x0, y0, w, h} = camera.getBounds();

		return {
			x: x0 + (xNormalized * w),
			y: y0 + (yNormalized * h),
		};
	}
	render(camera, scene) {
		//update size if necessary
		this.resize();
		//set color
		const col = scene.bgColor;
		this.gl.clearColor(col.r, col.g, col.b, col.a);
		//clear gl bits
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

		//get matrix from camera
		const pMatrix = camera.getMatrix(this.aspect);
		const mvMatrix = mat4.create();

		//get visible renderables
		const visible = scene.getVisible(camera.getBounds());
		//group renderables by shader program
		const groups = visible.reduce((map, item) => {
			if (!map.has(item.shader)) {
				map.set(item.shader, []);
			}

			map.get(item.shader).push(item);

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
				const x = renderable.x;
				const y = renderable.y;
				const zInd = Math.floor(renderable.zIndex);
				const zVal = renderable.id % 16000;
				const z = 1 - (((zInd * 16000) + zVal + 1) / 16000000);
				mat4.fromTranslation(mvMatrix, [x, y, z]);
				mat4.rotateZ(mvMatrix, mvMatrix, renderable.r);
				shader.setModelView(mvMatrix);

				//render the renderable
				shader.render(renderable);
			}
		}
	}
}

module.exports = Renderer;
