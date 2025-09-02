import React from "react";
import Link from "next/link";
import { Clock, Target, Play } from "lucide-react";

import type { PilatesVideo } from "@/types/pilates";
import Image from "next/image";

const PilatesVideoCard: React.FC<{ video: PilatesVideo, link?: string, height?: number }> = ({ video, link, height = 120 }) => (
  <Link
    href={link || `/dashboard/pilates-video/${video.id}`}
    className={`group flex h-[${height}px] cursor-pointer flex-row items-stretch gap-3 rounded-lg bg-white p-3 shadow transition hover:bg-gray-50 hover:shadow-lg lg:gap-4 lg:p-4 lg:h-auto lg:min-h-[140px] lg:hover:shadow-warm-lg`}
  >
    <div className="relative flex w-24 lg:w-32 flex-shrink-0 items-center justify-center overflow-hidden rounded bg-gray-100">
      {video.mux_playback_id ? (
        <>
          <Image
            src={`https://image.mux.com/${video.mux_playback_id}/thumbnail.png?width=384&height=256&fit_mode=smartcrop&time=${video.thumbnailTimestamp || 35}`}
            alt="class thumbnail"
            className="h-full w-full rounded object-cover transition group-hover:scale-105"
            width={100}
            height={100}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition group-hover:opacity-100">
            <Play className="h-6 w-6 lg:h-8 lg:w-8 text-white fill-current" />
          </div>
        </>
      ) : (
        <span className="text-2xl lg:text-3xl text-gray-300">▶️</span>
      )}
    </div>
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="mb-1 text-base lg:text-lg font-semibold group-hover:text-brand-brown transition-colors">
        {video.title}
      </div>
      <div className="mb-2 line-clamp-2 text-sm lg:text-base text-gray-500 lg:line-clamp-3">
        {video.summary}
      </div>
      <div className="mt-auto flex items-center gap-2 flex-wrap">
        <span className="rounded bg-brand-light-nude px-2 py-0.5 text-xs lg:text-sm flex items-center gap-1 lg:px-3 lg:py-1 text-brand-brown">
          <Clock className="h-3 w-3 lg:h-4 lg:w-4" />
          {video.duration} min
        </span>
        <span className="rounded bg-brand-cobalt/10 px-2 py-0.5 text-xs lg:text-sm flex items-center gap-1 lg:px-3 lg:py-1 text-brand-cobalt">
          <Target className="h-3 w-3 lg:h-4 lg:w-4" />
          {video.difficulty}
        </span>
      </div>
    </div>
  </Link>
);

export default PilatesVideoCard;
