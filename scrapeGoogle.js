import fs from 'fs';
import { catalogItems } from './src/data/mockItems.js';

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function scrapeGoogleImages() {
    let updatedCode = `export const catalogItems = [\n`;

    for (let i = 0; i < catalogItems.length; i++) {
        const item = catalogItems[i];
        let query = item.name;

        console.log(`Searching Google Images for: ${query}...`);
        try {
            const url = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query + " pokemon")}`;
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
                }
            });
            const html = await response.text();

            // Google image results often include a raw image URL in the HTML source encoded like: "https://encrypted-tbn0.gstatic.com/images?q=..."
            const match = html.match(/https:\/\/encrypted-tbn0\.gstatic\.com\/images\?q=[^"]+/);

            let imageUrl = item.image; // fallback
            if (match && match[0]) {
                imageUrl = match[0].split('\\')[0]; // Clean up any escaped characters
                console.log(` ✅ Found image: ${imageUrl}`);
            } else {
                console.log(` ❌ No image found for ${query}. Fallback used.`);
            }

            updatedCode += `    { name: "${item.name.replace(/"/g, '\\"')}", price: ${item.price}, category: "${item.category}", description: "${item.description.replace(/"/g, '\\"')}", image: "${imageUrl}" },\n`;

        } catch (e) {
            console.error(`Error fetching ${query}:`, e);
            updatedCode += `    { name: "${item.name.replace(/"/g, '\\"')}", price: ${item.price}, category: "${item.category}", description: "${item.description.replace(/"/g, '\\"')}", image: "${item.image}" },\n`;
        }

        // Delay to prevent getting blocked by Google
        await delay(1000);
    }

    updatedCode += `];\n`;

    fs.writeFileSync('./src/data/mockItems.js', updatedCode, 'utf8');
    console.log("mockItems.js successfully updated with Google Images!");
}

scrapeGoogleImages();
