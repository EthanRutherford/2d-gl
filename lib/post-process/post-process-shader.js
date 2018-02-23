const ShaderProgram = require("../core/shader-program");

class PostProcessShader extends ShaderProgram {
	constructor(gl, vert, frag) {
		super(gl, vert, frag);

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

		this.uFboTex = gl.getUniformLocation(this.program, "uFboTex");
		this.uPMatrix = gl.getUniformLocation(this.program, "uPMatrix");
		this.uMVMatrix = gl.getUniformLocation(this.program, "uMVMatrix");
	}
	setProjection(mat) {
		this.gl.uniformMatrix4fv(this.uPMatrix, false, mat);
	}
	setModelView(mat) {
		this.gl.uniformMatrix4fv(this.uMVMatrix, false, mat);
	}
	resize(width, height) {
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
	preRender() {
		const gl = this.gl;
		gl.bindTexture(gl.TEXTURE_2D, this.fboTex);
	}
}

module.exports = PostProcessShader;
