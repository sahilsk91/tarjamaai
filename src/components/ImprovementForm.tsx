"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { submitTranslationImprovement } from "@/app/actions";
import type { ImprovementFeedback } from "@/lib/types";
import { Loader2, Send, Lightbulb } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

const improvementFormSchema = z.object({
  arabicText: z.string().min(5, { message: "Arabic text must be at least 5 characters." }),
  initialTranslation: z.string().min(5, { message: "Initial translation must be at least 5 characters." }),
  correctedTranslation: z.string().min(5, { message: "Corrected translation must be at least 5 characters." }),
});

type ImprovementFormValues = z.infer<typeof improvementFormSchema>;

export function ImprovementForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<ImprovementFeedback | null>(null);

  const form = useForm<ImprovementFormValues>({
    resolver: zodResolver(improvementFormSchema),
    defaultValues: {
      arabicText: "",
      initialTranslation: "",
      correctedTranslation: "",
    },
  });

  async function onSubmit(data: ImprovementFormValues) {
    setIsLoading(true);
    setFeedback(null);
    try {
      const result = await submitTranslationImprovement(data);
      setFeedback(result);
      toast({
        title: "Feedback Submitted",
        description: "Thank you for helping us improve!",
      });
      form.reset(); // Optionally reset form
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: (error as Error).message || "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Translation Improvement Tool</CardTitle>
        <CardDescription className="text-center">
          Help us enhance our AI by providing corrected translations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="arabicText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Original Arabic Text</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter the original Arabic text here..."
                      className="min-h-[100px] text-base"
                      dir="rtl"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The Arabic text as it appeared in the source.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="initialTranslation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Initial English Translation (AI's Output)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter the initial English translation provided by our AI..."
                      className="min-h-[100px] text-base"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The translation our system initially provided.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="correctedTranslation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Your Corrected English Translation</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter your improved English translation here..."
                      className="min-h-[100px] text-base"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Your more accurate or natural-sounding translation.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="w-full text-lg py-6" size="lg">
              {isLoading ? (
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              ) : (
                <Send className="mr-2 h-6 w-6" />
              )}
              {isLoading ? "Submitting..." : "Submit Improvement"}
            </Button>
          </form>
        </Form>

        {feedback && (
          <Card className="mt-8 bg-accent/10 border-accent">
            <CardHeader className="flex flex-row items-center gap-3">
              <Lightbulb className="w-6 h-6 text-accent" />
              <CardTitle className="text-accent">AI Feedback Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-accent-foreground/90 whitespace-pre-wrap">{feedback.feedback}</p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
