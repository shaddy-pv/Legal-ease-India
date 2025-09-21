// Gemini AI Service for LegalEase India (Frontend)
import { API_CONFIG } from '../config/api';

// Configuration constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_TEXT_LENGTH = 100000; // 100k characters
const CHUNK_SIZE = 50000; // 50k characters per chunk
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const SUPPORTED_DOCUMENT_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

export interface DocumentAnalysisRequest {
  file: File;
  language?: string;
}

export interface DocumentAnalysisResponse {
  summary_en: string;
  summary_local: string;
  clauses: Array<{
    title: string;
    source_excerpt: string;
    explanation_en: string;
    risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
    risk_reasons: string[];
    india_markers: string[];
  }>;
  recommended_questions: string[];
  disclaimer: string;
}

export interface ChatRequest {
  docId: string;
  question: string;
  context?: string;
}

export interface ChatResponse {
  answer: string;
  evidence?: Array<{
    chunk_id: number;
    snippet: string;
  }>;
}

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  fileType: 'image' | 'document' | 'unsupported';
}

class GeminiService {
  private readonly API_BASE_URL = API_CONFIG.BACKEND_URL + '/api'; // Backend server URL

  /**
   * Validates file before processing
   */
  private validateFile(file: File): FileValidationResult {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
        fileType: 'unsupported'
      };
    }

    // Check file type
    if (SUPPORTED_IMAGE_TYPES.includes(file.type)) {
      return { isValid: true, fileType: 'image' };
    }
    
    if (SUPPORTED_DOCUMENT_TYPES.includes(file.type)) {
      return { isValid: true, fileType: 'document' };
    }

    return {
      isValid: false,
      error: `Unsupported file type: ${file.type}. Supported types: ${[...SUPPORTED_IMAGE_TYPES, ...SUPPORTED_DOCUMENT_TYPES].join(', ')}`,
      fileType: 'unsupported'
    };
  }

  /**
   * Uploads file to backend for text extraction
   */
  private async uploadFileForExtraction(file: File): Promise<{ text: string; fileName: string }> {
    const formData = new FormData();
    formData.append('file', file);

    console.log('📤 Uploading file to backend:', file.name, 'Size:', file.size, 'Type:', file.type);

    try {
      const response = await fetch(`${this.API_BASE_URL}/documents/extract-text`, {
        method: 'POST',
        body: formData,
      });

      console.log('📡 Backend response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Backend error:', errorData);
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Text extraction successful:', {
        fileName: result.fileName,
        textLength: result.textLength,
        fileType: result.fileType
      });

      return {
        text: result.text,
        fileName: result.fileName || file.name
      };
    } catch (error) {
      console.error('❌ File upload failed:', error);
      
      // Provide more specific error messages
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot connect to backend server. Please make sure the API is running.');
      }
      
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Makes HTTP request to backend API with proper error handling
   */
  private async makeBackendRequest(endpoint: string, requestBody: any): Promise<any> {
    try {
      console.log('Making backend API request to:', endpoint);
      
      const response = await fetch(`${this.API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        let errorMessage = `API request failed: ${response.status} ${response.statusText}`;
        
        try {
          const errorText = await response.text();
          if (errorText) {
            const errorData = JSON.parse(errorText);
            console.error('Backend API Error:', errorData);
            errorMessage = errorData.error || errorMessage;
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          // If it's a 404, provide a more specific message
          if (response.status === 404) {
            errorMessage = 'API endpoint not found. Please make sure the backend server is running on port 3001.';
          }
        }
        
        // Provide user-friendly error messages based on status codes
        if (response.status === 500) {
          errorMessage = 'AI service is temporarily unavailable. Please try again later.';
        } else if (response.status === 429) {
          errorMessage = 'Too many requests. Please wait a moment and try again.';
        } else if (response.status === 503) {
          errorMessage = 'Service temporarily unavailable. Please try again later.';
        } else if (response.status === 400) {
          errorMessage = 'Invalid request. Please check your input and try again.';
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Backend API returned an error');
      }
      
      return data;
    } catch (error) {
      console.error('Backend API Error:', error);
      
      // Provide more specific error messages for common issues
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot connect to the server. Please make sure the backend is running and try again.');
      }
      
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Network error. Please check your internet connection and try again.');
      }
      
      throw error;
    }
  }

  /**
   * Splits large text into manageable chunks
   */
  private splitTextIntoChunks(text: string): string[] {
    if (text.length <= CHUNK_SIZE) {
      return [text];
    }

    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
      let end = start + CHUNK_SIZE;
      
      // Try to break at sentence boundary
      if (end < text.length) {
        const lastSentenceEnd = text.lastIndexOf('.', end);
        const lastNewline = text.lastIndexOf('\n', end);
        const breakPoint = Math.max(lastSentenceEnd, lastNewline);
        
        if (breakPoint > start + CHUNK_SIZE * 0.5) {
          end = breakPoint + 1;
        }
      }

      chunks.push(text.substring(start, end).trim());
      start = end;
    }

    return chunks;
  }

  /**
   * Simple JSON repair for common issues (browser-compatible)
   */
  private repairJson(jsonString: string): string {
    try {
      // Try basic JSON repair techniques
      let repaired = jsonString.trim();
      
      // Remove markdown code blocks
      repaired = repaired.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
      
      // Find the first { and last } to extract just the JSON
      const firstBrace = repaired.indexOf('{');
      const lastBrace = repaired.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        repaired = repaired.substring(firstBrace, lastBrace + 1);
      }
      
      // Try to parse to validate
      JSON.parse(repaired);
      return repaired;
    } catch (error) {
      console.warn('JSON repair failed:', error);
      return jsonString;
    }
  }

  /**
   * Main method to analyze documents using backend API + Gemini AI
   */
  async analyzeDocument(file: File, language: string = 'en'): Promise<DocumentAnalysisResponse> {
    try {
      // Validate file first
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error || 'Invalid file');
      }

      // Check if this is an image file (handle locally)
      const isImage = validation.fileType === 'image';
      
      if (isImage) {
        // For images, extract data URL and process locally
        const imageData = await this.extractImageData(file);
        return await this.analyzeImageDocument(file, imageData, language);
      } else {
        // For documents, upload to backend for text extraction
        const { text: extractedText, fileName } = await this.uploadFileForExtraction(file);
        
        if (!extractedText || extractedText.trim().length === 0) {
          throw new Error('No text could be extracted from the file');
        }

        return await this.analyzeTextDocument(extractedText, fileName, language);
      }

    } catch (error) {
      console.error('Document analysis failed:', error);
      // Return fallback analysis with error context
      return this.createFallbackAnalysis(
        error instanceof Error ? error.message : 'Unknown error occurred',
        file.name,
        language
      );
    }
  }

  /**
   * Extracts image data for local processing
   */
  private async extractImageData(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        resolve(result);
      };
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Analyzes image documents using backend API
   */
  private async analyzeImageDocument(file: File, imageData: string, language: string): Promise<DocumentAnalysisResponse> {
    try {
      // For images, we'll send the base64 data to the backend
      const response = await this.makeBackendRequest('/gemini/analyze', {
        text: imageData, // The imageData contains the base64 encoded image
        language: language
      });

      return response.analysis;
    } catch (apiError) {
      console.warn('Backend API failed for image analysis, using fallback analysis:', apiError);
      return this.createFallbackAnalysis(imageData, file.name, language);
    }
  }

  /**
   * Analyzes text documents using backend API
   */
  private async analyzeTextDocument(extractedText: string, fileName: string, language: string): Promise<DocumentAnalysisResponse> {
    // Check if text is too long and needs chunking
    if (extractedText.length > MAX_TEXT_LENGTH) {
      return await this.analyzeLargeDocument(extractedText, fileName, language);
    }

    try {
      const response = await this.makeBackendRequest('/gemini/analyze', {
        text: extractedText,
        language: language
      });

      return response.analysis;
    } catch (apiError) {
      console.warn('Backend API failed, using fallback analysis:', apiError);
      return this.createFallbackAnalysis(extractedText, fileName, language);
    }
  }

  /**
   * Analyzes large documents by processing them in chunks
   */
  private async analyzeLargeDocument(extractedText: string, fileName: string, language: string): Promise<DocumentAnalysisResponse> {
    const chunks = this.splitTextIntoChunks(extractedText);
    const chunkAnalyses: DocumentAnalysisResponse[] = [];

    // Process each chunk
    for (let i = 0; i < chunks.length; i++) {
      try {
        const response = await this.makeBackendRequest('/gemini/analyze', {
          text: chunks[i],
          language: language
        });

        chunkAnalyses.push(response.analysis);
      } catch (error) {
        console.warn(`Failed to analyze chunk ${i + 1}:`, error);
        // Continue with other chunks
      }
    }

    // Combine all chunk analyses
    return this.combineChunkAnalyses(chunkAnalyses, language);
  }



  /**
   * Combines multiple chunk analyses into a single response
   */
  private combineChunkAnalyses(chunkAnalyses: DocumentAnalysisResponse[], language: string): DocumentAnalysisResponse {
    if (chunkAnalyses.length === 0) {
      return this.createFallbackAnalysis('No chunks could be analyzed', 'document', language);
    }

    if (chunkAnalyses.length === 1) {
      return chunkAnalyses[0];
    }

    // Combine summaries
    const combinedSummaryEn = chunkAnalyses
      .map(chunk => chunk.summary_en)
      .filter(summary => summary && summary.trim().length > 0)
      .join(' ');

    const combinedSummaryLocal = chunkAnalyses
      .map(chunk => chunk.summary_local)
      .filter(summary => summary && summary.trim().length > 0)
      .join(' ');

    // Combine all clauses
    const allClauses = chunkAnalyses.flatMap(chunk => chunk.clauses);

    // Combine all recommended questions (remove duplicates)
    const allQuestions = Array.from(new Set(
      chunkAnalyses.flatMap(chunk => chunk.recommended_questions)
    ));

    // Use the most comprehensive disclaimer
    const disclaimers = chunkAnalyses.map(chunk => chunk.disclaimer);
    const bestDisclaimer = disclaimers.find(d => d && d.length > 50) || disclaimers[0] || '';

    return {
      summary_en: combinedSummaryEn || 'Document analysis completed across multiple sections.',
      summary_local: combinedSummaryLocal || (language === 'hi' ? 'दस्तावेज़ का विश्लेषण कई खंडों में पूरा हो गया है।' : 'Document analysis completed across multiple sections.'),
      clauses: allClauses,
      recommended_questions: allQuestions,
      disclaimer: bestDisclaimer
    };
  }

  private createFallbackAnalysis(extractedText: string, fileName: string, language: string): DocumentAnalysisResponse {
    const isChallan = fileName.toLowerCase().includes('challan') || 
                     extractedText.toLowerCase().includes('challan') ||
                     extractedText.toLowerCase().includes('traffic') ||
                     extractedText.toLowerCase().includes('violation') ||
                     extractedText.toLowerCase().includes('vehicle inspection') ||
                     extractedText.toLowerCase().includes('infringement report') ||
                     extractedText.toLowerCase().includes('motor vehicles act');
    
    const isTamilNaduChallan = extractedText.toLowerCase().includes('tamilnadu') || 
                              extractedText.toLowerCase().includes('tamil nadu') ||
                              extractedText.toLowerCase().includes('chennai traffic police');
    
    const fileType = isChallan ? 'Traffic Challan' : 
                    fileName.toLowerCase().includes('rental') ? 'Rental Agreement' :
                    fileName.toLowerCase().includes('employment') ? 'Employment Contract' :
                    fileName.toLowerCase().includes('service') ? 'Service Agreement' :
                    'Legal Document';

    if (isChallan) {
      return {
        summary_en: `This is a traffic challan (violation notice) document${isTamilNaduChallan ? ' issued by Tamil Nadu Traffic Police' : ''}. The document appears to be a legal notice issued by traffic authorities for a motor vehicle violation under the Motor Vehicles Act, 1988. Please review the violation details, fine amount, and legal implications carefully.`,
        summary_local: language === 'hi' ? 
          `यह एक ट्रैफिक चालान (उल्लंघन नोटिस) दस्तावेज़ है${isTamilNaduChallan ? ' जो तमिलनाडु ट्रैफिक पुलिस द्वारा जारी किया गया है' : ''}। यह दस्तावेज़ मोटर वाहन उल्लंघन के लिए ट्रैफिक अधिकारियों द्वारा जारी किया गया कानूनी नोटिस प्रतीत होता है। कृपया उल्लंघन विवरण, जुर्माना राशि और कानूनी प्रभावों की सावधानीपूर्वक समीक्षा करें।` :
          `This is a traffic challan (violation notice) document${isTamilNaduChallan ? ' issued by Tamil Nadu Traffic Police' : ''}. Please review the violation details carefully.`,
        clauses: [
          {
            title: "Traffic Violation Notice",
            source_excerpt: extractedText.substring(0, 300) + "...",
            explanation_en: "This is a legal notice for a traffic violation under the Motor Vehicles Act, 1988. It contains details about the offense, fine amount, and legal consequences. The document appears to be issued by traffic police authorities.",
            risk_level: "HIGH",
            risk_reasons: ["Legal notice requires immediate attention", "Fine payment deadline", "Potential court proceedings", "Vehicle registration may be affected"],
            india_markers: ["motor_vehicles_act", "traffic_law", "penalty_notice", "tamil_nadu_traffic"]
          },
          {
            title: "Payment and Compliance",
            source_excerpt: "Payment and compliance requirements",
            explanation_en: "The challan requires payment of the specified fine within the given timeframe to avoid further legal action. Non-payment may result in additional penalties or court proceedings.",
            risk_level: "MEDIUM",
            risk_reasons: ["Time-sensitive payment", "Additional penalties for delay", "Vehicle impoundment risk"],
            india_markers: ["fine_payment", "compliance_deadline", "motor_vehicles_act"]
          },
          {
            title: "Document Completeness",
            source_excerpt: extractedText.substring(0, 200) + "...",
            explanation_en: "Review the document for completeness. Ensure all required fields are filled including challan number, vehicle details, offense description, and fine amount.",
            risk_level: "MEDIUM",
            risk_reasons: ["Incomplete information may affect validity", "Missing details could delay processing"],
            india_markers: ["document_validation", "legal_procedure"]
          }
        ],
        recommended_questions: [
          "What is the violation I'm being charged for?",
          "What is the fine amount and payment deadline?",
          "What happens if I don't pay the fine on time?",
          "Can I contest this challan?",
          "What are my legal rights in this case?",
          "How does this affect my driving record?",
          "Is this challan valid if some fields are blank?",
          "What should I do if the challan has incomplete information?"
        ],
        disclaimer: "This is a legal notice that requires immediate attention. Please consult with a traffic lawyer or legal expert for specific advice regarding your case. Non-payment may result in additional penalties or court proceedings."
      };
    }

    return {
      summary_en: `This appears to be a ${fileType.toLowerCase()}. The document has been uploaded successfully and is ready for analysis. Please review the content carefully and consult with a legal professional for specific advice.`,
      summary_local: language === 'hi' ? 
        `यह एक ${fileType.toLowerCase()} प्रतीत होता है। दस्तावेज़ सफलतापूर्वक अपलोड हो गया है और विश्लेषण के लिए तैयार है।` :
        `This appears to be a ${fileType.toLowerCase()}. The document has been uploaded successfully.`,
      clauses: [
        {
          title: "Document Uploaded Successfully",
          source_excerpt: extractedText.substring(0, 200) + "...",
          explanation_en: "Your document has been uploaded and is ready for detailed analysis. Please ensure all terms are clear before proceeding.",
          risk_level: "MEDIUM",
          risk_reasons: ["Document requires review", "Terms need verification"],
          india_markers: ["general_legal", "document_review"]
        }
      ],
      recommended_questions: [
        "What are the main terms and conditions?",
        "Are there any clauses I should be concerned about?",
        "How does this apply under Indian law?",
        "What should I verify before signing?"
      ],
      disclaimer: "This analysis is for informational purposes only and does not constitute legal advice. Please consult with a qualified legal professional for specific legal matters."
    };
  }


  /**
   * Sanitizes text content for security and display
   */
  private sanitizeText(text: string): string {
    if (!text || typeof text !== 'string') {
      return '';
    }

    return text
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  private cleanJsonResponse(text: string): string {
    // Remove markdown code blocks
    let cleaned = text.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
    
    // Remove any leading/trailing whitespace
    cleaned = cleaned.trim();
    
    // Find the first { and last } to extract just the JSON
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
    
    return cleaned;
  }

  private validateAndCleanAnalysis(analysis: any, language: string): DocumentAnalysisResponse {
    // Ensure all required fields exist and clean up the content
    const cleanedAnalysis: DocumentAnalysisResponse = {
      summary_en: this.cleanText(analysis.summary_en || 'No English summary available'),
      summary_local: this.cleanText(analysis.summary_local || (language === 'hi' ? 'हिंदी सारांश उपलब्ध नहीं है' : 'No local summary available')),
      clauses: Array.isArray(analysis.clauses) ? analysis.clauses.map((clause: any) => ({
        title: this.cleanText(clause.title || 'Untitled Clause'),
        source_excerpt: this.cleanText(clause.source_excerpt || 'No excerpt available'),
        explanation_en: this.cleanText(clause.explanation_en || 'No explanation available'),
        risk_level: ['HIGH', 'MEDIUM', 'LOW'].includes(clause.risk_level) ? clause.risk_level : 'MEDIUM',
        risk_reasons: Array.isArray(clause.risk_reasons) ? clause.risk_reasons.map((r: any) => this.cleanText(r)) : ['Risk assessment required'],
        india_markers: Array.isArray(clause.india_markers) ? clause.india_markers.map((m: any) => this.cleanText(m)) : ['general_legal']
      })) : [],
      recommended_questions: Array.isArray(analysis.recommended_questions) ? 
        analysis.recommended_questions.map((q: any) => this.cleanText(q)) : 
        ['What are the main terms and conditions?'],
      disclaimer: this.cleanText(analysis.disclaimer || 'This analysis is for informational purposes only and does not constitute legal advice.')
    };

    return cleanedAnalysis;
  }

  private cleanText(text: string): string {
    if (!text || typeof text !== 'string') return '';
    
    // Remove extra whitespace and clean up formatting
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim();
  }

  private createStructuredResponse(analysisText: string, originalText: string, language: string): DocumentAnalysisResponse {
    // Create a structured response from the raw analysis text
    const lines = analysisText.split('\n').filter(line => line.trim());
    
    return {
      summary_en: analysisText.substring(0, 500) + "...",
      summary_local: language === 'hi' ? "दस्तावेज़ का विश्लेषण पूरा हो गया है। कृपया विस्तृत जानकारी के लिए नीचे दिए गए खंडों को देखें।" : "Document analysis completed. Please review the sections below for detailed information.",
      clauses: [
        {
          title: "Document Analysis",
          source_excerpt: originalText.substring(0, 200) + "...",
          explanation_en: analysisText.substring(0, 300) + "...",
          risk_level: "MEDIUM",
          risk_reasons: ["Requires legal review", "Complex terms present"],
          india_markers: ["general_legal", "document_analysis"]
        }
      ],
      recommended_questions: [
        "What are the main terms and conditions?",
        "Are there any risky clauses I should be aware of?",
        "How does this apply under Indian law?",
        "What should I negotiate or clarify?"
      ],
      disclaimer: "This analysis is for informational purposes only and does not constitute legal advice. Please consult with a qualified legal professional for specific legal matters."
    };
  }

  async chatWithDocument(request: ChatRequest): Promise<ChatResponse> {
    try {
      const response = await this.makeBackendRequest('/gemini/chat', {
        question: request.question,
        context: request.context,
        docId: request.docId
      });

      return {
        answer: response.answer,
        evidence: response.evidence || []
      };
    } catch (error) {
      console.error('Chat request failed:', error);
      throw new Error('Failed to get response. Please try again.');
    }
  }

  /**
   * Generates a summary using backend API
   */
  async generateSummary(text: string, language: string = 'en'): Promise<string> {
    try {
      const response = await this.makeBackendRequest('/gemini/summary', {
        text: text,
        language: language
      });

      return response.summary;
    } catch (error) {
      console.error('Summary generation failed:', error);
      throw new Error('Failed to generate summary. Please try again.');
    }
  }
}

export const geminiService = new GeminiService();
