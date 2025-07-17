import React from "react";
import Link from "next/link";
import type { PilatesVideo } from "@/types/pilates";
import { PlayCircle } from "lucide-react";
import Image from "next/image";

const PilatesVideoLibraryCard: React.FC<{ video: PilatesVideo }> = ({ video }) => (
  <Link
    href={`/dashboard/pilates-video/${video.id}`}
    className="block rounded-lg bg-[#f9f7f3] shadow p-0 overflow-hidden border border-[#ede7df] hover:shadow-lg transition"
  >
    <div className="relative aspect-video w-full bg-gray-100 flex items-center justify-center" style={{ maxHeight: 190 }}>
      {video.mux_playback_id ? (
        <Image
          src={`https://image.mux.com/${video.mux_playback_id}/thumbnail.png?width=600&height=338&fit_mode=smartcrop&time=35`}
          alt="class thumbnail"
          className="w-full h-full object-cover"
          width={200}
          height={150}
        />
      ) : (
        <span className="text-3xl text-gray-300">▶️</span>
      )}
      <span className="absolute inset-0 flex items-center justify-center">
        <PlayCircle className="w-10 h-10 text-white/80 drop-shadow-lg" />
      </span>
    </div>
    <div className="p-4">
      <div className="text-lg font-bold mb-1 line-clamp-2">{video.title}</div>
      <div className="flex gap-4 text-gray-700 text-sm mb-1">
        <span>{video.difficulty}</span>
        <span>{video.duration} min</span>
      </div>
      <div className="text-sm text-gray-600 line-clamp-3">{video.summary}</div>
    </div>
  </Link>
);

export default PilatesVideoLibraryCard; 