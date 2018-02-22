class ShapeParams {
	constructor(gl, verts) {
		this.gl = gl;

		this.vertCount = verts.length;
		this.vertBuf = gl.createBuffer();
		this.normBuf = gl.createBuffer();

		this.update(verts);
	}
	update(verts) {
		const faceNorms = [];
		for (let i = 0; i < verts.length; i++) {
			const j = i + 1 < verts.length ? i + 1 : 0;
			const edge = {
				x: verts[j].y - verts[i].y,
				y: verts[i].x - verts[j].x,
			};

			const length = Math.sqrt(edge.x ** 2 + edge.y ** 2);
			edge.x /= length;
			edge.y /= length;

			faceNorms.push(edge);
		}

		const norms = [];
		for (let i = 0; i < faceNorms.length; i++) {
			const j = i - 1 > -1 ? i - 1 : faceNorms.length - 1;
			const norm = {
				x: (faceNorms[i].x + faceNorms[j].x) / 2,
				y: (faceNorms[i].y + faceNorms[j].y) / 2,
			};

			const length = Math.sqrt(norm.x ** 2 + norm.y ** 2);
			norm.x /= length;
			norm.y /= length;

			norms.push(norm);
		}

		const serialVerts = verts.reduce((arr, v) => {
			arr.push(v.x, v.y);
			return arr;
		}, []);
		const serialNorms = norms.reduce((arr, v) => {
			arr.push(v.x, v.y);
			return arr;
		}, []);

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertBuf);
		this.gl.bufferData(
			this.gl.ARRAY_BUFFER,
			new Float32Array(serialVerts),
			this.gl.STATIC_DRAW,
		);
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normBuf);
		this.gl.bufferData(
			this.gl.ARRAY_BUFFER,
			new Float32Array(serialNorms),
			this.gl.STATIC_DRAW,
		);
	}
}

module.exports = ShapeParams;
