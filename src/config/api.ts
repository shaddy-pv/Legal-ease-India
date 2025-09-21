// API Configuration for LegalEase India
export const API_CONFIG = {
  // Backend API Configuration
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001',
  
  // Supabase Configuration (already in client.ts)
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  
  // Application Configuration
  APP_NAME: import.meta.env.VITE_APP_NAME || 'LegalEase India',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  
  // API Endpoints
  ENDPOINTS: {
    DOCUMENTS: '/api/documents',
    GEMINI: '/api/gemini',
    HEALTH: '/api/health'
  }
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string) => {
  return `${API_CONFIG.BACKEND_URL}${endpoint}`;
};
