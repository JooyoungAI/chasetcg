import fs from 'fs';
import { catalogItems } from './src/data/mockItems.js';

const pokemonNames = ["Umbreon", "Pikachu", "Rayquaza", "Charizard", "Gengar", "Greninja", "Mewtwo", "Articuno", "Eevee"];
const setNames = ["Evolving Skies", "Prismatic Evolutions", "Base Set", "Roaring Skies", "Hidden Fates", "Celebrations", "Shining Fates"];

async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
    let updatedCode = `export const catalogItems = [\n`;

    for (const item of catalogItems) {
        let imageUrl = item.image;
        let isSet = false;

        if (item.category === 'sealed') {
            const foundSet = setNames.find(s => item.name.includes(s));
            if (foundSet) {
                try {
                    const res = await fetch(`https://api.tcgdex.net/v2/en/sets?name=${encodeURIComponent(foundSet)}`);
                    const data = await res.json();
                    // Some sets might not have a logo, but if they do, use it
                    if (data && data.length > 0 && data[0].logo) {
                        imageUrl = data[0].logo + '.png';
                        isSet = true;
                    }
                } catch (e) {
                    console.error("Error fetching set:", e);
                }
            }
        }

        if (!isSet) {
            // Find a pokemon name to fetch a specific card
            const foundPkmn = pokemonNames.find(p => item.name.includes(p) || item.description.includes(p));
            if (foundPkmn) {
                try {
                    // Try to get a specific card modifier if it exists in the name
                    let searchName = foundPkmn;
                    if (item.name.includes("VMAX")) searchName += " VMAX";
                    else if (item.name.includes("VSTAR")) searchName += " VSTAR";
                    else if (item.name.includes("ex ")) searchName += " ex";

                    const res = await fetch(`https://api.tcgdex.net/v2/en/cards?name=${encodeURIComponent(searchName)}`);
                    const data = await res.json();

                    if (data && data.length > 0 && data[0].image) {
                        imageUrl = data[0].image + '/high.webp';
                    } else {
                        // Fallback to just the base pokemon name if VMAX/VSTAR fails
                        const res2 = await fetch(`https://api.tcgdex.net/v2/en/cards?name=${encodeURIComponent(foundPkmn)}`);
                        const data2 = await res2.json();
                        if (data2 && data2.length > 0 && data2[0].image) {
                            imageUrl = data2[0].image + '/high.webp';
                        }
                    }
                } catch (e) {
                    console.error("Error fetching card:", e);
                }
            }
        }

        console.log(`Mapped ${item.name} -> ${imageUrl}`);
        updatedCode += `    { name: "${item.name.replace(/"/g, '\\"')}", price: ${item.price}, category: "${item.category}", description: "${item.description.replace(/"/g, '\\"')}", image: "${imageUrl}" },\n`;
        await delay(300);
    }

    updatedCode += `];\n`;
    fs.writeFileSync('./src/data/mockItems.js', updatedCode, 'utf8');
    console.log("Successfully updated all items via TCGdex!");
}
run();
