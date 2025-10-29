'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Chrome, Target, ArrowRight, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { signIn, signUp, signInWithGoogle } = useAuth();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password, displayName);
      } else {
        await signIn(email, password);
      }
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Orbs Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full bg-orb-green blur-3xl"
          style={{ top: '-10%', right: '-10%' }}
          animate={{
            y: [0, 50, 0],
            x: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full bg-orb-green blur-3xl"
          style={{ bottom: '-10%', left: '-10%' }}
          animate={{
            y: [0, -40, 0],
            x: [0, -20, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Auth Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <motion.div 
            className="flex items-center justify-center gap-3 mb-4"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-16 h-16 bg-gradient-green rounded-2xl flex items-center justify-center shadow-glow-lg">
              <Target className="w-9 h-9 text-black" />
            </div>
            <h1 className="text-4xl font-display font-black text-white">ReHabit</h1>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-4"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-semibold">
              {isSignUp ? 'Join 15K+ Users Building Better Habits' : 'Welcome Back'}
            </span>
          </motion.div>

          <p className="text-xl text-gray-400">
            {isSignUp ? 'Create your account and start your journey' : 'Continue building your habits'}
          </p>
        </div>

        {/* Auth Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-green-subtle rounded-3xl blur-xl opacity-50" />
          <div className="relative glass-dark rounded-3xl p-10 border-2 border-primary/30 shadow-glow">
            
            {/* Google Sign In Button - First */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-5 bg-white/5 backdrop-blur-xl border border-primary/20 text-white rounded-xl font-bold text-lg hover:bg-white/10 hover:border-primary/40 transition-all flex items-center justify-center gap-3 mb-6"
            >
              <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
                <Chrome className="w-5 h-5 text-black" />
              </div>
              Continue with Google
            </button>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-primary/20"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-6 bg-black text-gray-400 font-medium text-sm">Or continue with email</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleEmailAuth} className="space-y-5">
              {isSignUp && (
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-3">
                    Display Name
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full pl-20 pr-5 py-4 bg-dark-800/50 border border-primary/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:shadow-glow transition-all"
                      placeholder="John Doe"
                      required={isSignUp}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-3">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-20 pr-5 py-4 bg-dark-800/50 border border-primary/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:shadow-glow transition-all"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-3">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Lock className="w-5 h-5 text-primary" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-20 pr-5 py-4 bg-dark-800/50 border border-primary/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:shadow-glow transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/10 border border-red-500/30 text-red-400 px-5 py-4 rounded-xl text-sm font-medium flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-red-500 text-xl">!</span>
                  </div>
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-gradient-green text-black rounded-xl font-bold text-lg shadow-glow hover:shadow-glow-lg hover:scale-105 transition-all flex items-center justify-center gap-3 group"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-6 h-6 border-3 border-black border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    {isSignUp ? 'Create Account' : 'Sign In'}
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Toggle Sign Up/Sign In */}
            <div className="mt-8 text-center">
              <span className="text-gray-400">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                }}
                className="text-primary hover:text-primary-400 font-bold transition-colors"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Back to Home */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-8"
        >
          <button
            onClick={() => router.push('/')}
            className="text-gray-400 hover:text-primary transition-colors font-medium flex items-center gap-2 mx-auto group"
          >
            <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
