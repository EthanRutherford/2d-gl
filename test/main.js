const {
	Renderer,
	Scene,
	ImageLoader,
	rgba,
	builtIn: {
		Shape,
		OrthoCamera,
		VectorMaterial,
		SpriteMaterial,
	},
} = require("../lib/2d-gl.js");

const renderer = new Renderer();
const canvas = renderer.canvas;

document.body.append(canvas);
canvas.style.width = "100%";
canvas.style.height = "100%";

const scene = new Scene({bgColor: rgba(0, 0, 0, 1)});
const camera = new OrthoCamera(0, 0, 10);

const triangleShape = new Shape(
	[{x: 0, y: 1}, {x: 0, y: 0}, {x: 1, y: 0}],
);

const triangle = renderer.getInstance(triangleShape, new VectorMaterial(
	[rgba(1, 0, 0), rgba(0, 1, 0), rgba(0, 0, 1)],
));

scene.add(triangle);

function render() {
	window.requestAnimationFrame(render);
	triangle.r += .01;
	renderer.render(camera, scene);
}

render();

const loader = new ImageLoader();
loader.get("crate", "./crate.png").then((result) => {
	const crateShape = new Shape(
		[{x: 0, y: 1}, {x: 0, y: 0}, {x: 1, y: 0}, {x: 1, y: 1}],
	);
	const crateMaterial = new SpriteMaterial(
		[{x: 0, y: 1}, {x: 0, y: 0}, {x: 1, y: 0}, {x: 1, y: 1}],
		result,
	);

	for (let i = 0; i < 10; i++) {
		const crate = renderer.getInstance(crateShape, crateMaterial);

		crate.x = 2 + i / 4;
		crate.y = i / 8 * (i % 2 ? 1 : -1);

		scene.add(crate);
	}
});

loader.onProgress = (progress) => {
	console.log(`${progress * 100}% loaded`);
};
