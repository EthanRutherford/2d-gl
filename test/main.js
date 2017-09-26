const {
	Renderer,
	Scene,
	ImageLoader,
	builtIn: {
		OrthoCamera,
		VectorShape,
		rgba,
		SpriteShape,
	},
} = require("../lib/2d-gl.js");

const renderer = new Renderer();
const canvas = renderer.canvas;

document.body.append(canvas);
canvas.style = "width: 100%; height: 100%;";

renderer.resize();
window.addEventListener("resize", () => renderer.resize());

const triangle = new VectorShape(
	[{x: 0, y: 1}, {x: 0, y: 0}, {x: 1, y: 0}],
	[rgba(1, 0, 0), rgba(0, 1, 0), rgba(0, 0, 1)],
);

const tri = renderer.getRenderable(triangle);

const scene = new Scene({renderables: [tri]});
const camera = new OrthoCamera(0, 0, 10);

function render() {
	window.requestAnimationFrame(render);
	tri.r += .01;
	renderer.render(camera, scene);
}

render();

const loader = new ImageLoader();
loader.loadImage("crate", "./crate.png").then((result) => {
	const crate = new SpriteShape(
		[{x: 0, y: 1}, {x: 0, y: 0}, {x: 1, y: 0}, {x: 1, y: 1}],
		[{x: 0, y: 1}, {x: 0, y: 0}, {x: 1, y: 0}, {x: 1, y: 1}],
		result.img,
	);

	const crt = renderer.getRenderable(crate);
	crt.x = 2;

	scene.add(crt);
});
