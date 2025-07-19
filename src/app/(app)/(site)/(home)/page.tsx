import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Eye, Lock, FileText, CheckCircle, MessageSquare } from "lucide-react";

const Home = () => {
  const features = [
    {
      icon: <Shield className="w-12 h-12 text-primary" />,
      title: "Complete Anonymity",
      description:
        "Your identity remains completely protected. Report without fear of retaliation or exposure.",
    },
    {
      icon: <Lock className="w-12 h-12 text-primary" />,
      title: "End-to-End Encryption",
      description:
        "Military-grade encryption ensures your reports are secure from submission to resolution.",
    },
    {
      icon: <Eye className="w-12 h-12 text-primary" />,
      title: "Zero Tracking",
      description:
        "No IP logging, no metadata collection. Your digital footprint remains invisible.",
    },
    {
      icon: <FileText className="w-12 h-12 text-primary" />,
      title: "Detailed Reporting",
      description:
        "Comprehensive forms to capture all necessary details while maintaining your anonymity.",
    },
    {
      icon: <MessageSquare className="w-12 h-12 text-primary" />,
      title: "Secure Communication",
      description: "Anonymous two-way communication channel for follow-ups and clarifications.",
    },
    {
      icon: <CheckCircle className="w-12 h-12 text-primary" />,
      title: "Case Tracking",
      description: "Monitor the progress of your report through secure, anonymous case tracking.",
    },
  ];

  const stats = [
    { number: "10,000+", label: "Reports Submitted" },
    { number: "500+", label: "Organizations Protected" },
    { number: "99.9%", label: "Anonymity Maintained" },
    { number: "24/7", label: "Secure Access" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <section className="bg-gradient-to-br from-background via-background to-muted/30 py-24 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex justify-center mb-8">
            <div className="p-4 rounded-full bg-primary/10 border border-primary/20">
              <Shield className="w-16 h-16 text-primary" />
            </div>
          </div>
          <h1 className="text-6xl font-bold mb-6 text-foreground leading-tight">
            Speak Up <span className="text-primary">Safely</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            A secure, anonymous whistleblowing platform that empowers you to report misconduct,
            fraud, and unethical behavior while protecting your identity and ensuring your voice is
            heard.
          </p>
          <div className="flex justify-center gap-6 mb-12">
            <Link href="/auth/sign-up">
              <Button size="lg" className="shadow-lg px-8 py-3 text-lg font-semibold">
                Submit Anonymous Report
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button
                variant="outline"
                size="lg"
                className="shadow-lg px-8 py-3 text-lg font-semibold border-2"
              >
                Organization Login
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6 text-foreground">
            Your <span className="text-primary">Security</span> is Our Priority
          </h2>
          <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
            We understand the courage it takes to speak up. That&apos;s why we&apos;ve built the
            most secure, anonymous reporting platform with zero-knowledge architecture and
            military-grade encryption.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-card rounded-lg border shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Zero-Knowledge</h3>
              <p className="text-sm text-muted-foreground">
                We never know who you are. Your identity is mathematically impossible to trace.
              </p>
            </div>
            <div className="p-6 bg-card rounded-lg border shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">End-to-End Encrypted</h3>
              <p className="text-sm text-muted-foreground">
                Your reports are encrypted before leaving your device and remain encrypted at rest.
              </p>
            </div>
            <div className="p-6 bg-card rounded-lg border shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">No Tracking</h3>
              <p className="text-sm text-muted-foreground">
                No IP logging, no cookies, no digital fingerprinting. Complete privacy guaranteed.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-foreground">
              Comprehensive <span className="text-primary">Reporting</span> Platform
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to report misconduct safely and effectively, with full anonymity
              and professional case management.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20"
              >
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-full bg-primary/10 border border-primary/20">
                      {feature.icon}
                    </div>
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground leading-relaxed">
                  {feature.description}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-20 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-5xl font-bold mb-6">
            Ready to Make a <span className="text-primary-foreground/90">Difference</span>?
          </h2>
          <p className="text-xl mb-10 max-w-3xl mx-auto opacity-90 leading-relaxed">
            Your voice matters. Report misconduct, fraud, or unethical behavior safely and
            anonymously. Help create a more ethical and transparent workplace for everyone.
          </p>
          <div className="flex justify-center gap-6">
            <Link href="/auth/sign-up">
              <Button
                size="lg"
                variant="secondary"
                className="shadow-xl hover:scale-105 transition-transform px-8 py-3 text-lg font-semibold"
              >
                Submit Report Now
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button
                size="lg"
                variant="outline"
                className="shadow-xl hover:scale-105 transition-transform px-8 py-3 text-lg font-semibold bg-transparent border-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              >
                Organization Access
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
