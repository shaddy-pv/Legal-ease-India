// Debug component to help troubleshoot the document analysis flow
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { geminiService } from '@/services/geminiService';

export const DebugPanel: React.FC = () => {
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  const addLog = (message: string) => {
    setDebugLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testAPI = async () => {
    setIsTesting(true);
    addLog('🧪 Starting API test...');
    
    try {
      // Test if the API endpoint is reachable
      const response = await fetch('/api/extract-text', {
        method: 'POST',
        body: new FormData() // Empty form data to test endpoint
      });
      
      addLog(`📡 API Response Status: ${response.status}`);
      
      if (response.status === 400) {
        addLog('✅ API endpoint is working (400 is expected for empty request)');
      } else {
        addLog(`⚠️ Unexpected status: ${response.status}`);
      }
      
    } catch (error) {
      addLog(`❌ API Test Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    setIsTesting(false);
  };

  const testFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsTesting(true);
    addLog(`📁 Testing file upload: ${file.name} (${file.type}, ${file.size} bytes)`);

    try {
      const result = await geminiService.analyzeDocument(file, 'en');
      addLog(`✅ Analysis successful! Summary length: ${result.summary_en.length} chars`);
      addLog(`📊 Clauses found: ${result.clauses.length}`);
      addLog(`❓ Questions generated: ${result.recommended_questions.length}`);
    } catch (error) {
      addLog(`❌ Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    setIsTesting(false);
  };

  const clearLogs = () => {
    setDebugLogs([]);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>🐛 Debug Panel</CardTitle>
        <p className="text-sm text-muted-foreground">
          Use this panel to debug document analysis issues
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={testAPI} disabled={isTesting}>
            {isTesting ? 'Testing...' : 'Test API Endpoint'}
          </Button>
          <Button onClick={clearLogs} variant="outline">
            Clear Logs
          </Button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Test File Upload:
          </label>
          <input
            type="file"
            accept=".pdf,.docx,.jpg,.jpeg,.png"
            onChange={testFileUpload}
            disabled={isTesting}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <div>
          <h4 className="font-medium mb-2">Debug Logs:</h4>
          <div className="bg-gray-100 p-4 rounded-lg max-h-64 overflow-y-auto">
            {debugLogs.length === 0 ? (
              <p className="text-gray-500 text-sm">No logs yet. Click "Test API Endpoint" to start.</p>
            ) : (
              <div className="space-y-1">
                {debugLogs.map((log, index) => (
                  <div key={index} className="text-sm font-mono">
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Common Issues:</strong></p>
          <p>• "Cannot connect to backend server" → API endpoint not running</p>
          <p>• "No text could be extracted" → File type not supported or corrupted</p>
          <p>• "HTTP error! status: 500" → Backend processing error</p>
          <p>• "Method not allowed" → Wrong HTTP method or endpoint</p>
        </div>
      </CardContent>
    </Card>
  );
};
