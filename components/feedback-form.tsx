"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { X, Send } from "lucide-react"

interface FeedbackFormProps {
  onClose: () => void
}

export function FeedbackForm({ onClose }: FeedbackFormProps) {
  const [rating, setRating] = useState("")
  const [feedback, setFeedback] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate submission
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setSubmitted(true)
    setTimeout(() => {
      onClose()
    }, 2000)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md backdrop-blur-sm bg-white/10 border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Feedback</CardTitle>
              <CardDescription className="text-white/70">Help us improve your experience</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/10"
              aria-label="Close feedback form"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="text-center py-8">
              <div className="text-green-400 text-4xl mb-4">✓</div>
              <h3 className="text-white text-lg font-medium mb-2">Thank you!</h3>
              <p className="text-white/70">Your feedback has been submitted.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-white">How would you rate your experience?</Label>
                <RadioGroup value={rating} onValueChange={setRating} className="mt-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="excellent" id="excellent" />
                    <Label htmlFor="excellent" className="text-white/80">
                      Excellent
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="good" id="good" />
                    <Label htmlFor="good" className="text-white/80">
                      Good
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fair" id="fair" />
                    <Label htmlFor="fair" className="text-white/80">
                      Fair
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="poor" id="poor" />
                    <Label htmlFor="poor" className="text-white/80">
                      Poor
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="feedback" className="text-white">
                  Additional Comments (Optional)
                </Label>
                <Textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Tell us about your experience or suggest improvements..."
                  className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  rows={4}
                />
              </div>

              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 border-white/30 text-white hover:bg-white/10 bg-transparent"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!rating || isSubmitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
