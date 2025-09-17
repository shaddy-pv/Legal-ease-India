import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";

interface FileDropZoneProps {
  onFileSelect: (file: File) => void;
  isUploading?: boolean;
  uploadProgress?: number;
  className?: string;
}

const FileDropZone = ({ 
  onFileSelect, 
  isUploading = false, 
  uploadProgress = 0,
  className = "" 
}: FileDropZoneProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    multiple: false,
    disabled: isUploading,
  });

  const clearFile = () => {
    setSelectedFile(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`w-full ${className}`}>
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 cursor-pointer
          ${isDragActive 
            ? 'border-saffron bg-saffron/5 scale-[1.02]' 
            : 'border-border hover:border-saffron/50 hover:bg-saffron/5'
          }
          ${isUploading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          {!selectedFile ? (
            <>
              <div className="p-4 bg-gradient-to-r from-saffron/20 to-india-green/20 rounded-full">
                <Upload className="h-8 w-8 text-saffron" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {isDragActive ? "Drop your document here" : "Upload Legal Document"}
                </h3>
                <p className="text-muted-foreground text-sm">
                  Drag & drop or click to select • PDF, DOCX, JPG, PNG up to 10MB
                </p>
              </div>
              <Button variant="outline" className="mt-4 btn-saffron">
                Choose File
              </Button>
            </>
          ) : (
            <div className="w-full">
              <div className="flex items-center justify-between p-4 bg-card rounded-lg border">
                <div className="flex items-center space-x-3">
                  <FileText className="h-6 w-6 text-saffron" />
                  <div>
                    <p className="font-medium text-foreground">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
                
                {!isUploading ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFile();
                    }}
                    className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                ) : (
                  <CheckCircle className="h-5 w-5 text-success" />
                )}
              </div>
              
              {isUploading && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Uploading...</span>
                    <span className="text-saffron font-medium">{Math.round(uploadProgress)}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileDropZone;