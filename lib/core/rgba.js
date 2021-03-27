// rgba value with premultiplied alpha
module.exports = (red, green, blue, alpha = 1) => ({
	r: red * alpha,
	g: green * alpha,
	b: blue * alpha,
	a: alpha,
});
