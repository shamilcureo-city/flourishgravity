import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Leaf } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-24 bg-wellness-gradient relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-50">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-wellness-peace rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-wellness-growth rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Leaf className="w-8 h-8 text-primary" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Start Your Journey?
          </h2>
          
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of people who have taken the first step toward better mental health. 
            Your AI therapist is ready to support you.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="w-full sm:w-auto shadow-soft-lg group" asChild>
              <Link to="/signup">
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            No credit card required • 5 free messages daily • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTA;
