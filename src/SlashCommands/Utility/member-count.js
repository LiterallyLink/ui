const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { createCanvas } = require('canvas');

const CANVAS_WIDTH = 700;
const CANVAS_HEIGHT = 400;
const CHART_RADIUS = 100;
const CHART_CENTER_X = CANVAS_WIDTH / 4;
const CHART_CENTER_Y = CANVAS_HEIGHT / 2;
const RECT_X_POS = 340;
const RECT_Y_POS = 110;
const RECT_WIDTH = 250;
const RECT_HEIGHT = 170;
const RECT_LINE_WIDTH = 3;
const STATUS_BOX_HEIGHT = 18;
const STATUS_BOX_WIDTH = 18;
const STATUS_BOX_X = 350;
const STATUS_BOX_Y_START = 125;
const STATUS_BOX_Y_SPACING = 30;
const DONUT_HOLE_RADIUS = 50;
const TEXT_FONT_LARGE = '18px sans-serif';
const TEXT_FONT_SMALL = '14px sans-serif';
const PERCENTAGE_RADIUS_MULTIPLIER = 1.3;
const PERCENTAGE_X_MULTIPLIER = 1.5;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('member-count')
        .setDescription("Get a breakdown of the member count by sorted by statuses in the guild."),
    async run({ interaction }) {
        try {
            const allMembers = await interaction.guild.members.fetch();

            const statusData = [
                { status: 'online', amount: 0, color: '#62ce74' },
                { status: 'idle', amount: 0, color: '#ebc83d' },
                { status: 'dnd', amount: 0, color: '#F04747' },
                { status: 'streaming', amount: 0, color: '#b06dad' },
                { status: 'offline', amount: 0, color: '#5d5d5d' }
            ];

            const statusMap = new Map(statusData.map(s => [s.status, s]));

            let humanCount = 0;
            let botCount = 0;

            allMembers.forEach(member => {
                member.user.bot ? botCount++ : humanCount++;

                const userStatus = member.presence?.status || 'offline';
                const statusObject = statusMap.get(userStatus);
                
                if (statusObject) statusObject.amount += 1;

                const isStreaming = member.presence?.activities?.some(activity => activity.type === 1);

                if (isStreaming) {
                    statusMap.get('streaming').amount += 1;
                }
            });

            const totalMembers = allMembers.size;
            const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
            const ctx = canvas.getContext('2d');

            ctx.beginPath();
            ctx.lineWidth = RECT_LINE_WIDTH;
            ctx.strokeStyle = '#7b8085';
            ctx.rect(RECT_X_POS, RECT_Y_POS, RECT_WIDTH, RECT_HEIGHT);
            ctx.fillStyle = '#1c2229';
            ctx.fillRect(RECT_X_POS, RECT_Y_POS, RECT_WIDTH, RECT_HEIGHT);
            ctx.stroke();
            ctx.closePath();

            let startAngle = 0;

            for (let i = 0; i < statusData.length; i++) {
                if (statusData[i].amount > 0) {
                    ctx.fillStyle = statusData[i].color;
                    ctx.lineWidth = 1;
                    ctx.strokeStyle = '#1c2229';
                    ctx.beginPath();

                    const endAngle = ((statusData[i].amount / totalMembers) * Math.PI * 2) + startAngle;

                    ctx.moveTo(CHART_CENTER_X, CHART_CENTER_Y);
                    ctx.arc(CHART_CENTER_X, CHART_CENTER_Y, CHART_RADIUS, startAngle, endAngle, false);
                    ctx.lineTo(CHART_CENTER_X, CHART_CENTER_Y);
                    ctx.fill();
                    ctx.stroke();
                    ctx.closePath();

                    ctx.beginPath();
                    ctx.font = TEXT_FONT_LARGE;
                    ctx.textAlign = 'center';
                    ctx.fillStyle = 'white';

                    const theta = (startAngle + endAngle) / 2;
                    const deltaY = Math.sin(theta) * PERCENTAGE_RADIUS_MULTIPLIER * CHART_RADIUS;
                    const deltaX = Math.cos(theta) * PERCENTAGE_X_MULTIPLIER * CHART_RADIUS;
                    ctx.fillText(`${(100 * statusData[i].amount / totalMembers).toFixed(2)}%`, deltaX + CHART_CENTER_X, deltaY + CHART_CENTER_Y);
                    ctx.closePath();

                    startAngle = endAngle;
                }
            }

            ctx.beginPath();
            ctx.moveTo(CHART_CENTER_X, CHART_CENTER_Y);
            ctx.arc(CHART_CENTER_X, CHART_CENTER_Y, DONUT_HOLE_RADIUS, 0, 2 * Math.PI);
            ctx.fillStyle = '#1c2229';
            ctx.fill();
            ctx.closePath();

            let statusBoxY = STATUS_BOX_Y_START;

            for (let i = 0; i < statusData.length; i++) {
                ctx.fillStyle = statusData[i].color;
                ctx.beginPath();
                ctx.fillRect(STATUS_BOX_X, statusBoxY, STATUS_BOX_HEIGHT, STATUS_BOX_WIDTH);
                ctx.rect(STATUS_BOX_X, statusBoxY, STATUS_BOX_HEIGHT, STATUS_BOX_WIDTH);
                ctx.closePath();

                const { status, amount } = statusData[i];
                ctx.textAlign = 'start';
                ctx.fillStyle = 'white';
                ctx.font = TEXT_FONT_SMALL;

                const capitalizedStatus = status.charAt(0).toUpperCase() + status.slice(1);
                ctx.fillText(`${capitalizedStatus} - ${amount} (${(100 * amount / totalMembers).toFixed(2)}%)`, STATUS_BOX_X + 30, statusBoxY + 15);
                statusBoxY += STATUS_BOX_Y_SPACING;
            }

            const memberCountEmbed = new EmbedBuilder()
                .setTitle(`Member Count for ${interaction.guild.name}`)
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                .addFields(
                    { name: "Total Members", value: `${totalMembers}`, inline: true },
                    { name: "Total Humans", value: `${humanCount}`, inline: true },
                    { name: "Total Bots", value: `${botCount}`, inline: true }
                )
                .setImage('attachment://memberChart.png')
                .setColor('#5b5c6e')
                .setTimestamp();

            return interaction.followUp({ 
                embeds: [memberCountEmbed], 
                files: [{ attachment: canvas.toBuffer(), name: 'memberChart.png' }] 
            });

        } catch (error) {
            console.error("Error in membercount command:", error);
            return interaction.followUp({ 
                content: "Failed to fetch member information", 
                ephemeral: true 
            });
        }
    }
};