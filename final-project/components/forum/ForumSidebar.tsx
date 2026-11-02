"use client";

import Link from "next/link";
import {
  MessageCircle,
  UserRound,
  Bookmark,
  Heart,
  Clock3,
  LifeBuoy,
  Lightbulb,
  CalendarDays,
  Camera,
  Shirt,
  ChevronRight,
} from "lucide-react";

const menus = [
  {
    title: "All Discussions",
    icon: MessageCircle,
    href: "/forum",
    active: true,
  },
  {
    title: "My Discussions",
    icon: UserRound,
    href: "/forum/my",
    badge: 3,
  },
  {
    title: "Saved Posts",
    icon: Bookmark,
    href: "/forum/saved",
  },
  {
    title: "Following",
    icon: Heart,
    href: "/forum/following",
  },
  {
    title: "Recent Activity",
    icon: Clock3,
    href: "/forum/activity",
  },
];

const categories = [
  {
    title: "Help",
    posts: "1.2k",
    color: "#E85D5D",
    icon: LifeBuoy,
  },
  {
    title: "Cosplay Tips",
    posts: "2.4k",
    color: "#F6A623",
    icon: Lightbulb,
  },
  {
    title: "Events",
    posts: "1.1k",
    color: "#8B5CF6",
    icon: CalendarDays,
  },
  {
    title: "Photography",
    posts: "1.8k",
    color: "#38BDF8",
    icon: Camera,
  },
  {
    title: "Costume Discussion",
    posts: "2.7k",
    color: "#EC4899",
    icon: Shirt,
  },
];

export default function ForumSidebar() {
  return (
    <aside className="sticky top-6 space-y-6">
      {/* Menu */}

      {/* Categories */}

      <section className="card p-6">
        <p className="mb-5 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
          Categories
        </p>

        <div className="space-y-3">
          {categories.map((category) => {
            const Icon = category.icon;

            return (
              <button
                key={category.title}
                className="group flex w-full items-center justify-between rounded-2xl px-3 py-3 transition hover:bg-[#FCFBFA]"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{
                      background: `${category.color}15`,
                      color: category.color,
                    }}
                  >
                    <Icon size={18} />
                  </div>

                  <div className="text-left">
                    <h4 className="font-medium">{category.title}</h4>

                    <p className="text-xs text-[var(--muted)]">
                      {category.posts} posts
                    </p>
                  </div>
                </div>

                <ChevronRight
                  size={18}
                  className="opacity-0 transition group-hover:opacity-100"
                />
              </button>
            );
          })}
        </div>

        <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--border)] py-3 font-medium transition hover:border-[var(--primary)] hover:text-[var(--primary)]">
          View All Categories
          <ChevronRight size={17} />
        </button>
      </section>
    </aside>
  );
}
