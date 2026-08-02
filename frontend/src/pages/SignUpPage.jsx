import { motion } from "framer-motion";
import { ArrowRight, Loader2, Mail, PlayCircle, User } from "lucide-react";
import { useState } from "react";
import BackgroundEffects from "../components/loading/BackgroundEffects";
import DharmaChakraLogo from "../components/loading/DharmaChakraLogo";
import { useAuth } from "../context/AuthContext";

const EASE = [0.22, 1, 0.36, 1];


function Field({ icon: Icon, error, ...props }) {
  return (
    <div>
      <div
        className={`flex items-center gap-2.5 rounded-xl border bg-white/[0.04] px-3.5 py-3 backdrop-blur-md transition-colors focus-within:border-[#7C5CFF]/70 focus-within:bg-white/[0.06] ${
          error ? "border-red-500/60" : "border-white/[0.08]"
        }`}
      >
        <Icon size={16} className="shrink-0 text-[#94A3B8]" />
        <input
          {...props}
          className="w-full bg-transparent text-sm text-[#F8FAFC] outline-none placeholder:text-[#64748B]"
        />
      </div>
      {error && <p className="mt-1.5 pl-1 text-[11px] text-red-300">{error}</p>}
    </div>
  );
}

/**
 * SignUpPage
 * Shown once the boot sequence finishes. Visitors can create a local profile
 * or jump straight into a demo session — both unlock the identical toolset.
 */
export default function SignUpPage() {
  const { signUp, startDemo } = useAuth();
  const [form, setForm] = useState({ name: "", email: "" });
  const [errors, setErrors] = useState({});
  const [pending, setPending] = useState(null); // "signup" | "demo"

  const update = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((x) => ({ ...x, [key]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      next.email = "Please enter a valid email address.";

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setPending("signup");
    // Brief pause so the transition reads as intentional rather than abrupt.
    setTimeout(() => signUp(form), 650);
  };

  const handleDemo = () => {
    setPending("demo");
    setTimeout(startDemo, 500);
  };

  const busy = pending !== null;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070B16] px-5 py-12 font-sans text-[#F8FAFC] antialiased">
      <BackgroundEffects />

      <motion.div
        initial={{ opacity: 0, y: 28, filter: "blur(12px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.9, ease: EASE }}
        className="relative z-10 w-full max-w-[440px]"
      >
        {/* Brand */}
        <div className="mb-8 flex flex-col items-center text-center">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="will-change-transform"
          >
            <DharmaChakraLogo size={104} />
          </motion.div>

          <h1
            className="mt-5 bg-gradient-to-r from-white via-[#A855F7] to-[#D4AF37] bg-clip-text font-display text-2xl font-extrabold tracking-[0.1em] text-transparent sm:text-3xl"
            style={{ backgroundSize: "180% 100%" }}
          >
            CODE TITAN
          </h1>
          <p className="mt-2 text-[13px] text-[#94A3B8]">
            Create your workspace for the Tibetan Research Assistant
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#111827]/50 p-6 shadow-[0_24px_70px_-24px_rgba(0,0,0,0.95)] backdrop-blur-xl sm:p-7">
          <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
            <Field
              icon={User}
              type="text"
              name="name"
              autoComplete="name"
              placeholder="Full name"
              value={form.name}
              onChange={update("name")}
              error={errors.name}
              disabled={busy}
            />
            <Field
              icon={Mail}
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@university.edu"
              value={form.email}
              onChange={update("email")}
              error={errors.email}
              disabled={busy}
            />

            <button
              type="submit"
              disabled={busy}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#A855F7] px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_-10px_rgba(124,92,255,0.9)] transition-all hover:brightness-110 disabled:opacity-70"
            >
              {pending === "signup" ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  Create workspace
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-white/[0.08]" />
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#64748B]">
              or
            </span>
            <span className="h-px flex-1 bg-white/[0.08]" />
          </div>

          {/* Demo */}
          <button
            type="button"
            onClick={handleDemo}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#D4AF37]/35 bg-[#D4AF37]/[0.07] px-4 py-3 text-sm font-semibold text-[#E9C767] backdrop-blur-md transition-all hover:border-[#D4AF37]/60 hover:bg-[#D4AF37]/[0.12] disabled:opacity-70"
          >
            {pending === "demo" ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <PlayCircle size={16} />
                Test the demo
              </>
            )}
          </button>
          <p className="mt-2.5 text-center text-[11px] leading-relaxed text-[#64748B]">
            The demo unlocks every service — OCR, translation, summaries and chat.
          </p>
        </div>

        <p className="mt-8 text-center font-mono text-[10px] uppercase tracking-[0.28em] text-[#475569]">

          Team Code Titan · Wisdom in Code
        </p>
      </motion.div>
    </div>
  );
}
