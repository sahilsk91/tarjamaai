import { FileUploadForm } from "@/components/FileUploadForm";

export default function UploadPage() {
  return (
    <div className="space-y-8">
      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Upload & Translate</h1>
        <p className="text-xl text-muted-foreground mt-2">
          Transform Arabic text from your images into English effortlessly.
        </p>
      </section>
      <FileUploadForm />
    </div>
  );
}
