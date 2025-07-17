"use client";

import React, { useEffect, useState } from "react";
import { Toaster } from "sonner";

interface SharedLayoutProps {
  title?: string;
  children: React.ReactNode;
}

type ToasterPosition = 'top-center' | 'bottom-right'

function ResponsiveToaster() {
  const [position, setPosition] = useState<ToasterPosition>("top-center");

  useEffect(() => {
    function handleResize() {
      setPosition(window.innerWidth < 768 ? "top-center" : "bottom-right");
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return <Toaster position={position} />;
}

const SharedLayout = ({ title, children }: SharedLayoutProps) => {
  return (
    <div>
      <div>{children}</div>
      <ResponsiveToaster />
    </div>
  );
};

export default SharedLayout;
