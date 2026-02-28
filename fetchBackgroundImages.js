import fs from 'fs';

const popularPokemon = [
    "Pikachu", "Greninja", "Charizard", "Rayquaza", "Groudon",
    "Kyogre", "Celebi", "Mew", "Ceruledge", "Lugia",
    "Ho-oh", "Mewtwo", "Darkrai", "Arceus", "Umbreon",
    "Espeon", "Eevee", "Sylveon", "Gengar", "Jirachi",
    "Mudkip", "Swampert", "Dragonite", "Tyranitar", "Lucario",
    "Snorlax", "Suicune", "Entei", "Raikou", "Latias", "Latios"
];

// Specific chase cards requested by user
const specificCardIds = [
    'me02.5-276', // Pikachu ex
    'me02.5-277', // Pikachu ex
    'swsh7-215',  // Umbreon VMAX 
    'sv08.5-161', // Umbreon ex
    'swsh7-218',  // Rayquaza VMAX
    'ex8-107',    // Rayquaza Gold Star
    'ecard2-149', // Lugia Aquapolis
    'base1-4',    // Charizard Base Set
    'swsh8-271',  // Gengar VMAX Alt Art
    'me02.5-284'  // Mega Gengar ex
];

async function fetchBackgroundImages() {
    let images = [];
    console.log("Fetching specific chase cards...");

    // 1. Fetch exact high-end chase cards first
    for (const id of specificCardIds) {
        try {
            const res = await fetch(`https://api.tcgdex.net/v2/en/cards/${id}`);
            const card = await res.json();
            if (card && card.image) {
                images.push(card.image + '/high.webp');
            }
        } catch (e) {
            console.error(`Error fetching specific card ${id}:`, e);
        }
    }

    console.log(`Successfully fetched ${images.length} specific chase cards.`);
    console.log("Fetching additional popular cards for background...");

    // 2. Fetch ~140 random popular cards
    let randomImages = [];
    for (const pokemon of popularPokemon) {
        try {
            const res = await fetch(`https://api.tcgdex.net/v2/en/cards?name=${encodeURIComponent(pokemon)}`);
            const cards = await res.json();

            const validCards = cards.filter(c => c.image);

            // Pick 5 random cards for each of the ~30 pokemon to get ~150 pool
            if (validCards.length >= 5) {
                const shuffled = validCards.sort(() => 0.5 - Math.random());
                randomImages.push(shuffled[0].image + '/high.webp');
                randomImages.push(shuffled[1].image + '/high.webp');
                randomImages.push(shuffled[2].image + '/high.webp');
                randomImages.push(shuffled[3].image + '/high.webp');
                randomImages.push(shuffled[4].image + '/high.webp');
            } else {
                validCards.forEach(c => randomImages.push(c.image + '/high.webp'));
            }
        } catch (e) {
            console.error(`Error fetching ${pokemon}:`, e);
        }
        await new Promise(r => setTimeout(r, 200));
    }

    // Shuffle the random cards
    randomImages = randomImages.sort(() => 0.5 - Math.random());

    // Combine chase cards with random pool
    images = [...images, ...randomImages];

    // Shuffle EVERYTHING together so the specific cards are scattered throughout
    images = images.sort(() => 0.5 - Math.random());

    // Ensure we have exactly 150 items
    images = images.slice(0, 150);

    const fileContent = `export const backgroundImages = ${JSON.stringify(images, null, 4)};\n`;
    fs.writeFileSync('./src/data/backgroundImages.js', fileContent, 'utf8');
    console.log(`Successfully saved ${images.length} background images to src/data/backgroundImages.js`);
}

fetchBackgroundImages();
