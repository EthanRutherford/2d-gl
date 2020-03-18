const {mat4} = require("gl-matrix");
const ShaderProgram = require("../core/shader-program");

// shader for copying bg pixels into the current buffer
const copyVertShader = `
	attribute vec2 aVPoint;
	varying highp vec2 vCoord;
	void main() {
		vCoord = (aVPoint.xy * .5) + .5;
		gl_Position = vec4(aVPoint, .9999999, 1);
	}
`;

const copyFragShader = `
	uniform sampler2D uFboTex;
	varying highp vec2 vCoord;
	void main() {
		gl_FragColor = texture2D(uFboTex, vCoord);
	}
`;

class CopyShader extends ShaderProgram {
	constructor(gl) {
		super(gl, copyVertShader, copyFragShader);

		this.fboTex = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this.fboTex);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

		this.rbo = gl.createRenderbuffer();
		gl.bindRenderbuffer(gl.RENDERBUFFER, this.rbo);

		this.fbo = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.fboTex, 0);
		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.rbo);

		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.bindRenderbuffer(gl.RENDERBUFFER, null);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);

		this.aVPoint = gl.getAttribLocation(this.program, "aVPoint");
		gl.enableVertexAttribArray(this.aVPoint);
	}
	resize(width, height) {
		if (this.width === width && this.height === height) {
			return;
		}

		const gl = this.gl;
		gl.bindTexture(gl.TEXTURE_2D, this.fboTex);
		gl.texImage2D(
			gl.TEXTURE_2D, 0, gl.RGBA,
			width, height, 0,
			gl.RGBA, gl.UNSIGNED_BYTE, null,
		);

		gl.bindRenderbuffer(gl.RENDERBUFFER, this.rbo);
		gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);

		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.bindRenderbuffer(gl.RENDERBUFFER, null);
	}
}

// base class for world-coordinate-aware bg shaders
const bgVertShader = `
	attribute vec2 aVPoint;
	uniform mat4 uIPMatrix;
	varying highp vec2 vWorld;
	void main() {
		vWorld = (uIPMatrix * vec4(aVPoint, 0, 1)).xy;
		gl_Position = vec4(aVPoint, 0, 1);
	}
`;

class BackgroundShader extends ShaderProgram {
	constructor(gl, fragShader) {
		super(gl, bgVertShader, fragShader);

		this.copyShader = new CopyShader(gl);

		this.aVPoint = gl.getAttribLocation(this.program, "aVPoint");
		gl.enableVertexAttribArray(this.aVPoint);

		this.uIPMatrix = gl.getUniformLocation(this.program, "uIPMatrix");

		this.vertBuf = gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertBuf);
		this.gl.bufferData(
			this.gl.ARRAY_BUFFER,
			new Float32Array([-1, 1, -1, -1, 1, -1, 1, 1]),
			this.gl.STATIC_DRAW,
		);
	}
	resize(width, height) {
		this.copyShader.resize(width, height);
	}
	copyIntoBuffer() {
		const gl = this.gl;

		gl.useProgram(this.copyShader.program);
		gl.bindTexture(gl.TEXTURE_2D, this.copyShader.fboTex);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuf);
		gl.vertexAttribPointer(this.aVPoint, 2, gl.FLOAT, false, 0, 0);

		gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
	}
	build(pMatrix) {
		const gl = this.gl;

		// use our program
		gl.useProgram(this.program);

		// set our inverse matrix;
		const ipMatrix = mat4.create();
		mat4.invert(ipMatrix, pMatrix);
		this.gl.uniformMatrix4fv(this.uIPMatrix, false, ipMatrix);

		// bind the fbo of our copy shader
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.copyShader.fbo);

		// render into the texture fbo
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuf);
		gl.vertexAttribPointer(this.aVPoint, 2, gl.FLOAT, false, 0, 0);
		if (this.bind instanceof Function) this.bind();

		gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
	}
}

module.exports = BackgroundShader;
