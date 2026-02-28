import fs from 'fs';

const popularPokemon = [
    "Pikachu", "Greninja", "Charizard", "Rayquaza", "Groudon",
    "Kyogre", "Celebi", "Mew", "Ceruledge", "Lugia",
    "Ho-oh", "Mewtwo", "Darkrai", "Arceus", "Umbreon",
    "Espeon", "Eevee", "Sylveon", "Gengar", "Jirachi",
    "Blastoise", "Venusaur", "Dragonite", "Tyranitar", "Lucario"
];

async function fetchBackgroundImages() {
    let images = [];
    console.log("Fetching popular cards for background...");

    for (const pokemon of popularPokemon) {
        try {
            // Fetch cards for each pokemon
            const res = await fetch(`https://api.tcgdex.net/v2/en/cards?name=${encodeURIComponent(pokemon)}`);
            const cards = await res.json();

            // Filter cards with images
            const validCards = cards.filter(c => c.image);

            // Pick 4 random cards for each of the 25 pokemon to get 100 total
            if (validCards.length >= 4) {
                // Shuffle array
                const shuffled = validCards.sort(() => 0.5 - Math.random());
                images.push(shuffled[0].image + '/high.webp');
                images.push(shuffled[1].image + '/high.webp');
                images.push(shuffled[2].image + '/high.webp');
                images.push(shuffled[3].image + '/high.webp');
            } else {
                validCards.forEach(c => images.push(c.image + '/high.webp'));
            }
        } catch (e) {
            console.error(`Error fetching ${pokemon}:`, e);
        }
        // Small delay to prevent rate limiting
        await new Promise(r => setTimeout(r, 200));
    }

    // Ensure we have exactly 100 (or slice if more)
    images = images.slice(0, 100);

    const fileContent = `export const backgroundImages = ${JSON.stringify(images, null, 4)};\n`;
    fs.writeFileSync('./src/data/backgroundImages.js', fileContent, 'utf8');
    console.log(`Successfully saved ${images.length} background images to src/data/backgroundImages.js`);
}

fetchBackgroundImages();
