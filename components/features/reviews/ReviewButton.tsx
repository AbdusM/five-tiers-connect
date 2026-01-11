"use client";

interface ReviewButtonProps {
  platform: string;
  href: string;
  slug: string;
}

const platformConfig: Record<
  string,
  { icon: string; label: string; gradient: string; hoverGlow: string }
> = {
  google: {
    icon: "G",
    label: "Google",
    gradient: "from-blue-500 to-blue-600",
    hoverGlow: "hover:shadow-blue-500/30",
  },
  yelp: {
    icon: "★",
    label: "Yelp",
    gradient: "from-red-500 to-red-600",
    hoverGlow: "hover:shadow-red-500/30",
  },
  instagram: {
    icon: "◈",
    label: "Instagram",
    gradient: "from-pink-500 via-purple-500 to-orange-400",
    hoverGlow: "hover:shadow-pink-500/30",
  },
  facebook: {
    icon: "f",
    label: "Facebook",
    gradient: "from-blue-600 to-blue-700",
    hoverGlow: "hover:shadow-blue-600/30",
  },
};

export function ReviewButton({ platform, href, slug }: ReviewButtonProps) {
  const config = platformConfig[platform];
  if (!config) return null;

  const handleClick = () => {
    window.open(href, "_blank", "noopener,noreferrer");
    setTimeout(() => {
      window.location.href = `/${slug}/thanks`;
    }, 500);
  };

  return (
    <button
      onClick={handleClick}
      className={`
        group relative flex items-center justify-between w-full py-4 px-5
        bg-zinc-900 rounded-xl font-medium
        border border-zinc-800 hover:border-zinc-700
        transition-all duration-200
        hover:-translate-y-0.5 hover:shadow-xl ${config.hoverGlow}
        active:scale-[0.98]
      `}
    >
      <div className="flex items-center gap-3">
        <span
          className={`w-8 h-8 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center text-white font-bold text-sm`}
        >
          {config.icon}
        </span>
        <span className="text-zinc-200">Review on {config.label}</span>
      </div>
      <span className="text-zinc-600 group-hover:text-zinc-400 transition-colors">
        →
      </span>
    </button>
  );
}
