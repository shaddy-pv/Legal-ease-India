import { Shield, Lock, Eye, FileX, Server, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Privacy = () => {
  const securityMeasures = [
    {
      icon: Lock,
      title: "End-to-End Encryption",
      description: "All documents are encrypted during upload, processing, and storage using AES-256 encryption."
    },
    {
      icon: Server,
      title: "Secure Infrastructure",
      description: "Our servers are hosted on secure cloud infrastructure with SOC 2 compliance and regular security audits."
    },
    {
      icon: FileX,
      title: "Automatic Deletion",
      description: "All documents and analysis data are automatically deleted from our systems after 24 hours."
    },
    {
      icon: Eye,
      title: "No Human Access",
      description: "Your documents are processed entirely by AI. No human employees can access your document content."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-saffron/20 to-india-green/20 rounded-full mb-8">
            <Shield className="h-8 w-8 text-saffron" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Privacy <span className="text-gradient">Policy</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your privacy is our top priority. Learn how we protect and handle your data.
          </p>
        </div>

        {/* Important Notice */}
        <Alert className="mb-12 border-saffron/20 bg-saffron/5">
          <AlertTriangle className="h-4 w-4 text-saffron" />
          <AlertDescription className="text-foreground">
            <strong>Important:</strong> We prioritize your privacy above all else. All documents are automatically 
            deleted after 24 hours, and we never store or share your personal information.
          </AlertDescription>
        </Alert>

        {/* Security Measures */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
            How We Protect Your Data
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {securityMeasures.map((measure, index) => (
              <Card key={index} className="card-glass">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-r from-saffron/20 to-india-green/20 rounded-lg">
                      <measure.icon className="h-6 w-6 text-saffron" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">
                        {measure.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {measure.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Privacy Policy Content */}
        <div className="space-y-8">
          <Card className="card-glass">
            <CardHeader>
              <CardTitle>Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none text-muted-foreground">
              <ul className="space-y-2">
                <li><strong>Document Content:</strong> Only the legal documents you upload for analysis</li>
                <li><strong>Usage Data:</strong> Anonymous analytics about how you use our service</li>
                <li><strong>Technical Data:</strong> IP address, browser type, and device information for security</li>
              </ul>
              <p className="mt-4">
                We do not collect personal information like names, addresses, or contact details unless 
                explicitly provided for support purposes.
              </p>
            </CardContent>
          </Card>

          <Card className="card-glass">
            <CardHeader>
              <CardTitle>How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none text-muted-foreground">
              <ul className="space-y-2">
                <li>To provide AI-powered legal document analysis</li>
                <li>To improve our AI models and service quality</li>
                <li>To ensure platform security and prevent abuse</li>
                <li>To provide customer support when requested</li>
              </ul>
              <p className="mt-4">
                We never use your documents for training our AI models without explicit consent, 
                and all training data is anonymized and aggregated.
              </p>
            </CardContent>
          </Card>

          <Card className="card-glass">
            <CardHeader>
              <CardTitle>Data Retention & Deletion</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none text-muted-foreground">
              <ul className="space-y-2">
                <li><strong>Documents:</strong> Automatically deleted after 24 hours</li>
                <li><strong>Analysis Results:</strong> Automatically deleted after 24 hours</li>
                <li><strong>Chat History:</strong> Automatically deleted after 24 hours</li>
                <li><strong>Usage Analytics:</strong> Anonymized data retained for service improvement</li>
              </ul>
              <p className="mt-4">
                You can request immediate deletion of your data by contacting our support team. 
                We also provide a "Delete My Data" button in our interface for instant removal.
              </p>
            </CardContent>
          </Card>

          <Card className="card-glass">
            <CardHeader>
              <CardTitle>Data Sharing & Third Parties</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none text-muted-foreground">
              <p>
                We do not sell, rent, or share your personal information or document content with third parties, 
                except in the following limited circumstances:
              </p>
              <ul className="space-y-2 mt-4">
                <li><strong>Legal Requirements:</strong> If required by law or court order</li>
                <li><strong>Security:</strong> To prevent fraud or security threats</li>
                <li><strong>Service Providers:</strong> Encrypted data with cloud infrastructure providers</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="card-glass">
            <CardHeader>
              <CardTitle>Your Rights</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none text-muted-foreground">
              <p>Under Indian data protection laws, you have the right to:</p>
              <ul className="space-y-2 mt-4">
                <li>Access the personal data we hold about you</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Object to processing of your data</li>
                <li>Data portability for your information</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, contact us at privacy@legalease.in
              </p>
            </CardContent>
          </Card>

          <Card className="card-glass">
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none text-muted-foreground">
              <p>
                If you have any questions about this Privacy Policy or our data practices, 
                please contact us:
              </p>
              <div className="mt-4 space-y-2">
                <p><strong>Email:</strong> privacy@legalease.in</p>
                <p><strong>Address:</strong> LegalEase India, Prayagraj, UttarPradesh, India</p>
              </div>
              <p className="mt-4 text-xs">
                <strong>Last updated:</strong> August 2025
              </p>
            </CardContent>
          </Card>
           <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
             Note- The Data shown currently is dummy in future we updated real one. Thank you!
           </p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;