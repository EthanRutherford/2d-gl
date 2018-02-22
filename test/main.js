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
	shaders: {
		MotionBlur,
	},
} = require("../lib/2d-gl.js");

const renderer = new Renderer();
const canvas = renderer.canvas;

document.body.append(canvas);
canvas.style.width = "100%";
canvas.style.height = "100%";

const scene = new Scene({bgColor: rgba(0, 0, 0, 1)});
const camera = new OrthoCamera(0, 0, 10);

const blurShader = renderer.createShader(MotionBlur);
scene.addPostProcShader(blurShader);

const triangleShape = new Shape(
	[{x: 0, y: 1}, {x: 0, y: 0}, {x: 1, y: 0}],
);

const triangle = renderer.getInstance(triangleShape, new VectorMaterial(
	[rgba(1, 0, 0), rgba(0, 1, 0), rgba(0, 0, 1)],
));

scene.add(triangle);

let aCrate;

function render(stamp) {
	window.requestAnimationFrame(render);
	const time = stamp / 120;

	if (aCrate) {
		const sin = Math.sin(time);
		aCrate.x = sin * 5;
		aCrate.r = -sin;
	}

	triangle.r = time;
	renderer.render(camera, scene);
}

render(performance.now());

const loader = new ImageLoader();
loader.get("crate", "./crate.png").then((result) => {
	const crateShape = new Shape(
		[{x: -.5, y: .5}, {x: -.5, y: -.5}, {x: .5, y: -.5}, {x: .5, y: .5}],
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

	aCrate = renderer.getInstance(crateShape, crateMaterial);
	aCrate.x = 0;
	aCrate.y = 3;
	scene.add(aCrate);
});

loader.onProgress = (progress) => {
	console.log(`${progress * 100}% loaded`);
};

//toggle blur shader
let blurOn = true;
window.addEventListener("keydown", (event) => {
	if (event.key === "d") {
		if (blurOn) {
			scene.removePostProcShader(blurShader);
		} else {
			scene.addPostProcShader(blurShader);
		}

		blurOn = !blurOn;
	}
});

window.addEventListener("touchend", () => {
	if (blurOn) {
		scene.removePostProcShader(blurShader);
	} else {
		scene.addPostProcShader(blurShader);
	}

	blurOn = !blurOn;
});
