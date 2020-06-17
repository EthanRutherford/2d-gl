const {mat4} = require("gl-matrix");
const PostProcessShader = require("./post-process-shader");

// postprocessing shader to add motion blur
const blurVertShader = `
	attribute vec2 aVPoint;
	uniform mat4 uPrevMat;
	uniform mat4 uMVMatrix;
	uniform mat4 uPMatrix;
	uniform vec2 uCenter;
	varying highp vec2 vCoord;
	varying highp vec2 vVel;

	void main() {
		vec4 p = uPMatrix * uMVMatrix * vec4(aVPoint, 0, 1);
		vec4 c = uPMatrix * uMVMatrix * vec4(uCenter, 0, 1);
		vec4 prevC = uPrevMat * vec4(uCenter, 0, 1);

		vec2 motion = (c - prevC).xy;

		vVel = motion * .5;
		vCoord = (p.xy * .5) + .5;
		gl_Position = p;
	}
`;

const blurFragShader = `
	uniform sampler2D uFboTex;
	varying highp vec2 vCoord;
	varying highp vec2 vVel;
	void main() {
		const highp float samples = 16.0;
		highp float weight = 1.0 / samples;
		highp float step = 1.0 / (samples - 1.0);
		highp vec4 acc = vec4(0, 0, 0, 0);

		for (highp float i = 0.0; i < samples; i++) {
			highp float t = (i * step) - .5;
			acc += texture2D(uFboTex, (vVel * t) + vCoord);
		}

		gl_FragColor = acc * weight;
	}
`;

class MotionBlurShader extends PostProcessShader {
	constructor(gl) {
		super(gl, blurVertShader, blurFragShader);

		this.aVPoint = gl.getAttribLocation(this.program, "aVPoint");
		gl.enableVertexAttribArray(this.aVPoint);

		this.uPrevMat = gl.getUniformLocation(this.program, "uPrevMat");
		this.uCenter = gl.getUniformLocation(this.program, "uCenter");

		this.prevMats = new WeakMap();
	}
	setProjection(mat) {
		super.setProjection(mat);
		this.pm = mat4.clone(mat);
	}
	setModelView(mat) {
		super.setModelView(mat);
		this.mat = mat4.clone(mat);
		mat4.mul(this.mat, this.pm, this.mat);
	}
	deblur(renderable) {
		// useful for when "teleporting" an object, since otherwise you'll get
		// quite a large, muddy smear from the start position to end position
		this.prevMats.delete(renderable);
	}
	render(renderable, frameNumber) {
		const gl = this.gl;
		const params = renderable.params;

		const prevEntry = this.prevMats.get(renderable);
		const hasPrevMat = prevEntry != null && prevEntry.frameNumber === frameNumber;
		const prevMat = hasPrevMat ? prevEntry.mat : this.mat;
		this.gl.uniformMatrix4fv(this.uPrevMat, false, prevMat);
		this.gl.uniform2fv(this.uCenter, params.center);

		gl.bindBuffer(gl.ARRAY_BUFFER, params.vertBuf);
		gl.vertexAttribPointer(this.aVPoint, 2, gl.FLOAT, false, 0, 0);

		gl.drawArrays(params.drawMode, 0, params.vertCount);

		this.prevMats.set(renderable, {frameNumber: frameNumber + 1, mat: this.mat});
	}
}

module.exports = MotionBlurShader;
