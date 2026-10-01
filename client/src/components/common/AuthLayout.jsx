import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ThemeToggle from './ThemeToggle';
import { HiOutlineSparkles } from 'react-icons/hi2';
import heroImg from '../../assets/hero.png';

const AuthLayout = ({ children, role, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-hero-warm dark:bg-surface-950 relative flex items-center justify-center px-4 py-10 overflow-hidden selection:bg-primary-500 selection:text-white">
      {/* Decorative shapes */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-peach opacity-70 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#FBE0D3] opacity-60 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-stretch">
        {/* Left visual panel */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:flex flex-col justify-between rounded-[2rem] overflow-hidden relative bg-gradient-to-br from-primary-500 via-primary-600 to-accent-500 shadow-coral-lg p-10 text-white"
        >
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-10 right-10 w-40 h-40 rounded-full bg-gold blur-2xl" />
            <div className="absolute bottom-24 left-6 w-32 h-32 rounded-full bg-white/30 blur-2xl" />
            <div className="absolute top-1/2 left-1/3 w-24 h-24 rounded-full bg-peach blur-xl" />
          </div>

          <div className="relative">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <span className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center text-2xl">🍽️</span>
              <span className="font-display font-extrabold text-xl">Campus Canteen</span>
            </Link>

            <div className="mt-16">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur border border-white/25 text-xs font-bold mb-6">
                <HiOutlineSparkles className="w-4 h-4" />
                {role === 'vendor' ? 'Vendor Portal' : role === 'admin' ? 'Admin Portal' : 'Student Portal'}
              </span>
              <h2 className="font-display text-4xl font-extrabold leading-tight mb-4">{title}</h2>
              <p className="text-white/85 text-sm leading-relaxed max-w-sm">{subtitle}</p>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl overflow-hidden border-4 border-white/25 shadow-2xl">
              <img src={heroImg} alt="Fresh food from the campus canteen" className="w-full h-44 object-cover" />
            </div>
            <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-white/85">
              <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
              Freshly prepared • Zero-wait pickup • Live order tracking
            </div>
          </div>
        </motion.div>

        {/* Right form card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex items-center"
        >
          <div className="w-full">
            <div className="absolute top-4 right-4 lg:hidden"><ThemeToggle /></div>
            <div className="lg:hidden flex items-center justify-between mb-6">
              <Link to="/" className="inline-flex items-center gap-2">
                <span className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary-500 to-accent-500 flex items-center justify-center text-xl shadow-coral">🍽️</span>
                <span className="font-display font-extrabold text-lg gradient-text">Campus Canteen</span>
              </Link>
              <ThemeToggle />
            </div>

            <div className="bg-white dark:bg-surface-900 rounded-[1.75rem] border border-[#F0DDD3] dark:border-surface-700 shadow-soft-lg p-8 sm:p-10">
              {children}
            </div>

            <p className="text-center mt-5">
              <Link to="/" className="text-sm text-surface-400 hover:text-primary-600 transition-colors">← Back to Home</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;