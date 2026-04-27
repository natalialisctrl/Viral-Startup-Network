import { AppLayout } from "@/components/layout";
import { useListPlans, useCreateCheckoutSession } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function Premium() {
  // Using static plans for UI display if API doesn't return them formatted perfectly
  const plans = [
    {
      id: "free",
      name: "Free",
      description: "Basic access to the ecosystem",
      price: 0,
      tier: "free",
      popular: false,
      features: [
        "10 swipes per day",
        "Basic profile",
        "View mutual matches",
        "Standard support"
      ]
    },
    {
      id: "talent_pro",
      name: "Talent Pro",
      description: "For serious candidates looking for the perfect role",
      price: 19,
      tier: "pro",
      popular: true,
      features: [
        "Unlimited swipes",
        "See who liked you",
        "5 Super Applies per month",
        "Priority matching algorithm",
        "AI Profile optimization"
      ]
    },
    {
      id: "startup_starter",
      name: "Startup Starter",
      description: "For early stage founders building their core team",
      price: 99,
      tier: "startup",
      popular: false,
      features: [
        "Unlimited talent swipes",
        "Post up to 3 roles",
        "Message before matching (10/mo)",
        "Advanced filtering",
        "Pitch video on profile"
      ]
    }
  ];

  const createCheckout = useCreateCheckoutSession();

  const handleSubscribe = (planId: string) => {
    if (planId === "free") return;
    
    createCheckout.mutate(
      { data: { planId, successUrl: window.location.origin + "/dashboard", cancelUrl: window.location.href } },
      {
        onSuccess: (session) => {
          // Redirect to Stripe
          window.location.href = session.url;
        }
      }
    );
  };

  return (
    <AppLayout>
      <div className="min-h-[calc(100vh-80px)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              Unlock the full power of <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500">Mesh</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Stop waiting. Start matching with the top 1% of the startup ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-4 inset-x-0 flex justify-center z-10">
                    <span className="bg-gradient-to-r from-white to-zinc-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center shadow-lg">
                      <Sparkles className="w-3 h-3 mr-1" /> Most Popular
                    </span>
                  </div>
                )}
                <Card className={`h-full border-border/50 bg-card/50 backdrop-blur-sm relative overflow-hidden transition-all hover:shadow-2xl hover:shadow-primary/10 ${
                  plan.popular ? 'border-primary/50 ring-1 ring-primary/20 scale-105 z-0' : ''
                }`}>
                  {plan.popular && (
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                  )}
                  
                  <CardHeader className="text-center pb-8 pt-8">
                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                    <CardDescription className="h-10 mt-2">{plan.description}</CardDescription>
                    <div className="mt-6 flex items-baseline justify-center gap-1">
                      <span className="text-5xl font-black">${plan.price}</span>
                      <span className="text-muted-foreground font-medium">/mo</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <ul className="space-y-4">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className="mt-1 bg-primary/20 rounded-full p-0.5 shrink-0">
                            <Check className="w-3 h-3 text-primary font-bold" />
                          </div>
                          <span className="text-sm font-medium">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  
                  <CardFooter className="pt-8 pb-8">
                    <Button 
                      className={`w-full h-12 rounded-xl text-md font-bold ${
                        plan.popular 
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(255,255,255,0.12)]' 
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      }`}
                      variant={plan.popular ? "default" : "secondary"}
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={createCheckout.isPending && createCheckout.variables?.data.planId === plan.id}
                    >
                      {createCheckout.isPending && createCheckout.variables?.data.planId === plan.id 
                        ? "Processing..." 
                        : plan.price === 0 ? "Current Plan" : "Upgrade Now"
                      }
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-16 text-center text-sm text-muted-foreground">
            <p>Need a custom plan for a larger scale startup? <a href="#" className="text-primary hover:underline">Contact sales</a>.</p>
            <p className="mt-2">All plans are billed monthly. Cancel anytime.</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
