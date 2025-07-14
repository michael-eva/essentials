import React from "react";
import type { PilatesVideo } from "@/types/pilates";

const PilatesVideoCard: React.FC<{ video: PilatesVideo }> = ({ video }) => (
  <a
    key={video.id}
    href={video.videoUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="rounded-lg bg-white shadow hover:shadow-lg transition p-3 flex flex-col items-start"
  >
    <div className="w-full aspect-video bg-gray-100 rounded mb-2 flex items-center justify-center overflow-hidden">
      {video.mux_playback_id ? (
        <img
          src={`https://image.mux.com/${video.mux_playback_id}/thumbnail.png?width=384&height=216&fit_mode=smartcrop&time=35`}
          alt="class thumbnail"
          className="w-full h-full object-cover rounded-md"
        />
      ) : (
        <span className="text-5xl text-gray-300">▶️</span>
      )}
    </div>
    <div className="font-semibold text-lg mb-1 line-clamp-2">{video.title}</div>
    <div className="text-sm text-gray-500 mb-2 line-clamp-2">{video.summary}</div>
    <div className="flex items-center gap-2 mt-auto">
      <span className="text-xs bg-gray-200 rounded px-2 py-0.5">{video.duration} min</span>
      <span className="text-xs bg-gray-200 rounded px-2 py-0.5">{video.difficulty}</span>
    </div>
  </a>
);

export default PilatesVideoCard; 