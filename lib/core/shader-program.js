function compileShader(gl, src, type) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, src);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		throw new Error(gl.getShaderInfoLog(shader));
	}

	return shader;
}

function linkShaderProgram(gl, vert, frag) {
	const program = gl.createProgram();

	gl.attachShader(program, vert);
	gl.attachShader(program, frag);
	gl.linkProgram(program);

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		throw new Error("Could not initialize shader");
	}

	return program;
}

class ShaderProgram {
	constructor(gl, vertSource, fragSource) {
		const vert = compileShader(gl, vertSource, gl.VERTEX_SHADER);
		const frag = compileShader(gl, fragSource, gl.FRAGMENT_SHADER);
		this.program = linkShaderProgram(gl, vert, frag);
	}
}

module.exports = ShaderProgram;
