import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah M.",
    role: "Working Professional",
    content: "Flourish has been a game-changer for my anxiety. Having someone to talk to at 2am when my thoughts are racing has made such a difference.",
    rating: 5,
  },
  {
    name: "James L.",
    role: "Graduate Student",
    content: "The mood tracking helped me realize how much my sleep affects my mental state. The insights are incredibly valuable.",
    rating: 5,
  },
  {
    name: "Emily R.",
    role: "New Parent",
    content: "As a new mom, I couldn't commit to regular therapy appointments. Flourish gives me the support I need on my own schedule.",
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Stories of Growth
          </h2>
          <p className="text-lg text-muted-foreground">
            Hear from people who have found support and growth through Flourish.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={testimonial.name}
              className="border-border/50 shadow-soft hover:shadow-soft-lg transition-all duration-300"
            >
              <CardContent className="p-6">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-foreground mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-semibold text-foreground">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
