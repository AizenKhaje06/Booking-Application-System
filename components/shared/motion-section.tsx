"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";

interface MotionSectionProps {
  children: ReactNode;
  className?: string;
  stagger?: boolean;
}

export function MotionSection({ children, className, stagger = false }: MotionSectionProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <section className={className}>{children}</section>;
  }

  return (
    <motion.section
      className={className}
      variants={stagger ? staggerContainer : fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
    >
      {children}
    </motion.section>
  );
}

export function MotionItem({ children, className }: { children: ReactNode; className?: string }) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div variants={staggerItem} className={className}>
      {children}
    </motion.div>
  );
}
