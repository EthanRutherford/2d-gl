const {mat4} = require("gl-matrix");
const PostProcessShader = require("./post-process-shader");

// postprocessing shader to add motion blur
const blurVertShader = `
	attribute vec2 aVPoint;
	attribute vec2 aVNorm;
	uniform mat4 uPrevMat;
	uniform mat4 uMVMatrix;
	uniform mat4 uPMatrix;
	uniform mat4 uRMatrix;
	varying highp vec2 vCoord;
	varying highp vec2 vVel;
	void main() {
		vec4 p = uPMatrix * uMVMatrix * vec4(aVPoint, 0, 1);
		vec4 prevP = uPrevMat * vec4(aVPoint, 0, 1);

		vec2 motion = p.xy - prevP.xy;
		vec2 n1 = normalize((uRMatrix * vec4(aVNorm, 0, 1)).xy);
		vec2 n2 = dot(motion, motion) > 0.0 ? normalize(motion) : motion;
		highp float ratio = (dot(n1, n2) * .5) + .5;

		vec4 stretchP = prevP + (p - prevP) * ratio;

		vVel = motion * .5;
		vCoord = (p.xy * .5) + .5;
		gl_Position = stretchP;
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

		this.aVNorm = gl.getAttribLocation(this.program, "aVNorm");
		gl.enableVertexAttribArray(this.aVNorm);

		this.uPrevMat = gl.getUniformLocation(this.program, "uPrevMat");
		this.uRMatrix = gl.getUniformLocation(this.program, "uRMatrix");

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

		const rMat = mat4.create();
		mat4.rotateZ(rMat, rMat, renderable.r);
		this.gl.uniformMatrix4fv(this.uRMatrix, false, rMat);

		gl.bindBuffer(gl.ARRAY_BUFFER, params.vertBuf);
		gl.vertexAttribPointer(this.aVPoint, 2, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, params.normBuf);
		gl.vertexAttribPointer(this.aVNorm, 2, gl.FLOAT, false, 0, 0);

		gl.drawArrays(params.drawMode, 0, params.vertCount);

		this.prevMats.set(renderable, {frameNumber: frameNumber + 1, mat: this.mat});
	}
}

module.exports = MotionBlurShader;
