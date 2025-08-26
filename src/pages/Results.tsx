import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Download, MessageCircle, Filter, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import RiskBadge from "@/components/RiskBadge";
import LoadingSpinner from "@/components/LoadingSpinner";
import ClauseCard from "@/components/ClauseCard";
import SummaryCard from "@/components/SummaryCard";
import { toast } from "@/hooks/use-toast";

type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "ALL";

interface Clause {
  title: string;
  source_excerpt: string;
  explanation_en: string;
  risk_level: "LOW" | "MEDIUM" | "HIGH";
  risk_reasons: string[];
  india_markers: string[];
}

interface DocumentResult {
  summary_en: string;
  summary_local: string;
  clauses: Clause[];
  recommended_questions: string[];
  disclaimer: string;
}

const Results = () => {
  const { docId } = useParams();
  const [data, setData] = useState<DocumentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRisk, setSelectedRisk] = useState<RiskLevel>("ALL");
  const [downloading, setDownloading] = useState(false);

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockData: DocumentResult = {
      summary_en: "This is a comprehensive employment contract that outlines terms and conditions for a software developer position. The contract includes standard clauses for compensation, benefits, intellectual property rights, and termination procedures. Key areas of concern include restrictive non-compete clauses and intellectual property assignment terms that may be overly broad.",
      summary_local: "यह एक व्यापक रोजगार अनुबंध है जो एक सॉफ्टवेयर डेवलपर पद के लिए नियम और शर्तों को निर्धारित करता है। अनुबंध में मुआवजा, लाभ, बौद्धिक संपदा अधिकार, और समाप्ति प्रक्रियाओं के लिए मानक खंड शामिल हैं।",
      clauses: [
        {
          title: "Non-Compete Agreement",
          source_excerpt: "Employee agrees not to engage in any business that competes with the Company for a period of 24 months after termination...",
          explanation_en: "This clause restricts your ability to work for competitors or start a competing business for 2 years after leaving. This may be legally questionable in India.",
          risk_level: "HIGH",
          risk_reasons: ["Overly restrictive time period", "May violate right to livelihood", "Broad geographic scope"],
          india_markers: ["employment_law", "restraint_of_trade", "constitutional_rights"]
        },
        {
          title: "Intellectual Property Assignment",
          source_excerpt: "All work product, inventions, and ideas conceived during employment shall be the exclusive property of the Company...",
          explanation_en: "This assigns all your creative work to the company, including personal projects during employment. Consider negotiating exceptions for personal work.",
          risk_level: "MEDIUM",
          risk_reasons: ["Includes personal time work", "No exceptions for personal projects"],
          india_markers: ["ip_law", "copyright_act"]
        },
        {
          title: "Termination Notice Period",
          source_excerpt: "Either party may terminate this agreement with 30 days written notice...",
          explanation_en: "Standard 30-day notice period is reasonable and complies with Indian labor laws for most positions.",
          risk_level: "LOW",
          risk_reasons: [],
          india_markers: ["labour_law", "notice_period"]
        }
      ],
      recommended_questions: [
        "Can the non-compete clause be enforced in Indian courts?",
        "What happens to my personal projects under the IP clause?",
        "Are there any exceptions to the intellectual property assignment?",
        "Can I negotiate the non-compete period?"
      ],
      disclaimer: "This analysis is for informational purposes only and does not constitute legal advice. Please consult with a qualified legal professional for specific legal matters."
    };

    setTimeout(() => {
      setData(mockData);
      setLoading(false);
    }, 1500);
  }, [docId]);

  const filteredClauses = data?.clauses.filter(clause => 
    selectedRisk === "ALL" || clause.risk_level === selectedRisk
  ) || [];

  const handleDownload = async () => {
    setDownloading(true);
    try {
      // Mock download - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Download started",
        description: "Your simplified document is being prepared.",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  const riskCounts = data?.clauses.reduce((acc, clause) => {
    acc[clause.risk_level] = (acc[clause.risk_level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Analyzing Document</h2>
          <p className="text-muted-foreground">This may take up to 60 seconds...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Document not found</h2>
          <p className="text-muted-foreground mb-4">The document may have expired or been deleted.</p>
          <Link to="/upload">
            <Button variant="outline">Upload New Document</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Document Analysis</h1>
            <p className="text-muted-foreground">
              AI-powered analysis of your legal document
            </p>
          </div>
          
          <div className="flex gap-3">
            <Link to={`/chat/${docId}`}>
              <Button variant="outline" className="btn-primary">
                <MessageCircle className="h-4 w-4 mr-2" />
                Ask Questions
              </Button>
            </Link>
            <Button 
              onClick={handleDownload}
              disabled={downloading}
              className="btn-saffron"
            >
              {downloading ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Download PDF
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <SummaryCard
            title="English Summary"
            content={data.summary_en}
            language="en"
          />
          <SummaryCard
            title="Hindi Summary"
            content={data.summary_local}
            language="hi"
          />
        </div>

        {/* Risk Filter */}
        <Card className="card-glass mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter by Risk Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {(["ALL", "HIGH", "MEDIUM", "LOW"] as RiskLevel[]).map((risk) => (
                <Badge
                  key={risk}
                  variant={selectedRisk === risk ? "default" : "outline"}
                  className={`cursor-pointer px-4 py-2 ${
                    selectedRisk === risk 
                      ? "bg-saffron text-saffron-foreground" 
                      : "hover:bg-saffron/10"
                  }`}
                  onClick={() => setSelectedRisk(risk)}
                >
                  {risk === "ALL" ? `All Clauses (${data.clauses.length})` : 
                   `${risk} (${riskCounts[risk] || 0})`}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Clauses */}
        <div className="space-y-4 mb-8">
          <h2 className="text-2xl font-semibold text-foreground">
            Document Clauses ({filteredClauses.length})
          </h2>
          
          {filteredClauses.length === 0 ? (
            <Card className="card-glass">
              <CardContent className="p-8 text-center">
                <RotateCcw className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No clauses found for the selected risk level.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredClauses.map((clause, index) => (
                <ClauseCard key={index} clause={clause} />
              ))}
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <Card className="card-glass border-warning/20">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-2">Legal Disclaimer</h3>
            <p className="text-sm text-muted-foreground">{data.disclaimer}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Results;