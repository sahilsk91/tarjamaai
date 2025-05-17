import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Languages, Lightbulb, Share2, FolderArchive, Settings2, UploadCloud } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  const features = [
    { icon: <UploadCloud className="w-8 h-8 text-accent" />, title: "Bulk Upload", description: "Upload multiple screenshots of Arabic text pages with ease." },
    { icon: <FileText className="w-8 h-8 text-accent" />, title: "Arabic OCR", description: "Extract Arabic text accurately from your images using advanced OCR." },
    { icon: <Languages className="w-8 h-8 text-accent" />, title: "Natural Translation", description: "Get contextually relevant English translations, including Duas." },
    { icon: <Lightbulb className="w-8 h-8 text-accent" />, title: "Improve Translations", description: "Help refine translations with our AI-powered improvement tool." },
    // { icon: <FolderArchive className="w-8 h-8 text-accent" />, title: "Organize & Save", description: "Save your translations and organize them into folders." },
    // { icon: <Share2 className="w-8 h-8 text-accent" />, title: "Share Easily", description: "Share translations via social media or email effortlessly." },
    // { icon: <Settings2 className="w-8 h-8 text-accent" />, title: "Customize View", description: "Adjust font sizes and themes for optimal readability." },
  ];

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-12 py-8">
      <section className="space-y-6">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary animate-in fade-in slide-in-from-bottom-8 duration-700">
          Unlock Arabic Texts with Tarjama
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          Effortlessly translate Arabic text from images. Upload your screenshots and let our AI-powered OCR and translation tools do the rest.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in zoom-in-90 duration-700 delay-400">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-transform hover:scale-105">
            <Link href="/upload">
              <UploadCloud className="mr-2 h-5 w-5" /> Start Translating
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="shadow-lg transition-transform hover:scale-105">
            <Link href="#features">
              Learn More
            </Link>
          </Button>
        </div>
      </section>
      
      <section className="w-full max-w-5xl relative animate-in fade-in zoom-in-95 duration-700 delay-500">
          <Image 
            src="https://placehold.co/1200x600.png" 
            alt="Tarjama App Screenshot"
            data-ai-hint="app user interface" 
            width={1200} 
            height={600} 
            className="rounded-xl shadow-2xl border"
          />
      </section>

      <section id="features" className="w-full max-w-5xl space-y-8 pt-16">
        <div className="text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h2 className="text-3xl font-bold tracking-tight">Powerful Features, Simple Interface</h2>
          <p className="text-muted-foreground mt-2">Everything you need to bridge the language gap.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div key={feature.title} className="animate-in fade-in slide-in-from-bottom-10 duration-500" style={{animationDelay: `${100 + index * 150}ms`}}>
              <Card className="bg-card/50 hover:shadow-lg transition-shadow duration-300 h-full">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  {feature.icon}
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
