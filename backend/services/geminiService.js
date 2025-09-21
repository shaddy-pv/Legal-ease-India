// Consolidated Gemini AI Service for LegalEase India Backend
const fetch = require('node-fetch');

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta';
    
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
  }

  async analyzeDocument(text, fileName, language = 'en') {
    try {
      const isImage = text.startsWith('[IMAGE_DATA:');
      
      if (isImage) {
        return await this.analyzeImageDocument(text, fileName, language);
      } else {
        return await this.analyzeTextDocument(text, fileName, language);
      }
    } catch (error) {
      console.error('Document analysis failed:', error);
      throw error;
    }
  }

  async analyzeImageDocument(imageData, fileName, language) {
    const prompt = `You are a legal AI assistant specializing in Indian law. Analyze this legal document image and provide a detailed analysis.

Please:
1. Extract all text from the image using OCR (including Tamil, Hindi, English text)
2. Identify key legal information, dates, amounts, parties involved, challan numbers, vehicle details
3. Analyze the legal implications under Indian law (Motor Vehicles Act, specific sections)
4. Provide risk assessment and recommendations
5. Pay special attention to traffic challans, court notices, legal notices
6. Extract specific details like fine amounts, payment deadlines, legal sections

IMPORTANT: 
- Provide summary_en in English ONLY
- Provide summary_local in ${language === 'hi' ? 'Hindi ONLY' : 'English ONLY'}
- Do NOT mix languages within the same field
- Return ONLY valid JSON without markdown code blocks
- For Hindi summary, write complete sentences in Hindi using Devanagari script
- Extract actual content from the document, not generic responses

Return your response as a clean JSON object:
{
  "summary_en": "Complete English summary with specific legal details extracted from the document",
  "summary_local": "${language === 'hi' ? 'दस्तावेज़ से निकाले गए विशिष्ट कानूनी विवरणों के साथ पूरा हिंदी सारांश' : 'Complete English summary with specific legal details extracted from the document'}",
  "clauses": [
    {
      "title": "Specific legal information found in document",
      "source_excerpt": "Actual extracted text from the document",
      "explanation_en": "Detailed explanation of legal implications under Indian law",
      "risk_level": "HIGH/MEDIUM/LOW",
      "risk_reasons": ["specific reason based on document content"],
      "india_markers": ["specific_legal_area", "motor_vehicles_act", "traffic_law"]
    }
  ],
  "recommended_questions": [
    "What specific violation is mentioned in this document?",
    "What is the fine amount and payment deadline?",
    "What legal sections are referenced?",
    "What are the consequences of non-compliance?"
  ],
  "disclaimer": "This analysis is for informational purposes only and does not constitute legal advice. Please consult with a qualified legal professional for specific legal matters."
}`;

    const base64Data = imageData.split(',')[1];
    const mimeType = imageData.split(':')[1].split(';')[0];

    const requestBody = {
      contents: [{
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: mimeType,
              data: base64Data
            }
          }
        ]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    };

    return await this.makeGeminiRequest(requestBody, language);
  }

  async analyzeTextDocument(text, fileName, language) {
    // Check if text is too long and needs chunking
    if (text.length > 100000) {
      return await this.analyzeLargeDocument(text, fileName, language);
    }

    const prompt = `You are a legal AI assistant specializing in Indian law. Analyze the following legal document and provide a detailed analysis.

DOCUMENT TEXT:
${text}

IMPORTANT: 
- Provide summary_en in English ONLY
- Provide summary_local in ${language === 'hi' ? 'Hindi ONLY' : 'English ONLY'}
- Do NOT mix languages within the same field
- Return ONLY valid JSON without markdown code blocks
- For Hindi summary, write complete sentences in Hindi using Devanagari script
- Pay special attention to Indian legal documents like traffic challans, court notices, legal agreements
- Identify specific legal sections, acts, and regulations mentioned
- Extract key details like challan numbers, fine amounts, dates, vehicle numbers, etc.

Return your response as a clean JSON object:
{
  "summary_en": "Complete English summary of the document with specific legal details",
  "summary_local": "${language === 'hi' ? 'दस्तावेज़ का पूरा हिंदी सारांश - मुख्य बिंदु, शर्तें और कानूनी प्रभाव' : 'Complete English summary of the document with specific legal details'}",
  "clauses": [
    {
      "title": "Specific legal clause or section title",
      "source_excerpt": "Relevant text from document with actual content",
      "explanation_en": "Detailed explanation of legal implications under Indian law",
      "risk_level": "HIGH/MEDIUM/LOW",
      "risk_reasons": ["specific reason1", "specific reason2"],
      "india_markers": ["specific_legal_area1", "specific_legal_area2"]
    }
  ],
  "recommended_questions": ["Specific question1", "Specific question2"],
  "disclaimer": "This analysis is for informational purposes only and does not constitute legal advice. Please consult with a qualified legal professional for specific legal matters."
}`;

    const requestBody = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    };

    return await this.makeGeminiRequest(requestBody, language);
  }

  async analyzeLargeDocument(text, fileName, language) {
    const chunks = this.splitTextIntoChunks(text);
    const chunkAnalyses = [];

    // Process each chunk
    for (let i = 0; i < chunks.length; i++) {
      try {
        const chunkPrompt = `You are a legal AI assistant specializing in Indian law. Analyze this portion of a legal document (chunk ${i + 1} of ${chunks.length}) and provide a detailed analysis.

DOCUMENT CHUNK:
${chunks[i]}

IMPORTANT: 
- Provide summary_en in English ONLY
- Provide summary_local in ${language === 'hi' ? 'Hindi ONLY' : 'English ONLY'}
- Do NOT mix languages within the same field
- Return ONLY valid JSON without markdown code blocks
- Focus on the specific content in this chunk

Return your response as a clean JSON object:
{
  "summary_en": "Summary of this chunk",
  "summary_local": "${language === 'hi' ? 'इस खंड का सारांश' : 'Summary of this chunk'}",
  "clauses": [
    {
      "title": "Clause title",
      "source_excerpt": "Relevant text from this chunk",
      "explanation_en": "Explanation",
      "risk_level": "HIGH/MEDIUM/LOW",
      "risk_reasons": ["reason1", "reason2"],
      "india_markers": ["legal_area1", "legal_area2"]
    }
  ],
  "recommended_questions": ["question1", "question2"],
  "disclaimer": "This analysis covers only a portion of the document."
}`;

        const requestBody = {
          contents: [{ parts: [{ text: chunkPrompt }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        };

        const chunkAnalysis = await this.makeGeminiRequest(requestBody, language);
        chunkAnalyses.push(chunkAnalysis);
      } catch (error) {
        console.warn(`Failed to analyze chunk ${i + 1}:`, error);
        // Continue with other chunks
      }
    }

    // Combine all chunk analyses
    return this.combineChunkAnalyses(chunkAnalyses, language);
  }

  splitTextIntoChunks(text) {
    const CHUNK_SIZE = 50000;
    if (text.length <= CHUNK_SIZE) {
      return [text];
    }

    const chunks = [];
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

  combineChunkAnalyses(chunkAnalyses, language) {
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

  async makeGeminiRequest(requestBody, language) {
    const url = `${this.apiUrl}/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      let analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      if (!analysisText) {
        throw new Error('No response received from Gemini API');
      }

      // Clean up the response text
      analysisText = this.cleanJsonResponse(analysisText);
      
      try {
        // Try to parse as JSON
        const analysis = JSON.parse(analysisText);
        return this.validateAndCleanAnalysis(analysis, language);
      } catch (parseError) {
        console.warn('JSON parsing failed, creating structured response:', parseError);
        return this.createStructuredResponse(analysisText, '', language);
      }
    } catch (error) {
      console.error('Gemini API request failed:', error);
      throw error;
    }
  }

  cleanJsonResponse(text) {
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

  validateAndCleanAnalysis(analysis, language) {
    const cleanedAnalysis = {
      summary_en: this.cleanText(analysis.summary_en || 'No English summary available'),
      summary_local: this.cleanText(analysis.summary_local || (language === 'hi' ? 'हिंदी सारांश उपलब्ध नहीं है' : 'No local summary available')),
      clauses: Array.isArray(analysis.clauses) ? analysis.clauses.map((clause) => ({
        title: this.cleanText(clause.title || 'Untitled Clause'),
        source_excerpt: this.cleanText(clause.source_excerpt || 'No excerpt available'),
        explanation_en: this.cleanText(clause.explanation_en || 'No explanation available'),
        risk_level: ['HIGH', 'MEDIUM', 'LOW'].includes(clause.risk_level) ? clause.risk_level : 'MEDIUM',
        risk_reasons: Array.isArray(clause.risk_reasons) ? clause.risk_reasons.map((r) => this.cleanText(r)) : ['Risk assessment required'],
        india_markers: Array.isArray(clause.india_markers) ? clause.india_markers.map((m) => this.cleanText(m)) : ['general_legal']
      })) : [],
      recommended_questions: Array.isArray(analysis.recommended_questions) ? 
        analysis.recommended_questions.map((q) => this.cleanText(q)) : 
        ['What are the main terms and conditions?'],
      disclaimer: this.cleanText(analysis.disclaimer || 'This analysis is for informational purposes only and does not constitute legal advice.')
    };

    return cleanedAnalysis;
  }

  cleanText(text) {
    if (!text || typeof text !== 'string') return '';
    
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim();
  }

  createStructuredResponse(analysisText, originalText, language) {
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

  createFallbackAnalysis(extractedText, fileName, language) {
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

  async chatWithDocument({ docId, question, context }) {
    const prompt = `You are a legal AI assistant specializing in Indian law. Answer this question about the legal document: "${question}"
    
    Context: ${context || 'No additional context provided.'}
    
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

    const requestBody = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    };

    const url = `${this.apiUrl}/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      try {
        // Try to parse as JSON
        const chatResponse = JSON.parse(responseText);
        return chatResponse;
      } catch (parseError) {
        // If JSON parsing fails, return the text as answer
        return {
          answer: responseText,
          evidence: []
        };
      }
    } catch (error) {
      console.error('Gemini chat request failed:', error);
      throw error;
    }
  }

  async generateSummary(text, language = 'en') {
    const prompt = `You are a legal AI assistant specializing in Indian law. Generate a concise summary of the following legal document:

${text}

IMPORTANT: 
- Provide summary in ${language === 'hi' ? 'Hindi using Devanagari script' : 'English'}
- Focus on key legal points, terms, and implications under Indian law
- Keep it concise but comprehensive
- Do NOT include markdown formatting

Return only the summary text without any additional formatting.`;

    const requestBody = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    };

    const url = `${this.apiUrl}/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      const summary = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      return this.cleanText(summary);
    } catch (error) {
      console.error('Gemini summary request failed:', error);
      throw error;
    }
  }
}

module.exports = GeminiService;
