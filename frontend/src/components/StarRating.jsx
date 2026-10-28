import { Star } from "lucide-react";

export default function StarRating({ rating = 5 }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? "fill-amber-400 text-amber-400" : "text-white/30"}`}
        />
      ))}
    </div>
  );
}
