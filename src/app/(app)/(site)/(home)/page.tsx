import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Lock, Users } from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: <Globe className="w-10 h-10 text-primary" />,
      title: 'Global Collaboration',
      description: 'Connect and work with teams across the world seamlessly.'
    },
    {
      icon: <Lock className="w-10 h-10 text-primary" />,
      title: 'Secure Communication',
      description: 'End-to-end encryption to protect your sensitive information.'
    },
    {
      icon: <Users className="w-10 h-10 text-primary" />,
      title: 'Team Management',
      description: 'Effortlessly organize, assign, and track team progress.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="bg-background py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-6 text-foreground">
            Streamline Your Team&apos;s Workflow
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            A powerful platform designed to enhance collaboration, 
            communication, and productivity for modern teams.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/auth/sign-up">
              <Button size="lg" className="shadow-md">
                Get Started
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="secondary" size="lg" className="shadow-md">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary/10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300">
                <CardHeader className="items-center">
                  {feature.icon}
                  <CardTitle className="mt-4 text-center">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground">
                  {feature.description}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-primary text-primary-foreground py-16 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Team&apos;s Potential?
          </h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto opacity-80">
            Join thousands of teams who have revolutionized their workflow 
            with our cutting-edge collaboration platform.
          </p>
          <Link href="/auth/sign-up">
            <Button 
              size="lg" 
              variant="secondary" 
              className="shadow-xl hover:scale-105 transition-transform"
            >
              Start Your Free Trial
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
