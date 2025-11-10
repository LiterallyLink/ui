const { HfInference } = require("@huggingface/inference");
require('dotenv').config();

const HF_TOKEN = process.env.HF_TOKEN;
const inference = new HfInference(HF_TOKEN);

async function detectSentiment(message) {
    try {
        const result = await inference.textClassification({
            model: "michellejieli/emotion_text_classifier",
            inputs: message
        });

        return result.reduce((prev, current) => (prev.score > current.score) ? prev : current);
    } catch (error) {
        console.error('Error detecting sentiment:', error);
        return null;
    }
}

async function captionImage(message) {
    const imageCaptions = [];

    try {
        for (const attachment of message.attachments.values()) {
            const imageBlob = await (await fetch(attachment.attachment)).blob();

            const result = await inference.imageToText({
                data: imageBlob,
                model: "Salesforce/blip-image-captioning-base",
            });

            imageCaptions.push(result.generated_text);
        }

        return ` THE USER SENT THE FOLLOWING IMAGES TO YOU : ${imageCaptions.join(", ")}`;
    } catch (error) {
        console.error('Error generating image captions:', error);
        throw new Error('Failed to generate captions for images');
    }
};

module.exports = {
    detectSentiment,
    captionImage
};
