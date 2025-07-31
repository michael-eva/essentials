import React from "react";
import type { PilatesVideo } from "@/types/pilates";
import PilatesVideoLibraryCard from "./PilatesVideoLibraryCard";

const PilatesVideoGrid: React.FC<{ videos: PilatesVideo[] }> = ({ videos }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
    {videos.map((video) => (
      <PilatesVideoLibraryCard key={video.id} video={video} />
    ))}
  </div>
);

export default PilatesVideoGrid;
