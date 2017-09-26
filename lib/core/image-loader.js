class ImageLoader {
	constructor() {
		this.map = {};
	}
	loadImage(name, src) {
		const img = document.createElement("img");
		const image = {img, progress: 0};
		this.map[name] = image;

		img.onprogress = (event) => image.progress = event.loaded / event.total;

		return new Promise((resolve, reject) => {
			img.onerror = () => reject(`${src} not found`);
			img.onload = () => resolve(image);

			img.src = src;
		});
	}
	getTotalProgress() {
		let progress = 0;
		const images = Object.values(this.map);

		for (const image of images) {
			progress += image.progress;
		}

		return progress / images.length;
	}
}

module.exports = ImageLoader;
