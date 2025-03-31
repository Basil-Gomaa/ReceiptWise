import { storage } from './storage';
import { InsertReceipt } from '../shared/schema';

// Random merchant names for each category
const merchantsByCategory = {
  // Food & Dining (id: 1)
  1: [
    "Starbucks", 
    "McDonald's", 
    "Chipotle", 
    "Olive Garden", 
    "The Cheesecake Factory",
    "Subway",
    "Panera Bread",
    "Burger King",
    "Pizza Hut",
    "Domino's Pizza"
  ],
  
  // Groceries (id: 2)
  2: [
    "Whole Foods", 
    "Trader Joe's", 
    "Kroger", 
    "Safeway", 
    "Publix",
    "Walmart",
    "Target",
    "Costco",
    "Aldi",
    "Albertsons"
  ],
  
  // Transportation (id: 3)
  3: [
    "Uber", 
    "Lyft", 
    "Shell", 
    "Chevron", 
    "Exxon",
    "BP",
    "Delta Airlines",
    "American Airlines",
    "Enterprise Rent-A-Car",
    "Amtrak"
  ],
  
  // Utilities (id: 4)
  4: [
    "AT&T", 
    "Verizon", 
    "Comcast", 
    "Pacific Gas & Electric", 
    "SoCal Edison",
    "Spectrum",
    "Con Edison",
    "Water District",
    "Waste Management",
    "T-Mobile"
  ],
  
  // Shopping (id: 5)
  5: [
    "Amazon", 
    "Best Buy", 
    "Apple", 
    "Nike", 
    "Macy's",
    "The Home Depot",
    "Lowe's",
    "IKEA",
    "Nordstrom",
    "REI"
  ],
  
  // Subscriptions (id: 6)
  6: [
    "Netflix", 
    "Spotify", 
    "Amazon Prime", 
    "Disney+", 
    "Hulu",
    "HBO Max",
    "Apple TV+",
    "YouTube Premium",
    "New York Times",
    "Adobe Creative Cloud"
  ]
};

// Generate a random date between start and end date
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Generate a random float between min and max with 2 decimal places
function randomAmount(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

// Create seed data
export async function seedDummyReceipts() {
  const endDate = new Date(); // Today
  const startDate = new Date();
  startDate.setMonth(endDate.getMonth() - 6); // 6 months ago
  
  // Number of receipts to generate per category
  const receiptsPerCategory = 5;
  
  // Generate receipts for each category
  for (const [categoryId, merchants] of Object.entries(merchantsByCategory)) {
    const categoryIdNum = parseInt(categoryId, 10);
    
    for (let i = 0; i < receiptsPerCategory; i++) {
      const merchantIndex = Math.floor(Math.random() * merchants.length);
      const merchantName = merchants[merchantIndex];
      
      // Generate random amounts based on category
      let minAmount = 10;
      let maxAmount = 100;
      
      switch (categoryIdNum) {
        case 1: // Food & Dining
          minAmount = 8;
          maxAmount = 75;
          break;
        case 2: // Groceries
          minAmount = 20;
          maxAmount = 200;
          break;
        case 3: // Transportation
          minAmount = 15;
          maxAmount = 150;
          break;
        case 4: // Utilities
          minAmount = 40;
          maxAmount = 250;
          break;
        case 5: // Shopping
          minAmount = 25;
          maxAmount = 500;
          break;
        case 6: // Subscriptions
          minAmount = 5;
          maxAmount = 50;
          break;
      }
      
      const total = randomAmount(minAmount, maxAmount);
      const date = randomDate(startDate, endDate);
      
      const receipt: InsertReceipt = {
        merchantName,
        total: total.toString(), // Convert to string as expected by the schema
        date,
        categoryId: categoryIdNum,
        ocrText: `Receipt from ${merchantName}. Total: $${total.toFixed(2)}. Date: ${date.toLocaleString()}`
      };
      
      await storage.createReceipt(receipt);
    }
  }
  
  // Return receipt count to confirm
  const receipts = await storage.getAllReceipts();
  return receipts.length;
}