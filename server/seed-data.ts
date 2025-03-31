import { storage } from './storage';
import { InsertReceipt, InsertSavingsChallenge } from '../shared/schema';

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

// Create seed savings challenges
export async function seedSavingsChallenges() {
  // Sample challenges data
  const challengeTypes = ["weekly", "monthly"];
  const challengeDifficulties = ["easy", "medium", "hard"];
  const categories = ["Food & Dining", "Groceries", "Transportation", "Coffee", "Shopping", "Entertainment"];
  const icons = ["coffee", "utensils", "shopping-bag", "target", "trophy"];
  const colorSchemes = ["#3B82F6", "#10B981", "#EC4899", "#F59E0B", "#6366F1", "#8B5CF6"];
  
  // Sample challenges
  const challengeTemplates = [
    {
      name: "Coffee Break Challenge",
      description: "Cut back on coffee expenses this week and save money by making coffee at home.",
      type: "weekly",
      category: "Food & Dining",
      difficulty: "easy",
      icon: "coffee",
      targetAmount: randomAmount(20, 40).toString(),
      colorScheme: "#3B82F6",
      status: "active"
    },
    {
      name: "Grocery Smart Saver",
      description: "Plan your meals and shop with a list to reduce your grocery spending.",
      type: "weekly",
      category: "Groceries",
      difficulty: "medium",
      icon: "shopping-bag",
      targetAmount: randomAmount(40, 80).toString(),
      colorScheme: "#10B981",
      status: "active"
    },
    {
      name: "Transportation Trim",
      description: "Use public transit or bike instead of rideshares to reach your saving goal.",
      type: "weekly",
      category: "Transportation", 
      difficulty: "medium",
      icon: "target",
      targetAmount: randomAmount(30, 60).toString(),
      colorScheme: "#F59E0B",
      status: "active"
    },
    {
      name: "No-Spend Weekend",
      description: "Challenge yourself to spend $0 on entertainment this weekend.",
      type: "weekly",
      category: "Entertainment",
      difficulty: "hard",
      icon: "trophy",
      targetAmount: randomAmount(50, 100).toString(),
      colorScheme: "#8B5CF6",
      status: "active"
    },
    {
      name: "Dining Out Detox",
      description: "Cook at home instead of eating out this month and save the difference.",
      type: "monthly",
      category: "Food & Dining",
      difficulty: "hard",
      icon: "utensils",
      targetAmount: randomAmount(120, 200).toString(),
      colorScheme: "#EC4899",
      status: "active"
    },
    {
      name: "Completed Challenge",
      description: "This challenge is already completed. You've reached your goal!",
      type: "weekly",
      category: "Shopping",
      difficulty: "easy",
      icon: "trophy",
      targetAmount: "50",
      currentAmount: "50",
      colorScheme: "#6366F1",
      status: "completed"
    }
  ];
  
  // Create a date for challenges
  const today = new Date();
  
  for (const template of challengeTemplates) {
    // Set start/end dates based on type
    const startDate = new Date(today);
    const endDate = new Date(today);
    
    if (template.type === "weekly") {
      // Weekly challenge ends in 7 days
      endDate.setDate(today.getDate() + 7);
    } else {
      // Monthly challenge ends in 30 days
      endDate.setDate(today.getDate() + 30);
    }
    
    // Add milestones for challenge
    let milestones = null;
    const targetAmount = parseFloat(template.targetAmount);
    
    if (targetAmount > 0) {
      // Create 3 milestones at 25%, 50%, and 75% of the target
      milestones = [
        {
          amount: Math.round(targetAmount * 0.25 * 100) / 100,
          reached: template.status === "completed" ? true : false,
          reward: "Achievement Badge"
        },
        {
          amount: Math.round(targetAmount * 0.5 * 100) / 100,
          reached: template.status === "completed" ? true : false,
          reward: "Special Status"
        },
        {
          amount: Math.round(targetAmount * 0.75 * 100) / 100,
          reached: template.status === "completed" ? true : false,
          reward: "Progress Boost"
        }
      ];
    }
    
    // Create the challenge
    const challenge: InsertSavingsChallenge = {
      name: template.name,
      description: template.description,
      targetAmount: template.targetAmount,
      currentAmount: template.currentAmount || "0",
      startDate: startDate,
      endDate: endDate,
      status: template.status,
      type: template.type,
      category: template.category,
      difficulty: template.difficulty,
      icon: template.icon,
      colorScheme: template.colorScheme,
      milestones: milestones,
      userId: null
    };
    
    await storage.createSavingsChallenge(challenge);
  }
  
  // Return challenge count to confirm
  const challenges = await storage.getAllSavingsChallenges();
  return challenges.length;
}