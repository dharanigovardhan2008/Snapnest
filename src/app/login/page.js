'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { validateEmail, validateMobile, validatePassword } from '../../utils/validators';
import toast from 'react-hot-toast';

// Google SVG Icon
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
      <path fill="#4285F4" d="M -3.264,51.509 C -3.264,50.719 -3.334,49.969 -3.454,49.239 L -14.754,49.239 L -14.754,53.749 L -8.284,53.749 C -8.574,55.229 -9.424,56.479 -10.684,57.329 L -10.684,60.329 L -6.824,60.329 C -4.564,58.239 -3.264,55.159 -3.264,51.509 z"/>
      <path fill="#34A853" d="M -14.754,63.239 C -11.514,63.239 -8.804,62.159 -6.824,60.329 L -10.684,57.329 C -11.764,58.049 -13.134,58.489 -14.754,58.489 C -17.884,58.489 -20.534,56.379 -21.484,53.529 L -25.464,53.529 L -25.464,56.619 C -23.494,60.539 -19.444,63.239 -14.754,63.239 z"/>
      <path fill="#FBBC05" d="M -21.484,53.529 C -21.734,52.809 -21.864,52.039 -21.864,51.239 C -21.864,50.439 -21.724,49.669 -21.484,48.949 L -21.484,45.859 L -25.464,45.859 C -26.284,47.479 -26.754,49.299 -26.754,51.239 C -26.754,53.179 -26.284,54.999 -25.464,56.619 L -21.484,53.529 z"/>
      <path fill="#EA4335" d="M -14.754,43.989 C -12.984,43.989 -11.404,44.599 -10.154,45.789 L -6.734,41.939 C -8.804,40.009 -11.514,38.989 -14.754,38.989 C -19.444,38.989 -23.494,41.689 -25.464,45.859 L -21.484,48.949 C -20.534,46.099 -17.884,43.989 -14.754,43.989 z"/>
    </g>
  </svg>
);

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    mobile: '',
  });
  const [errors, setErrors] = useState({});

  const authContext = useAuth();
  const { user, isAdmin } = authContext;
  const signInFn = authContext.signIn || authContext.login;
  const signUpFn = authContext.signUp || authContext.register;
  
  const router = useRouter();

  useEffect(() => {
    if (user) {
      if (isAdmin) {
        router.push('/admin');
      } else {
        router.push('/my-orders');
      }
    }
  }, [user, isAdmin, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.message;
    }

    if (!isLogin) {
      if (!formData.name.trim()) {
        newErrors.name = 'Name is required';
      }

      if (!validateMobile(formData.mobile)) {
        newErrors.mobile = 'Invalid mobile number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!validate()) {
      toast.error('Please fix the errors in the form.', { icon: '⚠️' });
      return;
    }
    
    if (!signInFn || !signUpFn) {
      toast.error('Authentication functions missing in context.');
      console.error('Auth context is missing signIn/login or signUp/register functions:', authContext);
      return;
    }

    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await signInFn(formData.email, formData.password);
      } else {
        result = await signUpFn(
          formData.email,
          formData.password,
          formData.name,
          formData.mobile
        );
      }

      if (result && result.success) {
        toast.success(isLogin ? 'Welcome back!' : 'Account created successfully!');
      } else if (result && result.error) {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Auth Exception:", error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setFormData({ email: '', password: '', name: '', mobile: '' });
  };

  const handleGoogleSignIn = () => {
    toast("Google Auth UI is ready! Update Firebase Provider in context.", { icon: 'ℹ️' });
  };

  return (
    <main className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-[#FFFFFF] font-[family-name:var(--font-geist)] selection:bg-[#2563EB]/10 selection:text-[#0F172A]">
      
      {/* LEFT COLUMN: Form Area */}
      <div className="flex flex-col px-6 sm:px-12 lg:px-24 xl:px-32 py-8 h-screen overflow-y-auto custom-scrollbar">
        
        {/* Navigation / Back */}
        <div className="mb-10 pt-4 flex items-center justify-between">
          <Link href="/" className="inline-flex w-12 h-12 rounded-full border border-[#E2E8F0] items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <span className="text-[14px] font-medium text-[#94A3B8]">Secure Gateway</span>
        </div>

        <motion.div
          key={isLogin ? 'login' : 'signup'}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md mx-auto mt-4 pb-20"
        >
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl md:text-[42px] font-bold tracking-tight text-[#0F172A] mb-3 font-[family-name:var(--font-outfit)]">
              {isLogin ? 'Welcome back.' : 'Join the studio.'}
            </h1>
            <p className="text-[17px] text-[#64748B] font-light">
              {isLogin
                ? 'Sign in to access your gallery and orders.'
                : 'Create an account to start printing your memories.'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="relative flex items-center">
                    <User className="absolute left-5 text-[#94A3B8]" size={20} />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full bg-[#F8FAFC] border ${errors.name ? 'border-rose-300 bg-rose-50' : 'border-[#E2E8F0]'} focus:border-[#0F172A] focus:ring-4 focus:ring-[#0F172A]/5 focus:bg-white rounded-full py-4 pl-14 pr-5 text-[#0F172A] transition-all outline-none placeholder:text-[#94A3B8] text-[15px] font-medium`}
                      placeholder="Full Name"
                    />
                  </div>
                  {errors.name && <p className="text-rose-500 text-[13px] mt-2 pl-5 font-medium">{errors.name}</p>}
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <div className="relative flex items-center">
                <Mail className="absolute left-5 text-[#94A3B8]" size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full bg-[#F8FAFC] border ${errors.email ? 'border-rose-300 bg-rose-50' : 'border-[#E2E8F0]'} focus:border-[#0F172A] focus:ring-4 focus:ring-[#0F172A]/5 focus:bg-white rounded-full py-4 pl-14 pr-5 text-[#0F172A] transition-all outline-none placeholder:text-[#94A3B8] text-[15px] font-medium`}
                  placeholder="Email Address"
                />
              </div>
              {errors.email && <p className="text-rose-500 text-[13px] mt-2 pl-5 font-medium">{errors.email}</p>}
            </div>

            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="relative flex items-center">
                    <Phone className="absolute left-5 text-[#94A3B8]" size={20} />
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      className={`w-full bg-[#F8FAFC] border ${errors.mobile ? 'border-rose-300 bg-rose-50' : 'border-[#E2E8F0]'} focus:border-[#0F172A] focus:ring-4 focus:ring-[#0F172A]/5 focus:bg-white rounded-full py-4 pl-14 pr-5 text-[#0F172A] transition-all outline-none placeholder:text-[#94A3B8] text-[15px] font-medium`}
                      placeholder="Mobile Number"
                    />
                  </div>
                  {errors.mobile && <p className="text-rose-500 text-[13px] mt-2 pl-5 font-medium">{errors.mobile}</p>}
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <div className="relative flex items-center">
                <Lock className="absolute left-5 text-[#94A3B8]" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full bg-[#F8FAFC] border ${errors.password ? 'border-rose-300 bg-rose-50' : 'border-[#E2E8F0]'} focus:border-[#0F172A] focus:ring-4 focus:ring-[#0F172A]/5 focus:bg-white rounded-full py-4 pl-14 pr-12 text-[#0F172A] transition-all outline-none placeholder:text-[#94A3B8] text-[15px] font-medium`}
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 text-[#94A3B8] hover:text-[#0F172A] transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <p className="text-rose-500 text-[13px] mt-2 pl-5 font-medium">{errors.password}</p>}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-[#0F172A] hover:bg-[#2563EB] text-white rounded-full h-[56px] font-medium text-[16px] transition-all duration-300 hover:shadow-[0_8px_20px_-6px_rgba(37,99,235,0.5)] active:scale-[0.98] flex items-center justify-center cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : isLogin ? (
                  'Sign In'
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>

          {/* Separator */}
          <div className="flex items-center gap-4 my-8">
            <div className="h-px bg-[#E2E8F0] flex-1" />
            <span className="text-[12px] font-medium text-[#94A3B8] uppercase tracking-widest">Or continue with</span>
            <div className="h-px bg-[#E2E8F0] flex-1" />
          </div>

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#0F172A] rounded-full h-[56px] font-medium text-[16px] transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-sm"
          >
            <GoogleIcon />
            Google
          </button>

          {/* Toggle Mode */}
          <div className="text-center mt-10 pb-12">
            <p className="text-[#64748B] text-[15px]">
              {isLogin ? "Don't have an account?" : 'Already part of the studio?'}
              <button
                type="button"
                onClick={toggleMode}
                className="ml-2 text-[#0F172A] font-semibold hover:text-[#2563EB] transition-colors"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </motion.div>
      </div>

      {/* RIGHT COLUMN: The "Tossed Stack" Visual (Desktop Only) */}
      <div className="hidden lg:flex w-full h-screen sticky top-0 bg-[#F8FAFC] items-center justify-center overflow-hidden border-l border-[#F1F5F9]">
        
        {/* Subtle radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#E0E7FF]/40 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative w-[460px] h-[550px]">
          
          {/* Back Left Polaroid */}
          <motion.div 
            initial={{ opacity: 0, rotate: -30, x: -80, y: 80 }}
            animate={{ opacity: 1, rotate: -15, x: 0, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-8 left-4 w-48 bg-white p-3 pb-12 shadow-[0_10px_30px_rgba(0,0,0,0.06)] rounded-[16px] border border-[#F1F5F9]"
          >
            <div className="w-full aspect-square bg-[#F8FAFC] rounded-[8px] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-300/30 to-indigo-400/30" />
            </div>
          </motion.div>

          {/* Bottom Right Polaroid */}
          <motion.div 
            initial={{ opacity: 0, rotate: 30, x: 80, y: 80 }}
            animate={{ opacity: 1, rotate: 12, x: 0, y: 0 }}
            transition={{ duration: 1.2, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-12 right-0 w-56 bg-white p-3 pb-14 shadow-[0_10px_30px_rgba(0,0,0,0.06)] rounded-[16px] border border-[#F1F5F9] z-10"
          >
            <div className="w-full aspect-square bg-[#F8FAFC] rounded-[8px] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-bl from-rose-300/30 to-orange-200/30" />
            </div>
          </motion.div>

          {/* Center Main Polaroid */}
          <motion.div 
            initial={{ opacity: 0, y: 150, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] bg-white p-4 pb-20 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.12)] rounded-[20px] border border-[#F1F5F9] z-20"
          >
            <div className="w-full aspect-square bg-[#F8FAFC] rounded-[10px] relative overflow-hidden border border-[#E2E8F0]/30">
               <div className="absolute inset-0 bg-gradient-to-tr from-[#2563EB]/20 to-cyan-300/30" />
               <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />
            </div>
            <div className="absolute bottom-7 left-0 w-full text-center font-[family-name:var(--font-outfit)] text-[#64748B] text-[15px] font-medium">
              Your masterpiece
            </div>
          </motion.div>
        </div>
      </div>

    </main>
  );
}