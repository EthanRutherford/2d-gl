const {mat4} = require("gl-matrix");
const PostProcessShader = require("./post-process-shader");

//postprocessing shader to add motion blur
const blurVertShader = `
	attribute vec2 aVPoint;
	attribute vec2 aVNorm;
	uniform mat4 uPrevMVM;
	uniform mat4 uPrevPM;
	uniform mat4 uMVMatrix;
	uniform mat4 uPMatrix;
	uniform mat4 uRMatrix;
	varying highp vec2 vCoord;
	varying highp vec2 vVel;
	void main() {
		vec4 p = uPMatrix * uMVMatrix * vec4(aVPoint, 0, 1);
		vec4 prevP = uPrevPM * uPrevMVM * vec4(aVPoint, 0, 1);

		vec2 n = (uRMatrix * vec4(aVNorm, 0, 1)).xy;
		vec2 motion = p.xy - prevP.xy;

		bool flag = dot(motion, n) > 0.0;
		vec4 stretchP = flag ? p : prevP;

		vVel = (motion) / 2.0;
		vCoord = (stretchP.xy + 1.0) / 2.0;
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
		highp vec4 acc = vec4(0, 0, 0, 0);

		for (highp float i = 0.0; i < samples; i++) {
			highp float t = (i / (samples - 1.0)) - .5;
			acc += texture2D(uFboTex, vCoord + (vVel * t)) * weight;
		}

		gl_FragColor = acc;
	}
`;

class MotionBlurShader extends PostProcessShader {
	constructor(gl) {
		super(gl, blurVertShader, blurFragShader);

		this.aVPoint = gl.getAttribLocation(this.program, "aVPoint");
		gl.enableVertexAttribArray(this.aVPoint);

		this.aVNorm = gl.getAttribLocation(this.program, "aVNorm");
		gl.enableVertexAttribArray(this.aVNorm);

		this.uPrevPM = gl.getUniformLocation(this.program, "uPrevPM");
		this.uPrevMVM = gl.getUniformLocation(this.program, "uPrevMVM");
		this.uRMatrix = gl.getUniformLocation(this.program, "uRMatrix");

		this.prevMVs = new Map();
	}
	setProjection(mat) {
		this.gl.uniformMatrix4fv(this.uPrevPM, false, this.pm || mat);
		super.setProjection(mat);
		this.pm = mat4.clone(mat);
	}
	setModelView(mat) {
		super.setModelView(mat);
		this.mvm = mat4.clone(mat);
	}
	render(renderable) {
		const gl = this.gl;
		const params = renderable.params;

		const mvm = this.prevMVs.get(renderable) || this.mvm;
		this.gl.uniformMatrix4fv(this.uPrevMVM, false, mvm);

		const rMat = mat4.create();
		mat4.rotateZ(rMat, rMat, renderable.r);
		this.gl.uniformMatrix4fv(this.uRMatrix, false, rMat);

		gl.bindBuffer(gl.ARRAY_BUFFER, params.vertBuf);
		gl.vertexAttribPointer(this.aVPoint, 2, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, params.normBuf);
		gl.vertexAttribPointer(this.aVNorm, 2, gl.FLOAT, false, 0, 0);

		gl.drawArrays(params.drawMode, 0, params.vertCount);

		this.prevMVs.set(renderable, this.mvm);
	}
}

module.exports = MotionBlurShader;
