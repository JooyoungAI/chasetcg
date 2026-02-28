const cardImage = "https://images.unsplash.com/photo-1627855938568-7c852445c754?q=80&w=500"; // Pokemon card fallback
const boxImage = "https://images.unsplash.com/photo-1613589808389-1ea236bf4c66?q=80&w=500"; // Pokemon cards spread
const toyImage = "https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?q=80&w=500"; // Pikachu plush
const accImage = "https://images.unsplash.com/photo-1610484826967-09c5720778c7?q=80&w=500"; // Pokeballs

export const catalogItems = [
    // SEALED
    { name: "Evolving Skies Elite Trainer Box", price: 119.99, category: "sealed", description: "Features 8 booster packs, Umbreon/Espeon sleeves, and player's guide.", image: boxImage },
    { name: "Prismatic Evolutions Booster Box", price: 144.99, category: "sealed", description: "36 packs of Eeveelution madness from the latest Prismatic Evolutions set.", image: boxImage },
    { name: "Prismatic Evolutions Elite Trainer Box", price: 54.99, category: "sealed", description: "Includes 9 booster packs and a special foil promo card.", image: boxImage },
    { name: "Ascended Heroes Booster Pack", price: 4.99, category: "sealed", description: "A single pack of the highly anticipated Ascended Heroes set.", image: boxImage },
    { name: "Base Set Booster Pack (Charizard Art)", price: 450.00, category: "sealed", description: "Vintage 1999 Base Set pack featuring Charizard artwork. Unweighed.", image: boxImage },
    { name: "Roaring Skies Booster Box", price: 399.99, category: "sealed", description: "Hunt for the elusive Shaymin EX and Rayquaza EX.", image: boxImage },
    { name: "Evolving Skies Booster Box", price: 650.00, category: "sealed", description: "The holy grail of the Sword & Shield era. Hunt for Moonbreon!", image: boxImage },
    { name: "Hidden Fates Elite Trainer Box", price: 159.99, category: "sealed", description: "Includes the stained-glass Legendary birds promo card.", image: boxImage },
    { name: "Celebrations Ultra Premium Collection", price: 299.99, category: "sealed", description: "Contains metal gold Charizard and Pikachu base set reprints.", image: boxImage },
    { name: "Shining Fates Elite Trainer Box", price: 49.99, category: "sealed", description: "Hunt for the Shiny Charizard VMAX inside!", image: boxImage },

    // SINGLES
    { name: "Umbreon VMAX Alt Art (Evolving Skies)", price: 650.00, category: "singles", description: "The legendary 'Moonbreon'. Near Mint condition.", image: cardImage },
    { name: "Pikachu VMAX (Vivid Voltage)", price: 120.00, category: "singles", description: "Chunky Pikachu Secret Rare. Near Mint condition.", image: cardImage },
    { name: "Rayquaza VMAX Alt Art (Evolving Skies)", price: 280.00, category: "singles", description: "Stunning artwork featuring Rayquaza soaring above the forest.", image: cardImage },
    { name: "Charizard V Alt Art (Brilliant Stars)", price: 150.00, category: "singles", description: "Charizard battling Venusaur. Near Mint.", image: cardImage },
    { name: "Gengar VMAX Alt Art (Fusion Strike)", price: 220.00, category: "singles", description: "Gengar swallowing the world. High-grade candidate.", image: cardImage },
    { name: "Greninja ex SIR (Twilight Masquerade)", price: 180.00, category: "singles", description: "Stunning Special Illustration Rare featuring Greninja.", image: cardImage },
    { name: "Mewtwo VSTAR Secret Rare (Pokemon GO)", price: 45.00, category: "singles", description: "Golden Mewtwo VSTAR. Mint condition.", image: cardImage },
    { name: "Pikachu Illustrator Promo", price: 4000000.00, category: "singles", description: "The rarest Pokemon card in the world. Authentic ungraded copy.", image: cardImage },
    { name: "Charizard Base Set Shadowless", price: 3500.00, category: "singles", description: "Lightly Played vintage shadowless Charizard.", image: cardImage },
    { name: "Ascended Heroes Secret Rare Pikachu", price: 85.00, category: "singles", description: "The chase card from the new Ascended Heroes expansion.", image: cardImage },

    // GRADED
    { name: "PSA 10 Base Set 1st Ed Charizard", price: 350000.00, category: "graded", description: "GEM MINT 10. The ultimate collector's piece.", image: accImage },
    { name: "PSA 10 Umbreon Gold Star (Pop Series 5)", price: 60000.00, category: "graded", description: "GEM MINT 10. Incredibly low population.", image: accImage },
    { name: "BGS 9.5 Rayquaza Gold Star (Deoxys)", price: 45000.00, category: "graded", description: "GEM MINT 9.5 with strong subgrades.", image: accImage },
    { name: "CGC 10 Pristine Moonbreon (Evolving Skies)", price: 1200.00, category: "graded", description: "Flawless CGC Pristine 10 Umbreon VMAX.", image: accImage },
    { name: "PSA 9 Gengar VMAX Alt Art", price: 300.00, category: "graded", description: "MINT 9 condition Fusion Strike chase.", image: accImage },
    { name: "PSA 8 Pikachu Illustrator", price: 5500000.00, category: "graded", description: "NM-MT 8 grade. Museum-quality artifact.", image: accImage },
    { name: "BGS 10 Black Label Charizard VMAX", price: 3500.00, category: "graded", description: "Perfect Black Label Shining Fates Charizard.", image: accImage },
    { name: "PSA 10 Greninja Gold Star", price: 4500.00, category: "graded", description: "GEM MINT vintage 2004 promo.", image: accImage },
    { name: "CGC 9 Mewtwo Gold Star (Holon Phantoms)", price: 1200.00, category: "graded", description: "MINT condition vintage classic.", image: accImage },
    { name: "PSA 10 Luigi Pikachu Promo", price: 2500.00, category: "graded", description: "GEM MINT Japanese exclusive crossover promo.", image: accImage },

    // ACCESSORIES
    { name: "Evolving Skies Playmat", price: 24.99, category: "accessories", description: "Official Pokemon Center playmat featuring Rayquaza and Eeveelutions.", image: accImage },
    { name: "Charizard Premium Deck Box", price: 19.99, category: "accessories", description: "Faux-leather magnetic deck box with gold Charizard embossing.", image: accImage },
    { name: "Pikachu & Zekrom Card Sleeves", price: 9.99, category: "accessories", description: "Pack of 65 matte sleeves. Tournament legal.", image: accImage },
    { name: "Gengar Midnight Toploaders (25ct)", price: 8.99, category: "accessories", description: "Premium rigid card holders with purple tinted edges.", image: accImage },
    { name: "Rayquaza Emerald Dice Set", price: 14.99, category: "accessories", description: "Metallic green damage counter dice.", image: accImage },
    { name: "Prismatic Evolutions 9-Pocket Binder", price: 29.99, category: "accessories", description: "Side-loading zip binder holding 360 sleeved cards.", image: accImage },
    { name: "Mewtwo Master Ball Sleeves", price: 12.99, category: "accessories", description: "Japanese exclusive glossy sleeves.", image: accImage },
    { name: "Ascended Heroes Magnetic Card Case", price: 4.99, category: "accessories", description: "35pt magnetic one-touch case with UV protection.", image: accImage },
    { name: "Eeveelution Playmat Tube", price: 15.99, category: "accessories", description: "Hard plastic tube to protect your playmats during travel.", image: accImage },
    { name: "Greninja Water Shuriken Deck Vault", price: 34.99, category: "accessories", description: "Premium twin-deck holder with dice compartment.", image: accImage },

    // OTHER
    { name: "Pikachu 24-inch Plush", price: 49.99, category: "other", description: "Massive, huggable Pikachu plush toy.", image: toyImage },
    { name: "Gengar LED Desk Lamp", price: 39.99, category: "other", description: "Glowing purple Gengar lamp that adds mood to any room.", image: toyImage },
    { name: "Charizard Amiibo Figure", price: 29.99, category: "other", description: "Nintendo Switch compatible Smash Bros Amiibo.", image: toyImage },
    { name: "Evolving Skies Pin Set", price: 19.99, category: "other", description: "Includes pins for all 8 Eeveelutions.", image: toyImage },
    { name: "Prismatic Evolutions Collector Coin", price: 9.99, category: "other", description: "Metal flip coin used for TCG matches.", image: toyImage },
    { name: "Greninja Action Figure", price: 14.99, category: "other", description: "Fully posable Select Series figure.", image: toyImage },
    { name: "Mewtwo 1/8 Scale Statue", price: 149.99, category: "other", description: "Highly detailed Kotobukiya ARTFX J statue.", image: toyImage },
    { name: "Rayquaza Wall Scroll", price: 24.99, category: "other", description: "Fabric poster featuring Mega Rayquaza.", image: toyImage },
    { name: "Umbreon Enamel Pin", price: 11.99, category: "other", description: "High-quality hard enamel pin.", image: toyImage },
    { name: "Ascended Heroes Promo Poster", price: 15.00, category: "other", description: "Official launch poster for your game room wall.", image: toyImage }
];
