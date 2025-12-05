// client/src/components/Layout/index.tsx
import { ReactNode } from "react";
import { Header } from "./Header";

type LayoutProps = {
  children: ReactNode;
};

export function Layout({ children }: LayoutProps) {
  return (
    <div className="app-root">
      <Header />
      <main className="container mx-auto p-4">{children}</main>
    </div>
  );
}
