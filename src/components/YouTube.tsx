"use client";

import { useState } from "react";
import Image from "next/image";

/** Click-to-play facade: only the thumbnail loads until the visitor asks for the player. */
export default function YouTube({ id, title }: { id: string; title: string }) {
  const [on, setOn] = useState(false);

  return (
    <div className="relative aspect-video overflow-hidden bg-ink">
      {on ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <button type="button" onClick={() => setOn(true)} className="group absolute inset-0">
          <Image src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" fill unoptimized className="object-cover" />
          <span className="absolute bottom-4 left-4 bg-paper px-3 py-1.5 text-xs uppercase tracking-widest text-ink transition-colors duration-[var(--duration-fast)] group-hover:bg-red group-hover:text-paper group-focus-visible:bg-red group-focus-visible:text-paper">
            ▶ Play<span className="sr-only">: {title}</span>
          </span>
        </button>
      )}
    </div>
  );
}
