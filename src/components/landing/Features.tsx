import { MessageCircle, BarChart3, Brain, Heart, Shield, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: MessageCircle,
    title: "AI Therapy Conversations",
    description: "Evidence-based conversations using CBT, DBT, and ACT techniques. Get compassionate support whenever you need it.",
    color: "bg-wellness-peace",
  },
  {
    icon: BarChart3,
    title: "Mood & Wellness Tracking",
    description: "Log your daily mood, sleep, and energy levels. Visualize trends and understand your emotional patterns.",
    color: "bg-wellness-growth",
  },
  {
    icon: Brain,
    title: "Personalized Insights",
    description: "AI identifies patterns in your data to provide meaningful observations about what affects your wellbeing.",
    color: "bg-wellness-focus",
  },
  {
    icon: Heart,
    title: "Therapeutic Exercises",
    description: "Access guided breathing exercises, journaling prompts, and cognitive reframing techniques.",
    color: "bg-wellness-warmth",
  },
  {
    icon: Shield,
    title: "Private & Secure",
    description: "Your conversations and data are encrypted and completely private. Your mental health journey is yours alone.",
    color: "bg-wellness-calm",
  },
  {
    icon: Zap,
    title: "Always Available",
    description: "Get support 24/7 without appointments or waitlists. Your AI therapist is always ready to listen.",
    color: "bg-wellness-peace",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything You Need to{" "}
            <span className="text-primary">Flourish</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Comprehensive tools designed by mental health experts to support your journey toward emotional wellness.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={feature.title} 
              className="border-border/50 shadow-soft hover:shadow-soft-lg transition-all duration-300 group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-foreground/80" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
