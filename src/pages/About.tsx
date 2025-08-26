import { Scale, Target, Users, Shield, Globe, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const About = () => {
  const values = [
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your documents are encrypted, processed securely, and automatically deleted after 24 hours."
    },
    {
      icon: Globe,
      title: "Inclusive Access",
      description: "Making legal understanding accessible to all Indians, regardless of language or background."
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "Leveraging cutting-edge AI to solve real problems in the Indian legal landscape."
    }
  ];

  const stats = [
    { number: "10,000+", label: "Documents Analyzed" },
    { number: "15", label: "Indian Languages" },
    { number: "99%", label: "Accuracy Rate" },
    { number: "30s", label: "Average Analysis Time" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-saffron/20 to-india-green/20 rounded-full mb-8">
            <Scale className="h-8 w-8 text-saffron" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            About <span className="text-gradient">LegalEase India</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We're on a mission to democratize legal understanding in India by making complex legal documents 
            accessible to everyone, regardless of their legal background or language preference.
          </p>
        </div>

        {/* Mission Section */}
        <section className="mb-20">
          <Card className="card-gradient">
            <CardContent className="p-8 md:p-12">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <Target className="h-8 w-8 text-saffron" />
                    <h2 className="text-3xl font-bold text-foreground">Our Mission</h2>
                  </div>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                    Every day, millions of Indians sign legal documents—employment contracts, rental agreements, 
                    insurance policies—without fully understanding their rights and obligations. This information 
                    asymmetry often leads to unfavorable outcomes and legal disputes.
                  </p>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    LegalEase India bridges this gap by providing instant, AI-powered analysis that translates 
                    complex legal language into clear, actionable insights tailored for Indian law and regulations.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center p-6 bg-card/50 rounded-xl">
                      <div className="text-3xl font-bold text-saffron mb-2">{stat.number}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Values Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Our Values</h2>
            <p className="text-xl text-muted-foreground">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="card-glass hover:shadow-lg transition-all duration-300">
                <CardContent className="p-8 text-center">
                  <div className="p-4 bg-gradient-to-r from-saffron/20 to-india-green/20 rounded-full w-fit mx-auto mb-6">
                    <value.icon className="h-8 w-8 text-saffron" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Story Section */}
        <section className="mb-20">
          <Card className="card-glass">
            <CardContent className="p-8 md:p-12">
              <div className="flex items-center gap-3 mb-8">
                <Users className="h-8 w-8 text-india-green" />
                <h2 className="text-3xl font-bold text-foreground">Our Story</h2>
              </div>
              
              <div className="prose prose-lg max-w-none text-muted-foreground">
                <p className="mb-6">
                  LegalEase India was born from a personal experience of our founder, who witnessed family members 
                  unknowingly sign unfavorable rental agreements due to language barriers and complex legal jargon. 
                  This sparked the idea: what if we could use AI to make legal documents as easy to understand as 
                  reading a news article?
                </p>
                
                <p className="mb-6">
                  Our team of legal experts, AI engineers, and linguists came together to build a solution 
                  specifically designed for the Indian legal landscape. We understand the nuances of Indian 
                  contract law, consumer protection regulations, and employment legislation.
                </p>
                
                <p>
                  Today, we're proud to have helped thousands of Indians make informed decisions about their 
                  legal documents, from startup founders reviewing investment agreements to domestic workers 
                  understanding their employment contracts.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Team Section */}
        <section>
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">Build for India ❤️</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our diverse team of legal experts, AI researchers, and product engineers are passionate about 
              making legal literacy accessible to all Indians.
            </p>
             <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
             Note- The Data shown currently is dummy in future we updated real one. Thank you!
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;