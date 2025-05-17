
"use client";

import type { TranslationResult } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Copy, Check, ZoomIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import React, { useState, useEffect, useRef } from "react";

interface SideBySideDisplayProps {
  result: TranslationResult;
}

export function SideBySideDisplay({ result }: SideBySideDisplayProps) {
  const { toast } = useToast();
  const [editedTranslation, setEditedTranslation] = useState(result.englishTranslation);
  const [copiedArabic, setCopiedArabic] = useState(false);
  const [copiedEnglish, setCopiedEnglish] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditedTranslation(result.englishTranslation);
  }, [result.englishTranslation]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"; // Reset height to shrink if text is deleted
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [editedTranslation]);

  const handleCopyToClipboard = async (textToCopy: string, type: "arabic" | "english") => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      toast({
        title: `${type === "arabic" ? "Arabic" : "English"} Text Copied!`,
        description: "The text has been copied to your clipboard.",
      });
      if (type === "arabic") {
        setCopiedArabic(true);
        setTimeout(() => setCopiedArabic(false), 2000);
      } else {
        setCopiedEnglish(true);
        setTimeout(() => setCopiedEnglish(false), 2000);
      }
    } catch (err) {
      console.error("Failed to copy text: ", err);
      toast({
        title: "Copy Failed",
        description: "Could not copy text to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl text-center">
          Translation Result {result.filename ? `for ${result.filename}` : ""}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {result.imageDataUri && (
          <div className="mb-4 p-2 border rounded-md bg-muted/20 flex justify-center animate-in fade-in zoom-in-95 duration-500 relative">
            <Dialog>
              <DialogTrigger asChild>
                <div className="relative cursor-pointer group">
                  <Image
                    src={result.imageDataUri}
                    alt={result.filename || "Uploaded image"}
                    width={400}
                    height={300}
                    className="rounded-md object-contain max-h-[300px]"
                    data-ai-hint="document scan"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md">
                    <ZoomIn className="h-12 w-12 text-white" />
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-3xl p-2 sm:max-w-xl md:max-w-2xl lg:max-w-4xl">
                <Image
                  src={result.imageDataUri}
                  alt={`${result.filename || "Uploaded image"} - Zoomed`}
                  width={1200}
                  height={900}
                  className="rounded-md object-contain w-full h-auto max-h-[85vh]"
                />
              </DialogContent>
            </Dialog>
          </div>
        )}
        {result.isDua && (
          <div className="p-3 bg-accent/10 text-accent-foreground rounded-md border border-accent animate-in fade-in duration-500 delay-100">
            <p className="font-semibold text-center">This text appears to be a Dua or Quranic Ayah.</p>
          </div>
        )}
        <div className="flex flex-col gap-8">
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 delay-200 space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-primary">Original Arabic Text</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleCopyToClipboard(result.arabicText, "arabic")}
                aria-label="Copy Arabic text"
                className="text-muted-foreground hover:text-primary"
              >
                {copiedArabic ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
              </Button>
            </div>
            <Separator />
            <div dir="rtl" lang="ar" className="p-4 bg-muted/30 rounded-md min-h-[150px] text-lg leading-relaxed whitespace-pre-wrap overflow-auto">
              {result.arabicText || "No Arabic text extracted."}
            </div>
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 delay-300 space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-primary">English Translation</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleCopyToClipboard(editedTranslation, "english")}
                aria-label="Copy English translation"
                className="text-muted-foreground hover:text-primary"
              >
                {copiedEnglish ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
              </Button>
            </div>
            <Separator />
            <Textarea
              ref={textareaRef}
              lang="en"
              value={editedTranslation}
              onChange={(e) => setEditedTranslation(e.target.value)}
              placeholder="English translation will appear here..."
              className="p-4 bg-muted/30 rounded-md min-h-[150px] text-xl leading-loose whitespace-pre-wrap focus:ring-accent focus:border-accent overflow-y-hidden resize-none"
              rows={1} 
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
