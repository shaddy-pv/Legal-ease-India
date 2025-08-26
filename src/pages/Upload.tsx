import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Shield, Zap, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import FileDropZone from "@/components/FileDropZone";
import LoadingSpinner from "@/components/LoadingSpinner";
import { toast } from "@/hooks/use-toast";

const Upload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
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

      // Simulate API call
      const formData = new FormData();
      formData.append('file', file);

      // Mock API response - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setUploadProgress(100);
      
      toast({
        title: "Upload successful!",
        description: "Your document has been processed successfully.",
      });

      // Navigate to results with mock doc_id
      setTimeout(() => {
        navigate(`/results/mock-doc-id-${Date.now()}`);
      }, 500);

    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Please try again or contact support.",
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
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Upload Your{" "}
            <span className="text-gradient">Legal Document</span>
          </h1>
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
      </div>
    </div>
  );
};

export default Upload;