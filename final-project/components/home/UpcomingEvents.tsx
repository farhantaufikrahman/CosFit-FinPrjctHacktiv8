"use client";

import { Sparkles, ArrowRight } from "lucide-react";
import type { GetOurEvent } from "@/app/types";
import Link from "next/link";

export interface UpcomingEventsProps {
  title?: string;
  viewAllLabel?: string;
  events?: GetOurEvent[];
  joinLabel?: string;
  onViewAll?: () => void;
  onSelectEvent?: (eventId: string) => void;
}


function EventCard({
  event,
  joinLabel,
  onSelect,
}: {
  event: GetOurEvent;
  joinLabel: string;
  onSelect?: (eventId: string) => void;
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="aspect-video w-full overflow-hidden bg-cream/30">
        {event.imgUrl ? (
          <img
            src={event.imgUrl}
            alt={event.eventName || "Event"}
            className="h-full w-full object-cover object-top"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-base text-muted">
            Event image
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted">
          {event.category || "Category"}
        </p>
        <p className="text-xl font-semibold text-foreground">
          {event.eventName || "Event Name"}
        </p>
        <p className="line-clamp-2 text-base text-muted">
          {event.description || "Short description of this event."}
        </p>

        <div className="mt-auto pt-4">
          <Link href={`/events/${event.slug}`}>
            <button
              type="button"
              onClick={() => onSelect?.(event._id)}
              className="inline-flex w-fit items-center justify-center gap-2 rounded-xl border border-primary px-4 py-2.5 text-base font-medium text-primary transition hover:bg-cream/40"
            >
              {joinLabel}
              <ArrowRight className="h-5 w-5" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );

}

export default function UpcomingEvents({
  title = "Upcoming Events",
  viewAllLabel = "View All Events",
  events = [],
  joinLabel = "Event Detail",
  onViewAll,
  onSelectEvent,
}: UpcomingEventsProps) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-serif text-3xl font-semibold text-foreground">
          {title}
          <Sparkles className="h-5 w-5 text-accent" />
        </h2>
        <button
          type="button"
          onClick={onViewAll}
          className="text-base font-medium text-primary hover:text-secondary hover:underline"
        >
          {viewAllLabel} &rarr;
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {events.map((event) => (
          <EventCard
            key={event._id}
            event={event}
            joinLabel={joinLabel}
            onSelect={onSelectEvent}
          />
        ))}
      </div>
    </section>
  );
}
