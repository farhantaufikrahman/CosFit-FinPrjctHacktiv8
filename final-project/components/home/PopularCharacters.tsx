"use client";

import { Sparkles, ArrowRight } from "lucide-react";
import type { GetProduct } from "@/app/types";
import { useRouter } from "next/navigation";
import Link from "next/link";

export interface PopularCharactersProps {
  title?: string;
  viewAllLabel?: string;
  /** Products rendered as character cards (imgUrl -> photo, title -> name, theme -> series). */
  characters?: GetProduct[];
  tryOnLabel?: string;
  onViewAll?: () => void;
  onSelectCharacter?: (productId: string) => void;
  onTryOn?: (productId: string) => void;
}


function CharacterCard({
  character,
  tryOnLabel,
  onSelect,
  onTryOn,
}: {
  character: GetProduct;
  tryOnLabel: string;
  onSelect?: (productId: string) => void;
  onTryOn?: (productId: string) => void;
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface">
      <button
        type="button"
        onClick={() => onSelect?.(character._id)}
        className="aspect-[3/4] w-full overflow-hidden bg-cream/30 text-left"
      >
        {character.imgUrl ? (
          <img
            src={character.imgUrl}
            alt={character.title || "Character"}
            className="h-full w-full object-cover object-top"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-base text-muted">
            Character image
          </div>
        )}
      </button>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="text-lg font-semibold text-foreground">
            {character.title || "Character Name"}
          </p>
          <p className="text-base text-muted">{character.theme || "Series"}</p>
        </div>

        <div className="mt-auto pt-3">
          <Link href={`/try-on?productId=${character.slug}`}>
            <button
              type="button"
              onClick={() => onTryOn?.(character._id)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary px-4 py-2.5 text-base font-medium text-primary transition hover:bg-cream/40"
            >
              {tryOnLabel}
              <ArrowRight className="h-5 w-5" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PopularCharacters({
  title = "Popular Characters",
  viewAllLabel = "View All Characters",
  characters = [],
  tryOnLabel = "Try On",
  onViewAll,
  onSelectCharacter,
  onTryOn,
}: PopularCharactersProps) {
  const router = useRouter();
  const handleClickAll = () => {
    router.push("/marketplace");
  };
  return (
    <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-serif text-3xl font-semibold text-foreground">
          {title}
          <Sparkles className="h-5 w-5 text-accent" />
        </h2>
        <button
          type="button"
          onClick={handleClickAll}
          className="text-base font-medium text-primary hover:text-secondary hover:underline"
        >
          {viewAllLabel} &rarr;
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {characters.map((character) => (
          <CharacterCard
            key={character._id}
            character={character}
            tryOnLabel={tryOnLabel}
            onSelect={onSelectCharacter}
            onTryOn={onTryOn}
          />
        ))}
      </div>
    </section>
  );
}
