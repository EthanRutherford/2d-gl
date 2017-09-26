module.exports = {
	Renderer: require("./core/renderer"),
	Scene: require("./core/scene"),
	ImageLoader: require("./core/image-loader"),
	builtIn: {
		OrthoCamera: require("./core/ortho-camera"),
		VectorShape: require("./vector/vector-shape"),
		rgba: require("./vector/rgba"),
		SpriteShape: require("./sprite/sprite-shape"),
	},
};
