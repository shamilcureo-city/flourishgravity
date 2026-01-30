import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";

const quotes = [
  {
    text: "You don't have to control your thoughts. You just have to stop letting them control you.",
    author: "Dan Millman",
  },
  {
    text: "The greatest glory in living lies not in never falling, but in rising every time we fall.",
    author: "Nelson Mandela",
  },
  {
    text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.",
    author: "Ralph Waldo Emerson",
  },
  {
    text: "You are not your thoughts. You are the observer of your thoughts.",
    author: "Eckhart Tolle",
  },
  {
    text: "The only way out is through.",
    author: "Robert Frost",
  },
  {
    text: "Be gentle with yourself. You're doing the best you can.",
    author: "Unknown",
  },
  {
    text: "Every day is a new beginning. Take a deep breath and start again.",
    author: "Unknown",
  },
  {
    text: "Feelings are just visitors. Let them come and go.",
    author: "Mooji",
  },
  {
    text: "You are allowed to be both a masterpiece and a work in progress.",
    author: "Sophia Bush",
  },
  {
    text: "Progress, not perfection.",
    author: "Unknown",
  },
];

export function DailyQuote() {
  // Get a consistent quote for the day based on the date
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const quote = quotes[dayOfYear % quotes.length];

  return (
    <Card className="bg-muted/30 border-muted">
      <CardContent className="p-6">
        <div className="flex gap-4">
          <Quote className="h-8 w-8 text-primary/40 flex-shrink-0" />
          <div>
            <p className="text-foreground italic mb-2">"{quote.text}"</p>
            <p className="text-sm text-muted-foreground">— {quote.author}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
