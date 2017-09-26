const ShaderProgram = require("../core/shader-program");

//basic 2D geometry shader for textured geometries
const spriteVertShader = `
	attribute vec2 aVPoint;
	attribute vec2 aTCoord;
	uniform mat4 uMVMatrix;
	uniform mat4 uPMatrix;
	varying highp vec2 vTextureCoord;
	void main() {
		gl_Position = uPMatrix * uMVMatrix * vec4(aVPoint, 0, 1);
		vTextureCoord = aTCoord;
	}
`;

const spriteFragShader = `
	varying highp vec2 vTextureCoord;
	uniform sampler2D uSampler;
	void main(void) {
		gl_FragColor = texture2D(uSampler, vTextureCoord.st);
	}
`;

class SpriteShader extends ShaderProgram {
	constructor(gl) {
		super(gl, spriteVertShader, spriteFragShader);
		this.gl = gl;

		gl.useProgram(gl.textureShader);

		this.aVPoint = gl.getAttribLocation(this.program, "aVPoint");
		gl.enableVertexAttribArray(this.aVPoint);
		this.aTCoord = gl.getAttribLocation(this.program, "aTCoord");
		gl.enableVertexAttribArray(this.aTCoord);

		this.uPMatrix = gl.getUniformLocation(this.program, "uPMatrix");
		this.uMVMatrix = gl.getUniformLocation(this.program, "uMVMatrix");
		this.uSampler = gl.getUniformLocation(this.program, "uSampler");
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
		gl.bindBuffer(gl.ARRAY_BUFFER, params.texBuf);
		gl.vertexAttribPointer(this.aTCoord, 2, gl.FLOAT, false, 0, 0);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, params.texture);
		gl.uniform1i(this.uSampler, 0);

		gl.drawArrays(params.drawMode, 0, params.vertCount);
	}
}

module.exports = SpriteShader;
