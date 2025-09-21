// Document processing routes
const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const path = require('path');
const fs = require('fs');
const GeminiService = require('../services/geminiService');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type'), false);
    }
  }
});

// Initialize Gemini service
let geminiService;
try {
  geminiService = new GeminiService();
} catch (error) {
  console.error('Failed to initialize Gemini service:', error.message);
}

// POST /api/documents/upload - Complete document analysis (text extraction + Gemini analysis)
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.file;
    const language = req.body.language || 'en';
    
    console.log(`Processing file: ${file.originalname} (${file.mimetype})`);

    // Extract text from file
    let extractedText = '';
    const fileName = file.originalname;

    if (file.mimetype === 'application/pdf') {
      const pdfBuffer = fs.readFileSync(file.path);
      const pdfData = await pdfParse(pdfBuffer);
      extractedText = pdfData.text;
    } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const docxBuffer = fs.readFileSync(file.path);
      const result = await mammoth.extractRawText({ buffer: docxBuffer });
      extractedText = result.value;
    } else if (file.mimetype.startsWith('image/')) {
      // For images, read as base64 for Gemini vision processing
      const imageBuffer = fs.readFileSync(file.path);
      const base64 = imageBuffer.toString('base64');
      const dataUrl = `data:${file.mimetype};base64,${base64}`;
      extractedText = `[IMAGE_DATA:${file.mimetype}]${dataUrl}`;
    } else {
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    // Clean up temporary file
    fs.unlinkSync(file.path);

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({ error: 'No text could be extracted from the file' });
    }

    // Sanitize text
    const sanitizedText = extractedText
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    // Analyze with Gemini if service is available
    let analysis = null;
    if (geminiService) {
      try {
        analysis = await geminiService.analyzeDocument(sanitizedText, fileName, language);
      } catch (geminiError) {
        console.warn('Gemini analysis failed, returning text only:', geminiError.message);
        // Continue without analysis
      }
    }

    res.json({
      success: true,
      text: sanitizedText,
      fileName: fileName,
      fileType: file.mimetype,
      textLength: sanitizedText.length,
      analysis: analysis, // Will be null if Gemini analysis failed
      hasAnalysis: !!analysis
    });

  } catch (error) {
    console.error('Document analysis error:', error);
    
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      error: 'Failed to analyze document',
      details: error.message 
    });
  }
});

// POST /api/documents/extract-text - Text-only extraction endpoint (without Gemini analysis)
router.post('/extract-text', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.file;
    let extractedText = '';
    const fileName = file.originalname;

    console.log(`Extracting text from: ${fileName} (${file.mimetype})`);

    if (file.mimetype === 'application/pdf') {
      const pdfBuffer = fs.readFileSync(file.path);
      const pdfData = await pdfParse(pdfBuffer);
      extractedText = pdfData.text;
    } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const docxBuffer = fs.readFileSync(file.path);
      const result = await mammoth.extractRawText({ buffer: docxBuffer });
      extractedText = result.value;
    } else if (file.mimetype.startsWith('image/')) {
      // For images, read as base64 for frontend processing
      const imageBuffer = fs.readFileSync(file.path);
      const base64 = imageBuffer.toString('base64');
      const dataUrl = `data:${file.mimetype};base64,${base64}`;
      extractedText = `[IMAGE_DATA:${file.mimetype}]${dataUrl}`;
    } else {
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    // Clean up temporary file
    fs.unlinkSync(file.path);

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({ error: 'No text could be extracted from the file' });
    }

    // Sanitize text
    const sanitizedText = extractedText
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    res.json({
      success: true,
      text: sanitizedText,
      fileName: fileName,
      fileType: file.mimetype,
      textLength: sanitizedText.length
    });

  } catch (error) {
    console.error('Text extraction error:', error);
    
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      error: 'Failed to extract text from file',
      details: error.message 
    });
  }
});

module.exports = router;
