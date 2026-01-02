import type { Metadata } from "next";
import Timeline from "@/components/Timeline";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "Spotify Challenge 2026",
};

export default function Home() {
  return (
    <main className="relative min-h-screen flex flex-col justify-center bg-slate-950 overflow-hidden">
      <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-12">
        <div className="flex flex-col justify-center divide-y divide-slate-200 *:py-16">
          <div className="w-full max-w-4xl mx-auto">
            <Timeline />
          </div>
        </div>
      </div>
    </main>
  );
}
