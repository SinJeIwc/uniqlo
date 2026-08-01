import { ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { LoginForm } from "@/components/admin/login/LoginForm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function AdminLoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,oklch(0.97_0_0),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,oklch(0.97_0_0),transparent_40%)]" />

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(0.922_0_0)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.922_0_0)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      {/* Back to home button */}
      <Link href="/" className="absolute top-6 left-6 z-10">
        <Button variant="outline" size="sm" className="gap-2">
          <ArrowLeft className="size-4" />
          На главную
        </Button>
      </Link>

      {/* Login card */}
      <Card className="relative z-10 w-full max-w-md border shadow-lg">
        <CardHeader className="text-center space-y-2">
          {/* Logo/Brand */}
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <ShieldCheck className="size-7" />
          </div>

          <div className="space-y-1 pt-2">
            <CardTitle className="text-2xl font-bold tracking-tight">
              UNIQLO Kyrgyzstan
            </CardTitle>
            <CardDescription className="text-base">
              Админ панель
            </CardDescription>
          </div>
        </CardHeader>

        <Separator className="mb-6" />

        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>

      {/* Footer text */}
      <div className="absolute bottom-6 left-0 right-0 text-center">
        <p className="text-sm text-muted-foreground">
          © 2026 UNIQLO Kyrgyzstan. Все права защищены.
        </p>
      </div>
    </div>
  );
}
