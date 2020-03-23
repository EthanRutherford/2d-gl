const {mat4} = require("gl-matrix");
const VectorShader = require("../vector/vector-shader");
const SpriteShader = require("../sprite/sprite-shader");
const Renderable = require("./renderable");

function calcZ(id, zIndex) {
	const pageCount = 1000;
	const pageSize = 16 * 1000;
	const discreteSteps = pageCount * pageSize;

	const zPage = Math.max(0, Math.min(999, Math.floor(zIndex)));
	const offset = (id % pageSize) + 2;

	return 1 - (((zPage * pageSize) + offset) / discreteSteps);
}

class Renderer {
	constructor(canvas = null) {
		this.frameNumber = 0;
		this.canvas = canvas || document.createElement("canvas");
		this.gl = this.canvas.getContext("webgl2");
		if (!this.gl) {
			throw new Error("could not initialize WebGL");
		}

		this.gl.enable(this.gl.BLEND);
		this.gl.enable(this.gl.DEPTH_TEST);
		this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

		this.aspect = 0;
		this.shaders = new Map();

		// bind the first few attributes tp dummy data to prevent
		// issues where an enabled attribute has no bound buffer yet
		const dummyBuf = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, dummyBuf);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([]), this.gl.STATIC_DRAW);
		this.gl.vertexAttribPointer(0, 2, this.gl.FLOAT, false, 0, 0);
		this.gl.vertexAttribPointer(1, 2, this.gl.FLOAT, false, 0, 0);
		this.gl.vertexAttribPointer(2, 2, this.gl.FLOAT, false, 0, 0);
		this.gl.vertexAttribPointer(3, 2, this.gl.FLOAT, false, 0, 0);

		// initialize built-in shaders
		this.createShader(VectorShader);
		this.createShader(SpriteShader);
	}
	createShader(ShaderType) {
		if (!this.shaders.has(ShaderType)) {
			this.shaders.set(ShaderType, new ShaderType(this.gl));
		}

		return this.shaders.get(ShaderType);
	}
	getInstance(shape, material) {
		const shader = this.shaders.get(material.shaderType);
		const shapeParams = shape.getParams(this.gl);
		const materialParams = material.getParams(this.gl);
		const params = Object.assign({}, shapeParams, materialParams);
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

		return {width, height};
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
		// update size if necessary
		const size = this.resize();
		if (scene.backgroundShader) {
			scene.backgroundShader.resize(size.width, size.height);
		}
		for (const shader of scene.postProcessing) {
			shader.resize(size.width, size.height);
		}

		// get matrix from camera
		const pMatrix = camera.getMatrix(this.aspect);
		const mvMatrix = mat4.create();

		// build background texture
		if (scene.backgroundShader) {
			scene.backgroundShader.build(pMatrix);
		}

		// set the initial frame buffer
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, scene.getFbo(0));

		// set color
		const col = scene.bgColor;
		this.gl.clearColor(col.r, col.g, col.b, col.a);
		// clear gl bits
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

		if (scene.backgroundShader) {
			scene.backgroundShader.copyIntoBuffer();
		}

		// get visible renderables
		const visible = scene.getVisible(camera.getBounds());
		// group renderables by shader program
		const groups = visible.reduce((map, item) => {
			if (!map.has(item.shader)) {
				map.set(item.shader, []);
			}

			map.get(item.shader).push(item);

			return map;
		}, new Map());

		// iterate through groups
		for (const [shader, renderables] of groups) {
			// prepare shader program
			this.gl.useProgram(shader.program);
			shader.setProjection(pMatrix);

			// iterate through renderables
			for (const renderable of renderables) {
				// set up and upload modelview matrix
				const x = renderable.x;
				const y = renderable.y;
				mat4.fromTranslation(mvMatrix, [x, y, calcZ(renderable.id, renderable.zIndex)]);
				mat4.rotateZ(mvMatrix, mvMatrix, renderable.r);
				shader.setModelView(mvMatrix);

				// render the renderable
				shader.render(renderable, this.frameNumber);
			}
		}

		// iterate through post processing shaders
		for (let i = 0; i < scene.postProcessing.length; i++) {
			this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, scene.getFbo(i + 1));
			this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
			if (scene.backgroundShader) {
				scene.backgroundShader.copyIntoBuffer();
			}

			const shader = scene.postProcessing[i];
			this.gl.useProgram(shader.program);
			shader.preRender();
			shader.setProjection(pMatrix);

			// iterate through renderables
			for (const renderable of visible) {
				// set up and upload modelview matrix
				const x = renderable.x;
				const y = renderable.y;
				mat4.fromTranslation(mvMatrix, [x, y, calcZ(renderable.id, renderable.zIndex)]);
				mat4.rotateZ(mvMatrix, mvMatrix, renderable.r);
				shader.setModelView(mvMatrix);

				// render the renderable
				shader.render(renderable, this.frameNumber);
			}
		}

		// increment frame counter
		this.frameNumber++;
	}
}

module.exports = Renderer;
