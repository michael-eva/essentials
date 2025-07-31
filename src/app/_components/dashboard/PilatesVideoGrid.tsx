import React from "react";
import PilatesVideoCard from "./PilatesVideoCard";
import type { PilatesVideo } from "@/types/pilates";
import Link from "next/link";
import Image from "next/image";
import { PlayCircle } from "lucide-react";
import PilatesVideoLibraryCard from "./PilatesVideoLibraryCard";

const PilatesVideoGrid: React.FC<{ videos: PilatesVideo[] }> = ({ videos }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
    {videos.map((video) => (
      <PilatesVideoLibraryCard key={video.id} video={video} />
    ))}
  </div>
);

export default PilatesVideoGrid;
