const defaultEvents = require('../../../../../assets/hungerGamesEvents/default_events.json');
const arcticEvents = require('../../../../../assets/hungerGamesEvents/arctic_events.json');
const jungleEvents = require('../../../../../assets/hungerGamesEvents/jungle_events.json');

class HGEventManager {
    constructor() {
    }

    getArenaEvents(arenaChoice) {
        switch (arenaChoice) {
            case 'jungle':
                return jungleEvents;
            case 'arctic':
                return arcticEvents;
            case 'default':
            default:
                return defaultEvents;
        }
    }

    parseEvent(text, tributes, ID) {
        for (let i = 0; i < tributes.length; i++) {
            const idOrName = ID ? `<@${tributes[i].id}>` : tributes[i].name;
            text = text.replaceAll(`(Player${i + 1})`, `${idOrName}`);
        }

        return text;
    }

    eventTrigger(events, tributeData, avatars, deaths, results, embedResultsText, tributeManager) {
        const tributes = new Set(tributeData);

        for (const tribute of tributes) {
            if (!tributes.has(tribute)) continue;

            const filteredEvents = events.filter(event => event.tributes <= tributes.size && event.deaths < tributes.size);
            const event = filteredEvents[Math.floor(Math.random() * filteredEvents.length)];

            tributes.delete(tribute);

            if (event.tributes === 1) {
                if (event.deaths.length === 1) {
                    deaths.push(tribute);
                    tributeManager.killTribute(tribute, null);
                    tributes.delete(tribute);
                }

                results.push(this.parseEvent(event.text, [tribute], false));
                embedResultsText.push(this.parseEvent(event.text, [tribute], true));
                avatars.push([tribute.avatar]);
            } else {
                const currTribute = [tribute];

                if (event.killers.includes(1)) tributeManager.addKill(tribute, tribute);

                if (event.deaths.includes(1)) {
                    deaths.push(tribute);
                    tributeManager.killTribute(tribute, null);
                    tributes.delete(tribute);
                }

                for (let i = 2; i <= event.tributes; i++) {
                    const tributesArray = Array.from(tributes);
                    const randomTribute = tributesArray[Math.floor(Math.random() * tributesArray.length)];

                    if (event.killers.includes(i)) tributeManager.addKill(randomTribute, randomTribute);

                    if (event.deaths.includes(i)) {
                        tributeManager.addKill(tribute, randomTribute);
                        tributeManager.killTribute(randomTribute, tribute);
                        deaths.push(randomTribute);
                        tributes.delete(randomTribute);
                    }

                    currTribute.push(randomTribute);
                    tributes.delete(randomTribute);
                }

                results.push(this.parseEvent(event.text, currTribute));
                embedResultsText.push(this.parseEvent(event.text, currTribute, true));
                avatars.push(currTribute.map(trib => trib.avatar));
            }
        }
    }
}

module.exports = HGEventManager;