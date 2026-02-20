import { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  fadeInUp,
  defaultTransition,
  defaultViewport,
} from "@/utils/animations";
import { STEP_ICON_MAP, FLOW_ICONS } from "@/utils/icons";
import { PageLayout } from "@/layouts";
import { GradientBackground, GrainOverlay, StepVisual } from "@/components";
import { STEPS, FLOW_ITEMS, COLOR_MAP, FLOW_NODE_STYLES } from "@/constants/how-it-works";

export default function HowItWorks() {
  useEffect(() => { document.title = "How It Works — SoundScout"; return () => { document.title = "SoundScout"; }; }, []);
  return (
    <PageLayout>

      {/* Hero - Full screen */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <GradientBackground />
        <GrainOverlay />

        {/* Sound Wave Rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="sound-wave-ring sound-wave-ring-1" />
          <div className="sound-wave-ring sound-wave-ring-2" />
          <div className="sound-wave-ring sound-wave-ring-3" />
          <div className="sound-wave-ring sound-wave-ring-4" />
        </div>

        <div className="relative z-10 max-w-[900px] mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              How it{" "}
              <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                works
              </span>
            </h1>
            <p className="text-xl text-text-secondary max-w-xl mx-auto leading-relaxed">
              Four simple steps to discover music you'll actually love. No
              algorithms, no guesswork — just pure genre-based exploration.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Steps */}
      <section className="pt-24 pb-24">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="space-y-24">
            {STEPS.map((step, index) => {
              const colors = COLOR_MAP[step.color];
              const Icon = STEP_ICON_MAP[step.icon];
              const isEven = index % 2 === 0;

              return (
                <motion.div
                  key={step.number}
                  className={`flex flex-col ${
                    isEven ? "lg:flex-row" : "lg:flex-row-reverse"
                  } items-center gap-12 lg:gap-20`}
                  initial="initial"
                  whileInView="animate"
                  viewport={defaultViewport}
                  variants={fadeInUp}
                  transition={{ ...defaultTransition, delay: 0.1 }}
                >
                  {/* Content */}
                  <div
                    className={`flex-1 ${
                      isEven ? "lg:text-left" : "lg:text-right"
                    } text-center`}
                  >
                    <div
                      className={`inline-flex items-center gap-3 mb-4 ${
                        isEven ? "" : "lg:flex-row-reverse"
                      }`}
                    >
                      <span
                        className={`text-5xl font-bold ${colors.text} opacity-50`}
                      >
                        {step.number}
                      </span>
                      <div className={`p-2.5 rounded-lg ${colors.bg}`}>
                        <Icon className={`w-5 h-5 ${colors.text}`} />
                      </div>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4 tracking-tight">
                      {step.title}
                    </h2>
                    <p
                      className={`text-text-secondary leading-relaxed max-w-md mx-auto ${
                        isEven ? "lg:mx-0" : "lg:ml-auto lg:mr-0"
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>

                  {/* Visual */}
                  <div className="flex-1 w-full max-w-sm">
                    <div className="bg-bg-surface rounded-xl p-6 border border-border-subtle">
                      <StepVisual step={step} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Flow Diagram */}
      <motion.section
        className="py-24 bg-bg-elevated overflow-hidden"
        initial="initial"
        whileInView="animate"
        viewport={defaultViewport}
        variants={fadeInUp}
        transition={defaultTransition}
      >
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 tracking-tight">
              The journey at a glance
            </h2>
            <p className="text-text-secondary max-w-lg mx-auto">
              From broad genres to your personal collection — all in a few
              clicks.
            </p>
          </div>

          {/* Desktop: Connected nodes with subtle line */}
          <div className="hidden md:block relative">
            {/* Subtle connecting line */}
            <div className="absolute top-8 left-[10%] right-[10%] h-px bg-border-default" />

            <div className="flex justify-between items-start relative">
              {FLOW_ITEMS.map((item, i) => {
                const style = FLOW_NODE_STYLES[i];
                const Icon = FLOW_ICONS[i];

                return (
                  <div key={item.label} className="flex flex-col items-center w-1/5">
                    {/* Node */}
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${style.gradient} ${style.glow} flex items-center justify-center relative z-10`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>

                    {/* Label */}
                    <div className="mt-4 text-center">
                      <p className="font-semibold text-text-primary">{item.label}</p>
                      <p className="text-xs text-text-muted mt-0.5">{item.sub}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile: Vertical timeline */}
          <div className="md:hidden relative">
            {/* Vertical subtle line */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-border-default" />

            <div className="space-y-8">
              {FLOW_ITEMS.map((item, i) => {
                const style = FLOW_NODE_STYLES[i];
                const Icon = FLOW_ICONS[i];

                return (
                  <div key={item.label} className="flex items-center gap-4">
                    {/* Node */}
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${style.gradient} flex items-center justify-center relative z-10 shrink-0`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>

                    {/* Label */}
                    <div>
                      <p className="font-semibold text-text-primary">{item.label}</p>
                      <p className="text-xs text-text-muted mt-0.5">{item.sub}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.section>

      {/* CTA */}
      <motion.section
        className="py-24"
        initial="initial"
        whileInView="animate"
        viewport={defaultViewport}
        variants={fadeInUp}
        transition={defaultTransition}
      >
        <div className="max-w-[800px] mx-auto px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 tracking-tight">
            Ready to explore?
          </h2>
          <p className="text-text-secondary mb-8 max-w-md mx-auto">
            Create a free account and start your musical journey today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="group flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-md font-semibold transition-default shadow-lg hover:shadow-glow-primary"
            >
              Get started free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/"
              className="text-text-secondary hover:text-text-primary px-6 py-4 font-medium transition-default"
            >
              Back to home
            </Link>
          </div>
        </div>
      </motion.section>
    </PageLayout>
  );
}
