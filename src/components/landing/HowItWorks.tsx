const steps = [
  {
    number: "01",
    title: "Create Your Profile",
    description: "Tell us about your goals and what you'd like to work on. We'll personalize your experience based on your needs.",
  },
  {
    number: "02",
    title: "Start Conversations",
    description: "Chat with your AI therapist anytime. Share what's on your mind and receive evidence-based guidance and support.",
  },
  {
    number: "03",
    title: "Track Your Journey",
    description: "Log your daily mood and wellness metrics. Watch your progress over time with beautiful, insightful charts.",
  },
  {
    number: "04",
    title: "Discover Patterns",
    description: "Receive AI-powered insights about your emotional patterns and personalized recommendations for growth.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-wellness-gradient">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Your Path to Wellness
          </h2>
          <p className="text-lg text-muted-foreground">
            Getting started is simple. Here's how Flourish helps you on your mental health journey.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid gap-8">
            {steps.map((step, index) => (
              <div 
                key={step.number}
                className="flex gap-6 items-start group"
              >
                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-card shadow-soft flex items-center justify-center group-hover:shadow-soft-lg transition-shadow">
                  <span className="text-2xl font-bold text-primary">{step.number}</span>
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute left-8 mt-16 w-px h-8 bg-border" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
