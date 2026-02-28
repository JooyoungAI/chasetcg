import fs from 'fs';
import { catalogItems } from './src/data/mockItems.js';

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function scrapeCollectrForImages() {
    let updatedCode = `export const catalogItems = [\n`;

    for (let i = 0; i < catalogItems.length; i++) {
        const item = catalogItems[i];
        let query = item.name.replace(/\([^\)]*\)/g, '').trim(); // Remove parenthetical terms like (Evolving Skies) to get better search results on Collectr

        console.log(`Searching Collectr for: ${query}...`);
        try {
            const url = `https://app.getcollectr.com/?searchString=${encodeURIComponent(query)}`;
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
                }
            });
            const html = await response.text();

            // Look for \"image_url\":\"https://public.getcollectr.com...\"
            // Since it's in a stringified JSON script block, the quotes and slashes might be escaped
            const match = html.match(/\\"image_url\\":\\"(https:\\\/\\\/public\.getcollectr\.com[^\\]+)/);

            let imageUrl = item.image; // fallback
            if (match && match[1]) {
                // Collectr sometimes adds unicode or search query params, let's clean it up if needed
                imageUrl = match[1].split('?')[0] + '?optimizer=image&format=webp&width=600&quality=80&strip=metadata';
                console.log(` ✅ Found image: ${imageUrl}`);
            } else {
                console.log(` ❌ No image found on Collectr HTML for ${query}. Fallback used.`);
            }

            // Append string for file
            updatedCode += `    { name: "${item.name.replace(/"/g, '\\"')}", price: ${item.price}, category: "${item.category}", description: "${item.description.replace(/"/g, '\\"')}", image: "${imageUrl}" },\n`;

        } catch (e) {
            console.error(`Error fetching ${query}:`, e);
            updatedCode += `    { name: "${item.name.replace(/"/g, '\\"')}", price: ${item.price}, category: "${item.category}", description: "${item.description.replace(/"/g, '\\"')}", image: "${item.image}" },\n`;
        }

        // Slight delay to prevent rate-limiting
        await delay(500);
    }

    updatedCode += `];\n`;

    // Rewrite the mockItems file directly
    fs.writeFileSync('./src/data/mockItems.js', updatedCode, 'utf8');
    console.log("mockItems.js successfully updated with Collectr images!");
}

scrapeCollectrForImages();
