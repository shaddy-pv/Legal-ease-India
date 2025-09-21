import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Shield, Zap, Globe, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import FileDropZone from "@/components/FileDropZone";
import LoadingSpinner from "@/components/LoadingSpinner";
import { DebugPanel } from "@/components/DebugPanel";
import { toast } from "@/hooks/use-toast";
import { geminiService } from "@/services/geminiService";

const Upload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const navigate = useNavigate();

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + Math.random() * 10;
        });
      }, 200);

      // Use Gemini service for document analysis
      const analysisResult = await geminiService.analyzeDocument(file, selectedLanguage);
      
      setUploadProgress(100);
      
      toast({
        title: "Upload successful!",
        description: "Your document has been processed successfully.",
      });

      // Navigate to results with analysis data
      setTimeout(() => {
        navigate(`/results/analysis-${Date.now()}`, { 
          state: { analysisData: analysisResult } 
        });
      }, 500);

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Get your document analysis in under 60 seconds"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your documents are encrypted and automatically deleted"
    },
    {
      icon: Globe,
      title: "Multi-Language",
      description: "Understand legal terms in Hindi, Bengali, Tamil & more"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-between items-center mb-6">
            <div></div>
            <h1 className="text-4xl md:text-5xl font-bold">
              Upload Your{" "}
              <span className="text-gradient">Legal Document</span>
            </h1>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDebugPanel(!showDebugPanel)}
              className="flex items-center gap-2"
            >
              <Bug className="h-4 w-4" />
              Debug
            </Button>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get instant, AI-powered analysis of contracts, agreements, and legal documents 
            tailored for Indian law and regulations.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Upload Section */}
          <div className="space-y-6">
            <Card className="card-gradient">
              <CardContent className="p-6">
                {/* Language Selector */}
                <div className="mb-6">
                  <Label htmlFor="language-select" className="text-sm font-medium text-foreground mb-2 block">
                    Analysis Language
                  </Label>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger id="language-select" className="w-full">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <FileDropZone
                  onFileSelect={handleFileSelect}
                  isUploading={isUploading}
                  uploadProgress={uploadProgress}
                />
                
                {file && !isUploading && (
                  <div className="mt-6 flex justify-center">
                    <Button
                      onClick={handleUpload}
                      className="btn-hero group"
                      size="lg"
                    >
                      Analyze Document
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                )}

                {isUploading && (
                  <div className="mt-6 text-center">
                    <LoadingSpinner size="lg" className="mb-4" />
                    <p className="text-muted-foreground">
                      Analyzing your document with AI...
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upload Info */}
            <div className="text-sm text-muted-foreground space-y-2">
              <p>✓ Supports PDF and DOCX files up to 10MB</p>
              <p>✓ All documents are encrypted and automatically deleted after 24 hours</p>
              <p>✓ Analysis typically takes 30-60 seconds</p>
            </div>
          </div>

          {/* Features Section */}
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-foreground">
              Why Choose LegalEase India?
            </h3>
            
            <div className="space-y-4">
              {features.map((feature, index) => (
                <Card key={index} className="card-glass hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-gradient-to-r from-saffron/20 to-india-green/20 rounded-lg">
                        <feature.icon className="h-6 w-6 text-saffron" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">
                          {feature.title}
                        </h4>
                        <p className="text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Supported Documents */}
            <Card className="card-glass">
              <CardContent className="p-6">
                <h4 className="font-semibold text-foreground mb-3">
                  Supported Document Types
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <div>• Employment Contracts</div>
                  <div>• Rental Agreements</div>
                  <div>• Service Agreements</div>
                  <div>• Purchase Orders</div>
                  <div>• NDAs & Confidentiality</div>
                  <div>• Terms & Conditions</div>
                  <div>• Privacy Policies</div>
                  <div>• And much more...</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Debug Panel */}
        {showDebugPanel && (
          <div className="mt-12">
            <DebugPanel />
          </div>
        )}
      </div>
    </div>
  );
};

export default Upload;