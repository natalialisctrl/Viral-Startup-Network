import { useState } from "react";
import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";
import { DollarSign, PieChart, TrendingUp, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

export default function EquityCalculator() {
  const [valuation, setValuation] = useState<number>(10000000); // 10M
  const [equityPercent, setEquityPercent] = useState<number>(0.5); // 0.5%
  const [exitMultiple, setExitMultiple] = useState<number>(5); // 5x
  const [dilution, setDilution] = useState<number>(20); // 20% expected dilution

  // Calculations
  const currentStakeValue = (valuation * (equityPercent / 100));
  const exitValuation = valuation * exitMultiple;
  const finalEquityPercent = equityPercent * (1 - (dilution / 100));
  const expectedPayout = exitValuation * (finalEquityPercent / 100);

  const formatCurrency = (num: number) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}k`;
    return `$${Math.round(num).toLocaleString()}`;
  };

  return (
    <AppLayout>
      <div className="min-h-[calc(100vh-80px)] p-6 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <PieChart className="w-8 h-8 text-primary" />
            Startup Equity Calculator
          </h1>
          <p className="text-muted-foreground mt-2">
            Visualize what your startup equity could actually be worth. 
            Don't just look at the percentage—understand the math.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls */}
          <Card className="lg:col-span-5 border-border/50 bg-card/50 backdrop-blur-xl shadow-xl">
            <CardHeader>
              <CardTitle>The Variables</CardTitle>
              <CardDescription>Adjust the levers to see potential outcomes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="flex items-center gap-2">
                    Equity Granted (%)
                    <Tooltip>
                      <TooltipTrigger><HelpCircle className="w-4 h-4 text-muted-foreground" /></TooltipTrigger>
                      <TooltipContent>Your initial grant size</TooltipContent>
                    </Tooltip>
                  </Label>
                  <span className="font-mono font-bold text-primary">{equityPercent.toFixed(2)}%</span>
                </div>
                <Slider 
                  value={[equityPercent]} 
                  min={0.01} max={5} step={0.01} 
                  onValueChange={(val) => setEquityPercent(val[0])} 
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="flex items-center gap-2">
                    Current Valuation
                    <Tooltip>
                      <TooltipTrigger><HelpCircle className="w-4 h-4 text-muted-foreground" /></TooltipTrigger>
                      <TooltipContent>What is the company worth today? (Post-money)</TooltipContent>
                    </Tooltip>
                  </Label>
                  <span className="font-mono font-bold">{formatCurrency(valuation)}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant={valuation === 5000000 ? "default" : "outline"} size="sm" onClick={() => setValuation(5000000)} className="flex-1 text-xs">Seed ($5M)</Button>
                  <Button variant={valuation === 20000000 ? "default" : "outline"} size="sm" onClick={() => setValuation(20000000)} className="flex-1 text-xs">Series A ($20M)</Button>
                  <Button variant={valuation === 100000000 ? "default" : "outline"} size="sm" onClick={() => setValuation(100000000)} className="flex-1 text-xs">Series B ($100M)</Button>
                </div>
                <Input 
                  type="number" 
                  value={valuation} 
                  onChange={(e) => setValuation(Number(e.target.value))}
                  className="font-mono"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="flex items-center gap-2">
                    Expected Dilution (%)
                    <Tooltip>
                      <TooltipTrigger><HelpCircle className="w-4 h-4 text-muted-foreground" /></TooltipTrigger>
                      <TooltipContent>How much your shares will dilute in future funding rounds. Usually 15-20% per round.</TooltipContent>
                    </Tooltip>
                  </Label>
                  <span className="font-mono font-bold text-orange-500">{dilution}%</span>
                </div>
                <Slider 
                  value={[dilution]} 
                  min={0} max={60} step={1} 
                  onValueChange={(val) => setDilution(val[0])} 
                  className="[&_[role=slider]]:border-orange-500 [&_[role=slider]]:bg-orange-500"
                />
              </div>

              <div className="space-y-4 pt-4 border-t border-border/50">
                <div className="flex justify-between items-center">
                  <Label className="flex items-center gap-2">
                    Exit Multiple
                    <Tooltip>
                      <TooltipTrigger><HelpCircle className="w-4 h-4 text-muted-foreground" /></TooltipTrigger>
                      <TooltipContent>How many times bigger the exit valuation is vs current valuation.</TooltipContent>
                    </Tooltip>
                  </Label>
                  <span className="font-mono font-bold text-green-500">{exitMultiple}x</span>
                </div>
                <Slider 
                  value={[exitMultiple]} 
                  min={1} max={20} step={0.5} 
                  onValueChange={(val) => setExitMultiple(val[0])} 
                  className="[&_[role=slider]]:border-green-500 [&_[role=slider]]:bg-green-500"
                />
                <p className="text-xs text-muted-foreground text-right">
                  Exit Valuation: {formatCurrency(exitValuation)}
                </p>
              </div>

            </CardContent>
          </Card>

          {/* Results */}
          <div className="lg:col-span-7 space-y-6">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              key={expectedPayout}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-white/3 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-primary/10 blur-[100px] rounded-full mix-blend-screen pointer-events-none" />
                <CardContent className="p-8 sm:p-12 relative z-10 flex flex-col items-center justify-center text-center min-h-[300px]">
                  <p className="text-lg font-medium text-muted-foreground mb-4 uppercase tracking-widest">Expected Payout</p>
                  <div className="text-6xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 font-mono tracking-tighter">
                    {formatCurrency(expectedPayout)}
                  </div>
                  
                  <div className="mt-8 pt-8 border-t border-primary/10 w-full grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Final Equity %</p>
                      <p className="text-xl font-bold font-mono">{finalEquityPercent.toFixed(3)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Current Value</p>
                      <p className="text-xl font-bold font-mono text-muted-foreground">{formatCurrency(currentStakeValue)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <Card className="border-border/50 bg-card/30">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" /> Scenario Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: "Pessimistic (2x exit)", mult: 2 },
                    { label: "Base Case (5x exit)", mult: 5 },
                    { label: "Optimistic (10x exit)", mult: 10 },
                    { label: "Unicorn (100x exit)", mult: 100 },
                  ].map((scenario, i) => {
                    const payout = (valuation * scenario.mult) * (finalEquityPercent / 100);
                    return (
                      <div key={i} className="flex justify-between items-center p-3 rounded-lg hover:bg-accent/50 transition-colors">
                        <span className="font-medium text-muted-foreground">{scenario.label}</span>
                        <span className="font-mono font-bold">{formatCurrency(payout)}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-6 text-xs text-muted-foreground italic bg-muted/50 p-4 rounded-lg">
                  * Note: This is a simplified model. It does not account for preference stacks, liquidation preferences, participation, options strike price, or taxes. Always consult a financial advisor.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
