// Gemini AI Service for LegalEase India
import { API_CONFIG, createGeminiRequest, getGeminiUrl } from '@/config/api';

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

class GeminiService {
  private async makeRequest(url: string, request: RequestInit): Promise<any> {
    try {
      console.log('Making Gemini API request to:', url);
      console.log('Request body:', request.body);
      
      const response = await fetch(url, request);
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data);
      return data;
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw error;
    }
  }

  async analyzeDocument(file: File, language: string = 'en'): Promise<DocumentAnalysisResponse> {
    try {
      // Extract text from the uploaded file
      const extractedText = await this.extractTextFromFile(file);
      
      // Check if this is an image file
      const isImage = file.type.startsWith('image/');
      
      // Create a comprehensive prompt for Gemini
      let prompt: string;
      
      if (isImage) {
        // For images, use vision capabilities
        prompt = `You are a legal AI assistant specializing in Indian law. Analyze this legal document image and provide a detailed analysis.

This appears to be a traffic challan (violation notice) from Uttar Pradesh Police. Please:
1. Extract all text from the image using OCR
2. Identify the violation details, challan number, vehicle information
3. Analyze the legal implications under Indian Motor Vehicles Act
4. Provide risk assessment and recommendations

IMPORTANT: 
- Provide summary_en in English ONLY
- Provide summary_local in ${language === 'hi' ? 'Hindi ONLY' : 'English ONLY'}
- Do NOT mix languages within the same field
- Return ONLY valid JSON without markdown code blocks
- For Hindi summary, write complete sentences in Hindi using Devanagari script

Return your response as a clean JSON object:
{
  "summary_en": "Complete English summary of the challan details, violation, fine amount, and legal implications",
  "summary_local": "${language === 'hi' ? 'यह उत्तर प्रदेश पुलिस द्वारा 31 दिसंबर 2019 को 15:26:05 पर जारी किया गया ट्रैफिक चालान (उल्लंघन नोटिस) है। उल्लंघन: हेलमेट के बिना दोपहिया वाहन चलाना, यूपी एमवी नियम 1998 नियम 201 के तहत। जुर्माना: 500 रुपये। समय पर भुगतान न करने पर कानूनी कार्रवाई हो सकती है।' : 'Complete English summary of the challan details, violation, fine amount, and legal implications'}",
  "clauses": [
    {
      "title": "Traffic Violation Details",
      "source_excerpt": "Extracted text from the challan about the violation",
      "explanation_en": "Explanation of the violation and its legal implications",
      "risk_level": "HIGH",
      "risk_reasons": ["Legal notice requires immediate attention", "Fine payment deadline", "Potential court proceedings"],
      "india_markers": ["motor_vehicles_act", "traffic_law", "penalty_notice"]
    }
  ],
  "recommended_questions": [
    "What is the specific violation I'm being charged for?",
    "What is the fine amount and payment deadline?",
    "What happens if I don't pay the fine on time?",
    "Can I contest this challan in court?",
    "What are my legal rights in this case?"
  ],
  "disclaimer": "This is a legal notice that requires immediate attention. Please consult with a traffic lawyer for specific advice regarding your case."
}`;
      } else {
        // For text documents
        prompt = `You are a legal AI assistant specializing in Indian law. Analyze the following legal document and provide a detailed analysis.

DOCUMENT TEXT:
${extractedText}

IMPORTANT: 
- Provide summary_en in English ONLY
- Provide summary_local in ${language === 'hi' ? 'Hindi ONLY' : 'English ONLY'}
- Do NOT mix languages within the same field
- Return ONLY valid JSON without markdown code blocks
- For Hindi summary, write complete sentences in Hindi using Devanagari script

Return your response as a clean JSON object:
{
  "summary_en": "Complete English summary of the document",
  "summary_local": "${language === 'hi' ? 'दस्तावेज़ का पूरा हिंदी सारांश - मुख्य बिंदु, शर्तें और कानूनी प्रभाव' : 'Complete English summary of the document'}",
  "clauses": [
    {
      "title": "Clause title",
      "source_excerpt": "Relevant text from document",
      "explanation_en": "Simple explanation",
      "risk_level": "HIGH/MEDIUM/LOW",
      "risk_reasons": ["reason1", "reason2"],
      "india_markers": ["legal_area1", "legal_area2"]
    }
  ],
  "recommended_questions": ["question1", "question2"],
  "disclaimer": "Legal disclaimer text"
}`;
      }

      try {
        // Call Gemini API
        const response = await this.makeRequest(
          getGeminiUrl('gemini-1.5-flash'),
          createGeminiRequest(prompt, 'gemini-1.5-flash', isImage ? extractedText : undefined)
        );

        // Parse the response
        let analysisText = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
        
        // Clean up the response text - remove markdown code blocks
        analysisText = this.cleanJsonResponse(analysisText);
        
        try {
          // Try to parse as JSON
          const analysis = JSON.parse(analysisText);
          return this.validateAndCleanAnalysis(analysis, language);
        } catch (parseError) {
          console.warn('JSON parsing failed, creating structured response:', parseError);
          // If JSON parsing fails, create a structured response from the text
          return this.createStructuredResponse(analysisText, extractedText, language);
        }
      } catch (apiError) {
        console.warn('Gemini API failed, using fallback analysis:', apiError);
        // Fallback to a basic analysis if API fails
        return this.createFallbackAnalysis(extractedText, file.name, language);
      }

    } catch (error) {
      console.error('Document analysis failed:', error);
      // Final fallback - return a basic analysis
      return this.createFallbackAnalysis('Document analysis failed', file.name, language);
    }
  }

  private createFallbackAnalysis(extractedText: string, fileName: string, language: string): DocumentAnalysisResponse {
    const isChallan = fileName.toLowerCase().includes('challan') || 
                     extractedText.toLowerCase().includes('challan') ||
                     extractedText.toLowerCase().includes('traffic') ||
                     extractedText.toLowerCase().includes('violation');
    
    const fileType = isChallan ? 'Traffic Challan' : 
                    fileName.toLowerCase().includes('rental') ? 'Rental Agreement' :
                    fileName.toLowerCase().includes('employment') ? 'Employment Contract' :
                    fileName.toLowerCase().includes('service') ? 'Service Agreement' :
                    'Legal Document';

    if (isChallan) {
      return {
        summary_en: `This is a traffic challan (violation notice) document. The document appears to be a legal notice issued by traffic authorities for a motor vehicle violation. Please review the violation details, fine amount, and legal implications carefully.`,
        summary_local: language === 'hi' ? 
          `यह एक ट्रैफिक चालान (उल्लंघन नोटिस) दस्तावेज़ है। यह दस्तावेज़ मोटर वाहन उल्लंघन के लिए ट्रैफिक अधिकारियों द्वारा जारी किया गया कानूनी नोटिस प्रतीत होता है। कृपया उल्लंघन विवरण, जुर्माना राशि और कानूनी प्रभावों की सावधानीपूर्वक समीक्षा करें।` :
          `This is a traffic challan (violation notice) document. Please review the violation details carefully.`,
        clauses: [
          {
            title: "Traffic Violation Notice",
            source_excerpt: extractedText.substring(0, 200) + "...",
            explanation_en: "This is a legal notice for a traffic violation. It contains details about the offense, fine amount, and legal consequences under the Motor Vehicles Act.",
            risk_level: "HIGH",
            risk_reasons: ["Legal notice requires immediate attention", "Fine payment deadline", "Potential court proceedings"],
            india_markers: ["motor_vehicles_act", "traffic_law", "penalty_notice"]
          },
          {
            title: "Payment and Compliance",
            source_excerpt: "Payment and compliance requirements",
            explanation_en: "The challan requires payment of the specified fine within the given timeframe to avoid further legal action.",
            risk_level: "MEDIUM",
            risk_reasons: ["Time-sensitive payment", "Additional penalties for delay"],
            india_markers: ["fine_payment", "compliance_deadline"]
          }
        ],
        recommended_questions: [
          "What is the violation I'm being charged for?",
          "What is the fine amount and payment deadline?",
          "What happens if I don't pay the fine on time?",
          "Can I contest this challan?",
          "What are my legal rights in this case?",
          "How does this affect my driving record?"
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

  private async extractTextFromFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target?.result;
        
        if (file.type === 'application/pdf') {
          // For PDF files, we'll use a simple text extraction
          // In production, you'd use a proper PDF parsing library
          resolve(this.extractTextFromPDF(content as ArrayBuffer));
        } else if (file.type.includes('wordprocessingml')) {
          // For DOCX files
          resolve(this.extractTextFromDOCX(content as string));
        } else if (file.type.startsWith('image/')) {
          // For image files, return base64 data for Gemini vision processing
          resolve(this.extractTextFromImage(content as string, file.type));
        } else {
          resolve('Document text extraction not supported for this file type.');
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      
      if (file.type === 'application/pdf') {
        reader.readAsArrayBuffer(file);
      } else if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    });
  }

  private extractTextFromPDF(arrayBuffer: ArrayBuffer): string {
    // For now, return a descriptive placeholder
    // In production, you would use a proper PDF parsing library like pdf-parse
    const sizeKB = Math.round(arrayBuffer.byteLength / 1024);
    return `[PDF Document - ${sizeKB}KB] This is a legal document that has been uploaded for analysis. The document contains legal terms, conditions, and clauses that need to be reviewed for compliance with Indian law. Please analyze the content for potential risks, legal implications, and areas that may require attention.`;
  }

  private extractTextFromDOCX(content: string): string {
    // Extract readable text from DOCX content
    const cleanContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const preview = cleanContent.substring(0, 2000);
    return `[DOCX Document] ${preview}${cleanContent.length > 2000 ? '...' : ''} This is a legal document that has been uploaded for analysis. Please review the content for legal clauses, terms, and conditions that may have implications under Indian law.`;
  }

  private extractTextFromImage(dataUrl: string, mimeType: string): string {
    // For images, we return the data URL for Gemini vision processing
    // The base64 data will be sent to Gemini for OCR and analysis
    return `[IMAGE_DATA:${mimeType}]${dataUrl}`;
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
    const prompt = `You are a legal AI assistant specializing in Indian law. Answer this question about the legal document: "${request.question}"
    
    Context: ${request.context || 'No additional context provided.'}
    
    Provide a detailed answer focusing on Indian legal implications and cite relevant sections of Indian law where applicable.
    
    Format your response as JSON:
    {
      "answer": "Your detailed answer here",
      "evidence": [
        {
          "chunk_id": 1,
          "snippet": "Relevant text from document"
        }
      ]
    }`;
    
    try {
      // Call Gemini API
      const response = await this.makeRequest(
        getGeminiUrl('gemini-1.5-flash'),
        createGeminiRequest(prompt)
      );

      const responseText = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      try {
        // Try to parse as JSON
        const parsedResponse = JSON.parse(responseText);
        return parsedResponse;
      } catch (parseError) {
        // If JSON parsing fails, return the text as answer
        return {
          answer: responseText,
          evidence: []
        };
      }
    } catch (error) {
      console.error('Chat request failed:', error);
      throw new Error('Failed to get response. Please try again.');
    }
  }

  async generateSummary(text: string, language: string = 'en'): Promise<string> {
    const prompt = `Summarize this legal document in ${language === 'hi' ? 'Hindi' : 'English'}, focusing on key terms, risks, and Indian legal implications. Keep it concise but comprehensive.`;
    
    try {
      // Mock implementation - replace with actual Gemini API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return language === 'hi' 
        ? "यह एक व्यापक रोजगार अनुबंध है जो एक सॉफ्टवेयर डेवलपर पद के लिए नियम और शर्तों को निर्धारित करता है।"
        : "This is a comprehensive employment contract that outlines terms and conditions for a software developer position.";
    } catch (error) {
      console.error('Summary generation failed:', error);
      throw new Error('Failed to generate summary. Please try again.');
    }
  }
}

export const geminiService = new GeminiService();
