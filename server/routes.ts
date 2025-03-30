import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { insertCategorySchema, insertReceiptSchema } from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { ImageAnnotatorClient } from "@google-cloud/vision";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Add multer middleware types
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Set up multer storage for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(process.cwd(), "tmp"));
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + "-" + uniqueSuffix + ext);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "application/pdf"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPG, PNG and PDF files are allowed.") as any);
    }
  },
});

// Ensure temp directory exists
const ensureTempDir = async () => {
  const tempDir = path.join(process.cwd(), "tmp");
  try {
    await fs.mkdir(tempDir, { recursive: true });
  } catch (error) {
    console.error("Failed to create temp directory:", error);
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Create temp directory
  await ensureTempDir();

  // Helper function to handle errors
  const handleError = (res: Response, error: any) => {
    if (error instanceof ZodError) {
      return res.status(400).json({ 
        message: fromZodError(error).message 
      });
    }
    return res.status(500).json({ 
      message: error.message || "Internal server error" 
    });
  };

  // Initialize Google Vision client
  let visionClient: ImageAnnotatorClient | null = null;
  let geminiClient: GoogleGenerativeAI | null = null;
  
  try {
    const visionApiKey = process.env.GOOGLE_VISION_API_KEY || process.env.VISION_API_KEY;
    const geminiApiKey = process.env.GEMINI_API_KEY;
    
    if (visionApiKey) {
      visionClient = new ImageAnnotatorClient({
        apiKey: visionApiKey
      });
      console.log("Google Vision API client initialized successfully.");
    } else {
      console.warn("Google Vision API key not found. OCR functionality will be limited.");
    }
    
    if (geminiApiKey) {
      geminiClient = new GoogleGenerativeAI(geminiApiKey);
      console.log("Google Gemini AI client initialized successfully.");
    } else {
      console.warn("Google Gemini API key not found. Alternative OCR will not be available.");
    }
  } catch (error) {
    console.error("Failed to initialize Google API clients:", error);
  }

  // CATEGORIES ENDPOINTS
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const newCategory = await storage.createCategory(categoryData);
      res.status(201).json(newCategory);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.put("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const categoryData = insertCategorySchema.partial().parse(req.body);
      const updatedCategory = await storage.updateCategory(id, categoryData);
      
      if (!updatedCategory) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(updatedCategory);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteCategory(id);
      
      if (!success) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      handleError(res, error);
    }
  });

  // RECEIPTS ENDPOINTS
  app.get("/api/receipts", async (req, res) => {
    try {
      const receipts = await storage.getAllReceipts();
      res.json(receipts);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/receipts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const receipt = await storage.getReceipt(id);
      
      if (!receipt) {
        return res.status(404).json({ message: "Receipt not found" });
      }
      
      res.json(receipt);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post("/api/receipts", async (req, res) => {
    try {
      const receiptData = insertReceiptSchema.parse(req.body);
      const newReceipt = await storage.createReceipt(receiptData);
      res.status(201).json(newReceipt);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.put("/api/receipts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const receiptData = insertReceiptSchema.partial().parse(req.body);
      const updatedReceipt = await storage.updateReceipt(id, receiptData);
      
      if (!updatedReceipt) {
        return res.status(404).json({ message: "Receipt not found" });
      }
      
      res.json(updatedReceipt);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.delete("/api/receipts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteReceipt(id);
      
      if (!success) {
        return res.status(404).json({ message: "Receipt not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      handleError(res, error);
    }
  });

  // RECEIPT UPLOAD & OCR ENDPOINT
  app.post("/api/upload", upload.single("receipt"), async (req: MulterRequest, res) => {
    // Initialize receipt information variables first - before any processing happens
    let merchantName = "Unknown";
    let total = 0;
    let notes = "";
    let receiptDate: Date = new Date(); // Default to today's date
    let ocrText = "";
    let ocrError = "";
    
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const filePath = req.file.path;
      
      // Helper function to convert file to base64
      const fileToBase64 = async (filePath: string): Promise<string> => {
        try {
          const fileData = await fs.readFile(filePath);
          return fileData.toString('base64');
        } catch (error) {
          console.error("Error reading file:", error);
          throw error;
        }
      };
      
      // First try with Google Vision API
      if (visionClient) {
        try {
          const [result] = await visionClient.textDetection(filePath);
          const detections = result.textAnnotations;
          if (detections && detections.length > 0) {
            ocrText = detections[0].description || "";
          }
        } catch (error: any) {
          console.error("Vision API OCR processing error:", error);
          
          // Check if this is a permission/API not enabled error
          const errorMessage = error.toString();
          if (errorMessage.includes("PERMISSION_DENIED") || 
              errorMessage.includes("API has not been used") || 
              errorMessage.includes("it is disabled")) {
            ocrError = "Google Vision API not properly enabled. Trying alternative OCR...";
            
            // Fallback to Gemini if available
            if (geminiClient) {
              try {
                console.log("Attempting OCR with Gemini AI...");
                
                // Convert image to base64
                const base64Image = await fileToBase64(filePath);
                
                // Create Gemini model and generate content
                const geminiModel = geminiClient.getGenerativeModel({ model: "gemini-1.5-flash" });
                
                const prompt = "This is a receipt image. Extract all the text you can see in the image. Focus especially on:\n1. The merchant/store name at the top\n2. The exact date in the format it appears (MM/DD/YYYY, DD.MM.YYYY, etc.)\n3. The TOTAL amount - be sure to correctly identify the final total (not subtotal) and include ALL digits before and after decimal point\n\nPlease format your response in plain text and be precise about numbers. If you see a total amount like '54.50', make sure to include the full number.";
                
                const result = await geminiModel.generateContent({
                  contents: [
                    {
                      role: "user",
                      parts: [
                        { text: prompt },
                        { inlineData: { mimeType: req.file?.mimetype || "image/jpeg", data: base64Image } }
                      ]
                    }
                  ],
                  generationConfig: {
                    temperature: 0,
                    topP: 1,
                    topK: 32,
                    maxOutputTokens: 4096,
                  },
                  safetySettings: [
                    {
                      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                    },
                    {
                      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                    },
                    {
                      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                    },
                    {
                      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                    },
                  ],
                });
                
                const responseText = result.response.text();
                if (responseText) {
                  ocrText = responseText;
                  ocrError = ""; // Clear error since we successfully got text from Gemini
                  console.log("Gemini AI OCR successful!");
                } else {
                  ocrError = "Both Google Vision and Gemini AI failed to extract text from the receipt.";
                }
              } catch (geminiError: any) {
                console.error("Gemini AI OCR error:", geminiError);
                ocrError = "Both OCR methods failed. Error: " + (geminiError.message || "Unknown Gemini error");
              }
            } else {
              ocrError = "Google Vision API not available and no fallback OCR configured.";
            }
          } else {
            ocrError = "Error processing OCR. Technical details: " + (error.message || 'Unknown error');
          }
        }
      } else if (geminiClient) {
        // If Vision API isn't available but Gemini is, use Gemini directly
        try {
          console.log("Vision API unavailable, attempting OCR with Gemini AI...");
          
          // Convert image to base64
          const base64Image = await fileToBase64(filePath);
          
          // Create Gemini model and generate content
          const geminiModel = geminiClient.getGenerativeModel({ model: "gemini-1.5-flash" });
          
          const prompt = "This is a receipt image. Extract all the text you can see in the image. Focus especially on:\n1. The merchant/store name at the top\n2. The exact date in the format it appears (MM/DD/YYYY, DD.MM.YYYY, etc.)\n3. The TOTAL amount - be sure to correctly identify the final total (not subtotal) and include ALL digits before and after decimal point\n\nPlease format your response in plain text and be precise about numbers. If you see a total amount like '54.50', make sure to include the full number.";
          
          const result = await geminiModel.generateContent({
            contents: [
              {
                role: "user",
                parts: [
                  { text: prompt },
                  { inlineData: { mimeType: req.file?.mimetype || "image/jpeg", data: base64Image } }
                ]
              }
            ],
            generationConfig: {
              temperature: 0,
              topP: 1,
              topK: 32,
              maxOutputTokens: 4096,
            },
            safetySettings: [
              {
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
              },
              {
                category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
              },
              {
                category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
              },
              {
                category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
              },
            ],
          });
          
          const responseText = result.response.text();
          if (responseText) {
            ocrText = responseText;
            console.log("Gemini AI OCR successful!");
            
            // Special handling for formatted Gemini responses
            // Look for key-value pairs in the Gemini response using multiple patterns
            const merchantPatterns = [
              /merchant(?:[^:]*):[\s]*([^*\n]+)/i,              // Merchant: Value
              /store(?:[^:]*):[\s]*([^*\n]+)/i,                 // Store: Value 
              /merchant\/store name:[\s]*([^*\n]+)/i,           // Merchant/Store Name: Value
              /\*\*merchant[^:]*\*\*:?\s+([^*\n]+)/i,           // **Merchant...**: Value
              /\d+\.\s+\*\*merchant[^:]*:\*\*\s+([^*\n]+)/i     // 1. **Merchant...:** Value
            ];
            
            // Try each pattern until we find a good match
            for (const pattern of merchantPatterns) {
              const match = responseText.match(pattern);
              if (match && match[1]) {
                const extractedName = match[1].trim()
                  .replace(/\*\*/g, '')  // Remove markdown formatting
                  .replace(/^["']|["']$/g, ''); // Remove quotes
                
                // Validate the extracted name
                if (extractedName && 
                    !extractedName.includes("extracted information") &&
                    !extractedName.includes("Here's") &&
                    extractedName.length < 100) {
                  merchantName = extractedName;
                  console.log("Extracted merchant name from Gemini format:", merchantName);
                  break;
                }
              }
            }
            
            // Multiple patterns for total amount extraction
            const totalPatterns = [
              /total(?:[^:]*):[\s]*([^*\n]+)/i,                // Total: Value
              /amount(?:[^:]*):[\s]*([^*\n]+)/i,               // Amount: Value
              /total amount(?:[^:]*):[\s]*([^*\n]+)/i,         // Total Amount: Value
              /\*\*total[^:]*\*\*:?\s+([^*\n]+)/i,             // **Total...**: Value
              /\d+\.\s+\*\*total[^:]*:\*\*\s+([^*\n]+)/i      // 3. **Total...:** Value
            ];
            
            // Try each pattern until we find a good match
            for (const pattern of totalPatterns) {
              const match = responseText.match(pattern);
              if (match && match[1]) {
                const cleanTotalStr = match[1].trim()
                  .replace(/\*\*/g, '')  // Remove markdown formatting
                  .replace(/[^\d.,]/g, ''); // Keep only digits, decimal points, and commas
                
                const extractedTotal = parseFloat(cleanTotalStr);
                if (!isNaN(extractedTotal) && extractedTotal > 0) {
                  total = extractedTotal;
                  console.log("Extracted total amount from Gemini format:", total);
                  break;
                }
              }
            }
            
            // Multiple patterns for date extraction
            const datePatterns = [
              /date(?:[^:]*):[\s]*([^*\n]+)/i,                 // Date: Value
              /\*\*date[^:]*\*\*:?\s+([^*\n]+)/i,              // **Date...**: Value
              /\d+\.\s+\*\*date[^:]*:\*\*\s+([^*\n]+)/i        // 2. **Date...:** Value
            ];
            
            // Try each pattern until we find a good match
            for (const pattern of datePatterns) {
              const match = responseText.match(pattern);
              if (match && match[1]) {
                const dateStr = match[1].trim()
                  .replace(/\*\*/g, '')  // Remove markdown formatting
                  .replace(/^["']|["']$/g, ''); // Remove quotes
                  
                try {
                  let parsedDate;
                  
                  // Try different date formats
                  
                  // European format (DD.MM.YYYY)
                  if (dateStr.includes('.')) {
                    const parts = dateStr.split('.');
                    if (parts.length === 3) {
                      const day = parseInt(parts[0]);
                      const month = parseInt(parts[1]) - 1; // JS months are 0-based
                      const year = parseInt(parts[2]);
                      if (year < 100) year += 2000; // Convert 2-digit years
                      parsedDate = new Date(year, month, day);
                    }
                  } 
                  // US/UK format (MM/DD/YYYY or DD/MM/YYYY)
                  else if (dateStr.includes('/')) {
                    const parts = dateStr.split('/');
                    if (parts.length === 3) {
                      // Assume European format (DD/MM/YYYY) first
                      const day = parseInt(parts[0]);
                      const month = parseInt(parts[1]) - 1;
                      const year = parseInt(parts[2]);
                      if (year < 100) year += 2000; // Convert 2-digit years
                      parsedDate = new Date(year, month, day);
                    }
                  }
                  // ISO format (YYYY-MM-DD)
                  else if (dateStr.includes('-')) {
                    parsedDate = new Date(dateStr);
                  }
                  // Try direct parsing as fallback
                  else {
                    parsedDate = new Date(dateStr);
                  }
                  
                  if (parsedDate && !isNaN(parsedDate.getTime())) {
                    receiptDate = parsedDate;
                    console.log("Extracted date from Gemini format:", receiptDate);
                    break;
                  }
                } catch (e) {
                  console.error("Failed to parse date from Gemini format:", e);
                }
              }
            }
          } else {
            ocrError = "Gemini AI failed to extract text from the receipt.";
          }
        } catch (geminiError: any) {
          console.error("Gemini AI OCR error:", geminiError);
          ocrError = "Gemini OCR failed. Error: " + (geminiError.message || "Unknown Gemini error");
        }
      } else {
        ocrError = "No OCR services available. Please configure either Google Vision API or Gemini API.";
      }
      
      // Update variable values based on OCR error
      if (ocrError) {
        merchantName = "Receipt Upload - Needs Manual Entry";
        notes = "OCR processing failed. Please enter receipt details manually.";
      }
      
      // Extract information from OCR text
      if (ocrText) {
        // Try different extraction methods for merchant name
        const lines = ocrText.split('\n');
        
        // Method 1: First line is often the merchant name
        if (lines.length > 0) {
          merchantName = lines[0].trim();
        }
        
        // Method 2: Look for text patterns common in Gemini AI responses
        const merchantMatch = ocrText.match(/merchant(?:\s+name)?[\s:]+([^\n]+)/i);
        if (merchantMatch && merchantMatch[1]) {
          merchantName = merchantMatch[1].trim();
        }
        
        // Structure to store potential totals with their confidence scores
        const potentialTotals: { amount: number; confidence: number }[] = [];
  
        // Method 1: Look for TOTAL or TOTAL AMOUNT specifically in all caps (highest confidence)
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
        const preciseNumbersRegex = /\b(\d{2,})\.(\d{2})\b/g;
        const preciseNumbersMatches = [];
        let preciseMatch;
        while ((preciseMatch = preciseNumbersRegex.exec(ocrText)) !== null) {
          preciseNumbersMatches.push(preciseMatch[0]);
        }
        
        if (preciseNumbersMatches.length > 0) {
          const parsedNumbers = preciseNumbersMatches.map(num => parseFloat(num));
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
        const allNumbersRegex = /\d+\.\d+/g;
        const allNumbersMatches = [];
        let allNumbersMatch;
        while ((allNumbersMatch = allNumbersRegex.exec(ocrText)) !== null) {
          allNumbersMatches.push(allNumbersMatch[0]);
        }
        
        if (allNumbersMatches.length > 0 && potentialTotals.length === 0) {
          const parsedNumbers = allNumbersMatches.map(num => parseFloat(num));
          const largestNumber = Math.max(...parsedNumbers.filter(num => !isNaN(num)));
          if (largestNumber > 0) {
            potentialTotals.push({ amount: largestNumber, confidence: 50 });
            console.log("Found total using fallback Method 7:", largestNumber);
          }
        }
        
        // If we found potential totals, select the one with highest confidence
        if (potentialTotals.length > 0) {
          // Sort by confidence (descending)
          potentialTotals.sort((a, b) => b.confidence - a.confidence);
          console.log("All potential totals:", potentialTotals);
          total = potentialTotals[0].amount;
        }
        
        // Log the detected total for debugging
        console.log("Final detected total amount:", total);
        console.log("OCR text excerpt:", ocrText.substring(0, 300));
        
        // Extract date from receipt text
        let receiptDateStr = "";
        
        // Look for dates in the format DD/MM/YYYY or MM/DD/YYYY
        const slashDateRegex = /\b(\d{1,2})\/(\d{1,2})\/(\d{2,4})\b/g;
        let slashMatch = slashDateRegex.exec(ocrText);
        const slashMatches: RegExpExecArray[] = [];
        while (slashMatch !== null) {
          slashMatches.push(slashMatch);
          slashMatch = slashDateRegex.exec(ocrText);
        }
        
        // Look for dates in the format DD.MM.YYYY
        const dotDateRegex = /\b(\d{1,2})\.(\d{1,2})\.(\d{2,4})\b/g;
        let dotMatch = dotDateRegex.exec(ocrText);
        const dotMatches: RegExpExecArray[] = [];
        while (dotMatch !== null) {
          dotMatches.push(dotMatch);
          dotMatch = dotDateRegex.exec(ocrText);
        }
        
        // Look for dates in the format YYYY-MM-DD
        const dashDateRegex = /\b(\d{4})-(\d{1,2})-(\d{1,2})\b/g;
        let dashMatch = dashDateRegex.exec(ocrText);
        const dashMatches: RegExpExecArray[] = [];
        while (dashMatch !== null) {
          dashMatches.push(dashMatch);
          dashMatch = dashDateRegex.exec(ocrText);
        }
        
        // Look for dates with month names, e.g. "15 Mar 2023"
        const monthNameRegex = /\b(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{2,4})\b/gi;
        let monthNameMatch = monthNameRegex.exec(ocrText);
        const monthNameMatches: RegExpExecArray[] = [];
        while (monthNameMatch !== null) {
          monthNameMatches.push(monthNameMatch);
          monthNameMatch = monthNameRegex.exec(ocrText);
        }
        
        // Check for explicit date labels
        const dateLabel = /\b(date|datum|dated|day|issued)[\s:]+([0-9\.\/\-]+)/i;
        const dateLabelMatch = ocrText.match(dateLabel);
        
        // Try to extract a date string from one of the matches
        if (dateLabelMatch && dateLabelMatch[2]) {
          receiptDateStr = dateLabelMatch[2];
        } else if (slashMatches.length > 0) {
          // Use the first match for slash format
          const match = slashMatches[0];
          const day = match[1].padStart(2, '0');
          const month = match[2].padStart(2, '0');
          const year = match[3].length === 2 ? `20${match[3]}` : match[3];
          // Assume European format (DD/MM/YYYY)
          receiptDateStr = `${year}-${month}-${day}`;
        } else if (dotMatches.length > 0) {
          // Use the first match for dot format (European)
          const match = dotMatches[0];
          const day = match[1].padStart(2, '0');
          const month = match[2].padStart(2, '0');
          const year = match[3].length === 2 ? `20${match[3]}` : match[3];
          receiptDateStr = `${year}-${month}-${day}`;
        } else if (dashMatches.length > 0) {
          // Already in ISO format
          const match = dashMatches[0];
          receiptDateStr = `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
        } else if (monthNameMatches.length > 0) {
          // Handle month name format
          const match = monthNameMatches[0];
          const day = parseInt(match[1]);
          const monthName = match[2].toLowerCase();
          const year = parseInt(match[3]);
          
          const monthMap: Record<string, number> = {
            'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
            'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
          };
          
          const month = monthMap[monthName.substring(0, 3)];
          const fullYear = year < 100 ? 2000 + year : year;
          
          // Create a date directly
          receiptDate = new Date(fullYear, month, day);
        }
        
        // Try to parse the date string if we have one
        if (receiptDateStr) {
          try {
            const parsedDate = new Date(receiptDateStr);
            if (!isNaN(parsedDate.getTime())) {
              receiptDate = parsedDate;
            }
          } catch (e) {
            // Keep using today's date
            console.error("Failed to parse receipt date:", e);
          }
        }
            

        
        // Add extracted text to notes for reference
        if (!ocrError) {
          notes = "OCR text extracted. You can edit this receipt if any details are incorrect.";
          notes += " Extracted text: " + ocrText.slice(0, 200) + (ocrText.length > 200 ? "..." : "");
        }
      }
      
      // Create receipt record
      const receiptData = {
        merchantName,
        total: total.toString(), // Convert to string as required by the schema
        date: receiptDate, // Use extracted date or today's date as fallback
        imageUrl: req.file.path,
        notes,
        ocrText
      };
      
      const newReceipt = await storage.createReceipt(receiptData);
      
      // Clean up file
      try {
        await fs.unlink(filePath);
      } catch (error: any) {
        console.error("Error deleting temporary file:", error);
      }
      
      res.status(201).json({
        ...newReceipt,
        ocrText,
        ocrError
      });
    } catch (error) {
      handleError(res, error);
    }
  });

  // Export receipts as CSV
  app.get("/api/export/receipts", async (req, res) => {
    try {
      const receipts = await storage.getAllReceipts();
      
      if (receipts.length === 0) {
        return res.status(404).json({ message: "No receipts found" });
      }
      
      // Create CSV header
      let csv = "ID,Merchant,Total,Date,Category\n";
      
      // Add receipt data
      for (const receipt of receipts) {
        let categoryName = "Uncategorized";
        
        if (receipt.categoryId) {
          const category = await storage.getCategory(receipt.categoryId);
          if (category) {
            categoryName = category.name;
          }
        }
        
        const row = [
          receipt.id,
          `"${receipt.merchantName.replace(/"/g, '""')}"`,
          receipt.total,
          new Date(receipt.date).toISOString().split('T')[0],
          `"${categoryName}"`
        ].join(',');
        
        csv += row + "\n";
      }
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="receipts.csv"');
      res.status(200).send(csv);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Analytics endpoints
  app.get("/api/analytics/monthly", async (req, res) => {
    try {
      const receipts = await storage.getAllReceipts();
      
      // Group by month
      const monthlyData: Record<string, number> = {};
      
      for (const receipt of receipts) {
        const date = new Date(receipt.date);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = 0;
        }
        
        monthlyData[monthYear] += Number(receipt.total);
      }
      
      // Convert to array format for charts
      const result = Object.entries(monthlyData).map(([month, total]) => ({
        month,
        total
      }));
      
      res.json(result);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/analytics/categories", async (req, res) => {
    try {
      const receipts = await storage.getAllReceipts();
      const categories = await storage.getAllCategories();
      
      // Initialize category totals
      const categoryTotals: Record<number, { id: number, name: string, color: string, total: number }> = {};
      
      categories.forEach(category => {
        categoryTotals[category.id] = {
          id: category.id,
          name: category.name,
          color: category.color,
          total: 0
        };
      });
      
      // Add uncategorized
      categoryTotals[0] = {
        id: 0,
        name: "Uncategorized",
        color: "#94A3B8",
        total: 0
      };
      
      // Calculate totals by category
      for (const receipt of receipts) {
        const categoryId = receipt.categoryId || 0;
        categoryTotals[categoryId].total += Number(receipt.total);
      }
      
      // Convert to array and filter out empty categories
      const result = Object.values(categoryTotals)
        .filter(category => category.total > 0);
      
      res.json(result);
    } catch (error) {
      handleError(res, error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
