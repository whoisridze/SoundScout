import { ArrowUpRight, Send } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { PageLayout } from "@/layouts";
import { GradientBackground } from "@/components";
import { SOCIAL_LINKS } from "@/constants";
import { staggerContainer, staggerItem } from "@/utils/animations";
import { SOCIAL_ICON_MAP } from "@/utils/icons";

export default function Contact() {
  useEffect(() => { document.title = "Contact — SoundScout"; return () => { document.title = "SoundScout"; }; }, []);
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate submission - replace with actual API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setFormState({ name: "", email: "", message: "" });
  };

  return (
    <PageLayout hideFooter>
      {/* Hero */}
      <section className="min-h-screen relative overflow-hidden">
        <GradientBackground variant="contact" fixed />

        <div className="relative z-10 max-w-[1400px] mx-auto px-6 pt-48 pb-24">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start"
          >
            {/* Left: Typography & Links */}
            <div>
              <motion.p
                variants={staggerItem}
                className="text-primary-400 font-medium mb-4"
              >
                Get in touch
              </motion.p>

              <motion.h1
                variants={staggerItem}
                className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
              >
                Let's{" "}
                <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                  connect
                </span>
              </motion.h1>

              <motion.p
                variants={staggerItem}
                className="text-xl text-text-secondary max-w-md mb-12 leading-relaxed"
              >
                Have a question, feedback, or just want to say hi? I'd love to
                hear from you.
              </motion.p>

              {/* Social Links */}
              <motion.div variants={staggerItem} className="space-y-4">
                {SOCIAL_LINKS.map((link) => {
                  const Icon = SOCIAL_ICON_MAP[link.icon];
                  return (
                    <a
                      key={link.name}
                      href={link.href}
                      target={
                        link.href.startsWith("mailto") ? undefined : "_blank"
                      }
                      rel={
                        link.href.startsWith("mailto")
                          ? undefined
                          : "noopener noreferrer"
                      }
                      className="group flex items-center gap-4 p-4 -mx-4 rounded-xl hover:bg-bg-surface transition-default"
                    >
                      <div className="w-12 h-12 rounded-lg bg-bg-surface group-hover:bg-bg-hover flex items-center justify-center transition-default">
                        <Icon className="w-5 h-5 text-text-secondary group-hover:text-primary-400 transition-default" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-text-primary group-hover:text-primary-400 transition-default">
                          {link.name}
                        </p>
                        <p className="text-sm text-text-muted">
                          {link.description}
                        </p>
                      </div>
                      <ArrowUpRight className="w-5 h-5 text-text-muted group-hover:text-primary-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all self-center" />
                    </a>
                  );
                })}
              </motion.div>
            </div>

            {/* Right: Contact Form */}
            <motion.div variants={staggerItem}>
              <div className="bg-bg-surface rounded-2xl p-8 border border-border-subtle">
                <h2 className="text-xl font-semibold mb-6">Send a message</h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-text-secondary mb-2"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formState.name}
                      onChange={(e) =>
                        setFormState({ ...formState, name: e.target.value })
                      }
                      required
                      className="w-full px-4 py-3 bg-bg-base border border-border-subtle rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-default"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-text-secondary mb-2"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formState.email}
                      onChange={(e) =>
                        setFormState({ ...formState, email: e.target.value })
                      }
                      required
                      className="w-full px-4 py-3 bg-bg-base border border-border-subtle rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-default"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-text-secondary mb-2"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      value={formState.message}
                      onChange={(e) =>
                        setFormState({ ...formState, message: e.target.value })
                      }
                      required
                      rows={5}
                      className="w-full px-4 py-3 bg-bg-base border border-border-subtle rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-default resize-none"
                      placeholder="What's on your mind?"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-4 rounded-lg font-semibold transition-default"
                  >
                    {isSubmitting ? (
                      "Sending..."
                    ) : (
                      <>
                        Send message
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <p className="text-xs text-text-muted text-center mt-6">
                  I'll get back to you as soon as possible.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </PageLayout>
  );
}
