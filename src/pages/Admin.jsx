import React, { useState } from 'react';
import { catalogItems } from '../data/mockItems';
import { db } from '../firebase';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import './Admin.css';

export default function Admin({ products, addProduct, removeProduct, updateProduct }) {
    const defaultProductState = {
        name: '',
        price: '',
        category: 'sealed',
        image: '',
        description: ''
    };

    const [newProduct, setNewProduct] = useState(defaultProductState);
    const [editingProductId, setEditingProductId] = useState(null);
    const [filterCategory, setFilterCategory] = useState('All');
    const [inventorySort, setInventorySort] = useState('date-new'); // Default newest first
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 25;

    // Admin Dashboard Tabs
    const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' or 'search'

    // Search TCGdex States
    const [searchCardName, setSearchCardName] = useState('');
    const [searchSetName, setSearchSetName] = useState('');
    const [searchSort, setSearchSort] = useState('newest'); // 'newest', 'oldest', 'cardno-asc', or 'cardno-desc'
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [tcgdexSets, setTcgdexSets] = useState([]);
    const [selectedCard, setSelectedCard] = useState(null);
    const [isLoadingCardDetails, setIsLoadingCardDetails] = useState(false);

    // Custom Autocomplete State for Set Name
    const [showAutocomplete, setShowAutocomplete] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const autocompleteRef = React.useRef(null);
    const filteredSets = tcgdexSets.filter(set => set.name.toLowerCase().includes(searchSetName.toLowerCase()));

    // Fetch TCGdex Sets on mount for chronological sorting and Set Name fuzzy searching
    React.useEffect(() => {
        const fetchSets = async () => {
            try {
                const res = await fetch('https://api.tcgdex.net/v2/en/sets');
                const data = await res.json();

                // Explicit blacklist of Pocket / Promo sets requested by user
                const BLOCKED_POCKET_SETS = [
                    'Promo-A', 'Genetic Apex', 'Mythical Island', 'Space-Time Smackdown',
                    'Triumphant Light', 'Shining Revelry', 'Celestial Guardians',
                    'Extradimensional Crisis', 'Eevee Grove', 'Wisdom of Sea and Sky',
                    'Secluded Springs', 'Deluxe Pack ex', 'Promo-B', 'Mega Rising',
                    'Crimson Blaze', 'Fantasical Parade', 'Fantastical Parade', 'Paldean Wonders'
                ];

                // Filter out Pocket sets from the autocomplete entirely
                const validSets = (data || []).filter(s => {
                    const isExplicitlyBlocked = BLOCKED_POCKET_SETS.some(blocked =>
                        s.name.toLowerCase().includes(blocked.toLowerCase())
                    );

                    return !isExplicitlyBlocked &&
                        !s.name.toLowerCase().includes('pocket') &&
                        !s.id.toLowerCase().includes('pocket') &&
                        !/^A\d/.test(s.id) &&
                        !s.id.startsWith('P-A');
                });

                setTcgdexSets(validSets);
            } catch (error) {
                console.error("Failed to fetch TCGdex sets:", error);
            }
        };
        fetchSets();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewProduct({ ...newProduct, [name]: value });
    };

    const handleEdit = (product) => {
        setEditingProductId(product.id);
        setNewProduct(product);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingProductId(null);
        setNewProduct(defaultProductState);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newProductData = {
            ...newProduct,
            price: parseFloat(newProduct.price) || 0
        };

        if (editingProductId && updateProduct) {
            const success = await updateProduct(editingProductId, newProductData);
            if (success) {
                handleCancelEdit();
                alert('Product successfully updated!');
            }
        } else {
            const success = await addProduct(newProductData);
            if (success) {
                handleCancelEdit();
                alert('Product successfully added!');
            }
        }
    };

    const handleSearchTcgDex = async (e) => {
        e.preventDefault();
        if (!searchCardName.trim() && !searchSetName.trim()) return;

        setIsSearching(true);
        setSearchResults([]);

        try {
            let fetchUrl = '';
            let targetSetId = null;

            // If a set name is provided, find its ID from our prefetched list
            if (searchSetName.trim()) {
                const lowerSetQuery = searchSetName.toLowerCase();
                const matchedSet = tcgdexSets.find(s => s.name.toLowerCase().includes(lowerSetQuery));

                if (!matchedSet) {
                    alert(`Could not find a Set matching "${searchSetName}".`);
                    setIsSearching(false);
                    return;
                }
                targetSetId = matchedSet.id;
            }

            // Determine fetch strategy
            if (searchCardName.trim() && targetSetId) {
                // If BOTH are provided, pass both directly to the TCGdex backend to massively reduce payload lag!
                fetchUrl = `https://api.tcgdex.net/v2/en/cards?name=${encodeURIComponent(searchCardName)}&set.id=${targetSetId}`;
            } else if (searchCardName.trim()) {
                fetchUrl = `https://api.tcgdex.net/v2/en/cards?name=${encodeURIComponent(searchCardName)}`;
            } else if (targetSetId) {
                fetchUrl = `https://api.tcgdex.net/v2/en/cards?set=${targetSetId}`;
            }

            const response = await fetch(fetchUrl);
            const data = await response.json();

            // TCGdex returns an array of objects: { id, localId, name, image }
            // Filter out items without an image, and rigorously exclude Pokemon TCG Pocket sets
            const BLOCKED_POCKET_SETS = [
                'Promo-A', 'Genetic Apex', 'Mythical Island', 'Space-Time Smackdown',
                'Triumphant Light', 'Shining Revelry', 'Celestial Guardians',
                'Extradimensional Crisis', 'Eevee Grove', 'Wisdom of Sea and Sky',
                'Secluded Springs', 'Deluxe Pack ex', 'Promo-B', 'Mega Rising',
                'Crimson Blaze', 'Fantasical Parade', 'Fantastical Parade', 'Paldean Wonders'
            ];

            let validCards = (data || []).filter(c => {
                if (!c.image) return false;

                // Cross-reference the cards returned against our valid Set Autocomplete list, or the strict block array
                const setId = c.id.split('-')[0];
                const matchedSet = tcgdexSets.find(s => s.id === setId);
                const isExplicitlyBlocked = matchedSet ? BLOCKED_POCKET_SETS.some(b =>
                    matchedSet.name.toLowerCase().includes(b.toLowerCase())
                ) : false;

                const isPocket = isExplicitlyBlocked ||
                    setId.toLowerCase().includes('pocket') ||
                    /^A\d/.test(setId) ||
                    /^B\d/.test(setId) || // Catch pocket series matching B2, etc.
                    setId.startsWith('P-A') ||
                    setId === 'PROMOP' ||
                    // Exclude the card if its set was completely purged from tcgdexSets during initial load
                    (tcgdexSets.length > 0 && !matchedSet);

                return !isPocket;
            });



            // Sort by Card Number (localId) or Chronologically (Set Index)
            validCards.sort((a, b) => {
                const setA = a.id.split('-')[0];
                const setB = b.id.split('-')[0];
                const indexA = tcgdexSets.findIndex(s => s.id === setA);
                const indexB = tcgdexSets.findIndex(s => s.id === setB);

                if (searchSort === 'newest' || searchSort === 'oldest') {
                    // If they are in the same set, fallback to localId
                    if (indexA === indexB) {
                        const localA = parseInt(a.localId?.replace(/\D/g, '')) || 0;
                        const localB = parseInt(b.localId?.replace(/\D/g, '')) || 0;
                        return searchSort === 'newest' ? localB - localA : localA - localB;
                    }
                    return searchSort === 'newest' ? indexB - indexA : indexA - indexB;
                } else {
                    // Sort purely by Card No (localId)
                    const localA = parseInt(a.localId?.replace(/\D/g, '')) || 0;
                    const localB = parseInt(b.localId?.replace(/\D/g, '')) || 0;
                    return searchSort === 'cardno-asc' ? localA - localB : localB - localA;
                }
            });

            setSearchResults([...validCards]); // clone to force React re-render
        } catch (error) {
            console.error("Error fetching from TCGdex:", error);
            alert("Failed to search TCGdex. Try again.");
        } finally {
            setIsSearching(false);
        }
    };

    // Auto-resort current results when searchSort changes to save API calls
    React.useEffect(() => {
        if (searchResults.length === 0) return;

        const resorted = [...searchResults].sort((a, b) => {
            const setA = a.id.split('-')[0];
            const setB = b.id.split('-')[0];
            const indexA = tcgdexSets.findIndex(s => s.id === setA);
            const indexB = tcgdexSets.findIndex(s => s.id === setB);

            if (searchSort === 'newest' || searchSort === 'oldest') {
                if (indexA === indexB) {
                    const localA = parseInt(a.localId?.replace(/\D/g, '')) || 0;
                    const localB = parseInt(b.localId?.replace(/\D/g, '')) || 0;
                    return searchSort === 'newest' ? localB - localA : localA - localB;
                }
                return searchSort === 'newest' ? indexB - indexA : indexA - indexB;
            } else {
                const localA = parseInt(a.localId?.replace(/\D/g, '')) || 0;
                const localB = parseInt(b.localId?.replace(/\D/g, '')) || 0;
                return searchSort === 'cardno-asc' ? localA - localB : localB - localA;
            }
        });

        setSearchResults(resorted);
    }, [searchSort]);

    const handleCardClick = async (card) => {
        setIsLoadingCardDetails(true);
        const setId = card.id.split('-')[0];
        const matchedSet = tcgdexSets.find(s => s.id === setId);
        const setName = matchedSet ? matchedSet.name : 'Unknown Set';

        // Optimistically set the required Add To Store fields (Full Name, Set Name) so the button works instantly
        setSelectedCard({
            ...card,
            name: `${card.name} - ${setName}`,
            set: { name: setName },
            isBasic: true
        });

        try {
            // Fire both network requests concurrently for a huge speed boost
            const [cardRes, setRes] = await Promise.all([
                fetch(`https://api.tcgdex.net/v2/en/cards/${card.id}`),
                fetch(`https://api.tcgdex.net/v2/en/sets/${setId}`).catch(() => null)
            ]);

            const fullDetails = await cardRes.json();

            let releaseDate = null;
            if (setRes && setRes.ok) {
                const setData = await setRes.json();
                releaseDate = setData.releaseDate;
            }

            // Safely merge, ensuring the image URL never disappears if the detail payload omits it
            setSelectedCard({
                ...card,
                ...fullDetails,
                image: fullDetails.image || card.image,
                setReleaseDate: releaseDate
            });
        } catch (error) {
            console.error("Failed to load full card details", error);
        } finally {
            setIsLoadingCardDetails(false);
        }
    };

    // Global listener for closing the modal via Escape key
    React.useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && selectedCard) {
                setSelectedCard(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedCard]);

    const confirmAddCard = async (priceStr) => {
        if (!selectedCard) return;

        const price = parseFloat(priceStr);
        if (isNaN(price) || price < 0) {
            alert("Please enter a valid positive price.");
            return;
        }

        const addResult = await addProduct({
            name: selectedCard.name,
            price: price,
            category: 'singles',
            description: `A single card from TCGdex. Set ID: ${selectedCard.id.split('-')[0]}`,
            image: `${selectedCard.image}/high.webp` // fetch high-res for store
        });

        if (addResult.success) {
            alert(`Added ${selectedCard.name} to store inventory for $${price.toFixed(2)}`);
            setSelectedCard(null); // close modal
        } else {
            alert("Failed to add product: " + addResult.error);
        }
    };

    const handleAddFromSearch = async (card) => {
        // Ask for price
        const priceStr = window.prompt(`Set selling price for ${card.name} (e.g. 5.99):`);
        if (priceStr === null) return; // User cancelled

        const price = parseFloat(priceStr);
        if (isNaN(price) || price < 0) {
            alert('Invalid price entered. Cancelled.');
            return;
        }

        try {
            // We need to fetch the specific card details to get the exact Set Name 
            // because the v2/en/cards search endpoint doesn't return the set explicitly
            const detailRes = await fetch(`https://api.tcgdex.net/v2/en/cards/${card.id}`);
            const detailData = await detailRes.json();

            const setName = detailData.set?.name || 'Unknown Set';
            const fullName = `${detailData.name} - ${setName}`;

            const productToAdd = {
                name: fullName,
                price: price,
                category: 'singles', // default to singles
                image: `${card.image}/high.webp`,
                description: 'A genuine Pokémon Trading Card.',
            };

            const success = await addProduct(productToAdd);
            if (success) {
                alert(`Successfully added ${fullName} for $${price.toFixed(2)}`);
            }
        } catch (error) {
            console.error("Error adding searched card: ", error);
            alert("Something went wrong verifying the card details.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            await removeProduct(id);
        }
    }

    const handleForcedSync = async () => {
        if (!window.confirm(`This will completely wipe current items and re-upload all ${catalogItems.length} mock items with the updated Set Names. Continue?`)) return;

        try {
            alert('Starting forced database sync... this may take 10 seconds. Check console for logs.');

            console.log("Starting Web Client Firestore cleanup and migration...");
            const productsCol = collection(db, 'products');

            console.log("1. Deleting all existing products in Firestore...");
            const existingDocs = await getDocs(productsCol);
            let deleteBatch = writeBatch(db);
            existingDocs.forEach((document) => {
                deleteBatch.delete(doc(db, 'products', document.id));
            });

            await deleteBatch.commit();
            console.log("Finished deleting old mock data.");

            console.log("2. Uploading enriched catalogItems to Firestore...");
            let insertBatch = writeBatch(db);

            for (const item of catalogItems) {
                const newDocRef = doc(productsCol);
                insertBatch.set(newDocRef, {
                    name: item.name,
                    price: item.price,
                    category: item.category,
                    description: item.description,
                    image: item.image,
                    createdAt: new Date()
                });
            }

            await insertBatch.commit();
            console.log("Successfully uploaded new mock data.");
            alert('Migration complete! Refresh the page to see live data.');
            window.location.reload();

        } catch (error) {
            console.error("Migration failed:", error);
            alert('Migration failed! ' + error.message);
        }
    }

    const handleDeleteAll = async () => {
        if (products.length === 0) return;
        if (window.confirm(`⚠️ Are you SURE you want to delete all ${products.length} products? This cannot be undone.`)) {
            try {
                // Remove all concurrently
                await Promise.all(products.map(product => removeProduct(product.id)));
                alert('All products successfully deleted!');
            } catch (error) {
                console.error("Error deleting all products:", error);
                alert("An error occurred while deleting some products.");
            }
        }
    }

    const handleFilterChange = (e) => {
        setFilterCategory(e.target.value);
        setCurrentPage(1);
    };

    const handleSortChange = (e) => {
        setInventorySort(e.target.value);
        setCurrentPage(1);
    };

    // Sort and filter the actual Inventory
    const processedProducts = React.useMemo(() => {
        let filtered = filterCategory === 'All'
            ? [...products]
            : products.filter(p => p.category === filterCategory);

        filtered.sort((a, b) => {
            switch (inventorySort) {
                case 'alpha-asc':
                    return a.name.localeCompare(b.name);
                case 'alpha-desc':
                    return b.name.localeCompare(a.name);
                case 'price-asc':
                    return a.price - b.price;
                case 'price-desc':
                    return b.price - a.price;
                case 'date-old':
                    // Natural index acts as Oldest -> Newest assuming incremental DB additions
                    return products.indexOf(a) - products.indexOf(b);
                case 'date-new':
                default:
                    // Reverse index acts as Newest -> Oldest
                    return products.indexOf(b) - products.indexOf(a);
            }
        });

        return filtered;
    }, [products, filterCategory, inventorySort]);

    const totalPages = Math.ceil(processedProducts.length / ITEMS_PER_PAGE);
    const validCurrentPage = Math.min(currentPage, totalPages > 0 ? totalPages : 1);
    const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE;
    const paginatedProducts = processedProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
        <div className="admin-dashboard">
            <header className="admin-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="7" height="9"></rect>
                        <rect x="14" y="3" width="7" height="5"></rect>
                        <rect x="14" y="12" width="7" height="9"></rect>
                        <rect x="3" y="16" width="7" height="5"></rect>
                    </svg>
                    <h2 style={{ margin: 0 }}>Store Administration</h2>
                </div>
                <p>Manage your inventory, prices, and categories from this dashboard.</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
                    <button
                        onClick={handleForcedSync}
                        style={{ background: '#ec4899', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.25rem', fontSize: '0.8rem' }}
                        title="Setup button to instantly migrate initial mock data to your new database."
                    >
                        Force DB Sync (Update Set Names)
                    </button>
                    <button
                        onClick={handleDeleteAll}
                        style={{ background: '#ef4444', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.25rem', fontSize: '0.8rem' }}
                        title="Warning: This deletes everything."
                    >
                        Delete All Items
                    </button>
                </div>
            </header>

            <div className="admin-tabs" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', borderBottom: '2px solid var(--panel-border)', marginBottom: '2rem' }}>
                <button
                    onClick={() => setActiveTab('inventory')}
                    style={{
                        padding: '1rem 2rem',
                        background: 'transparent',
                        border: 'none',
                        borderBottom: activeTab === 'inventory' ? '3px solid var(--accent)' : '3px solid transparent',
                        color: activeTab === 'inventory' ? 'var(--text-primary)' : 'var(--text-secondary)',
                        fontWeight: activeTab === 'inventory' ? 'bold' : 'normal',
                        cursor: 'pointer',
                        fontSize: '1.1rem'
                    }}
                >
                    Store Inventory
                </button>
                <button
                    onClick={() => setActiveTab('search')}
                    style={{
                        padding: '1rem 2rem',
                        background: 'transparent',
                        border: 'none',
                        borderBottom: activeTab === 'search' ? '3px solid var(--accent)' : '3px solid transparent',
                        color: activeTab === 'search' ? 'var(--text-primary)' : 'var(--text-secondary)',
                        fontWeight: activeTab === 'search' ? 'bold' : 'normal',
                        cursor: 'pointer',
                        fontSize: '1.1rem'
                    }}
                >
                    TCGdex Live Search
                </button>
            </div>

            <div className={`admin-content ${activeTab === 'inventory' ? 'inventory-active' : ''}`} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                {activeTab === 'search' && (
                    <div style={{ width: '100%' }}>

                        {/* TCGdex API Search Form */}
                        <section className="admin-section glass-panel search-active" style={{ padding: '1.5rem' }}>
                            <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="11" cy="11" r="8"></circle>
                                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                    </svg>
                                    <h3 style={{ margin: 0, padding: 0, border: 'none', textAlign: 'center', fontSize: '1.5rem' }}>Live TCGdex Card Search</h3>
                                </div>
                                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', textAlign: 'center' }}>
                                    Search any Pokemon card by name or set, and it instantly adds to your store!
                                </p>
                                <form className="admin-form" onSubmit={handleSearchTcgDex}>
                                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', textAlign: 'left' }}>
                                            <input
                                                type="text"
                                                placeholder="Card Name (e.g. Pikachu)"
                                                value={searchCardName}
                                                onChange={(e) => setSearchCardName(e.target.value)}
                                                style={{ flexGrow: 1 }}
                                            />
                                            <div style={{ position: 'relative', flexGrow: 1 }} ref={autocompleteRef}>
                                                <input
                                                    type="text"
                                                    placeholder="Set Name (e.g. Ascended Heroes)"
                                                    value={searchSetName}
                                                    onChange={(e) => {
                                                        setSearchSetName(e.target.value);
                                                        setShowAutocomplete(true);
                                                        setHighlightedIndex(-1); // Reset highlight when typing
                                                    }}
                                                    onFocus={() => {
                                                        setShowAutocomplete(true);
                                                        setHighlightedIndex(-1);
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (!showAutocomplete || filteredSets.length === 0) return;

                                                        if (e.key === 'ArrowDown') {
                                                            e.preventDefault();
                                                            setHighlightedIndex(prev => (prev < filteredSets.length - 1 ? prev + 1 : prev));
                                                        } else if (e.key === 'ArrowUp') {
                                                            e.preventDefault();
                                                            setHighlightedIndex(prev => (prev > 0 ? prev - 1 : prev));
                                                        } else if (e.key === 'Enter' && highlightedIndex >= 0) {
                                                            e.preventDefault();
                                                            setSearchSetName(filteredSets[highlightedIndex].name);
                                                            setShowAutocomplete(false);
                                                        } else if (e.key === 'Escape') {
                                                            setShowAutocomplete(false);
                                                        }
                                                    }}
                                                    style={{ width: '100%' }}
                                                    autoComplete="off"
                                                />
                                                {showAutocomplete && searchSetName && filteredSets.length > 0 && (
                                                    <ul style={{
                                                        position: 'absolute', top: '100%', left: 0, right: 0,
                                                        background: 'var(--panel-bg)', border: '1px solid var(--panel-border)',
                                                        borderRadius: '4px', maxHeight: '200px', overflowY: 'auto',
                                                        listStyle: 'none', padding: 0, margin: '0.25rem 0 0 0', zIndex: 10
                                                    }}>
                                                        {filteredSets.map((set, idx) => (
                                                            <li
                                                                key={set.id}
                                                                onClick={() => {
                                                                    setSearchSetName(set.name);
                                                                    setShowAutocomplete(false);
                                                                }}
                                                                style={{
                                                                    padding: '0.5rem', cursor: 'pointer',
                                                                    borderBottom: '1px solid rgba(150,150,150,0.1)',
                                                                    background: highlightedIndex === idx ? 'var(--accent)' : 'transparent',
                                                                    color: highlightedIndex === idx ? '#fff' : 'inherit'
                                                                }}
                                                                onMouseEnter={() => setHighlightedIndex(idx)}
                                                            >
                                                                {set.name}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
                                            <button type="submit" className="admin-submit-btn" disabled={isSearching || tcgdexSets.length === 0} style={{ width: 'auto', padding: '0.75rem 2rem', margin: 0 }}>
                                                {isSearching ? '...' : 'Search'}
                                            </button>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', borderTop: '1px solid var(--panel-border)', paddingTop: '1rem' }}>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Sort Results:</label>
                                        <select
                                            value={searchSort}
                                            onChange={(e) => setSearchSort(e.target.value)}
                                            style={{ padding: '0.25rem', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid var(--panel-border)' }}
                                        >
                                            <option value="newest">Newest First (Release)</option>
                                            <option value="oldest">Oldest First (Release)</option>
                                            <option value="cardno-asc">Card No. Low-High</option>
                                            <option value="cardno-desc">Card No. High-Low</option>
                                        </select>
                                    </div>
                                </form>
                            </div>

                            {/* Search Results Display */}
                            {searchResults.length > 0 && (
                                <div style={{ marginTop: '2rem', maxHeight: '650px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '1.5rem', paddingRight: '0.5rem' }}>
                                    {searchResults.map(card => (
                                        <div
                                            key={card.id}
                                            onClick={() => handleCardClick(card)}
                                            style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', transition: 'transform 0.2s' }}
                                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                            title={`Click to add ${card.name}`}
                                        >
                                            <img
                                                src={`${card.image}/low.webp`}
                                                alt={card.name}
                                                style={{ width: '100%', borderRadius: '0.5rem', boxShadow: '0 4px 8px rgba(0,0,0,0.15)' }}
                                                onError={(e) => {
                                                    if (e.target.src.endsWith('/low.webp')) {
                                                        e.target.src = `${card.image}/low.png`;
                                                    }
                                                }}
                                            />
                                            <span style={{ fontSize: '0.9rem', marginTop: '0.5rem', fontWeight: 'bold' }}>{card.name}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {searchResults.length === 0 && (searchCardName || searchSetName) && !isSearching && (
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Press search to find cards...</span>
                            )}
                        </section>
                    </div>
                )}

                {activeTab === 'inventory' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 2fr', gap: '2rem' }}>
                        {/* Manual Add/Edit Product Form */}
                        <section className="admin-section form-section glass-panel" style={{ alignSelf: 'start' }}>
                            <h3 style={{ borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                                {editingProductId ? 'Edit Specific Product' : 'Add Custom Product'}
                            </h3>
                            <form className="admin-form" onSubmit={handleSubmit}>

                                <div className="form-group">
                                    <label htmlFor="name">Product Name *</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={newProduct.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="price">Price ($) *</label>
                                    <input
                                        type="number"
                                        id="price"
                                        name="price"
                                        step="0.01"
                                        value={newProduct.price}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="category">Category</label>
                                    <select
                                        id="category"
                                        name="category"
                                        value={newProduct.category}
                                        onChange={handleInputChange}
                                    >
                                        <option value="sealed">Sealed</option>
                                        <option value="singles">Singles</option>
                                        <option value="graded">Graded</option>
                                        <option value="accessories">Accessories</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="image">Image URL</label>
                                    <input
                                        type="url"
                                        id="image"
                                        name="image"
                                        placeholder="https://..."
                                        value={newProduct.image}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="description">Description</label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        rows="3"
                                        value={newProduct.description}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button type="submit" className="admin-submit-btn">
                                        {editingProductId ? 'Update Product' : 'Add Product to Store'}
                                    </button>
                                    {editingProductId && (
                                        <button type="button" onClick={handleCancelEdit} style={{ background: '#64748b', color: 'white', padding: '0.75rem', borderRadius: '0.25rem', border: 'none', cursor: 'pointer' }}>
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </form>
                        </section>

                        <section className="admin-section inventory-section glass-panel">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                                <h3 style={{ margin: 0 }}>Current Inventory ({processedProducts.length})</h3>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div className="filter-group" style={{ display: 'flex', alignItems: 'center' }}>
                                        <label htmlFor="inventorySort" style={{ marginRight: '0.5rem', fontSize: '0.9rem' }}>Sort:</label>
                                        <select id="inventorySort" value={inventorySort} onChange={handleSortChange} style={{ padding: '0.3rem', borderRadius: '4px', background: '#ffffff', color: '#1e293b' }}>
                                            <option value="date-new">Date: Newest First</option>
                                            <option value="date-old">Date: Oldest First</option>
                                            <option value="alpha-asc">Alphabetical: A-Z</option>
                                            <option value="alpha-desc">Alphabetical: Z-A</option>
                                            <option value="price-asc">Price: Low to High</option>
                                            <option value="price-desc">Price: High to Low</option>
                                        </select>
                                    </div>
                                    <div className="filter-group" style={{ display: 'flex', alignItems: 'center' }}>
                                        <label htmlFor="filterCategory" style={{ marginRight: '0.5rem', fontSize: '0.9rem' }}>Filter:</label>
                                        <select id="filterCategory" value={filterCategory} onChange={handleFilterChange} style={{ padding: '0.3rem', borderRadius: '4px', background: '#ffffff', color: '#1e293b' }}>
                                            <option value="All">All Categories</option>
                                            <option value="singles">Singles</option>
                                            <option value="graded">Graded</option>
                                            <option value="sealed">Sealed</option>
                                            <option value="accessories">Accessories</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="table-responsive">
                                <table className="inventory-table">
                                    <thead>
                                        <tr>
                                            <th>Image</th>
                                            <th>Name</th>
                                            <th>Category</th>
                                            <th>Price</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedProducts.map(product => (
                                            <tr key={product.id}>
                                                <td>
                                                    <img src={product.image} alt={product.name} className="admin-table-img" />
                                                </td>
                                                <td className="font-medium">{product.name}</td>
                                                <td>
                                                    <span className={`category-badge ${product.category}`}>
                                                        {product.category}
                                                    </span>
                                                </td>
                                                <td className="font-bold text-accent">${product.price.toFixed(2)}</td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                        <button
                                                            className="edit-btn"
                                                            onClick={() => handleEdit(product)}
                                                            style={{ background: '#3b82f6', color: 'white', padding: '0.35rem 0.6rem', borderRadius: '0.25rem', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}
                                                            aria-label="Edit product"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            className="delete-btn"
                                                            onClick={() => handleDelete(product.id)}
                                                            aria-label="Delete product"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {paginatedProducts.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="text-center">No products found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {totalPages > 1 && (
                                <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={validCurrentPage === 1}
                                        style={{ padding: '0.5rem 1rem', borderRadius: '0.25rem', border: '1px solid var(--panel-border)', background: validCurrentPage === 1 ? 'transparent' : 'var(--panel-bg)', color: validCurrentPage === 1 ? 'var(--text-secondary)' : 'var(--text-primary)', cursor: validCurrentPage === 1 ? 'not-allowed' : 'pointer' }}
                                    >
                                        Previous
                                    </button>
                                    <span style={{ fontWeight: 'bold' }}>
                                        Page {validCurrentPage} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={validCurrentPage === totalPages}
                                        style={{ padding: '0.5rem 1rem', borderRadius: '0.25rem', border: '1px solid var(--panel-border)', background: validCurrentPage === totalPages ? 'transparent' : 'var(--panel-bg)', color: validCurrentPage === totalPages ? 'var(--text-secondary)' : 'var(--text-primary)', cursor: validCurrentPage === totalPages ? 'not-allowed' : 'pointer' }}
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </section>
                    </div>
                )}
            </div>

            {/* Card Detail Modal */}
            {selectedCard && (
                <div
                    onClick={() => setSelectedCard(null)}
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                        zIndex: 9999, padding: '2rem'
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="glass-panel"
                        style={{
                            maxWidth: '850px', width: '100%', padding: '2rem', display: 'flex',
                            flexDirection: 'column', gap: '1.5rem', position: 'relative',
                            maxHeight: '90vh', overflowY: 'auto'
                        }}
                    >
                        <button
                            onClick={() => setSelectedCard(null)}
                            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-primary)', zIndex: 10 }}
                        >&times;</button>

                        <h2 style={{ margin: 0, paddingRight: '2rem' }}>{selectedCard.name}</h2>

                        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                            {/* Left Column: Image */}
                            <div style={{ flex: '1 1 300px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
                                <img
                                    src={selectedCard.image ? `${selectedCard.image}/high.webp` : ''}
                                    alt={selectedCard.name}
                                    style={{ width: '100%', maxWidth: '350px', borderRadius: '0.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}
                                    onError={(e) => {
                                        // Some cards lack the specific /high.webp extension format, so we gracefully cascade downwards
                                        if (e.target.src.endsWith('/high.webp')) {
                                            e.target.src = `${selectedCard.image}/low.webp`;
                                        } else if (e.target.src.endsWith('/low.webp')) {
                                            e.target.src = `${selectedCard.image}/high.png`;
                                        } else if (e.target.src.endsWith('/high.png')) {
                                            e.target.src = `${selectedCard.image}/low.png`;
                                        }
                                    }}
                                />
                            </div>

                            {/* Right Column: Details */}
                            <div style={{ flex: '2 1 300px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.5rem 1rem', fontSize: '0.95rem' }}>
                                    {selectedCard.set?.name && (
                                        <>
                                            <strong style={{ color: 'var(--text-secondary)' }}>Set:</strong>
                                            <span>{selectedCard.set.name}</span>
                                        </>
                                    )}
                                    {selectedCard.localId && (
                                        <>
                                            <strong style={{ color: 'var(--text-secondary)' }}>Card No:</strong>
                                            <span>{selectedCard.localId}</span>
                                        </>
                                    )}

                                    {isLoadingCardDetails ? (
                                        <div style={{ gridColumn: '1 / -1', padding: '1rem 0', color: 'var(--text-secondary)', fontStyle: 'italic' }}>Loading extended details...</div>
                                    ) : (
                                        <>
                                            {selectedCard.rarity && (
                                                <>
                                                    <strong style={{ color: 'var(--text-secondary)' }}>Rarity:</strong>
                                                    <span>{selectedCard.rarity.replace(/\b\w/g, char => char.toUpperCase())}</span>
                                                </>
                                            )}
                                            {selectedCard.hp && (
                                                <>
                                                    <strong style={{ color: 'var(--text-secondary)' }}>HP:</strong>
                                                    <span>{selectedCard.hp}</span>
                                                </>
                                            )}
                                            {selectedCard.types && selectedCard.types.length > 0 && (
                                                <>
                                                    <strong style={{ color: 'var(--text-secondary)' }}>Type:</strong>
                                                    <span>{selectedCard.types.join(', ')}</span>
                                                </>
                                            )}
                                            {selectedCard.stage && (
                                                <>
                                                    <strong style={{ color: 'var(--text-secondary)' }}>Stage:</strong>
                                                    <span>{selectedCard.stage}</span>
                                                </>
                                            )}
                                            {selectedCard.illustrator && (
                                                <>
                                                    <strong style={{ color: 'var(--text-secondary)' }}>Illustrator:</strong>
                                                    <span>{selectedCard.illustrator}</span>
                                                </>
                                            )}
                                            {selectedCard.setReleaseDate && (
                                                <>
                                                    <strong style={{ color: 'var(--text-secondary)' }}>Release Date:</strong>
                                                    <span>{new Date(selectedCard.setReleaseDate).toLocaleDateString()}</span>
                                                </>
                                            )}
                                        </>
                                    )}
                                </div>

                                {!isLoadingCardDetails && selectedCard.attacks && selectedCard.attacks.length > 0 && (
                                    <div style={{ marginTop: '0.5rem' }}>
                                        <strong style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.25rem' }}>Attacks</strong>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            {selectedCard.attacks.map((attack, idx) => (
                                                <div key={idx} style={{ fontSize: '0.9rem', background: 'rgba(150,150,150,0.05)', padding: '0.5rem', borderRadius: '0.25rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                                                        <span>{attack.name}</span>
                                                        {attack.damage && <span>{attack.damage}</span>}
                                                    </div>
                                                    {attack.effect && <div style={{ color: 'var(--text-secondary)' }}>{attack.effect}</div>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div style={{ marginTop: 'auto', paddingTop: '1.5rem' }}>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                        Set your selling price to add this card to your store.
                                    </p>
                                    <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                                        <button
                                            onClick={() => {
                                                const price = window.prompt(`Set selling price for ${selectedCard.name} (e.g. 5.99):`);
                                                if (price) confirmAddCard(price);
                                            }}
                                            className="admin-submit-btn"
                                            style={{ flex: 1, margin: 0, padding: '0.75rem' }}
                                        >
                                            Add to Store
                                        </button>
                                        <button
                                            onClick={() => setSelectedCard(null)}
                                            style={{ flex: 1, background: '#ef4444', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer', padding: '0.75rem' }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
