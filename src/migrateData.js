import { collection, addDoc } from 'firebase/firestore';
import { db, isConfigured } from './firebase.js';
import { catalogItems } from './data/mockItems.js';

export async function runMigration() {
    if (!isConfigured || !db) {
        console.error("Firebase is not configured! Check your .env setup.");
        return false;
    }

    console.log("Starting database migration...");

    try {
        for (const item of catalogItems) {
            // Removing the hardcoded integer IDs so Firestore can auto-generate doc IDs
            const { id, ...itemData } = item;

            const docRef = await addDoc(collection(db, "products"), itemData);
            console.log(`Migrated ${itemData.name} -> ID: ${docRef.id}`);
        }

        console.log("Migration complete!");
        return true;
    } catch (error) {
        console.error("Error migrating data: ", error);
        return false;
    }
}
