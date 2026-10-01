import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ThemeToggle from '../components/common/ThemeToggle';
import {
  HiOutlineAcademicCap, HiOutlineBuildingStorefront, HiOutlineShieldCheck,
  HiOutlineSparkles, HiOutlineBolt, HiOutlineSun, HiOutlineTicket,
} from 'react-icons/hi2';
import heroImg from '../assets/hero.png';

const features = [
  { icon: HiOutlineBolt, title: 'Fast Ordering', desc: 'Pre-order your favorites in seconds and skip the queue.' },
  { icon: HiOutlineSun, title: 'Fresh Food', desc: 'Freshly prepared meals, ready exactly when you arrive.' },
  { icon: HiOutlineTicket, title: 'Easy Pickup', desc: 'Scan your QR code for zero-wait, contactless pickup.' },
  { icon: HiOutlineShieldCheck, title: 'Secure Payments', desc: 'Safe checkout with clear pricing and order tracking.' },
];

const roleCards = [
  {
    icon: HiOutlineAcademicCap,
    title: 'Student',
    desc: 'Browse the menu, place pre-orders, and scan your QR code at pickup.',
    login: '/student/login',
    register: '/student/register',
    registerLabel: 'Create Account →',
    accent: 'bg-gradient-to-tr from-primary-500 to-primary-600 shadow-primary-500/30',
    hoverBorder: 'hover:border-primary-300',
  },
  {
    icon: HiOutlineBuildingStorefront,
    title: 'Vendor',
    desc: 'Manage your canteen shop, toggle availability, and fulfill orders in real time.',
    login: '/vendor/login',
    register: '/vendor/register',
    registerLabel: 'Register Shop →',
    accent: 'bg-gradient-to-tr from-accent-500 to-accent-600 shadow-accent-500/30',
    hoverBorder: 'hover:border-accent-300',
  },
  {
    icon: HiOutlineShieldCheck,
    title: 'Admin',
    desc: 'Approve vendors, manage categories, and track sales with detailed reports.',
    login: '/admin/login',
    accent: 'bg-gradient-to-tr from-primary-500 to-primary-800 shadow-primary-500/30',
    hoverBorder: 'hover:border-primary-300',
  },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-hero-warm dark:bg-surface-950 relative overflow-hidden selection:bg-primary-500 selection:text-white">
      {/* Soft decorative shapes */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-peach opacity-70 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-32 w-[480px] h-[480px] rounded-full bg-[#FBE0D3] opacity-60 blur-3xl pointer-events-none animate-float-slow" />
      <div className="absolute bottom-0 left-1/4 w-72 h-72 rounded-full bg-gold/20 blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-6 md:px-12 py-6 max-w-7xl mx-auto w-full">
        <Link to="/" className="flex items-center gap-3">
          <span className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary-500 to-accent-500 flex items-center justify-center text-2xl shadow-coral">🍽️</span>
          <h2 className="font-display font-extrabold text-2xl tracking-tight text-surface-900 dark:text-white">
            Campus <span className="gradient-text">Canteen</span>
          </h2>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link to="/student/menu" className="btn-primary !px-5 !py-2.5 text-xs font-bold">
            Explore Menu
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-10 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Copy */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-surface-900/70 backdrop-blur border border-[#F0DDD3] dark:border-surface-700 text-primary-600 dark:text-primary-400 text-xs font-bold mb-7 shadow-soft"
            >
              <HiOutlineSparkles className="w-4 h-4 text-accent-500" />
              Smart Food Pre-Ordering Platform
            </motion.div>

            <h1 className="font-display text-5xl sm:text-6xl font-extrabold text-surface-900 dark:text-white mb-5 leading-[1.1] tracking-tight">
              Good Food.
              <span className="block gradient-text">Great Taste.</span>
              <span className="block">Made for Campus.</span>
            </h1>

            <p className="text-lg text-surface-600 dark:text-surface-400 mb-9 max-w-xl leading-relaxed">
              Order your favorite canteen meals in advance, watch them being prepared live,
              and scan your QR code for a zero-wait pickup. Fresh, fast, and made for your campus.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/student/register" className="btn-primary !px-8 !py-4">
                Start Ordering
              </Link>
              <Link to="/student/login" className="btn-secondary !px-8 !py-4">
                Student Login
              </Link>
            </div>

            {/* Mini stats */}
            <div className="flex gap-8 mt-12">
              {[
                { value: '4+', label: 'Campus Outlets' },
                { value: '50+', label: 'Food Items' },
                { value: '100%', label: 'Pre-Ordered Fresh' },
              ].map(s => (
                <div key={s.label}>
                  <p className="font-display text-2xl font-extrabold text-primary-600 dark:text-primary-400">{s.value}</p>
                  <p className="text-xs font-semibold text-surface-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Hero image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-tr from-primary-200/60 via-peach to-accent-200/60 blur-2xl -z-0" />
            <div className="relative rounded-[2rem] overflow-hidden border-8 border-white dark:border-surface-800 shadow-soft-lg">
              <img src={heroImg} alt="Delicious food prepared at the campus canteen" className="w-full h-[420px] lg:h-[480px] object-cover" />
            </div>
            {/* Floating badge */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="absolute -bottom-5 left-6 bg-white dark:bg-surface-900 rounded-2xl px-5 py-4 shadow-soft-lg border border-[#F0DDD3] dark:border-surface-700 flex items-center gap-3"
            >
              <span className="w-10 h-10 rounded-full bg-success-500/15 text-success-600 dark:text-success-400 flex items-center justify-center text-xl">✓</span>
              <div>
                <p className="font-bold text-sm text-surface-900 dark:text-white">Zero-Wait Pickup</p>
                <p className="text-xs text-surface-500">Scan & grab your meal</p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-24"
        >
          {features.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              className="glass-hover p-6"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${i % 2 === 0 ? 'bg-primary-500/12 text-primary-500' : 'bg-accent-500/12 text-accent-600'}`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-1.5">{title}</h3>
              <p className="text-sm text-surface-500 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Portal selector */}
        <div className="mt-20">
          <h2 className="font-display text-3xl font-extrabold text-surface-900 dark:text-white text-center mb-2">
            Choose Your <span className="gradient-text">Portal</span>
          </h2>
          <p className="text-surface-500 text-center mb-10">One platform for everyone on campus</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {roleCards.map(({ icon: Icon, title, desc, login, register, registerLabel, accent, hoverBorder }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                className={`glass p-7 flex flex-col justify-between h-full border transition-all duration-300 hover:shadow-soft-lg ${hoverBorder}`}
              >
                <div>
                  <div className={`w-14 h-14 rounded-2xl ${accent} flex items-center justify-center mb-5 shadow-lg`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-display font-extrabold text-surface-900 dark:text-white text-xl mb-1.5">{title}</h3>
                  <p className="text-sm text-surface-500 leading-relaxed mb-6">{desc}</p>
                </div>
                <div className="space-y-2.5 pt-4 border-t border-[#F0DDD3] dark:border-surface-700">
                  <Link to={login} className="btn-primary w-full text-xs font-bold">
                    {title} Login
                  </Link>
                  {register && (
                    <Link to={register} className="block text-center text-xs font-semibold text-surface-500 hover:text-primary-600 py-1 transition-colors">
                      {registerLabel}
                    </Link>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-surface-400 dark:text-surface-500 text-xs border-t border-[#F0DDD3] dark:border-surface-700/70 bg-white/60 dark:bg-surface-950/60 backdrop-blur">
        <p>© 2026 Campus Canteen Pre-Ordering System • Warm, Fresh & Made for Campus</p>
      </footer>
    </div>
  );
};

export default Landing;