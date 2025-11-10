const { createCanvas, loadImage } = require('canvas');

class HGCanvasManager {
    constructor(client) {
        this.client = client;
        
        this.avatarSize = 150;
        this.halfAvatar = 75;
        this.avatarPaddingX = 50;
        this.avatarPaddingY = 230;
        this.avatarSpacingX = 30;
        this.avatarSpacingY = 130;
    }

    async populateCanvas(tributeData) {
        const verticalAvatarCount = Math.min(tributeData.length, 6);
        const horitzontalAvatarCount = Math.ceil(tributeData.length / 6);

        const canvasWidth = ((this.avatarSize + this.avatarSpacingX) * verticalAvatarCount) - this.avatarSpacingX + (this.avatarPaddingX * 2);
        const canvasHeight = (horitzontalAvatarCount * this.avatarSpacingY) + (horitzontalAvatarCount * this.avatarSize) - this.avatarSpacingY + (this.avatarPaddingY * 2) - 100;

        const canvas = createCanvas(canvasWidth, canvasHeight);
        const ctx = canvas.getContext('2d');

        this.client.canvas.drawBackground(ctx, '#5d5050');
        this.drawHeaderText(ctx, ['The Reaping']);
        await this.generateStatusImage(ctx, tributeData);

        return canvas;
    }

    async generateEventImage(eventText, resultsText, avatarArray) {
        const canvasHeight = 500;
        const canvas = createCanvas(1, canvasHeight);
        const ctx = canvas.getContext('2d');

        ctx.font = '35px arial';

        const canvasWidth = Math.max(ctx.measureText(resultsText).width + 100, ctx.measureText('The Hunger Games').width + 100);
        ctx.canvas.width = canvasWidth;

        this.client.canvas.drawBackground(ctx, '#5d5050');
        this.drawHeaderText(ctx, [resultsText, eventText]);

        ctx.strokeStyle = '#000000';
        ctx.fillStyle = '#ffffff';

        const avatarYPosition = (canvasHeight / 2) + 10;
        let avatarXPosition = (canvasWidth / 2) - this.halfAvatar;
        avatarXPosition -= ((this.avatarSpacingX / 2) + this.halfAvatar) * (avatarArray.length - 1);

        for (let i = 0; i < avatarArray.length; i++) {
            const tributeImage = await loadImage(avatarArray[i]);

            ctx.drawImage(tributeImage, avatarXPosition, avatarYPosition, this.avatarSize, this.avatarSize);
            ctx.strokeRect(avatarXPosition, avatarYPosition, this.avatarSize, this.avatarSize);

            avatarXPosition += this.avatarSpacingX + this.avatarSize;
        }

        return canvas;
    }

    async generateFallenTributes(deaths, announcementCount, deathMessage) {
        const canvasHeight = 500;

        const canvas = createCanvas(1, canvasHeight);
        const ctx = canvas.getContext('2d');

        ctx.font = 'bold 28px arial';

        const deathMessageLength = ctx.measureText(deathMessage).width + 200;
        const avatarXLength = (this.avatarPaddingX * 2) + (this.avatarSize * deaths.length) + (this.avatarSpacingX * (deaths.length - 1));
        const canvasWidth = Math.max(deathMessageLength, avatarXLength);

        ctx.canvas.width = canvasWidth;
        this.client.canvas.drawBackground(ctx, '#5d5050');
        this.drawHeaderText(ctx, [deathMessage, `Fallen Tributes ${announcementCount}`]);

        ctx.font = 'bold 20px arial';
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.textAlign = 'center';

        const avatarYPosition = (canvasHeight / 2) + 10;
        let avatarXPosition = (canvasWidth / 2) - this.halfAvatar;
        const textYPosition = avatarYPosition + this.avatarSize + 10;

        avatarXPosition -= ((this.avatarSpacingX / 2) + this.halfAvatar) * (deaths.length - 1);

        for (let i = 0; i < deaths.length; i++) {
            const tributeImage = await loadImage(deaths[i].avatar);

            ctx.drawImage(tributeImage, avatarXPosition, avatarYPosition, this.avatarSize, this.avatarSize);
            ctx.strokeRect(avatarXPosition, avatarYPosition, this.avatarSize, this.avatarSize);

            this.client.canvas.greyScale(ctx, avatarXPosition, avatarYPosition, this.avatarSize);

            const textXPosition = avatarXPosition + this.halfAvatar;

            ctx.fillText(`${deaths[i].name.slice(0, 10)}...`, textXPosition, textYPosition);
            ctx.fillText(`District ${deaths[i].district}`, textXPosition, textYPosition + 30);

            avatarXPosition += this.avatarSpacingX + this.avatarSize;
        }

        return canvas;
    }

    async generateWinnerImage(tributeData) {
        const canvasWidth = 400 * tributeData.length;
        const canvasHeight = 400;

        const canvas = createCanvas(canvasWidth, canvasHeight);
        const ctx = canvas.getContext('2d');

        this.client.canvas.drawBackground(ctx, '#5d5050');

        if (tributeData.length === 1) {
            this.drawHeaderText(ctx, ['The Winner']);
        } else {
            this.drawHeaderText(ctx, ['The Winners']);
        }

        ctx.strokeStyle = '#000000';

        const avatarYPosition = canvasHeight / 2;
        let avatarXPosition = (canvasWidth / 2) - this.halfAvatar;
        avatarXPosition -= (this.avatarSpacingX + this.halfAvatar) * (tributeData.length - 1);

        for (let i = 0; i < tributeData.length; i++) {
            const tributeImage = await loadImage(tributeData[i].avatar);

            ctx.drawImage(tributeImage, avatarXPosition, avatarYPosition, this.avatarSize, this.avatarSize);
            ctx.strokeRect(avatarXPosition, avatarYPosition, this.avatarSize, this.avatarSize);

            avatarXPosition += this.avatarSpacingX + this.avatarSize;
        }

        return canvas;
    }

    async massLoadImages(tributeData) {
        const avatarPromises = [];
        for (let i = 0; i < tributeData.length; i++) {
            const avatar = loadImage(tributeData[i].avatar);
            avatarPromises.push(avatar);
        }

        return await Promise.all(avatarPromises);
    }

    async generateStatusImage(ctx, tributeData) {
        ctx.strokeStyle = '#000000';

        let destinationX = this.avatarPaddingX;
        let destinationY = this.avatarPaddingY;

        const avatarPromises = await this.massLoadImages(tributeData);

        for (let i = 0; i < tributeData.length; i++) {
            ctx.drawImage(await avatarPromises[i], destinationX, destinationY, this.avatarSize, this.avatarSize);
            ctx.strokeRect(destinationX, destinationY, this.avatarSize, this.avatarSize);

            if (!tributeData[i].alive) this.client.canvas.greyScale(ctx, destinationX, destinationY, this.avatarSize);

            const spacingMultiplier = i % 2 === 0 ? 1 : 1.5;
            destinationX += this.avatarSize + (this.avatarSpacingX * spacingMultiplier);

            if ((i + 1) % 6 === 0) {
                destinationX = this.avatarPaddingX;
                destinationY += this.avatarSize + this.avatarSpacingY;
            }
        }

        this.drawTributeName(ctx, tributeData);
        this.drawAliveText(ctx, tributeData);
        this.drawDistrictText(ctx, tributeData);
    }

    drawTributeName(ctx, tributeArray) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px arial';
        ctx.textAlign = 'center';

        let textDestinationX = this.avatarPaddingX + this.halfAvatar;
        let textDestinationY = this.avatarPaddingY + this.avatarSize + 5;

        for (let i = 0; i < tributeArray.length; i++) {
            ctx.fillText(`${tributeArray[i].name.slice(0, 10)}...`, textDestinationX, textDestinationY);

            const spacingMultiplier = i % 2 === 0 ? 1 : 1.5;
            textDestinationX += this.avatarSize + (this.avatarSpacingX * spacingMultiplier);

            if ((i + 1) % 6 === 0) {
                textDestinationX = this.avatarPaddingX + this.halfAvatar;
                textDestinationY += this.avatarSize + this.avatarSpacingY;
            }
        }
    }

    drawAliveText(ctx, tributeArray) {
        const aliveColor = '#70ec25';
        const deceasedColor = '#fa6666';
        ctx.font = 'bold 25px arial';
        ctx.textAlign = 'center';

        let textDestinationX = this.avatarPaddingX + this.halfAvatar;
        let textDestinationY = this.avatarPaddingY + this.avatarSize + 30;

        for (let i = 0; i < tributeArray.length; i++) {
            const { alive } = tributeArray[i];
            const statusText = alive ? 'Alive' : 'Deceased';

            ctx.fillStyle = alive ? aliveColor : deceasedColor;
            ctx.fillText(statusText, textDestinationX, textDestinationY);

            const spacingMultiplier = i % 2 === 0 ? 1 : 1.5;
            textDestinationX += this.avatarSize + (this.avatarSpacingX * spacingMultiplier);

            if ((i + 1) % 6 === 0) {
                textDestinationX = this.avatarPaddingX + this.halfAvatar;
                textDestinationY += this.avatarSize + this.avatarSpacingY;
            }
        }
    }

    drawDistrictText(ctx, tributeArray) {
        ctx.font = 'bold 28px arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        const districtCount = tributeArray.map(trib => trib.district).pop();

        let textDestinationY = this.avatarPaddingY - 40;
        let textDestinationX = this.avatarPaddingX + this.halfAvatar;

        if (tributeArray.length === 2) {
            ctx.fillText(`District 1`, textDestinationX, textDestinationY);
            ctx.fillText(`District 2`, textDestinationX + this.avatarSize + this.avatarSpacingX, textDestinationY);
            return;
        }

        const middleXPositionArray = [215, 590, 965];
        const centerXPositionArray = [125, 500, 875];

        let iterator = 0;

        for (let i = 0; i < districtCount; i++) {
            const isLastIteration = i === districtCount - 1;

            if (isLastIteration && tributeArray.length % 2 === 1) {
                textDestinationX = centerXPositionArray[iterator];
            } else {
                textDestinationX = middleXPositionArray[iterator];
            }

            ctx.fillText(`District ${i + 1}`, textDestinationX, textDestinationY);
            iterator++;

            if ((i + 1) % 3 === 0) {
                iterator = 0;
                textDestinationY += this.avatarSize + this.avatarSpacingY;
            }
        }
    }

    drawHeaderText(ctx, textArray) {
        const text = ['The Hunger Games', ...textArray];

        ctx.textBaseline = 'top';
        ctx.font = '35px arial';
        ctx.textAlign = 'center';

        let textPaddingY = 30;
        const ySizing = 45;

        for (let i = 0; i < text.length; i++) {
            const textMeasure = ctx.measureText(text[i]);
            const textCenterAlignment = (ctx.canvas.width / 2) - textMeasure.actualBoundingBoxLeft - 5;
            const textWidth = textMeasure.width + 10;

            ctx.fillStyle = '#232323';
            ctx.fillRect(textCenterAlignment, textPaddingY, textWidth, ySizing);

            ctx.strokeStyle = '#ffffff';
            ctx.strokeRect(textCenterAlignment, textPaddingY, textWidth, ySizing);

            ctx.fillStyle = '#e4ae24';
            ctx.fillText(text[i], ctx.canvas.width / 2, textPaddingY);
            textPaddingY += 70;
        }
    }
}

module.exports = HGCanvasManager;