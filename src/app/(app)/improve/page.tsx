import { ImprovementForm } from "@/components/ImprovementForm";

export default function ImprovePage() {
  return (
    <div className="space-y-8">
      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Improve Our Translations</h1>
        <p className="text-xl text-muted-foreground mt-2">
          Your feedback helps Tarjama learn and provide even better translations.
        </p>
      </section>
      <ImprovementForm />
    </div>
  );
}
