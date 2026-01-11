"use client";

import { useState } from "react";

interface ShareButtonsProps {
  businessName: string;
  slug: string;
}

export function ShareButtons({ businessName, slug }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/${slug}`
    : `/${slug}`;
  const shareText = `Check out ${businessName}!`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const shareToSMS = () => {
    window.location.href = `sms:?body=${encodeURIComponent(
      `${shareText} ${shareUrl}`
    )}`;
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: businessName,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or error
      }
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={copyLink}
        className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-zinc-800 rounded-lg font-medium hover:bg-zinc-700 transition"
      >
        {copied ? "✓ Copied!" : "📋 Copy Link"}
      </button>

      <button
        onClick={shareToSMS}
        className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-zinc-800 rounded-lg font-medium hover:bg-zinc-700 transition"
      >
        💬 Text a Friend
      </button>

      {typeof navigator !== "undefined" && typeof navigator.share === 'function' && (
        <button
          onClick={shareNative}
          className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-amber-500 text-black rounded-lg font-medium hover:bg-amber-400 transition"
        >
          📤 Share
        </button>
      )}
    </div>
  );
}
