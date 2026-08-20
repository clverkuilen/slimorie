import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* Decorative gradient blobs. aria-hidden — purely visual, and
          .animate-blob-* freezes under prefers-reduced-motion. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="animate-blob-a absolute -top-24 -left-20 size-[28rem] rounded-full bg-palette-light-sea-green/25 blur-3xl" />
        <div className="animate-blob-b absolute top-10 -right-24 size-[26rem] rounded-full bg-palette-amber-glow/25 blur-3xl" />
        <div className="animate-blob-c absolute bottom-[-6rem] left-1/4 size-[24rem] rounded-full bg-palette-light-sea-green/20 blur-3xl" />
      </div>

      <div className="mx-auto max-w-3xl px-6 pt-16 pb-24 text-center md:pt-24 md:pb-32">
        <h1 className="font-heading text-4xl leading-tight font-bold tracking-tight text-balance sm:text-5xl md:text-6xl">
          Open the app.
          <br />
          Log food. <span className="text-primary">Get on with your day.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground text-balance">
          Slimorie is a fast, no-nonsense calorie and nutrition tracker. No ten-tap flows, no
          guessing where the data came from — just quick logging built around the foods you
          actually eat.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button render={<Link href="/signup" />} nativeButton={false} size="lg" className="w-full sm:w-auto">
            Get started free
            <ArrowRight className="size-4" />
          </Button>
          <Button
            render={<Link href="/login" />}
            nativeButton={false}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
          >
            Sign in
          </Button>
        </div>
      </div>
    </section>
  );
}
