"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth-store";

const loginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi girin"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    clearAuth();
  }, [clearAuth]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin@hukukofisi.com",
    },
  });

  const onSubmit = async (data: LoginForm) => {
    setError(null);
    try {
      const response = await authService.login(data);
      setAuth(response);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Giriş başarısız. Lütfen tekrar deneyin.");
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between bg-sidebar p-12 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20">
            <Scale className="h-6 w-6 text-accent" />
          </div>
          <div>
            <p className="text-lg font-semibold text-white">Hukuk FMS</p>
            <p className="text-sm text-sidebar-foreground">Dosya Yönetim Sistemi</p>
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-semibold leading-tight text-white">
            Hukuk ofisinizi
            <br />
            dijitalleştirin
          </h2>
          <p className="max-w-md text-sidebar-foreground">
            Müvekkil yönetimi, dava takibi, belge arşivi ve finans yönetimini tek platformda birleştirin.
          </p>
        </div>
        <p className="text-xs text-sidebar-foreground">© 2026 Hukuk FMS. Tüm hakları saklıdır.</p>
      </div>

      <div className="flex flex-1 items-center justify-center p-6">
        <Card className="w-full max-w-md border-0 shadow-card">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 lg:hidden">
              <Scale className="h-6 w-6 text-accent" />
            </div>
            <CardTitle className="text-xl">Hoş Geldiniz</CardTitle>
            <CardDescription>Hesabınıza giriş yapın</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  E-posta
                </label>
                <Input id="email" type="email" placeholder="ornek@hukukofisi.com" {...register("email")} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Şifre
                </label>
                <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>
              <Button type="submit" variant="accent" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Giriş yapılıyor..." : "Giriş Yap"}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Demo: admin@hukukofisi.com / Admin123!
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
