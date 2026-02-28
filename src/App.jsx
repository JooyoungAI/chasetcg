import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Catalog from './components/Catalog'
import ShoppingCart from './components/ShoppingCart'
import { catalogItems } from './data/mockItems'
import './App.css'
import './components/Navbar.css'

function App() {
  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)

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

  return (
    <>
      <Navbar cart={cart} theme={theme} toggleTheme={toggleTheme} toggleCart={toggleCart} />

      <main className="main-content">
        <header className="catalog-header">
          <h2>Our Latest Collection</h2>
          <p>Discover premium tech and lifestyle products crafted for excellence.</p>
        </header>

        <Catalog items={catalogItems} addToCart={addToCart} />
      </main>

      <ShoppingCart
        cart={cart}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
      />
    </>
  )
}

export default App
