import { useState } from "react";
import { Copy, Check, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface SummaryCardProps {
  title: string;
  content: string;
  language: "en" | "hi";
}

const SummaryCard = ({ title, content, language }: SummaryCardProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "Summary has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="card-gradient h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-saffron" />
            {title}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="p-2 hover:bg-muted/50"
          >
            {copied ? (
              <Check className="h-4 w-4 text-success" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`prose prose-sm max-w-none ${
          language === "hi" ? "text-right" : "text-left"
        }`}>
          <p className="text-muted-foreground leading-relaxed mb-0">
            {content}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SummaryCard;