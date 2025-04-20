import React from "react";
import { Skeleton as NextUISkeleton } from "@nextui-org/react";

type SkeletonProps = {
  className?: string;
};

export const Skeleton = ({ className = "" }: SkeletonProps) => {
  return (
    <NextUISkeleton className={className} />
  );
};