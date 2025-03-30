import { createCanvas, loadImage } from "canvas";
import * as fs from 'fs/promises';
import * as path from 'path';

// Same OCR extraction functions from routes.ts
function extractMerchantName(ocrText: string): string {
  // Try different extraction methods for merchant name
  const lines = ocrText.split('\n');
  
  // Method 1: First line is often the merchant name
  if (lines.length > 0) {
    return lines[0].trim();
  }
  
  // Method 2: Look for text patterns common in Gemini AI responses
  const merchantMatch = ocrText.match(/merchant(?:\s+name)?[\s:]+([^\n]+)/i);
  if (merchantMatch && merchantMatch[1]) {
    return merchantMatch[1].trim();
  }
  
  return "Unknown";
}

function extractTotalAmount(ocrText: string): number {
  // Structure to store potential totals with their confidence scores
  const potentialTotals: { amount: number; confidence: number }[] = [];
  
  // Method 1: Look for TOTAL or TOTAL AMOUNT specifically in all caps (highest confidence)
  // We use a regex that looks for TOTAL followed by whitespace and then capture the amount
  const totalRegex1 = /TOTAL(?:\s+AMOUNT)?[\s:]*\$?\s*(\d+(?:\.\d+)?)/i;
  const totalMatch1 = ocrText.match(totalRegex1);
  if (totalMatch1 && totalMatch1[1]) {
    const amount = parseFloat(totalMatch1[1]);
    if (!isNaN(amount)) {
      potentialTotals.push({ amount, confidence: 100 });
      console.log("Found total using Method 1 (ALL CAPS):", amount);
    }
  }
  
  // Method 2: Look for "Total: $XX.XX" pattern
  const totalRegex2 = /total[:\s]*\$?(\d+\.?\d*)/i;
  const totalMatch2 = ocrText.match(totalRegex2);
  if (totalMatch2 && totalMatch2[1]) {
    const amount = parseFloat(totalMatch2[1]);
    if (!isNaN(amount)) {
      potentialTotals.push({ amount, confidence: 90 });
      console.log("Found total using Method 2:", amount);
    }
  }
  
  // Method 3: Look for currency symbol followed by the largest number
  const currencyMatches = Array.from(ocrText.matchAll(/(?:€|\$|£)\s?(\d+\.?\d*)/gi));
  if (currencyMatches && currencyMatches.length > 0) {
    let largestAmount = 0;
    currencyMatches.forEach(match => {
      if (match && match[1]) {
        const amount = parseFloat(match[1]);
        if (!isNaN(amount) && amount > largestAmount) {
          largestAmount = amount;
        }
      }
    });
    
    if (largestAmount > 0) {
      potentialTotals.push({ amount: largestAmount, confidence: 80 });
      console.log("Found total using Method 3 (currency symbols):", largestAmount);
    }
  }
  
  // Method 4: Look for common total indicators with numbers nearby
  const totalRegex4 = /(?:total|amount|sum|due|zu zahlen|summe|betrag|gesamt)(?:.{1,25})(\d+\.?\d*)/i;
  const totalMatch4 = ocrText.match(totalRegex4);
  if (totalMatch4 && totalMatch4[1]) {
    const amount = parseFloat(totalMatch4[1]);
    if (!isNaN(amount)) {
      potentialTotals.push({ amount, confidence: 75 });
      console.log("Found total using Method 4:", amount);
    }
  }
  
  // Method 5: Look for subtotal/tax/total pattern (common in receipts)
  // Typically, the last number after subtotal and tax is the total
  const subtotalMatch = ocrText.match(/subtotal[\s:]*\$?(\d+\.?\d*)/i);
  const taxMatch = ocrText.match(/tax[\s:]*\$?(\d+\.?\d*)/i);
  
  if (subtotalMatch && subtotalMatch[1] && taxMatch && taxMatch[1]) {
    const subtotal = parseFloat(subtotalMatch[1]);
    const tax = parseFloat(taxMatch[1]);
    
    if (!isNaN(subtotal) && !isNaN(tax)) {
      const calculatedTotal = subtotal + tax;
      
      // Look for numbers close to our calculated total
      const allNumbers = ocrText.match(/\d+\.\d+/g);
      if (allNumbers) {
        const parsedNumbers = allNumbers.map(num => parseFloat(num));
        
        for (const num of parsedNumbers) {
          // If we find a number within 1% of our calculated total, it's likely the actual total
          if (Math.abs(num - calculatedTotal) / calculatedTotal < 0.01) {
            potentialTotals.push({ amount: num, confidence: 85 });
            console.log("Found total using Method 5 (subtotal + tax verification):", num);
            break;
          }
        }
      }
    }
  }
  
  // Method 6: Look for two-digit numbers with decimal point followed by exactly two digits
  // This is good for catching totals like 54.50
  const preciseNumbers = ocrText.match(/\b(\d{2,})\.(\d{2})\b/g);
  if (preciseNumbers && preciseNumbers.length > 0) {
    const parsedNumbers = preciseNumbers.map(num => parseFloat(num));
    const largestNumber = Math.max(...parsedNumbers.filter(num => !isNaN(num)));
    if (largestNumber > 0) {
      // If this is significantly larger than other detected totals, give it higher confidence
      let confidence = 60;
      for (const potential of potentialTotals) {
        if (largestNumber > potential.amount * 2) {
          confidence = 70; // Higher confidence if it's much larger
          break;
        }
      }
      potentialTotals.push({ amount: largestNumber, confidence });
      console.log("Found precise total using Method 6:", largestNumber);
    }
  }
  
  // Method 7: Look for the largest number with decimal point in the receipt
  // This is a fallback method when all else fails
  const allNumbers = ocrText.match(/\d+\.\d+/g);
  if (allNumbers && allNumbers.length > 0 && potentialTotals.length === 0) {
    const parsedNumbers = allNumbers.map(num => parseFloat(num));
    const largestNumber = Math.max(...parsedNumbers.filter(num => !isNaN(num)));
    if (largestNumber > 0) {
      potentialTotals.push({ amount: largestNumber, confidence: 50 });
      console.log("Found total using fallback Method 7:", largestNumber);
    }
  }
  
  // Method 8: Look for Gemini AI specific patterns
  const totalMatch8 = ocrText.match(/(?:total|amount|sum)(?:\s+amount)?[\s:]+\$?(\d+\.?\d*)/i);
  if (totalMatch8 && totalMatch8[1]) {
    const amount = parseFloat(totalMatch8[1]);
    if (!isNaN(amount)) {
      potentialTotals.push({ amount, confidence: 65 });
      console.log("Found total using Gemini pattern Method 8:", amount);
    }
  }
  
  // If we found potential totals, return the one with highest confidence
  if (potentialTotals.length > 0) {
    // Sort by confidence (descending)
    potentialTotals.sort((a, b) => b.confidence - a.confidence);
    console.log("All potential totals:", potentialTotals);
    return potentialTotals[0].amount;
  }
  
  console.log("Could not extract total amount");
  return 0;
}

async function testOCRParsing() {
  console.log("Testing OCR extraction patterns...");
  
  // Test various receipt texts
  const testTexts = [
    `ABC STORE
    1234 Main Street
    New York, NY 10001
    Date: 03/15/2023
    
    Item 1             $10.99
    Item 2             $24.50
    Item 3             $19.01
    
    Subtotal          $54.50
    Tax                $4.50
    TOTAL             $59.00`,
    
    `GROCERY MART
    Receipt: #1234
    
    Apples     2lb    $4.50
    Oranges    3lb    $6.75
    Milk       1gal   $3.99
    
    Total: $15.24`,
    
    `COFFEE SHOP
    15.03.2023
    
    Latte            4.50
    Croissant        3.25
    
    Amount Due: €7.75`,
    
    `DEPARTMENT STORE
    Date: 2023-04-01
    
    Shirt            24.99
    Pants            34.95
    Socks             7.50
    
    Total Amount    $67.44`,
    
    `PROBLEMATIC RECEIPT
    Date: 05/12/2023
    
    Coffee              $3.75
    Sandwich           $7.25
    Chips              $1.50
    Soft Drinks        $2.00
    
    Subtotal          $14.50
    Tax               $1.25
    Service Fee        $1.25
    
    TOTAL             $17.00
    
    *IMPORTANT* 
    Subtotal          54.50
    
    The store thanks you!`,
    
    `ANOTHER PROBLEM RECEIPT
    123 Main Street
    New York, NY
    
    Item 1              4.99
    Item 2              9.99
    Item 3             39.52
    
    TOTAL $           54.50
    
    Thank you for shopping with us!`
  ];
  
  for (let i = 0; i < testTexts.length; i++) {
    console.log(`\n---- Test Text ${i+1} ----`);
    const text = testTexts[i];
    console.log("OCR Text:\n", text);
    
    const merchantName = extractMerchantName(text);
    const totalAmount = extractTotalAmount(text);
    
    console.log("Extracted Merchant Name:", merchantName);
    console.log("Extracted Total Amount:", totalAmount);
    console.log("-----------------------");
  }
}

// Run the test
testOCRParsing();