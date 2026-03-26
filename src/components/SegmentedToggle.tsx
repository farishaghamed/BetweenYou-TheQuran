"use client";

interface SegmentedToggleProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

export default function SegmentedToggle({
  value,
  onChange,
  options,
}: SegmentedToggleProps) {
  const activeIndex = options.findIndex((o) => o.value === value);

  return (
    <div
      className="relative inline-flex rounded-full p-[3px]"
      style={{ backgroundColor: "rgba(107, 127, 94, 0.12)" }}
    >
      {/* Sliding pill */}
      <div
        className="absolute top-[3px] bottom-[3px] rounded-full bg-olive transition-transform duration-300 ease-in-out"
        style={{
          width: `calc(${100 / options.length}% - 0px)`,
          transform: `translateX(${activeIndex * 100}%)`,
        }}
      />

      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className="relative z-10 px-5 py-1.5 rounded-full font-[family-name:var(--font-nunito)] text-[0.72rem] font-semibold tracking-wide transition-colors duration-300"
          style={{
            color: value === opt.value ? "var(--cream)" : "var(--olive)",
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
