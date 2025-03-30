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
  
  try {
    const apiKey = process.env.GOOGLE_VISION_API_KEY || process.env.VISION_API_KEY;
    
    if (apiKey) {
      visionClient = new ImageAnnotatorClient({
        apiKey: apiKey
      });
      console.log("Google Vision API client initialized successfully.");
    } else {
      console.warn("Google Vision API key not found. OCR functionality will be limited.");
    }
  } catch (error) {
    console.error("Failed to initialize Google Vision client:", error);
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
      
      // Perform OCR if Vision client is available
      if (visionClient) {
        try {
          const [result] = await visionClient.textDetection(filePath);
          const detections = result.textAnnotations;
          if (detections && detections.length > 0) {
            ocrText = detections[0].description || "";
          }
        } catch (error: any) {
          console.error("OCR processing error:", error);
          
          // Check if this is a permission/API not enabled error
          const errorMessage = error.toString();
          if (errorMessage.includes("PERMISSION_DENIED") || 
              errorMessage.includes("API has not been used") || 
              errorMessage.includes("it is disabled")) {
            ocrError = "Google Vision API not properly enabled. Please enable the API in your Google Cloud Console.";
          } else {
            ocrError = "Error processing OCR. Technical details: " + (error.message || 'Unknown error');
          }
        }
      } else {
        ocrError = "Google Vision API client not available. Check your API key configuration.";
      }
      
      // Extract receipt information
      let merchantName = "Unknown";
      let total = 0;
      
      // Extract merchant name (assuming it's typically at the top of the receipt)
      if (ocrText) {
        const lines = ocrText.split('\n');
        if (lines.length > 0) {
          merchantName = lines[0].trim();
        }
        
        // Try to extract total amount
        const totalRegex = /total[:\s]*\$?(\d+\.\d{2})/i;
        const totalMatch = ocrText.match(totalRegex);
        if (totalMatch && totalMatch[1]) {
          total = parseFloat(totalMatch[1]);
        }
      }
      
      // Create receipt record
      const receiptData = {
        merchantName,
        total: total.toString(), // Convert to string as required by the schema
        date: new Date(), // Use Date object as required by the schema
        imageUrl: req.file.path,
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
