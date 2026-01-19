import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Disc3 } from "lucide-react";
import { GradientBackground } from "@/components";
import { staggerContainer, staggerItem } from "@/utils/animations";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthLayout({
  children,
  title,
  subtitle,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-6 py-12">
      <GradientBackground variant="auth" fixed />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <motion.div variants={staggerItem} className="text-center mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-2xl font-bold hover:opacity-80 transition-default"
          >
            <Disc3 className="w-8 h-8 text-primary-500" />
            <span>SoundScout</span>
          </Link>
        </motion.div>

        {/* Card */}
        <motion.div
          variants={staggerItem}
          className="bg-bg-surface rounded-2xl p-8 border border-border-subtle shadow-xl"
        >
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">{title}</h1>
            <p className="text-text-secondary">{subtitle}</p>
          </div>

          {children}
        </motion.div>
      </motion.div>
    </div>
  );
}
