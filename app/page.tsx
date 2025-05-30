import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Bot,
  MessageSquare,
  BarChart3,
  Users,
  ArrowRight,
  Code,
  Globe,
} from "lucide-react";
import Link from "next/link";
import { SignedIn, SignedOut, SignUpButton } from "@clerk/nextjs";
import Header from "@/components/header";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-gray-50 py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 border-none">
              Launching Soon
            </Badge>
            <h1 className="text-5xl font-bold tracking-tight mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent sm:text-6xl">
              Create Custom AI Assistants in Minutes
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Build, deploy, and manage AI assistants for your business without
              writing a single line of code. Engage customers, collect feedback,
              and boost conversions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <SignedOut>
                <SignUpButton mode="modal">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Start Building for Free
                  </Button>
                </SignUpButton>
                <Button variant="outline" size="lg" asChild>
                  <a href="#features">
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </SignedOut>

              <SignedIn>
                <Button asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              </SignedIn>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Create Any Type of AI Assistant
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose from multiple assistant types or customize your own to meet
              your specific business needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-sm hover:shadow-md transition-all">
              <CardContent className="pt-6">
                <div className="mb-5 p-2 bg-blue-100 rounded-lg w-fit">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Sales Assistant</h3>
                <p className="text-gray-600 mb-4">
                  Convert visitors into customers with personalized sales
                  conversations and product recommendations.
                </p>
                <ul className="space-y-2">
                  {[
                    "Lead qualification",
                    "Product recommendations",
                    "Pricing information",
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-all">
              <CardContent className="pt-6">
                <div className="mb-5 p-2 bg-green-100 rounded-lg w-fit">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Feedback Collector</h3>
                <p className="text-gray-600 mb-4">
                  Gather valuable customer feedback and insights about your
                  products or services.
                </p>
                <ul className="space-y-2">
                  {[
                    "Customer satisfaction",
                    "Product reviews",
                    "Service feedback",
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-all">
              <CardContent className="pt-6">
                <div className="mb-5 p-2 bg-purple-100 rounded-lg w-fit">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Survey Assistant</h3>
                <p className="text-gray-600 mb-4">
                  Conduct interactive surveys and collect structured data from
                  users with natural conversations.
                </p>
                <ul className="space-y-2">
                  {[
                    "Market research",
                    "User preferences",
                    "Data collection",
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Deployment Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Deploy Anywhere</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Easily integrate your AI assistants into your website or share
              them via link.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <Card className="border-0 shadow-sm hover:shadow-md transition-all">
              <CardContent className="pt-6">
                <div className="mb-5 p-2 bg-blue-100 rounded-lg w-fit">
                  <Code className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Web Widget</h3>
                <p className="text-gray-600 mb-4">
                  Embed your assistant directly on your website with a simple
                  code snippet. No coding skills required.
                </p>
                <div className="bg-gray-100 p-4 rounded-md">
                  <code className="text-sm text-gray-800">
                    {`<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'https://assistantai.com/widget/YOUR_ID';
    document.head.appendChild(script);
  })();
</script>`}
                  </code>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-all">
              <CardContent className="pt-6">
                <div className="mb-5 p-2 bg-green-100 rounded-lg w-fit">
                  <Globe className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Shareable Link</h3>
                <p className="text-gray-600 mb-4">
                  Share your assistant via email, social media, or QR code.
                  Perfect for campaigns and outreach.
                </p>
                <div className="bg-gray-100 p-4 rounded-md flex items-center">
                  <code className="text-sm text-gray-800 flex-1 truncate">
                    https://assistantai.com/chat/sample-assistant-id
                  </code>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the plan that's right for your business. All plans include
              a free trial.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Starter",
                price: "$29",
                description: "Perfect for small businesses",
                features: [
                  "Up to 5 assistants",
                  "10,000 tokens/month",
                  "Basic analytics",
                  "Email support",
                  "Web widget integration",
                ],
              },
              {
                name: "Pro",
                price: "$79",
                description: "Great for growing businesses",
                popular: true,
                features: [
                  "Up to 25 assistants",
                  "50,000 tokens/month",
                  "Advanced analytics",
                  "Priority support",
                  "Custom branding",
                  "API access",
                ],
              },
              {
                name: "Enterprise",
                price: "$199",
                description: "For large organizations",
                features: [
                  "Unlimited assistants",
                  "200,000 tokens/month",
                  "Custom integrations",
                  "Dedicated support",
                  "White-label solution",
                  "Advanced security",
                ],
              },
            ].map((plan, i) => (
              <Card
                key={i}
                className={`border-0 shadow-sm relative ${
                  plan.popular ? "ring-2 ring-blue-600 shadow-md" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardContent className="pt-6">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <div className="flex items-baseline justify-center gap-1 my-4">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-gray-600">/month</span>
                    </div>
                    <p className="text-gray-600 mb-6">{plan.description}</p>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <SignUpButton mode="modal">
                    <Button
                      className={`w-full ${
                        plan.popular
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-gray-900 hover:bg-gray-800"
                      }`}
                    >
                      Get Started
                    </Button>
                  </SignUpButton>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Customer Interactions?
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Join thousands of businesses using AssistantAI to create engaging AI
            experiences.
          </p>
          <SignUpButton mode="modal">
            <Button
              size="lg"
              className="bg-white text-gray-900 hover:bg-gray-100"
            >
              Start Building for Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </SignUpButton>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 border-t">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Bot className="h-6 w-6 text-primary" />
              <span className="font-semibold text-xl">AssistantAI</span>
            </div>
            <div className="flex gap-8">
              <Link href="#" className="text-gray-600 hover:text-gray-900">
                Terms
              </Link>
              <Link href="#" className="text-gray-600 hover:text-gray-900">
                Privacy
              </Link>
              <Link href="#" className="text-gray-600 hover:text-gray-900">
                Contact
              </Link>
            </div>
          </div>
          <div className="text-center mt-8 text-gray-600 text-sm">
            &copy; {new Date().getFullYear()} AssistantAI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
