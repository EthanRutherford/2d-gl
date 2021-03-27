const {mat4} = require("gl-matrix");
const VectorShader = require("../vector/vector-shader");
const SpriteShader = require("../sprite/sprite-shader");
const Renderable = require("./renderable");

function computeChildren(array, item, parentMatrix) {
	const {x, y, r} = item;
	const mvMatrix = mat4.create();
	mat4.fromTranslation(mvMatrix, [x, y, 0]);
	mat4.rotateZ(mvMatrix, mvMatrix, r);
	if (parentMatrix) {
		mat4.multiply(mvMatrix, parentMatrix, mvMatrix);
	}

	array.push({item, mvMatrix});
	const children = item.getChildren();
	for (const child of children) {
		computeChildren(array, child, mvMatrix);
	}

	return array;
}
function computeRenderableList(items) {
	// sort renderables by zIndex first (for correct transparency handling),
	// then by shader id (to avoid excessive shader swapping), then by item id
	const all = items.reduce((a, i) => computeChildren(a, i), []).sort(
		(a, b) => a.item.zIndex - b.item.zIndex ||
		a.item.shader.id - b.item.shader.id ||
		a.item.id - b.item.id,
	);

	for (let i = 0; i < all.length; i++) {
		const r = all[i];
		const z = 1 - ((i + 1) / all.length);
		mat4.translate(r.mvMatrix, r.mvMatrix, [0, 0, z]);
	}

	return all;
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
		this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);

		this.aspect = 1;
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
		const dpr = window.devicePixelRatio || 1;
		const width = this.canvas.clientWidth * dpr;
		const height = this.canvas.clientHeight * dpr;

		if (height !== this.canvas.height || width !== this.canvas.width) {
			this.canvas.width = width;
			this.canvas.height = height;
			this.gl.viewport(0, 0, width, height);
			this.aspect = width / height;
		}

		return {width, height};
	}
	viewportToWorld(x, y, camera) {
		const dpr = window.devicePixelRatio || 1;
		const xNormalized = x * dpr / this.canvas.width;
		const yNormalized = 1 - (y * dpr / this.canvas.height);

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
		// group renderables by shader program and calculate children and mvMats
		const renderables = computeRenderableList(visible);

		// iterate through renderables
		let curShader = null;
		for (const renderable of renderables) {
			// prepare shader program
			if (renderable.item.shader !== curShader) {
				curShader = renderable.item.shader;
				this.gl.useProgram(curShader.program);
				curShader.setProjection(pMatrix);
			}

			// upload modelview matrix
			curShader.setModelView(renderable.mvMatrix);

			// render the renderable
			curShader.render(renderable.item, this.frameNumber);
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
			for (const renderable of renderables) {
				// upload modelview matrix
				shader.setModelView(renderable.mvMatrix);

				// render the renderable
				shader.render(renderable.item, this.frameNumber);
			}
		}

		// increment frame counter
		this.frameNumber++;
	}
	// this doesn't free everything, you'd still need to manually free shapes and
	// materials, and frame/render buffers are also not cleared.
	free() {
		const {gl, canvas} = this;

		// unbind all textures
		const texCount = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
		for (let i = 0; i < texCount; i++) {
			gl.activeTexture(gl.TEXTURE0 + i);
			gl.bindTexture(gl.TEXTURE_2D, null);
			gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
		}

		// unbind buffers
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
		gl.bindRenderbuffer(gl.RENDERBUFFER, null);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);

		// set attrib pointers to tiny buffer
		const empty = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, empty);
		const attribCount = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
		for (let i = 0; i < attribCount; i++) {
			gl.vertexAttribPointer(i, 1, gl.FLOAT, false, 0, 0);
		}

		// shrink down canvas and lose context
		canvas.width = 1;
		canvas.height = 1;
		gl.getExtension("WEBGL_lose_context").loseContext();
	}
}

module.exports = Renderer;
