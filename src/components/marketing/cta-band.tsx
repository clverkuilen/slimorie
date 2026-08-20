import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CtaBand() {
  return (
    <section className="bg-palette-dark-walnut">
      <div className="mx-auto max-w-3xl px-6 py-16 text-center md:py-20">
        <h2 className="font-heading text-3xl font-bold tracking-tight text-palette-cornsilk text-balance md:text-4xl">
          Your next meal is one tap away
        </h2>
        <p className="mx-auto mt-3 max-w-md text-palette-cornsilk/80 text-balance">
          Create an account, set a goal, and start logging. It takes less time than reading this
          sentence twice.
        </p>
        <div className="mt-8">
          <Button
            render={<Link href="/signup" />}
            nativeButton={false}
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Get started free
          </Button>
        </div>
      </div>
    </section>
  );
}
