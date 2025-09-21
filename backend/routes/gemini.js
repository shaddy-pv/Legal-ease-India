// Consolidated Gemini API routes
const express = require('express');
const router = express.Router();
const GeminiService = require('../services/geminiService');

// Initialize Gemini service
let geminiService;
try {
  geminiService = new GeminiService();
} catch (error) {
  console.error('Failed to initialize Gemini service:', error.message);
}

// POST /api/gemini/analyze - Analyze text with Gemini AI
router.post('/analyze', async (req, res) => {
  try {
    const { text, language = 'en' } = req.body;

    // Validate input
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Text content is required and must be a non-empty string'
      });
    }

    if (!geminiService) {
      return res.status(500).json({
        success: false,
        error: 'Gemini service is not available. Please check API key configuration.'
      });
    }

    console.log(`Analyzing text with Gemini (${text.length} characters, language: ${language})`);

    // Call Gemini service for analysis
    const analysis = await geminiService.analyzeDocument(text, 'document', language);

    res.json({
      success: true,
      analysis: analysis,
      metadata: {
        textLength: text.length,
        language: language,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Gemini analysis error:', error);
    
    // Return user-friendly error messages
    let errorMessage = 'Failed to analyze document with AI';
    let statusCode = 500;

    if (error.message.includes('API key')) {
      errorMessage = 'AI service configuration error. Please contact support.';
      statusCode = 500;
    } else if (error.message.includes('quota') || error.message.includes('limit')) {
      errorMessage = 'AI service is temporarily unavailable due to high usage. Please try again later.';
      statusCode = 429;
    } else if (error.message.includes('network') || error.message.includes('timeout')) {
      errorMessage = 'Network error. Please check your connection and try again.';
      statusCode = 503;
    }

    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/gemini/chat - Chat with Gemini AI
router.post('/chat', async (req, res) => {
  try {
    const { question, context = '', docId = 'unknown' } = req.body;

    // Validate input
    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Question is required and must be a non-empty string'
      });
    }

    if (!geminiService) {
      return res.status(500).json({
        success: false,
        error: 'Gemini service is not available. Please check API key configuration.'
      });
    }

    console.log(`Chat request: ${question.substring(0, 100)}...`);

    // Call Gemini service for chat
    const response = await geminiService.chatWithDocument({
      docId,
      question,
      context
    });

    res.json({
      success: true,
      answer: response.answer,
      evidence: response.evidence || [],
      metadata: {
        questionLength: question.length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Gemini chat error:', error);
    
    // Return user-friendly error messages
    let errorMessage = 'Failed to get AI response';
    let statusCode = 500;

    if (error.message.includes('API key')) {
      errorMessage = 'AI service configuration error. Please contact support.';
      statusCode = 500;
    } else if (error.message.includes('quota') || error.message.includes('limit')) {
      errorMessage = 'AI service is temporarily unavailable due to high usage. Please try again later.';
      statusCode = 429;
    } else if (error.message.includes('network') || error.message.includes('timeout')) {
      errorMessage = 'Network error. Please check your connection and try again.';
      statusCode = 503;
    }

    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/gemini/summary - Generate summary with Gemini AI
router.post('/summary', async (req, res) => {
  try {
    const { text, language = 'en' } = req.body;

    // Validate input
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Text content is required and must be a non-empty string'
      });
    }

    if (!geminiService) {
      return res.status(500).json({
        success: false,
        error: 'Gemini service is not available. Please check API key configuration.'
      });
    }

    console.log(`Generating summary (${text.length} characters, language: ${language})`);

    // Call Gemini service for summary
    const summary = await geminiService.generateSummary(text, language);

    res.json({
      success: true,
      summary: summary,
      metadata: {
        textLength: text.length,
        language: language,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Gemini summary error:', error);
    
    // Return user-friendly error messages
    let errorMessage = 'Failed to generate summary with AI';
    let statusCode = 500;

    if (error.message.includes('API key')) {
      errorMessage = 'AI service configuration error. Please contact support.';
      statusCode = 500;
    } else if (error.message.includes('quota') || error.message.includes('limit')) {
      errorMessage = 'AI service is temporarily unavailable due to high usage. Please try again later.';
      statusCode = 429;
    } else if (error.message.includes('network') || error.message.includes('timeout')) {
      errorMessage = 'Network error. Please check your connection and try again.';
      statusCode = 503;
    }

    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/gemini/health - Health check for Gemini service
router.get('/health', (req, res) => {
  if (!geminiService) {
    return res.status(500).json({
      success: false,
      error: 'Gemini service is not available',
      hasApiKey: !!process.env.GEMINI_API_KEY
    });
  }

  res.json({
    success: true,
    status: 'Gemini service is available',
    hasApiKey: !!process.env.GEMINI_API_KEY
  });
});

module.exports = router;
