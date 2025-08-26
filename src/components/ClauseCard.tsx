import { useState } from "react";
import { ChevronDown, ChevronUp, AlertTriangle, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import RiskBadge from "./RiskBadge";

interface Clause {
  title: string;
  source_excerpt: string;
  explanation_en: string;
  risk_level: "LOW" | "MEDIUM" | "HIGH";
  risk_reasons: string[];
  india_markers: string[];
}

interface ClauseCardProps {
  clause: Clause;
}

const ClauseCard = ({ clause }: ClauseCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const getMarkerColor = (marker: string) => {
    const markerColors: Record<string, string> = {
      employment_law: "bg-blue-500/10 text-blue-400",
      ip_law: "bg-purple-500/10 text-purple-400",
      labour_law: "bg-green-500/10 text-green-400",
      restraint_of_trade: "bg-red-500/10 text-red-400",
      constitutional_rights: "bg-yellow-500/10 text-yellow-400",
      notice_period: "bg-indigo-500/10 text-indigo-400",
      copyright_act: "bg-pink-500/10 text-pink-400",
    };
    
    return markerColors[marker] || "bg-gray-500/10 text-gray-400";
  };

  const formatMarker = (marker: string) => {
    return marker.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Card className="card-gradient hover:shadow-lg transition-all duration-300">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold text-foreground mb-2">
                {clause.title}
              </CardTitle>
              <div className="flex items-center gap-3">
                <RiskBadge level={clause.risk_level} />
                {clause.risk_reasons.length > 0 && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    {clause.risk_reasons.length} concern{clause.risk_reasons.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>
            
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2">
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Always visible explanation */}
          <div className="mb-4">
            <p className="text-muted-foreground leading-relaxed">
              {clause.explanation_en}
            </p>
          </div>

          <CollapsibleContent className="space-y-4">
            {/* Source excerpt */}
            <div className="bg-muted/30 rounded-lg p-4 border-l-4 border-border">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  Original Text
                </span>
              </div>
              <p className="text-sm text-muted-foreground italic leading-relaxed">
                "{clause.source_excerpt}"
              </p>
            </div>

            {/* Risk reasons */}
            {clause.risk_reasons.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  Risk Factors
                </h4>
                <ul className="space-y-1">
                  {clause.risk_reasons.map((reason, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-destructive rounded-full mt-2 flex-shrink-0" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* India markers */}
            {clause.india_markers.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">
                  Related Indian Laws & Regulations
                </h4>
                <div className="flex flex-wrap gap-2">
                  {clause.india_markers.map((marker, index) => (
                    <Badge 
                      key={index}
                      variant="outline"
                      className={`text-xs ${getMarkerColor(marker)} border-current`}
                    >
                      {formatMarker(marker)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CollapsibleContent>
        </CardContent>
      </Collapsible>
    </Card>
  );
};

export default ClauseCard;