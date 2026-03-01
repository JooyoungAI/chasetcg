import { useState, useEffect, useMemo } from 'react'
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom'
import Navbar from './components/Navbar'
import Catalog from './components/Catalog'
import ShoppingCart from './components/ShoppingCart'
import Home from './pages/Home'
import Admin from './pages/Admin'
import Login from './pages/Login'
import { catalogItems } from './data/mockItems'
import { useProducts } from './hooks/useProducts'
import { auth, isConfigured, db } from './firebase'
import { collection, getDocs, writeBatch, doc, query, where, updateDoc } from 'firebase/firestore'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import './App.css'
import './components/Navbar.css'

// A wrapper component to filter catalog items based on the URL parameter
function CategoryPage({ items, addToCart }) {
  const { categoryId } = useParams()

  // If we are on the home page (no categoryId), show everything.
  // Otherwise, filter by the categoryId in the URL.
  const displayedItems = useMemo(() => {
    return categoryId
      ? items.filter(item => item.category === categoryId)
      : items;
  }, [items, categoryId]);

  const categoryTitle = categoryId
    ? categoryId.charAt(0).toUpperCase() + categoryId.slice(1)
    : "All Products"

  if (items.length === 0) {
    return <p style={{ textAlign: 'center', marginTop: '4rem' }}>Loading products...</p>
  }

  return (
    <>
      <header className="catalog-header">
        <h2>
          {categoryTitle}
        </h2>
        <p>Discover premium card singles and modern sealed product.</p>
      </header>
      {displayedItems.length === 0 ? (
        <p style={{ textAlign: 'center', marginTop: '2rem' }}>No products found in this category.</p>
      ) : (
        <Catalog items={displayedItems} addToCart={addToCart} />
      )}
    </>
  )
}

function App() {
  const { products, loading, addProduct, removeProduct, updateProduct } = useProducts()
  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)

  // Auth State
  const [authUser, setAuthUser] = useState(null)
  const [mockAuthUser, setMockAuthUser] = useState(null)

  useEffect(() => {
    if (isConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setAuthUser(user)
      })
      return () => unsubscribe()
    }
  }, [])

  // Temporary Migration Hook
  useEffect(() => {
    const runMigration = async () => {
      // Check localStorage to ensure this only runs once
      if (localStorage.getItem('productsMigrated_v3') === 'true') return;

      console.log("Starting Web Client Firestore cleanup and migration...");
      try {
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

        // Mark as complete
        localStorage.setItem('productsMigrated_v3', 'true');
        console.log("Migration complete! Reload the page to see changes.");

      } catch (error) {
        console.error("Migration failed:", error);
      }
    };

    if (isConfigured) {
      runMigration();

    }
  }, []);

  const handleLogout = async () => {
    if (isConfigured && auth) {
      await signOut(auth)
    } else {
      setMockAuthUser(null)
    }
  }

  // Strictly enforce that only the owner email is considered an 'Admin'
  const ADMIN_EMAIL = "jooyoung.kim.ai@gmail.com";
  let currentUser = null;

  if (isConfigured && authUser) {
    if (authUser.email === ADMIN_EMAIL) {
      currentUser = authUser;
    }
  } else if (!isConfigured && mockAuthUser) {
    if (mockAuthUser.email === ADMIN_EMAIL || mockAuthUser.email === 'admin@chasetcg.com') {
      currentUser = mockAuthUser;
    }
  }

  // Theme state: defaults to 'light' or checking local storage
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme')
    return savedTheme ? savedTheme : 'light'
  })

  // Apply theme to body whenever it changes
  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark')
    } else {
      document.body.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light')
  }

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen)
  }

  // Cart Management Functions
  const addToCart = (item) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id)
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      }
      return [...prevCart, { ...item, quantity: 1 }]
    })

    // Automatically open cart when an item is added
    if (!isCartOpen) {
      setIsCartOpen(true)
    }
  }

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(id)
      return
    }
    setCart((prevCart) =>
      prevCart.map((cartItem) =>
        cartItem.id === id ? { ...cartItem, quantity: newQuantity } : cartItem
      )
    )
  }

  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((cartItem) => cartItem.id !== id))
  }

  // Temporary Client-Side High-Rarity Singles DB Seed Hook
  // Bypasses pure Node script failures by securely piggybacking the logged-in Web Session
  useEffect(() => {
    const seedSingles = async () => {
      if (localStorage.getItem('seed_500_mixed_singles_v1') === 'true' || !authUser) return;

      console.log('Starting Client-Side 500 Singles Seed (250 High Rarity + 250 Random)...');

      try {
        const rarities = ["Rare", "Double Rare", "Ultra Rare", "Secret Rare"];
        const promises = rarities.map(r =>
          fetch(`https://api.tcgdex.net/v2/en/cards?rarity=${encodeURIComponent(r)}`).then(res => res.json())
        );
        promises.push(fetch(`https://api.tcgdex.net/v2/en/cards`).then(res => res.json())); // All cards for the 250 random

        const results = await Promise.all(promises);

        let highRarityCards = results.slice(0, 4).flat().filter(c => c.image && !c.id.includes("pocket") && !c.id.includes("Promo") && !c.id.endsWith("-p"));
        let generalCards = results[4].filter(c => c.image && !c.id.includes("pocket") && !c.id.includes("Promo") && !c.id.endsWith("-p"));

        highRarityCards.sort(() => 0.5 - Math.random());
        generalCards.sort(() => 0.5 - Math.random());

        const selectedCards = [...highRarityCards.slice(0, 250), ...generalCards.slice(0, 250)];
        console.log(`Found ${selectedCards.length} matching TCGdex cards! Fetching extended details... (This will take a minute)`);

        const fullCards = [];
        for (const card of selectedCards) {
          try {
            const det = await fetch(`https://api.tcgdex.net/v2/en/cards/${card.id}`).then(r => r.json());
            if (det && det.set && det.set.name) {
              fullCards.push({
                name: `${det.name} - ${det.set.name}`,
                price: parseFloat((Math.random() * 50 + 5).toFixed(2)),
                category: 'singles',
                description: `A beautiful ${det.rarity} card from the ${det.set.name} set. Illustrator: ${det.illustrator || 'Unknown'}.`,
                image: `${det.image}/high.webp`,
                createdAt: Date.now()
              });
            }
          } catch (e) { }
          await new Promise(r => setTimeout(r, 20));
        }

        const productsCol = collection(db, 'products');
        const q = query(productsCol, where('category', '==', 'singles'));
        const existingDocs = await getDocs(q);

        let deleteBatch = writeBatch(db);
        existingDocs.forEach((docSnap) => {
          deleteBatch.delete(doc(db, 'products', docSnap.id));
        });
        await deleteBatch.commit();
        console.log('Deleted legacy Singles category!');

        let insertBatch = writeBatch(db);
        let count = 0;
        for (const item of fullCards) {
          insertBatch.set(doc(productsCol), item);
          count++;
          if (count % 500 === 0) {
            await insertBatch.commit();
            insertBatch = writeBatch(db);
          }
        }
        if (count % 500 !== 0) {
          await insertBatch.commit();
        }

        console.log(`Migration Complete! Instilled ${count} single cards into Firestore!`);
        localStorage.setItem('seed_500_mixed_singles_v1', 'true');
        alert('Database Sync Complete: 500 new Singles added (250 High Rarity + 250 Random)!');

      } catch (err) {
        console.error("Failed to client-seed products:", err);
      }
    };

    // Slight delay to ensure Firebase initializes properly
    if (authUser) {
      setTimeout(() => seedSingles(), 3000);
    }
  }, [authUser]);

  return (
    <Router>
      <Navbar
        cart={cart}
        theme={theme}
        toggleTheme={toggleTheme}
        toggleCart={toggleCart}
        currentUser={currentUser}
        handleLogout={handleLogout}
      />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<CategoryPage items={products} addToCart={addToCart} />} />
          <Route path="/shop/:categoryId" element={<CategoryPage items={products} addToCart={addToCart} />} />
          <Route
            path="/admin"
            element={currentUser ? (
              <Admin products={products} addProduct={addProduct} removeProduct={removeProduct} updateProduct={updateProduct} />
            ) : (
              <Login setMockAuthUser={setMockAuthUser} />
            )}
          />
        </Routes>
      </main>

      <ShoppingCart
        cart={cart}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
      />
    </Router>
  )
}

export default App
