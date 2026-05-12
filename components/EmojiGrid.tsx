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
