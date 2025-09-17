// API Configuration for LegalEase India
export const API_CONFIG = {
  // Gemini API Configuration
  GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY || '',
  GEMINI_API_URL: 'https://generativelanguage.googleapis.com/v1beta',
  
  // Supabase Configuration (already in client.ts)
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  
  // Application Configuration
  APP_NAME: import.meta.env.VITE_APP_NAME || 'LegalEase India',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  
  // API Endpoints
  ENDPOINTS: {
    UPLOAD_DOCUMENT: '/api/upload',
    ANALYZE_DOCUMENT: '/api/analyze',
    CHAT_WITH_DOCUMENT: '/api/chat',
    DOWNLOAD_RESULTS: '/api/download'
  }
};

// Gemini API Helper Functions
export const createGeminiRequest = (prompt: string, model: string = 'gemini-1.5-flash', imageData?: string) => {
  const parts: any[] = [{ text: prompt }];
  
  // If image data is provided, add it to the request
  if (imageData && imageData.startsWith('[IMAGE_DATA:')) {
    const mimeType = imageData.match(/\[IMAGE_DATA:([^\]]+)\]/)?.[1] || 'image/jpeg';
    const base64Data = imageData.replace(/\[IMAGE_DATA:[^\]]+\]/, '');
    
    parts.push({
      inline_data: {
        mime_type: mimeType,
        data: base64Data.split(',')[1] // Remove data:image/jpeg;base64, prefix
      }
    });
  }
  
  return {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: parts
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    })
  };
};

export const getGeminiUrl = (model: string = 'gemini-1.5-flash') => {
  return `${API_CONFIG.GEMINI_API_URL}/models/${model}:generateContent?key=${API_CONFIG.GEMINI_API_KEY}`;
};
