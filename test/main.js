const {
	Renderer,
	Scene,
	ImageLoader,
	rgba,
	builtIn: {
		OrthoCamera,
		VectorShape,
		SpriteShape,
	},
} = require("../lib/2d-gl.js");

const renderer = new Renderer();
const canvas = renderer.canvas;

document.body.append(canvas);
canvas.style.width = "100%";
canvas.style.height = "100%";

const triangleShape = new VectorShape(
	[{x: 0, y: 1}, {x: 0, y: 0}, {x: 1, y: 0}],
	[rgba(1, 0, 0), rgba(0, 1, 0), rgba(0, 0, 1)],
);

const triangle = renderer.getInstance(triangleShape);

const scene = new Scene({renderables: [triangle], bgColor: rgba(0, 0, 0, 1)});
const camera = new OrthoCamera(0, 0, 10);

function render() {
	window.requestAnimationFrame(render);
	triangle.r += .01;
	renderer.render(camera, scene);
}

render();

const loader = new ImageLoader();
loader.loadImage("crate", "./crate.png").then((result) => {
	const crateShape = new SpriteShape(
		[{x: 0, y: 1}, {x: 0, y: 0}, {x: 1, y: 0}, {x: 1, y: 1}],
		[{x: 0, y: 1}, {x: 0, y: 0}, {x: 1, y: 0}, {x: 1, y: 1}],
		result.img,
	);

	const crate = renderer.getInstance(crateShape);
	crate.x = 2;

	scene.add(crate);
});
