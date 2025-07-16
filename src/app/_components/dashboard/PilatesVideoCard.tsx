import React from "react";
import Link from "next/link";

import type { PilatesVideo } from "@/types/pilates";
import Image from "next/image";

const PilatesVideoCard: React.FC<{ video: PilatesVideo }> = ({ video }) => (
  <Link
    href={`/dashboard/pilates-video/${video.id}`}
    className="flex min-h-[80px] cursor-pointer flex-row items-stretch gap-3 rounded-lg bg-white p-3 shadow transition hover:bg-gray-50 hover:shadow-lg"
  >
    <div className="flex w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded bg-gray-100">
      {video.mux_playback_id ? (
        <Image
          src={`https://image.mux.com/${video.mux_playback_id}/thumbnail.png?width=384&height=256&fit_mode=smartcrop&time=35`}
          alt="class thumbnail"
          className="h-full w-full rounded object-cover"
          width={100}
          height={100}
        />
      ) : (
        <span className="text-2xl text-gray-300">▶️</span>
      )}
    </div>
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="mb-1 line-clamp-2 text-base font-semibold">
        {video.title}
      </div>
      <div className="mb-2 line-clamp-2 text-sm text-gray-500">
        {video.summary}
      </div>
      <div className="mt-auto flex items-center gap-2">
        <span className="rounded bg-gray-200 px-2 py-0.5 text-xs">
          {video.duration} min
        </span>
        <span className="rounded bg-gray-200 px-2 py-0.5 text-xs">
          {video.difficulty}
        </span>
      </div>
    </div>
  </Link>
);

export default PilatesVideoCard;
