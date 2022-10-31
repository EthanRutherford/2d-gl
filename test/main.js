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
		BackgroundShader,
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

class SpaceBgShader extends BackgroundShader {
	constructor(gl) {
		super(gl, `
			varying highp vec2 vWorld;
		
			highp float rand(highp vec2 co) {
				highp float a = 12.9898;
				highp float b = 78.233;
				highp float c = 43758.5453;
				highp float dt = dot(co.xy, vec2(a, b));
				highp float sn = mod(dt, 3.14);
				return fract(sin(sn) * c);
			}
		
			void main() {
				highp vec2 xy = vWorld * 20.0;
				highp vec2 rxy = floor(xy + .5);
				highp float r = rand(rxy);
		
				if (r > .999) {
					highp float str = 1.0 - distance(xy, rxy) * 2.0;
					gl_FragColor = vec4(str, str, str, 1);
				} else {
					gl_FragColor = vec4(0, 0, 0, 1);
				}
			}
		`);
	}
}

const backgroundShader = renderer.createShader(SpaceBgShader);
scene.setBackgroundShader(backgroundShader);

const triangleShape = new Shape(
	[{x: 0, y: 1}, {x: 0, y: 0}, {x: 1, y: 0}],
);
const triangleMaterial = new VectorMaterial(
	[rgba(1, 0, 0), rgba(0, 1, 0), rgba(0, 0, 1, .2)],
);

const twoTrisShape = new Shape(
	[{x: 0, y: 1}, {x: 0, y: 0}, {x: 1, y: 0}, {x: .5, y: .5}, {x: 1, y: 0}, {x: 1, y: .5}],
	Shape.triangles,
);
const twoTrisMaterial = new VectorMaterial(
	[rgba(1, 0, 0), rgba(0, 1, 0), rgba(0, 0, 1), rgba(1, 0, 0), rgba(0, 1, 0), rgba(0, 0, 1)],
);

const triangle = renderer.getInstance(triangleShape, triangleMaterial);
const subTriangle = renderer.getInstance(triangleShape, triangleMaterial);
triangle.getChildren = () => [subTriangle];
subTriangle.x = 1;
subTriangle.zIndex = 1;

scene.add(triangle);


const twoTris = renderer.getInstance(twoTrisShape, twoTrisMaterial);
twoTris.x = -4;
scene.add(twoTris);


let aCrate;

let limit = false;
let limitTicker = 1;
function render(stamp) {
	window.requestAnimationFrame(render);
	const time = stamp / 120;

	if (limit && limitTicker !== 10) {
		limitTicker++;
		return;
	}

	if (aCrate) {
		const sin = Math.sin(time / limitTicker);
		aCrate.x = sin * 5;
		aCrate.r = -sin;
	}

	triangle.r = time / limitTicker;
	subTriangle.r = time / limitTicker / 2;
	renderer.render(camera, scene);
	limitTicker = 1;
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

// toggle blur shader
let blurOn = true;
window.addEventListener("keydown", (event) => {
	if (event.key === "l") {
		limit = !limit;
	}
	if (event.key === "d") {
		if (blurOn) {
			scene.removePostProcShader(blurShader);
		} else {
			scene.addPostProcShader(blurShader);
		}

		blurOn = !blurOn;
	}
	if (event.key === "ArrowUp") {
		camera.y += .1;
	}
	if (event.key === "ArrowDown") {
		camera.y -= .1;
	}
	if (event.key === "ArrowLeft") {
		camera.x -= .1;
	}
	if (event.key === "ArrowRight") {
		camera.x += .1;
	}
	if (event.key === "0") {
		camera.x = camera.y = 0;
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
