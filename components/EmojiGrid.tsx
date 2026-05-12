import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function EmojiGrid({ icon }: { icon?: string }) {
  // Split the icon string into individual emojis (handles multi-codepoint emojis correctly)
  const emojis = icon
    ? [...new Intl.Segmenter().segment(icon)]
        .map((s) => s.segment)
        .filter((s) => s.trim())
        .slice(0, 4)
    : ["📦"];

  const count = emojis.length;

  return (
    <div className="w-[54px] h-[54px] rounded-[14px] bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 group-hover:bg-emerald-100/70 group-hover:border-emerald-200 dark:group-hover:bg-emerald-950/40 dark:group-hover:border-emerald-800 transition-all duration-200 overflow-hidden flex items-center justify-center">
      {count === 1 && (
        <span className="text-[26px] leading-none">{emojis[0]}</span>
      )}

      {count === 2 && (
        <div className="flex flex-col items-center justify-center gap-0.5 py-1">
          {emojis.map((e, i) => (
            <span key={i} className="text-[15px] leading-none">
              {e}
            </span>
          ))}
        </div>
      )}

      {count === 3 && (
        <div className="grid grid-cols-2 gap-0.5 p-1 w-full h-full place-items-center">
          <span className="col-span-2 text-[15px] leading-none flex justify-center">
            {emojis[0]}
          </span>
          <span className="text-[14px] leading-none flex justify-center">
            {emojis[1]}
          </span>
          <span className="text-[14px] leading-none flex justify-center">
            {emojis[2]}
          </span>
        </div>
      )}

      {count === 4 && (
        <div className="grid grid-cols-2 gap-0.5 p-1.5 w-full h-full">
          {emojis.map((e, i) => (
            <span
              key={i}
              className="text-[13px] leading-none flex items-center justify-center"
            >
              {e}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function CategoryCard({ cat }: { cat: any }) {
  return (
    <Link
      key={cat._id}
      href={`/categories/${cat.slug}`}
      className="group relative flex flex-col items-center gap-2.5 p-[18px_12px_14px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 dark:hover:border-emerald-800 transition-all duration-200 hover:-translate-y-0.5"
    >
      {/* Arrow hint on hover */}
      <span className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-600">
        <ArrowUpRight className="w-3.5 h-3.5" />
      </span>

      <EmojiGrid icon={cat.icon} />

      <div className="text-center">
        <span className="block text-xs font-medium leading-snug text-gray-800 dark:text-gray-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
          {cat.name}
        </span>
        {cat.itemCount != null && (
          <span className="block text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
            {cat.itemCount} items
          </span>
        )}
      </div>
    </Link>
  );
}
