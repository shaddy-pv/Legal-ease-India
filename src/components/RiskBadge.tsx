import { AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RiskBadgeProps {
  level: "LOW" | "MEDIUM" | "HIGH";
  className?: string;
}

const RiskBadge = ({ level, className = "" }: RiskBadgeProps) => {
  const getIconAndColor = () => {
    switch (level) {
      case "LOW":
        return {
          icon: CheckCircle,
          className: "risk-low",
          text: "Low Risk"
        };
      case "MEDIUM":
        return {
          icon: AlertCircle,
          className: "risk-medium", 
          text: "Medium Risk"
        };
      case "HIGH":
        return {
          icon: AlertTriangle,
          className: "risk-high",
          text: "High Risk"
        };
      default:
        return {
          icon: AlertCircle,
          className: "risk-medium",
          text: "Medium Risk"
        };
    }
  };

  const { icon: Icon, className: riskClass, text } = getIconAndColor();

  return (
    <Badge 
      variant="outline"
      className={`${riskClass} px-3 py-1 font-medium border rounded-full ${className}`}
    >
      <Icon className="h-3 w-3 mr-1" />
      {text}
    </Badge>
  );
};

export default RiskBadge;