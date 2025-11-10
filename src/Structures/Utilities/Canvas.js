const { loadImage } = require('canvas');

module.exports = class Canvas {

    constructor(client) {
        this.client = client;   
    }

    drawBackground(ctx, bgColor) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    greyScale(ctx, destinationX, destinationY, avatarSize) {
		const imageData = ctx.getImageData(destinationX, destinationY, avatarSize, avatarSize);

		const pixels = imageData.data;

		for (let j = 0; j < pixels.length; j += 4) {
			const lightness = parseInt((pixels[j] + pixels[j + 1] + pixels[j + 2]) / 3);

			pixels[j] = lightness;
			pixels[j + 1] = lightness;
			pixels[j + 2] = lightness;
		}

		ctx.putImageData(imageData, destinationX, destinationY);
	}
};