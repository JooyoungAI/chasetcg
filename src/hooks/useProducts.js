import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, isConfigured } from '../firebase';
import { catalogItems as mockData } from '../data/mockItems';

export function useProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadProducts() {
            if (isConfigured && db) {
                try {
                    const querySnapshot = await getDocs(collection(db, "products"));
                    const fetchedItems = [];
                    querySnapshot.forEach((docSnap) => {
                        fetchedItems.push({ id: docSnap.id, ...docSnap.data() });
                    });
                    setProducts(fetchedItems);
                } catch (error) {
                    console.error("Error fetching products from Firebase:", error);
                    setProducts(mockData); // Fallback to mock data on error
                }
            } else {
                // Fallback to mock data if no config is present
                setProducts(mockData);
            }
            setLoading(false);
        }

        loadProducts();
    }, []);

    const addProduct = async (productData) => {
        if (isConfigured && db) {
            try {
                const docRef = await addDoc(collection(db, "products"), productData);
                setProducts(prev => [...prev, { id: docRef.id, ...productData }]);
                return true;
            } catch (error) {
                console.error("Error adding product:", error);
                return false;
            }
        } else {
            // Local fallback
            setProducts(prev => [...prev, { ...productData, id: Date.now().toString() }]);
            return true;
        }
    };

    const removeProduct = async (id) => {
        if (isConfigured && db) {
            try {
                await deleteDoc(doc(db, "products", id.toString()));
                setProducts(prev => prev.filter(p => p.id !== id));
                return true;
            } catch (error) {
                console.error("Error deleting product:", error);
                return false;
            }
        } else {
            // Local fallback
            setProducts(prev => prev.filter(p => p.id !== id));
            return true;
        }
    };

    return { products, loading, addProduct, removeProduct };
}
