export default function Stars({ value = 0 }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;

  return (
    <div className="stars" aria-label={`Rating ${value}`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const isFull = i < full;
        const isHalf = i === full && half;
        return (
          <span
            key={i}
            className={`star ${isFull ? "full" : isHalf ? "half" : ""}`}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}
