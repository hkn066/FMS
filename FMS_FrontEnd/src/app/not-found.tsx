import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-semibold">404</h1>
      <p className="text-muted-foreground">Aradığınız sayfa bulunamadı.</p>
      <Button asChild variant="accent">
        <Link href="/dashboard">Dashboard&apos;a Dön</Link>
      </Button>
    </div>
  );
}
