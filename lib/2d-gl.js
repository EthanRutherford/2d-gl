module.exports = {
	Renderer: require("./core/renderer"),
	Scene: require("./core/scene"),
	ImageLoader: require("./core/image-loader"),
	rgba: require("./core/rgba"),
	builtIn: {
		Shape: require("./shape/shape"),
		OrthoCamera: require("./core/ortho-camera"),
		VectorMaterial: require("./vector/vector-material"),
		SpriteMaterial: require("./sprite/sprite-material"),
	},
};
