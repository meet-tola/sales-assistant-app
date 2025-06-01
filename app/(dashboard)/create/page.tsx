"use client"

import { useState } from "react"
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

  const stepTitles = ["Choose Type", "Configure", "Delivery Method", "Review & Create"]

  return (
    <div className="min-h-screen">
      <div>
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" className="mb-4 text-gray-600 hover:text-gray-900" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">Create AI Assistant</h1>
          <p className="text-gray-600">
            Step {step} of 4: {stepTitles[step - 1]}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            {stepTitles.map((title, index) => (
              <span key={index} className={`${step > index ? "text-gray-900" : ""}`}>
                {title}
              </span>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div
              className="bg-gray-900 h-1 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Token Warning */}
        {userTokens && userTokens.tokens < 100 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              You have {userTokens.tokens} tokens remaining. Creating an assistant requires at least 100 tokens.{" "}
              <Link href="/settings" className="underline font-medium">
                Upgrade your plan
              </Link>{" "}
              to continue.
            </p>
          </div>
        )}

        {/* Step Content */}
        <div className="mb-8">
          {/* Step 1: Choose Assistant Type */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-2">Choose Assistant Type</h2>
                <p className="text-gray-600 mb-6">Select the type of AI assistant you want to create</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {assistantTypes.map((type) => (
                  <div
                    key={type.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all hover:border-gray-400 ${
                      formData.type === type.id ? "border-gray-900 bg-gray-50" : "border-gray-200 bg-white"
                    }`}
                    onClick={() => setFormData({ ...formData, type: type.id })}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <type.icon className="h-5 w-5 text-gray-700" />
                      <h3 className="font-medium text-gray-900">{type.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{type.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {type.features.map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs bg-gray-100 text-gray-700 border-0">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Configure Assistant */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-2">Configure Your Assistant</h2>
                <p className="text-gray-600 mb-6">Set up the basic information and behavior</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-900">
                    Assistant Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g., Sales Helper, Feedback Bot"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="border-gray-200 focus:border-gray-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructions" className="text-sm font-medium text-gray-900">
                    Custom Instructions
                  </Label>
                  <Textarea
                    id="instructions"
                    placeholder="Provide specific instructions for how your assistant should behave, what information it should collect, and how it should respond to users..."
                    className="min-h-[120px] border-gray-200 focus:border-gray-400"
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  />
                  <p className="text-xs text-gray-500">
                    Be specific about the assistant's role, tone, and objectives. (~
                    {Math.ceil(formData.instructions.length / 4)} tokens)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="welcome" className="text-sm font-medium text-gray-900">
                    Welcome Message
                  </Label>
                  <Textarea
                    id="welcome"
                    placeholder="Hi! I'm here to help you with..."
                    value={formData.welcomeMessage}
                    onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value })}
                    className="border-gray-200 focus:border-gray-400"
                  />
                  <p className="text-xs text-gray-500">(~{Math.ceil(formData.welcomeMessage.length / 4)} tokens)</p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-900">Response Tone</Label>
                    <RadioGroup
                      value={formData.behavior.tone}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          behavior: { ...formData.behavior, tone: value },
                        })
                      }
                      className="space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="professional" id="professional" />
                        <Label htmlFor="professional" className="text-sm text-gray-700">
                          Professional
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="friendly" id="friendly" />
                        <Label htmlFor="friendly" className="text-sm text-gray-700">
                          Friendly
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="casual" id="casual" />
                        <Label htmlFor="casual" className="text-sm text-gray-700">
                          Casual
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-900">Response Length</Label>
                    <RadioGroup
                      value={formData.behavior.responseLength}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          behavior: { ...formData.behavior, responseLength: value },
                        })
                      }
                      className="space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="short" id="short" />
                        <Label htmlFor="short" className="text-sm text-gray-700">
                          Short & Concise
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="medium" id="medium" />
                        <Label htmlFor="medium" className="text-sm text-gray-700">
                          Medium
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="detailed" id="detailed" />
                        <Label htmlFor="detailed" className="text-sm text-gray-700">
                          Detailed
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                {/* Token Estimate */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Estimated cost: <span className="font-medium">{estimatedTokens} tokens</span> (100 base +{" "}
                    {estimatedTokens - 100} for instructions)
                  </p>
                  <p className="text-xs text-blue-600 mt-1">You have {userTokens?.tokens || 0} tokens available</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Delivery Method */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-2">Choose Delivery Method</h2>
                <p className="text-gray-600 mb-6">How do you want to deploy your assistant?</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {deliveryMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all hover:border-gray-400 ${
                      formData.deliveryMethod === method.id ? "border-gray-900 bg-gray-50" : "border-gray-200 bg-white"
                    }`}
                    onClick={() => setFormData({ ...formData, deliveryMethod: method.id })}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <method.icon className="h-5 w-5 text-gray-700" />
                      <h3 className="font-medium text-gray-900">{method.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{method.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {method.features.map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs bg-gray-100 text-gray-700 border-0">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Review & Create */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-2">Review Your Assistant</h2>
                <p className="text-gray-600 mb-6">Review the configuration before creating your assistant</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="text-sm font-medium text-gray-900">Name</Label>
                    <p className="text-sm text-gray-600 mt-1">{formData.name || "Not specified"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-900">Type</Label>
                    <p className="text-sm text-gray-600 mt-1 capitalize">{formData.type || "Not selected"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-900">Delivery Method</Label>
                    <p className="text-sm text-gray-600 mt-1">
                      {formData.deliveryMethod === "widget"
                        ? "Web Widget"
                        : formData.deliveryMethod === "link"
                          ? "Shareable Link"
                          : "Not selected"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-900">Tone</Label>
                    <p className="text-sm text-gray-600 mt-1 capitalize">{formData.behavior.tone}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-900">Instructions</Label>
                  <p className="text-sm text-gray-600 mt-1">{formData.instructions || "No instructions provided"}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-900">Welcome Message</Label>
                  <p className="text-sm text-gray-600 mt-1">{formData.welcomeMessage || "No welcome message set"}</p>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    Total cost: <span className="font-medium">{estimatedTokens} tokens</span>
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Remaining after creation: {(userTokens?.tokens || 0) - estimatedTokens} tokens
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={step === 1}
            className="border-gray-200 text-gray-700 hover:bg-gray-50"
          >
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
              className="bg-gray-900 hover:bg-gray-800 text-white"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={createAssistant.isPending || !userTokens || userTokens.tokens < estimatedTokens}
              className="bg-gray-900 hover:bg-gray-800 text-white"
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
    </div>
  )
}
