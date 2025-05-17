import { BookText } from 'lucide-react';
import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 group">
      <BookText className="h-7 w-7 text-primary group-hover:text-accent transition-colors" />
      <h1 className="text-2xl font-bold text-foreground group-hover:text-accent transition-colors">
        Tarjama
      </h1>
    </Link>
  );
}
