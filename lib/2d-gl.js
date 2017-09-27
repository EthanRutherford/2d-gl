module.exports = {
	Renderer: require("./core/renderer"),
	Scene: require("./core/scene"),
	ImageLoader: require("./core/image-loader"),
	rgba: require("./core/rgba"),
	builtIn: {
		OrthoCamera: require("./core/ortho-camera"),
		VectorShape: require("./vector/vector-shape"),
		SpriteShape: require("./sprite/sprite-shape"),
	},
};
