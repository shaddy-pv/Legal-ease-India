import { Link } from "react-router-dom";
import { ArrowRight, Scale, Shield, Zap, Globe, Users, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const Index = () => {
  const features = [
    {
      icon: Zap,
      title: "Lightning Fast Analysis",
      description: "Get comprehensive document analysis in under 60 seconds"
    },
    {
      icon: Shield,
      title: "Bank-Grade Security",
      description: "Your documents are encrypted and automatically deleted after 24 hours"
    },
    {
      icon: Globe,
      title: "Multi-Language Support", 
      description: "Understand legal terms in Hindi, Bengali, Tamil, Telugu & more"
    },
    {
      icon: Users,
      title: "India-Specific Context",
      description: "Analysis tailored for Indian laws, regulations, and legal practices"
    }
  ];

  const benefits = [
    "Identify risky clauses before signing",
    "Understand complex legal language", 
    "Get Indian law context and compliance",
    "Ask questions about specific terms",
    "Download simplified summaries"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-saffron/5 to-india-green/5" />
        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-32">
          <div className="text-center">
            <div className="inline-flex items-center justify-center p-2 bg-gradient-to-r from-saffron/20 to-india-green/20 rounded-full mb-8">
              <Scale className="h-8 w-8 text-saffron mr-2" />
              <span className="text-sm font-medium text-foreground px-3">
                Powered by AI • Made for India
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6">
              Understand Any{" "}
              <span className="text-gradient">Legal Document</span>{" "}
              in Minutes
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
              India's first AI-powered legal document simplifier. 
              Upload contracts, agreements, or legal papers and get instant, 
              easy-to-understand analysis in your preferred language.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/upload">
                <Button size="lg" className="btn-hero group">
                  Analyze Document Now
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <div className="flex gap-4">
                <Link to="/about">
                  <Button variant="outline" size="lg" className="btn-primary">
                    Learn More
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button variant="outline" size="lg" className="btn-saffron">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Why Choose LegalEase India?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built specifically for Indian legal documents and regulations
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="card-glass hover:shadow-lg transition-all duration-300 group">
                <CardContent className="p-6 text-center">
                  <div className="p-4 bg-gradient-to-r from-saffron/20 to-india-green/20 rounded-full w-fit mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="h-8 w-8 text-saffron" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-foreground mb-6">
                Stop Signing Documents You Don't Understand
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Every year, millions of Indians sign legal documents without fully 
                understanding their implications. LegalEase India changes that.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-success flex-shrink-0" />
                    <span className="text-lg text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-8">
                <Link to="/upload">
                  <Button className="btn-saffron" size="lg">
                    Get Started Free
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <Card className="card-gradient p-8">
                <div className="text-center">
                  <div className="p-6 bg-gradient-to-r from-primary/10 to-saffron/10 rounded-xl mb-6">
                    <Scale className="h-16 w-16 text-saffron mx-auto" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-4">
                    Join 10,000+ Indians
                  </h3>
                  <p className="text-muted-foreground">
                    Who are making informed legal decisions with LegalEase India
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 via-saffron/10 to-india-green/10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Ready to Understand Your Legal Documents?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Upload your first document and experience the power of AI-driven legal analysis
          </p>
          <Link to="/upload">
            <Button size="lg" className="btn-hero">
              Start Free Analysis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
