require('dotenv').config();

const { default: ollama } = require('ollama');
const { detectSentiment, captionImage } = require('./huggingfaceUtils');
const fs = require('fs');

const SYSTEM_MESSAGE = process.env.SYSTEM_MESSAGE;
const HISTORY_FILE = 'assets/conversation_histories.json';

module.exports = class LLM {
    constructor() {
        this.conversationHistories = this.loadConversationHistory();
    }

    loadConversationHistory() {
        try {
            if (!fs.existsSync(HISTORY_FILE)) return {};
            
            const data = fs.readFileSync(HISTORY_FILE, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error loading conversation history:', error);
            return {};
        }
    }

    saveConversationHistory() {
        try {
            const data = JSON.stringify(this.conversationHistories, null, 2);
            fs.writeFileSync(HISTORY_FILE, data, 'utf8');
        } catch (error) {
            console.error('Error saving conversation history:', error);
        }
    }

    getConversationHistory(userId) {
        if (!this.conversationHistories[userId]) {
            this.conversationHistories[userId] = {
                sentimentMetrics: {},
                shortTermMemory: [],
                longTermMemory: []
            };
        }
        return this.conversationHistories[userId];
    }

    async generateResponse(message) {
        const userId = message.author.id;
        let messageContent = message.content.trim();

        const conversationHistory = this.getConversationHistory(userId);

        if (message.attachments.size !== 0) {
            const imageCaptions = await captionImage(message);
            input += imageCaptions;
        }

        await this.updateSentimentWeights(conversationHistory, messageContent);
        await this.addToCurrentConversation(userId, { role: 'user', content: messageContent });
        this.saveConversationHistory();

        const messages = this.createConversationContext(conversationHistory.shortTermMemory, conversationHistory.longTermMemory);

        try {
            const response = await ollama.chat({
                model: 'llama3',
                messages: messages,
                stream: false
            });

            const reply = response.message.content;
            await this.addToCurrentConversation(userId, { role: 'assistant', content: reply });

            message.channel.sendTyping().then(() => {
                message.reply(reply);
            })
        } catch (error) {
            console.error('Error generating response:', error);
            throw new Error('Failed to generate response');
        }
    }

    async addToCurrentConversation(userId, message) {
        const conversationHistory = this.getConversationHistory(userId);
        conversationHistory.shortTermMemory.push(message);

        if (conversationHistory.shortTermMemory.length % 10 === 0) {
            await this.summarizeConversation(userId);
        }
    }

    createConversationContext(shortTermMemory, longTermMemory) {
        const systemInstruction = {
            role: 'system',
            content: `${SYSTEM_MESSAGE}. This is a history of the current conversation and previous summaries. Use it to remember specific moments in this discussion.`
        };

        return [systemInstruction, ...longTermMemory, ...shortTermMemory];
    }

    async summarizeConversation(userId) {
        const conversationHistory = this.getConversationHistory(userId);
        const currentConversation = conversationHistory.shortTermMemory.map(item => `${item.role}: ${item.content}`).join("\n");

        try {
            const summary = await ollama.chat({
                model: 'llama3',
                messages: [{ 
                    role: 'system', 
                    content: `Summarize the following conversation in a concise manner. Do not add notes, analysis, or unnecessary details. CONVERSATION HISTORY: ${currentConversation}`
                }],
            });

            conversationHistory.longTermMemory.push({ role: 'assistant', content: summary.message.content });
            conversationHistory.shortTermMemory = [];

            this.saveConversationHistory();
        } catch (error) {
            console.error('Error summarizing conversation:', error);
        }
    }

    async updateSentimentWeights(conversationHistory, message) {
        const sentiment = await detectSentiment(message);
    
        if (!conversationHistory.sentimentMetrics[sentiment.label]) {
            conversationHistory.sentimentMetrics[sentiment.label] = { score: 0 };
        }
    
        conversationHistory.sentimentMetrics[sentiment.label].score += sentiment.score;
    
        this.adjustSentimentScores(sentiment.label, sentiment.score, conversationHistory.sentimentMetrics);
    
        for (const emotion in conversationHistory.sentimentMetrics) {
            conversationHistory.sentimentMetrics[emotion].score = this.clampScore(conversationHistory.sentimentMetrics[emotion].score);
        }
    }
    
    adjustSentimentScores(currentEmotion, score, sentimentMetrics) {
        const interactions = {
            joy: { sadness: -1, anger: -1, fear: -1 },
            anger: { neutrality: -1, joy: -1 },
            disgust: { joy: -1, neutrality: -1 },
            fear: { joy: -1, neutrality: -1 },
            sadness: { joy: -1 },
            surprise: { neutrality: -1, fear: -1 }
        };
    
        const adjustments = interactions[currentEmotion] || {};
        for (const [emotion, factor] of Object.entries(adjustments)) {
            if (sentimentMetrics[emotion]) {
                sentimentMetrics[emotion].score += factor * score;
            }
        }
    }
    
    clampScore(score, min = 0, max = 100) {
        return Math.max(min, Math.min(score, max));
    }
    
};
