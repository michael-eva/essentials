import React from "react";
import PilatesVideoCard from "./PilatesVideoCard";
import type { PilatesVideo } from "@/types/pilates";

const PilatesVideoGrid: React.FC<{ videos: PilatesVideo[] }> = ({ videos }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
    {videos.map((video) => (
      <PilatesVideoCard key={video.id} video={video} />
    ))}
  </div>
);

export default PilatesVideoGrid; 