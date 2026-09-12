import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Mail, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import AuthBrandPanel from '../components/AuthBrandPanel';

const Register = () => {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
      toast.success('Registration successful! Welcome to ProjectPulse.');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fbfafb] font-sans">
      <div className="grid min-h-screen w-full overflow-hidden bg-[#fbfafb] lg:grid-cols-[1fr_1.02fr]">
        <AuthBrandPanel />

        <section className="flex flex-col justify-center px-7 py-12 sm:px-14 lg:px-20">
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#923b5b] to-[#652d59] text-2xl font-bold text-white shadow-lg shadow-[#923b5b]/20">P</div>
              <h2 className="mt-6 text-3xl font-medium tracking-tight text-[#302b32]">Create Account</h2>
              <p className="mt-2 text-sm text-[#716b73]">Join your team in ProjectPulse</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#716b73]">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-[#817b82]" />
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Jordan Miller" required className="w-full border border-[#ddd8dd] bg-white px-10 py-3 text-sm text-[#302b32] outline-none transition placeholder:text-[#aaa4aa] focus:border-[#923b5b] focus:ring-2 focus:ring-[#923b5b]/15" />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[#716b73]">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-[#817b82]" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" required className="w-full border border-[#ddd8dd] bg-white px-10 py-3 text-sm text-[#302b32] outline-none transition placeholder:text-[#aaa4aa] focus:border-[#923b5b] focus:ring-2 focus:ring-[#923b5b]/15" />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[#716b73]">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-[#817b82]" />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 6 characters" required className="w-full border border-[#ddd8dd] bg-white px-10 py-3 text-sm text-[#302b32] outline-none transition placeholder:text-[#aaa4aa] focus:border-[#923b5b] focus:ring-2 focus:ring-[#923b5b]/15" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 bg-gradient-to-r from-[#923b5b] to-[#652d59] px-4 py-3 text-sm font-semibold text-white shadow-md shadow-[#923b5b]/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? 'Creating account...' : 'Sign Up'}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>

            <div className="mt-7 text-center text-sm text-[#716b73]">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-[#923b5b] hover:underline">Log in</Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Register;
