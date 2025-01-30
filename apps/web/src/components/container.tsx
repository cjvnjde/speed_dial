import type { PropsWithChildren } from "react";

export const Container = ({ children }: PropsWithChildren) => {
  return <div className="min-h-screen bg-background w-full">{children}</div>;
};
