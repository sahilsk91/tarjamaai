import Link from 'next/link';
import { Logo } from './Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Upload, Wand2 } from 'lucide-react';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Logo />
        <nav className="ml-10 hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link href="/upload" className="text-foreground/70 hover:text-foreground transition-colors">
            <Button variant="ghost" className="gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </Button>
          </Link>
          <Link href="/improve" className="text-foreground/70 hover:text-foreground transition-colors">
            <Button variant="ghost" className="gap-2">
              <Wand2 className="h-4 w-4" />
              Improve Translation
            </Button>
          </Link>
          {/* Future links:
          <Link href="/dashboard" className="text-foreground/70 hover:text-foreground transition-colors">
            Dashboard
          </Link>
          <Link href="/settings" className="text-foreground/70 hover:text-foreground transition-colors">
            Settings
          </Link>
          */}
        </nav>
        <div className="ml-auto flex items-center space-x-4">
          <ThemeToggle />
          {/* Future User Avatar/Login Button */}
        </div>
      </div>
    </header>
  );
}
