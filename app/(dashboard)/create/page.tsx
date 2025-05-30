"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, MessageSquare, BarChart3, Users, Globe, Code, Loader2 } from "lucide-react"
import Link from "next/link"
import { useCreateAssistant } from "@/hooks/use-assistants"
import { useUserTokens } from "@/hooks/use-user"
import { useRouter } from "next/navigation"

export default function CreateAssistant() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    instructions: "",
    welcomeMessage: "",
    deliveryMethod: "",
    behavior: {
      tone: "professional",
      responseLength: "medium",
    },
  })

  const createAssistant = useCreateAssistant()
  const { data: userTokens } = useUserTokens()

  const assistantTypes = [
    {
      id: "sales",
      title: "Sales Assistant",
      description: "Help convert visitors into customers with personalized sales conversations",
      icon: MessageSquare,
      features: ["Lead qualification", "Product recommendations", "Pricing information"],
    },
    {
      id: "feedback",
      title: "Feedback Collector",
      description: "Gather valuable customer feedback and insights about your products or services",
      icon: BarChart3,
      features: ["Customer satisfaction", "Product reviews", "Service feedback"],
    },
    {
      id: "survey",
      title: "Survey Assistant",
      description: "Conduct interactive surveys and collect structured data from users",
      icon: Users,
      features: ["Market research", "User preferences", "Data collection"],
    },
  ]

  const deliveryMethods = [
    {
      id: "widget",
      title: "Web Widget",
      description: "Embed directly on your website",
      icon: Code,
      features: ["Easy integration", "Customizable appearance", "Real-time chat"],
    },
    {
      id: "link",
      title: "Shareable Link",
      description: "Share via email, social media, or QR code",
      icon: Globe,
      features: ["No coding required", "Mobile-friendly", "Analytics tracking"],
    },
  ]

  const handleNext = () => {
    if (step < 4) setStep(step + 1)
  }

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = async () => {
    if (!userTokens || userTokens.tokens < 100) {
      alert("Insufficient tokens to create assistant. Please upgrade your plan.")
      return
    }

    const result = await createAssistant.mutateAsync({
      name: formData.name,
      type: formData.type,
      instructions: formData.instructions,
      welcomeMessage: formData.welcomeMessage,
      deliveryMethod: formData.deliveryMethod,
      tone: formData.behavior.tone,
      responseLength: formData.behavior.responseLength,
    })

    if (result.success) {
      router.push("/assistants")
    }
  }

  const estimatedTokens = Math.ceil((formData.instructions.length + formData.welcomeMessage.length) / 4) + 100

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Create AI Assistant
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Step {step} of 4:{" "}
            {step === 1 ? "Choose Type" : step === 2 ? "Configure" : step === 3 ? "Delivery Method" : "Review & Create"}
          </p>
        </div>
      </div>

      {/* Token Warning */}
      {userTokens && userTokens.tokens < 100 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">
              ⚠️ You have {userTokens.tokens} tokens remaining. Creating an assistant requires at least 100 tokens.{" "}
              <Link href="/settings" className="underline font-medium">
                Upgrade your plan
              </Link>{" "}
              to continue.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Progress Bar */}
      <div className="w-full bg-secondary rounded-full h-3">
        <div
          className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-300"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>

      {/* Step 1: Choose Assistant Type */}
      {step === 1 && (
        <div className="space-y-6">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-xl">Choose Assistant Type</CardTitle>
              <CardDescription className="text-base">
                Select the type of AI assistant you want to create
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                {assistantTypes.map((type) => (
                  <Card
                    key={type.id}
                    className={`cursor-pointer transition-all hover:border-primary/50 border-2 ${
                      formData.type === type.id ? "border-primary bg-primary/5" : ""
                    }`}
                    onClick={() => setFormData({ ...formData, type: type.id })}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">{type.title}</CardTitle>
                      </div>
                      <CardDescription>{type.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {type.features.map((feature, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 2: Configure Assistant */}
      {step === 2 && (
        <div className="space-y-6">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-xl">Configure Your Assistant</CardTitle>
              <CardDescription className="text-base">
                Set up the basic information and behavior for your assistant
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Assistant Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Sales Helper, Feedback Bot"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Custom Instructions</Label>
                <Textarea
                  id="instructions"
                  placeholder="Provide specific instructions for how your assistant should behave, what information it should collect, and how it should respond to users..."
                  className="min-h-[120px]"
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                />
                <p className="text-sm text-muted-foreground">
                  Be specific about the assistant's role, tone, and objectives. (~
                  {Math.ceil(formData.instructions.length / 4)} tokens)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="welcome">Welcome Message</Label>
                <Textarea
                  id="welcome"
                  placeholder="Hi! I'm here to help you with..."
                  value={formData.welcomeMessage}
                  onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value })}
                />
                <p className="text-sm text-muted-foreground">
                  (~{Math.ceil(formData.welcomeMessage.length / 4)} tokens)
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Response Tone</Label>
                  <RadioGroup
                    value={formData.behavior.tone}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        behavior: { ...formData.behavior, tone: value },
                      })
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="professional" id="professional" />
                      <Label htmlFor="professional">Professional</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="friendly" id="friendly" />
                      <Label htmlFor="friendly">Friendly</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="casual" id="casual" />
                      <Label htmlFor="casual">Casual</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Response Length</Label>
                  <RadioGroup
                    value={formData.behavior.responseLength}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        behavior: { ...formData.behavior, responseLength: value },
                      })
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="short" id="short" />
                      <Label htmlFor="short">Short & Concise</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="medium" id="medium" />
                      <Label htmlFor="medium">Medium</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="detailed" id="detailed" />
                      <Label htmlFor="detailed">Detailed</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              {/* Token Estimate */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <p className="text-blue-800">
                    💡 Estimated cost: <strong>{estimatedTokens} tokens</strong> (100 base + {estimatedTokens - 100} for
                    instructions)
                  </p>
                  <p className="text-sm text-blue-600 mt-1">You have {userTokens?.tokens || 0} tokens available</p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 3: Delivery Method */}
      {step === 3 && (
        <div className="space-y-6">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-xl">Choose Delivery Method</CardTitle>
              <CardDescription className="text-base">How do you want to deploy your assistant?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {deliveryMethods.map((method) => (
                  <Card
                    key={method.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      formData.deliveryMethod === method.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setFormData({ ...formData, deliveryMethod: method.id })}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <method.icon className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">{method.title}</CardTitle>
                      </div>
                      <CardDescription>{method.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {method.features.map((feature, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 4: Review & Create */}
      {step === 4 && (
        <div className="space-y-6">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-xl">Review Your Assistant</CardTitle>
              <CardDescription className="text-base">
                Review the configuration before creating your assistant
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p className="text-sm text-muted-foreground">{formData.name || "Not specified"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <p className="text-sm text-muted-foreground capitalize">{formData.type || "Not selected"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Delivery Method</Label>
                  <p className="text-sm text-muted-foreground">
                    {formData.deliveryMethod === "widget"
                      ? "Web Widget"
                      : formData.deliveryMethod === "link"
                        ? "Shareable Link"
                        : "Not selected"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Tone</Label>
                  <p className="text-sm text-muted-foreground capitalize">{formData.behavior.tone}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Instructions</Label>
                <p className="text-sm text-muted-foreground">{formData.instructions || "No instructions provided"}</p>
              </div>

              <div>
                <Label className="text-sm font-medium">Welcome Message</Label>
                <p className="text-sm text-muted-foreground">{formData.welcomeMessage || "No welcome message set"}</p>
              </div>

              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-6">
                  <p className="text-green-800">
                    ✅ Total cost: <strong>{estimatedTokens} tokens</strong>
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    Remaining after creation: {(userTokens?.tokens || 0) - estimatedTokens} tokens
                  </p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handlePrevious} disabled={step === 1}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        {step < 4 ? (
          <Button
            onClick={handleNext}
            disabled={
              (step === 1 && !formData.type) ||
              (step === 2 && (!formData.name || !formData.instructions)) ||
              (step === 3 && !formData.deliveryMethod)
            }
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={createAssistant.isPending || !userTokens || userTokens.tokens < estimatedTokens}
          >
            {createAssistant.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Assistant"
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
