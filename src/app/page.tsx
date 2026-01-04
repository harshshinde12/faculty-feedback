"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      if (session.user.role === "ADMIN") router.push("/admin/dashboard");
      else if (session.user.role === "HOD") router.push("/hod/analytics");
      else if (session.user.role === "STUDENT") router.push("/student/dashboard");
      else if (session.user.role === "FACULTY") router.push("/faculty/dashboard");
    }
  }, [status, session, router]);

  // Loading state (optional, can be a spinner)
  if (status === "loading") return <div className="h-screen flex items-center justify-center bg-slate-50">Loading...</div>;

  // If logged in, we are redirecting, so show nothing or loader
  if (status === "authenticated") return <div className="h-screen flex items-center justify-center bg-slate-50">Redirecting to Dashboard...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-rose-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">F</div>
            <span className="text-xl font-bold tracking-tight text-slate-900">FacultyFeedback</span>
          </div>
          <Link
            href="/login"
            className="px-6 py-2 bg-slate-900 text-white font-medium rounded-full hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="z-10"
          >
            <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-rose-100 text-rose-600 font-semibold text-sm tracking-wide">
              New: AI-Powered Analytics 🚀
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] mb-6">
              Feedback that <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-purple-600">Empowers</span> Growth.
            </h1>
            <p className="text-lg text-slate-600 mb-8 max-w-lg leading-relaxed">
              Streamline academic feedback with our secure, anonymous, and analytical platform designed for modern institutions.
            </p>
            <div className="flex gap-4">
              <Link
                href="/login"
                className="px-8 py-4 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-all shadow-xl shadow-rose-600/20 hover:scale-105"
              >
                Get Started
              </Link>
              <button className="px-8 py-4 bg-white text-slate-700 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all">
                Learn More
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-rose-200 to-purple-200 rounded-3xl blur-3xl opacity-50 -z-10" />
            <Image
              src="/assets/landing_hero.png"
              alt="Hero Illustration"
              width={800}
              height={600}
              className="rounded-3xl shadow-2xl border border-white/50"
              priority
            />
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Why FacultyFeedback?</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              We provide the tools necessary to bridge the gap between students and faculty, fostering a culture of continuous improvement.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Anonymous & Secure", desc: "Students can share honest feedback without fear, ensuring authentic insights.", icon: "🔒" },
              { title: "Real-time Analytics", desc: "Instant data visualization for HODs and Faculty to track performance trends.", icon: "📊" },
              { title: "Actionable Insights", desc: "Turn raw data into meaningful improvements for curriculum and teaching.", icon: "💡" },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-2xl mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Visual Showcase - Analytics */}
      <section className="py-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative order-2 lg:order-1"
          >
            <Image
              src="/assets/landing_analytics.png"
              alt="Analytics Dashboard"
              width={800}
              height={600}
              className="rounded-3xl shadow-2xl"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="order-1 lg:order-2"
          >
            <h2 className="text-4xl font-bold text-slate-900 mb-6">Master Your Data</h2>
            <p className="text-lg text-slate-600 mb-6">
              Our advanced analytics engine processes thousands of data points to present clear, actionable visualizations.
            </p>
            <ul className="space-y-4">
              {['Subject-wise Performance', 'Trend Analysis over Semesters', 'Downloadable Reports (PDF/Excel)'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                  <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Visual Showcase - Feedback */}
      <section className="py-24 bg-slate-900 text-white px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold mb-6">Intuitive Feedback Experience</h2>
            <p className="text-lg text-slate-300 mb-8">
              We've designed a friction-free interface for students, ensuring higher completion rates and better quality data.
            </p>
            <Link href="/login" className="text-rose-400 font-bold hover:text-rose-300 flex items-center gap-2">
              Explore the platform &rarr;
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-rose-500/20 blur-3xl rounded-full" />
            <Image
              src="/assets/landing_feedback.png"
              alt="Feedback Interface"
              width={800}
              height={600}
              className="relative rounded-3xl shadow-2xl border border-slate-700"
            />
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 py-12 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center opacity-60">
          <p>&copy; 2024 FacultyFeedback System. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-slate-900">Privacy</a>
            <a href="#" className="hover:text-slate-900">Terms</a>
            <a href="#" className="hover:text-slate-900">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}