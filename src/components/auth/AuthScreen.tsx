import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Sparkles } from 'lucide-react';

export function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp, signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!displayName.trim()) {
          setError('Please enter your name');
          return;
        }
        await signUp(email, password, displayName);
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#2A5ACA] rounded-full mb-4">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-[#1A1A2A] mb-2">NewU</h1>
          <p className="text-lg text-[#6A7A9A]">Become Someone New</p>
          <p className="text-sm text-[#6A7A9A] mt-2">
            The strength you need is already inside you.
            <br />
            NewU helps you find it.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm p-8">
          <div className="flex mb-6 bg-[#F8F9FC] rounded-xl p-1">
            <button
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                isSignUp
                  ? 'bg-white text-[#2A5ACA] shadow-sm'
                  : 'text-[#6A7A9A]'
              }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                !isSignUp
                  ? 'bg-white text-[#2A5ACA] shadow-sm'
                  : 'text-[#6A7A9A]'
              }`}
            >
              Sign In
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-[#1A1A2A] mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F8F9FC] border-2 border-transparent rounded-xl focus:outline-none focus:border-[#2A5ACA] transition-colors"
                  placeholder="Enter your name"
                  required={isSignUp}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#1A1A2A] mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#F8F9FC] border-2 border-transparent rounded-xl focus:outline-none focus:border-[#2A5ACA] transition-colors"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A1A2A] mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#F8F9FC] border-2 border-transparent rounded-xl focus:outline-none focus:border-[#2A5ACA] transition-colors"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#2A5ACA] text-white font-semibold rounded-xl hover:bg-[#1f4ba3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Please wait...' : isSignUp ? 'Begin Your Journey' : 'Welcome Back'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#6A7A9A] mt-6">
          Your journey to freedom starts here
        </p>
      </div>
    </div>
  );
}
