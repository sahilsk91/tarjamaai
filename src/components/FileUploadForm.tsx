
"use client";

import type { TranslationResult } from "@/lib/types";
import { processImageForTranslation } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UploadCloud, XCircle, FileTextIcon } from "lucide-react";
import Image from "next/image";
import React, { useState, useRef } from "react";
import { SideBySideDisplay } from "./SideBySideDisplay";
import { ScrollArea } from "./ui/scroll-area";
import { Card, CardContent } from "./ui/card";

interface FilePreview {
  id: string;
  name: string;
  dataUri: string;
  file: File;
}

// Helper function to convert ArrayBuffer to base64
function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export function FileUploadForm() {
  const [filePreviews, setFilePreviews] = useState<FilePreview[]>([]);
  const [translationResults, setTranslationResults] = useState<TranslationResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newPreviews: FilePreview[] = [];
      Array.from(files).forEach((file, index) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push({
            id: `${file.name}-${Date.now()}-${index}`,
            name: file.name,
            dataUri: reader.result as string,
            file,
          });
          if (newPreviews.length === files.length) {
            setFilePreviews(prev => {
              const existingNames = new Set(prev.map(p => p.name));
              const trulyNewPreviews = newPreviews.filter(np => !existingNames.has(np.name));
              return [...prev, ...trulyNewPreviews];
            });
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeFilePreview = (id: string) => {
    setFilePreviews(prev => prev.filter(fp => fp.id !== id));
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (filePreviews.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select one or more images to translate.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setTranslationResults([]); 

    const results: TranslationResult[] = [];
    for (const preview of filePreviews) {
      try {
        const result = await processImageForTranslation({ photoDataUri: preview.dataUri });
        results.push({
          ...result,
          id: preview.id,
          filename: preview.name,
          imageDataUri: preview.dataUri,
        });
      } catch (error) {
        console.error("Error processing file:", preview.name, error);
        toast({
          title: `Error processing ${preview.name}`,
          description: (error as Error).message || "An unknown error occurred.",
          variant: "destructive",
        });
        results.push({
          id: preview.id,
          filename: preview.name,
          imageDataUri: preview.dataUri,
          arabicText: "Error during processing.",
          englishTranslation: "Could not translate this image.",
          isDua: false,
        });
      }
    }
    setTranslationResults(results);
    setIsProcessing(false);
    if(results.length > 0 && !results.some(r => r.arabicText === "Error during processing.")) {
        toast({
            title: "Processing Complete",
            description: `${results.length} image(s) processed.`,
        });
    }
    // Clear file previews and reset input after processing
    setFilePreviews([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const loadFont = async (fontPath: string, fontNameInVFS: string, fontAlias: string, fontWeight: string, jsPDFInstance: any) => {
    try {
      const response = await fetch(fontPath);
      if (!response.ok) {
        throw new Error(`Failed to fetch font: ${fontPath} - ${response.statusText}`);
      }
      const fontBuffer = await response.arrayBuffer();
      const fontBase64 = arrayBufferToBase64(fontBuffer);
      jsPDFInstance.addFileToVFS(fontNameInVFS, fontBase64);
      jsPDFInstance.addFont(fontNameInVFS, fontAlias, fontWeight);
      return true;
    } catch (error) {
      console.error(`Error loading font ${fontPath}:`, error);
      toast({
        title: `Font Load Error: ${fontAlias} ${fontWeight}`,
        description: `Failed to load font from public path '${fontPath}'. Please ensure the font file (e.g., '${fontNameInVFS}') exists in your 'public/fonts/' directory. PDF formatting may be impacted.`,
        variant: "destructive",
      });
      return false;
    }
  };


  const handleDownloadTranslationsPdf = async () => {
    if (translationResults.length === 0) {
      toast({
        title: "No translations to export",
        description: "Please process some images first.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingPdf(true);
    const { default: jsPDF } = await import('jspdf');

    try {
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });

      await loadFont('/fonts/Tajawal-Regular.ttf', 'Tajawal-Regular.ttf', 'Tajawal', 'normal', doc);
      await loadFont('/fonts/Tajawal-Bold.ttf', 'Tajawal-Bold.ttf', 'Tajawal', 'bold', doc);
      await loadFont('/fonts/Inter-Regular.ttf', 'Inter-Regular.ttf', 'Inter', 'normal', doc);
      await loadFont('/fonts/Inter-Bold.ttf', 'Inter-Bold.ttf', 'Inter', 'bold', doc);
      
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      const maxLineWidth = pageWidth - 2 * margin;
      let currentY = margin;
      const lineHeight = 7; 
      const titleFontSize = 14;
      const textFontSize = 12;

      doc.setFont("Inter", "normal");
      doc.setFontSize(textFontSize);

      for (let i = 0; i < translationResults.length; i++) {
        const result = translationResults[i];

        if (i > 0) { 
          currentY += lineHeight * 2; 
          if (currentY > doc.internal.pageSize.getHeight() - margin * 2) {
            doc.addPage();
            currentY = margin;
          }
        }
        
        if (result.filename) {
          doc.setFont("Inter", "bold");
          doc.setFontSize(titleFontSize);
          const filenameTitle = `Translation for: ${result.filename}`;
          const filenameLines = doc.splitTextToSize(filenameTitle, maxLineWidth);
          if (currentY + (filenameLines.length * lineHeight) > doc.internal.pageSize.getHeight() - margin) {
            doc.addPage();
            currentY = margin;
          }
          doc.text(filenameLines, margin, currentY);
          currentY += (filenameLines.length * lineHeight) + (lineHeight / 2);
          doc.setFontSize(textFontSize);
          doc.setFont("Inter", "normal");
        }

        if (currentY + 2 > doc.internal.pageSize.getHeight() - margin) {
            doc.addPage();
            currentY = margin;
        }
        doc.setLineWidth(0.5);
        doc.line(margin, currentY, pageWidth - margin, currentY);
        currentY += lineHeight;

        if (result.isDua && result.englishTranslation.includes('\n\n')) {
          const parts = result.englishTranslation.split('\n\n');
          const arabicPart = parts[0];
          const englishPart = parts.slice(1).join('\n\n');

          doc.setFont("Tajawal", "normal"); 
          doc.setFontSize(textFontSize); 
          const arabicLines = doc.splitTextToSize(arabicPart, maxLineWidth);
          arabicLines.forEach((line: string) => {
            if (currentY > doc.internal.pageSize.getHeight() - margin - lineHeight) {
              doc.addPage();
              currentY = margin;
            }
            doc.text(line, pageWidth - margin, currentY, { lang: 'ar', align: 'right' });
            currentY += lineHeight;
          });
          currentY += lineHeight / 2; 

          doc.setFont("Inter", "normal");
          doc.setFontSize(textFontSize); 
          const englishLines = doc.splitTextToSize(englishPart, maxLineWidth);
          englishLines.forEach((line: string) => {
            if (currentY > doc.internal.pageSize.getHeight() - margin - lineHeight) {
              doc.addPage();
              currentY = margin;
            }
            doc.text(line, margin, currentY);
            currentY += lineHeight;
          });

        } else {
          doc.setFont("Inter", "normal");
          doc.setFontSize(textFontSize); 
          const textLines = doc.splitTextToSize(result.englishTranslation, maxLineWidth);
          textLines.forEach((line: string) => {
            if (currentY > doc.internal.pageSize.getHeight() - margin - lineHeight) {
              doc.addPage();
              currentY = margin;
            }
            doc.text(line, margin, currentY);
            currentY += lineHeight;
          });
        }
      }
      doc.save('tarjama-translations.pdf');
      toast({
        title: "Translations PDF Generated",
        description: "Your PDF has been downloaded.",
      });
    } catch (error) {
      console.error("Error generating translations PDF:", error);
      toast({
        title: "PDF Generation Failed",
        description: (error as Error).message || "An unknown error occurred. Ensure font files are in public/fonts/.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };


  return (
    <div className="space-y-8">
      <Card className="shadow-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="file-upload" className="text-lg font-medium">Upload Screenshots</Label>
              <p className="text-sm text-muted-foreground">Select one or more images containing Arabic text.</p>
            </div>
            <Input
              id="file-upload"
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
          </div>

          {filePreviews.length > 0 && (
            <div className="mt-6 space-y-4">
              <h3 className="text-md font-medium">Selected Files ({filePreviews.length}):</h3>
              <ScrollArea className="h-48 w-full rounded-md border p-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-2">
                  {filePreviews.map((preview, index) => (
                    <div 
                      key={preview.id} 
                      className="relative group border rounded-md p-1 aspect-square flex items-center justify-center bg-muted/20 animate-in fade-in zoom-in-95 duration-300"
                      style={{animationDelay: `${index * 50}ms`}}
                    >
                       <Image
                        src={preview.dataUri}
                        alt={preview.name}
                        width={100}
                        height={100}
                        className="object-contain rounded max-h-full max-w-full"
                        data-ai-hint="document text"
                      />
                      <button
                        onClick={() => removeFilePreview(preview.id)}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Remove file"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                       <p className="absolute bottom-1 left-1 right-1 text-xs bg-black/50 text-white p-0.5 rounded-sm truncate text-center">
                        {preview.name}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
          
          <div className="mt-6 space-y-2">
            <Button
              onClick={handleSubmit}
              disabled={isProcessing || filePreviews.length === 0 || isGeneratingPdf}
              className="w-full text-lg py-6"
              size="lg"
            >
              {isProcessing ? (
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              ) : (
                <UploadCloud className="mr-2 h-6 w-6" />
              )}
              {isProcessing ? "Processing..." : `Translate ${filePreviews.length > 0 ? filePreviews.length : ''} File(s)`}
            </Button>

            <Button
              onClick={handleDownloadTranslationsPdf}
              disabled={isGeneratingPdf || translationResults.length === 0 || isProcessing}
              className="w-full text-lg py-6"
              variant="outline"
              size="lg"
            >
              {isGeneratingPdf ? (
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              ) : (
                <FileTextIcon className="mr-2 h-6 w-6" />
              )}
              {isGeneratingPdf ? "Generating PDF..." : `Download ${translationResults.length > 0 ? translationResults.length : ''} Translation(s) as PDF`}
            </Button>
          </div>

        </CardContent>
      </Card>

      {translationResults.length > 0 && (
        <div className="mt-12 space-y-8">
          <h2 className="text-3xl font-bold text-center animate-in fade-in slide-in-from-bottom-4 duration-500">Translation Results</h2>
          {translationResults.map((result, index) => (
            <div key={result.id} className="animate-in fade-in slide-in-from-bottom-8 duration-500" style={{animationDelay: `${index * 150}ms`}}>
                <SideBySideDisplay result={result} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

