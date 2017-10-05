const images = {};

class ImageLoader {
	constructor() {
		this.names = new Set();
		this.onProgress = null;
	}
	get(name, src) {
		this.names.add(name);
		if (!(name in images)) {
			const data = {progress: 0};
			images[name] = data;

			data.promise = new Promise((resolve, reject) => {
				const xhr = new XMLHttpRequest();
				xhr.responseType = "blob";

				xhr.onerror = () => reject(`${src} not found`);
				xhr.onload = () => resolve(createImageBitmap(xhr.response));

				xhr.onprogress = (event) => {
					data.progress = event.loaded / event.total;

					if (this.onProgress instanceof Function) {
						this.onProgress(this.getTotalProgress());
					}
				};

				xhr.open("GET", src, true);
				xhr.send();
			});
		}

		return images[name].promise;
	}
	all() {
		const promises = [...this.names].map(
			(name) => images[name].promise,
		);

		return Promise.all(promises);
	}
	getTotalProgress() {
		const names = [...this.names];
		const progress = names.reduce(
			(sum, name) => sum + images[name].progress,
			0,
		);

		return progress / names.length;
	}
}

module.exports = ImageLoader;
