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
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const filePath = req.file.path;
      let ocrText = "";
      let ocrError: string | undefined;
      
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
                
                const prompt = "This is a receipt image. Extract all the text you can see in the image, especially the merchant name, date, and total amount. Format your response in plain text.";
                
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
                  ocrError = undefined; // Clear error since we successfully got text from Gemini
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
          
          const prompt = "This is a receipt image. Extract all the text you can see in the image, especially the merchant name, date, and total amount. Format your response in plain text.";
          
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
      
      // Extract receipt information
      let merchantName = ocrError ? "Receipt Upload - Needs Manual Entry" : "Unknown";
      let total = 0;
      let notes = ocrError ? "OCR processing failed. Please enter receipt details manually." : "";
      
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
        
        // Try different approaches to extract total amount
        // Method 1: Standard regex for "total: $X.XX" pattern
        const totalRegex1 = /total[:\s]*\$?(\d+\.\d{2})/i;
        const totalMatch1 = ocrText.match(totalRegex1);
        if (totalMatch1 && totalMatch1[1]) {
          total = parseFloat(totalMatch1[1]);
        }
        
        // Method 2: Look for dollar amounts with "total" nearby
        const totalRegex2 = /(?:total|amount|sum|due)(?:.{1,20})\$?(\d+\.\d{2})/i;
        const totalMatch2 = ocrText.match(totalRegex2);
        if (!total && totalMatch2 && totalMatch2[1]) {
          total = parseFloat(totalMatch2[1]);
        }
        
        // Method 3: Look for specific Gemini AI response patterns
        const totalMatch3 = ocrText.match(/total(?:\s+amount)?[\s:]+\$?(\d+\.\d{2})/i);
        if (!total && totalMatch3 && totalMatch3[1]) {
          total = parseFloat(totalMatch3[1]);
        }
        
        // Add extracted text to notes for reference
        if (!ocrError) {
          notes = "OCR text extracted. You can edit this receipt if any details are incorrect.";
        }
      }
      
      // Create receipt record
      const receiptData = {
        merchantName,
        total: total.toString(), // Convert to string as required by the schema
        date: new Date(), // Use Date object as required by the schema
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
