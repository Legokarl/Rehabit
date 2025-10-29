'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowRight, Target, TrendingUp, Users, Zap, Check, Star, Award, Clock, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Home() {
  const router = useRouter();
  const [selectedTier, setSelectedTier] = useState('silver');
  const [countdown, setCountdown] = useState({ days: 3, hours: 12, minutes: 53, seconds: 58 });

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        let { days, hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;
            if (hours > 0) {
              hours--;
            } else {
              hours = 23;
              if (days > 0) {
                days--;
              }
            }
          }
        }
        
        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const pricingTiers = [
    {
      name: 'Copper',
      price: 0,
      features: ['5 habits max', '10 XP per habit', 'Basic stats', 'Community access'],
      color: 'from-orange-600 to-orange-700',
      popular: false,
    },
    {
      name: 'Bronze',
      price: 9,
      features: ['15 habits max', '15 XP per habit', 'Advanced stats', 'Priority support', 'Custom themes'],
      color: 'from-amber-600 to-amber-700',
      popular: false,
    },
    {
      name: 'Silver',
      price: 19,
      features: ['50 habits max', '20 XP per habit', 'AI insights', 'Group challenges', 'Export data', 'Ad-free'],
      color: 'from-gray-400 to-gray-500',
      popular: true,
    },
    {
      name: 'Gold',
      price: 39,
      features: ['Unlimited habits', '25 XP per habit', 'Personal coach', 'All features', 'Lifetime updates', 'VIP badge'],
      color: 'from-yellow-400 to-yellow-500',
      popular: false,
    },
  ];

  const stats = [
    { value: '15K+', label: 'Active Users', icon: Users },
    { value: '100K+', label: 'Habits Completed', icon: Target },
    { value: '$50K+', label: 'XP Earned', icon: Award },
    { value: '24/7', label: 'Support', icon: Clock },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Navigation */}
      <nav className="relative z-50 backdrop-blur-xl bg-black/30 border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-green rounded-2xl flex items-center justify-center shadow-glow">
                <Target className="w-7 h-7 text-black" />
              </div>
              <span className="text-3xl font-display font-black text-white tracking-tight">ReHabit</span>
            </div>

            <div className="hidden md:flex items-center gap-10">
              <a href="#features" className="text-gray-300 hover:text-primary transition-colors font-medium">
                Features
              </a>
              <a href="#pricing" className="text-gray-300 hover:text-primary transition-colors font-medium">
                Pricing
              </a>
              <a href="#stats" className="text-gray-300 hover:text-primary transition-colors font-medium">
                Stats
              </a>
              <button
                onClick={() => router.push('/auth')}
                className="text-gray-300 hover:text-primary transition-colors font-medium"
              >
                Login
              </button>
            </div>

            <button
              onClick={() => router.push('/auth')}
              className="btn-primary flex items-center gap-2 shadow-glow"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10">
        <section className="max-w-7xl mx-auto px-6 pt-24 pb-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Text */}
        <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-8"
          >
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm text-primary font-semibold">Stop Losing Progress, Start Winning</span>
          </motion.div>

              <h1 className="text-7xl md:text-8xl font-display font-black mb-8 leading-none">
                <span className="text-white">Start</span>
            <br />
                <span className="text-gradient-green">earning</span>
              </h1>

              <p className="text-xl text-gray-400 mb-10 max-w-xl leading-relaxed">
                Stop losing your own progress, join us and start building better habits! Track, level up, and conquer your goals.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => router.push('/auth')}
                  className="group px-10 py-5 bg-gradient-green text-black rounded-2xl font-bold text-lg shadow-glow hover:shadow-glow-lg transition-all hover:scale-105 flex items-center justify-center gap-3"
                >
                  Join Us
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-10 py-5 bg-white/5 backdrop-blur-xl border border-primary/20 text-white rounded-2xl font-bold text-lg hover:bg-white/10 hover:border-primary/40 transition-all"
                >
                  See Pricing
                </button>
              </div>
            </motion.div>

            {/* Right Column - 3D Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="relative"
            >
              <div className="relative">
                {/* Rotating Orb */}
          <motion.div
                  className="w-96 h-96 mx-auto relative"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                >
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 via-primary/20 to-transparent blur-3xl" />
                  <div className="absolute inset-8 rounded-full bg-gradient-to-br from-primary/40 via-primary/30 to-transparent blur-2xl" />
                  <div className="absolute inset-16 rounded-full bg-gradient-to-br from-primary/50 to-primary/20 shadow-glow-lg" />
                </motion.div>

                {/* Floating Stats Cards */}
                <motion.div
                  className="absolute top-10 -right-10 glass-dark rounded-2xl p-4 border border-primary/30"
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-green flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Your XP</div>
                      <div className="text-2xl font-bold text-primary">+250</div>
                    </div>
                </div>
          </motion.div>

                <motion.div
                  className="absolute bottom-20 -left-10 glass-dark rounded-2xl p-4 border border-primary/30"
                  animate={{ y: [0, 15, 0] }}
                  transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-green flex items-center justify-center">
                      <Target className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Level</div>
                      <div className="text-2xl font-bold text-primary">15</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Countdown Section */}
        <section className="max-w-5xl mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
            <div className="absolute inset-0 bg-orb-green blur-3xl opacity-20" />
            <div className="relative backdrop-blur-xl bg-black/40 border border-primary/20 p-12 text-center">
              <h2 className="text-4xl font-display font-bold mb-8 text-white">
                Special Launch Offer Ending In:
              </h2>
              <div className="grid grid-cols-4 gap-6 max-w-2xl mx-auto mb-8">
                {[
                  { value: countdown.days, label: 'DAYS' },
                  { value: countdown.hours, label: 'HOURS' },
                  { value: countdown.minutes, label: 'MINUTES' },
                  { value: countdown.seconds, label: 'SECONDS' },
                ].map((item, index) => (
                  <div key={index} className="glass-dark rounded-2xl p-6 border border-primary/30">
                    <div className="text-5xl font-black text-gradient-green mb-2">
                      {String(item.value).padStart(2, '0')}
                    </div>
                    <div className="text-sm text-gray-400 font-semibold tracking-wider">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push('/auth')}
                  className="px-8 py-4 bg-gradient-green text-black rounded-xl font-bold shadow-glow hover:shadow-glow-lg transition-all"
            >
                  Try for free
            </button>
            <button
              onClick={() => router.push('/auth')}
                  className="px-8 py-4 bg-white/5 backdrop-blur-xl border border-primary/20 text-white rounded-xl font-bold hover:bg-white/10 transition-all"
            >
                  I want to join
            </button>
              </div>
            </div>
          </motion.div>
        </section>

        {/* How It Works Section */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-display font-black mb-4 text-white">
              How does it <span className="text-gradient-green">work?</span>
            </h2>
            <p className="text-xl text-gray-400">Your pathway to building better habits</p>
        </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: 1,
                title: 'Create Habits',
                description: 'Choose habits that suit your goals. Simply create your habit and start tracking your progress.',
                icon: Target,
              },
              {
                step: 2,
                title: 'Track Progress',
                description: 'Complete habits daily to build streaks. Earn XP with every completion and level up.',
                icon: TrendingUp,
              },
              {
                step: 3,
                title: 'Join Community',
                description: 'Connect with others, share achievements, and stay motivated together in groups.',
                icon: Users,
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-green-subtle rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative glass-dark rounded-3xl p-8 border border-primary/20 hover:border-primary/40 transition-all h-full">
                  <div className="text-sm font-bold text-primary mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                      STEP {item.step}
                    </div>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-green flex items-center justify-center mb-6 shadow-glow">
                    <item.icon className="w-8 h-8 text-black" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white">{item.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="max-w-7xl mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-display font-black mb-4 text-white">
              Best prices in <span className="text-gradient-green">habit tracking!</span>
            </h2>
            <p className="text-xl text-gray-400">Choose your plan and account size.</p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {pricingTiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative group ${tier.popular ? 'md:scale-105' : ''}`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-green text-black text-sm font-bold rounded-full shadow-glow z-10">
                    MOST POPULAR
                  </div>
                )}
                <div
                  className={`relative glass-dark rounded-3xl p-6 border ${
                    tier.popular ? 'border-primary/50 shadow-glow' : 'border-primary/20'
                  } hover:border-primary/40 transition-all h-full`}
                >
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold mb-2 text-white">{tier.name}</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-black text-gradient-green">${tier.price}</span>
                      <span className="text-gray-400">/month</span>
                    </div>
                  </div>

                  <button
                    onClick={() => router.push('/auth')}
                    className={`w-full py-4 rounded-xl font-bold mb-6 transition-all ${
                      tier.popular
                        ? 'bg-gradient-green text-black shadow-glow hover:shadow-glow-lg'
                        : 'bg-white/5 text-white border border-primary/20 hover:bg-white/10'
                    }`}
                  >
                    Get Started
                  </button>

                  <div className="space-y-3">
                    {tier.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section id="stats" className="max-w-7xl mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-dark rounded-3xl p-12 border border-primary/20"
          >
            <div className="grid md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-green flex items-center justify-center shadow-glow">
                    <stat.icon className="w-8 h-8 text-black" />
                  </div>
                  <div className="text-5xl font-black text-gradient-green mb-2">{stat.value}</div>
                  <div className="text-gray-400 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Features Grid */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: 'No Time Limit Progress',
                description: 'Users have the freedom to reach their goals without the pressure of strict time constraints. Build habits at your own pace.',
                icon: Clock,
              },
              {
                title: 'Fast Progress',
                description: 'Prove to us you have the ability, and we will help you level up faster, increase your XP, or give you bonus rewards!',
                icon: Zap,
              },
              {
                title: 'Unique Programs',
                description: 'You are guaranteed satisfaction with us - we want our users to succeed and be one step ahead.',
                icon: Star,
              },
              {
                title: 'Modern Platform',
                description: 'We offer a new modern platform based on real-time updates and connected directly to your progress. Simple and clear.',
                icon: Award,
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-dark rounded-3xl p-8 border border-primary/20 hover:border-primary/40 transition-all group"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-green flex items-center justify-center mb-4 shadow-glow group-hover:shadow-glow-lg transition-all">
                  <feature.icon className="w-7 h-7 text-black" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-white">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="max-w-5xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-green opacity-10" />
            <div className="relative glass-dark border-2 border-primary/30 p-16 text-center">
              <h2 className="text-5xl font-display font-black mb-6 text-white">
                Ready to <span className="text-gradient-green">Start?</span>
          </h2>
              <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                Users from more than 150 countries around the world have joined! Don&apos;t miss out.
          </p>
          <button
            onClick={() => router.push('/auth')}
                className="px-12 py-5 bg-gradient-green text-black rounded-2xl font-bold text-lg shadow-glow-lg hover:scale-105 transition-all"
          >
                Join Now - It&apos;s Free!
          </button>
            </div>
        </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-primary/10 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-green rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-black" />
              </div>
              <span className="text-2xl font-display font-bold">ReHabit</span>
            </div>
            <p className="text-gray-500 text-sm">
              © 2025 ReHabit. Build better habits, achieve your goals.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
