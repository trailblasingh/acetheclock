import "katex/dist/katex.min.css";

type MathTextProps = {
  text: string;
  className?: string;
};

export function MathText({ text, className }: MathTextProps) {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <div className={className}>
      {lines.map((line, index) => (
        <p key={`${line}-${index}`} className="mb-3 leading-7 text-pretty">
          {line}
        </p>
      ))}
    </div>
  );
}
