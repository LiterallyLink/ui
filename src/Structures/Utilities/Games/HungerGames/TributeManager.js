class TributeManager {
    constructor(client) {
        this.client = client;
        this.tributes = [];
    }

    async getRandomTributes(interaction, count) {
        try {
            await interaction.guild.members.fetch();
            const allMembers = interaction.guild.members.cache;
            
            if (allMembers.size < count) {
                await interaction.followUp({ 
                    content: `Not enough members in the server. Found ${allMembers.size}, need ${count}.`, 
                    ephemeral: true 
                });
                return null;
            }
            
            const selectedMembers = allMembers.random(count);
            
            return selectedMembers.map(member => ({
                user: member.user
            }));
            
        } catch (error) {
            console.error('Error fetching server members:', error);
            await interaction.followUp({ 
                content: 'Failed to fetch server members. Make sure the bot has proper permissions.', 
                ephemeral: true 
            });
            return null;
        }
    }

    generateTributeData(tributes) {
        this.tributes = [];

        for (let i = 0; i < tributes.length; i++) {
            const { user } = tributes[i];

            const tributeObj = {
                name: user.username,
                id: user.id,
                avatar: user.displayAvatarURL({ extension: 'png' }),
                alive: true,
                kills: [],
                killedBy: '',
                district: tributes.length === 2 ? i + 1 : Math.ceil((i + 1) / 2)
            };

            this.tributes.push(tributeObj);
        }

        return this.tributes;
    }

    randomizeTributeData() {
        this.tributes = this.client.utils.shuffle(this.tributes);

        for (let i = 0; i < this.tributes.length; i++) {
            this.tributes[i].district = this.tributes.length === 2 ? i + 1 : Math.ceil((i + 1) / 2);
        }

        return this.tributes;
    }

    tributesLeftAlive() {
        return this.tributes.filter(tribute => tribute.alive);
    }

    getDead() {
        return this.tributes.filter(tribute => !tribute.alive);
    }

    getAllTributes() {
        return this.tributes;
    }

    getAliveCount() {
        return this.tributesLeftAlive().length;
    }

    getTotalCount() {
        return this.tributes.length;
    }

    killTribute(tribute, killedBy = null) {
        tribute.alive = false;
        
        if (killedBy) {
            tribute.killedBy = killedBy.name;
            killedBy.kills.push(tribute);
        }
    }

    addKill(killer, victim) {
        killer.kills.push(victim);
    }

    gameOver() {
        const tributesLeftAlive = this.tributesLeftAlive();

        if (tributesLeftAlive.length === 2) {
            return tributesLeftAlive[0].district === tributesLeftAlive[1].district;
        } else if (tributesLeftAlive.length === 1) {
            return true;
        } else {
            return false;
        }
    }

    getWinners() {
        const alive = this.tributesLeftAlive();
        if (alive.length === 0) return [];
        
        const winner = alive.map(trib => `${trib.name}`).join(' and ');
        const winnerText = alive.length > 1 ? 'winners are' : 'winner is';
        
        return {
            tributes: alive,
            winnerText,
            winner,
            district: alive[0].district
        };
    }

    getTributeById(id) {
        return this.tributes.find(tribute => tribute.id === id);
    }

    getTributesByDistrict(district) {
        return this.tributes.filter(tribute => tribute.district === district);
    }

    getMaxDistrict() {
        return Math.max(...this.tributes.map(trib => trib.district));
    }
}

module.exports = TributeManager;