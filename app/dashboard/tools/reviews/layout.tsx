import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "ReviewDrop",
  description: "Share your experience",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-zinc-950 text-white min-h-screen w-full">{children}</div>
  );
}
