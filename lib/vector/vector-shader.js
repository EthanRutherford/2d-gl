const ShaderProgram = require("../core/shader-program");

//basic 2D geometry shader for vector geometries
const vectorVertShader = `
	attribute vec2 aVPoint;
	attribute vec4 aVColor;
	uniform mat4 uMVMatrix;
	uniform mat4 uPMatrix;
	varying highp vec4 vColor;
	void main() {
		gl_Position = uPMatrix * uMVMatrix * vec4(aVPoint, 0, 1);
		vColor = aVColor;
	}
`;

const vectorFragShader = `
	varying highp vec4 vColor;
	void main() {
		gl_FragColor = vColor;
	}
`;

class VectorShader extends ShaderProgram {
	constructor(gl) {
		super(gl, vectorVertShader, vectorFragShader);
		this.gl = gl;

		this.aVPoint = gl.getAttribLocation(this.program, "aVPoint");
		gl.enableVertexAttribArray(this.aVPoint);
		this.aVColor = gl.getAttribLocation(this.program, "aVColor");
		gl.enableVertexAttribArray(this.aVColor);

		this.uPMatrix = gl.getUniformLocation(this.program, "uPMatrix");
		this.uMVMatrix = gl.getUniformLocation(this.program, "uMVMatrix");
	}
	setProjection(mat) {
		this.gl.uniformMatrix4fv(this.uPMatrix, false, mat);
	}
	setModelView(mat) {
		this.gl.uniformMatrix4fv(this.uMVMatrix, false, mat);
	}
	render(renderable) {
		const gl = this.gl;
		const params = renderable.params;

		gl.bindBuffer(gl.ARRAY_BUFFER, params.vertBuf);
		gl.vertexAttribPointer(this.aVPoint, 2, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, params.colorBuf);
		gl.vertexAttribPointer(this.aVColor, 4, gl.FLOAT, false, 0, 0);

		gl.drawArrays(params.drawMode, 0, params.vertCount);
	}
}

module.exports = VectorShader;
