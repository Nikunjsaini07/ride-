import { useState } from "react";
import { Star } from "lucide-react";

// Read-only display of an average rating.
export function StarsDisplay({ value = 0, count }) {
  const rounded = Math.round(value);
  return (
    <span className="stars-display" title={`${value} / 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={14}
          fill={n <= rounded ? "currentColor" : "none"}
          className={n <= rounded ? "" : "stars-empty"}
          style={{ strokeWidth: n <= rounded ? 0 : 2, marginRight: 2 }}
        />
      ))}
      {value > 0 ? (
        <span className="stars-num">
          {value.toFixed(1)}
          {count != null ? ` (${count})` : ""}
        </span>
      ) : (
        <span className="stars-num muted">No ratings</span>
      )}
    </span>
  );
}

// Interactive star picker.
export function StarsInput({ value, onChange }) {
  const [hover, setHover] = useState(0);
  const activeRating = hover || value;
  return (
    <span className="stars-input">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`star ${activeRating >= n ? "on" : ""}`}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
        >
          <Star size={20} fill={activeRating >= n ? "currentColor" : "none"} />
        </button>
      ))}
    </span>
  );
}
