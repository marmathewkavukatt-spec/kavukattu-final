"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [captcha, setCaptcha] = useState("");
  const [captchaCode, setCaptchaCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [requiresCaptcha, setRequiresCaptcha] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  useEffect(() => {
    router.prefetch("/admin/dashboard");
  }, [router]);

  // Generate new CAPTCHA code when needed
  useEffect(() => {
    if (requiresCaptcha) {
      setCaptchaCode(Math.random().toString(36).substring(2, 8).toUpperCase());
    }
  }, [requiresCaptcha]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          password,
          captchaToken: requiresCaptcha ? captcha : undefined
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const responseText = await res.text();
      let data: any = null;
      try {
        data = responseText ? JSON.parse(responseText) : null;
      } catch {
        data = null;
      }
      
      if (!res.ok) {
        const message =
          data && typeof data === "object" && typeof data.error === "string"
            ? data.error
            : responseText || "Login failed";

        setError(message);
        
        // Update security state
        if (data && typeof data === "object") {
          if (data.requiresCaptcha !== undefined) {
            setRequiresCaptcha(Boolean(data.requiresCaptcha));
          }
          if (data.remainingAttempts !== undefined) {
            setRemainingAttempts(Number(data.remainingAttempts));
          }
          if (data.lockedUntil) {
            setLockedUntil(Number(data.lockedUntil));
          }
        }
        
        // Reset CAPTCHA on error
        if (requiresCaptcha) {
          setCaptcha("");
          setCaptchaCode(Math.random().toString(36).substring(2, 8).toUpperCase());
        }
        
        setLoading(false);
        return;
      }
      
      // Success - hard redirect to avoid spinner staying on screen
      window.location.replace("/admin/dashboard");
      
    } catch (err: unknown) {
      setLoading(false);
      
      if (err instanceof Error && err.name === 'AbortError') {
        setError("Request timeout. Please check your connection and try again.");
      } else {
        setError("Connection error. Please try again.");
      }
    }
  }

  const isLocked = Boolean(lockedUntil && Date.now() < lockedUntil);

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-100 px-4">
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 shadow-lg">
        <div className="text-center">
          <h1 className="font-serif text-[36px] sm:text-[40px] lg:text-[48px] font-bold text-stone-800">ADMIN PANEL</h1>
          <p className="mt-2 text-sm text-stone-600">Sign in to access the dashboard</p>
        </div>
        
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {error && (
            <div className="animate-shake rounded-xl bg-red-50 p-4 border border-red-200">
              <div className="flex items-start gap-3">
                <svg className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                  {remainingAttempts !== null && remainingAttempts > 0 && (
                    <p className="mt-1 text-xs text-red-600">
                      {remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} remaining
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {isLocked && (
            <div className="rounded-xl bg-yellow-50 p-4 border border-yellow-200">
              <div className="flex items-start gap-3">
                <svg className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p className="text-sm text-yellow-800">
                  Account temporarily locked. Please try again later.
                </p>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-semibold text-stone-700">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLocked || loading}
              autoComplete="email"
              className="w-full rounded-xl border-2 border-stone-200 bg-white px-4 py-3 text-stone-900 shadow-sm transition-all placeholder:text-stone-400 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="admin@example.com"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-semibold text-stone-700">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLocked || loading}
                autoComplete="current-password"
                className="w-full rounded-xl border-2 border-stone-200 bg-white px-4 py-3 pr-12 text-stone-900 shadow-sm transition-all placeholder:text-stone-400 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLocked || loading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          {requiresCaptcha && !isLocked && (
            <div className="space-y-2">
              <label htmlFor="captcha" className="block text-sm font-semibold text-stone-700">
                Security Verification
              </label>
              <div className="rounded-xl bg-blue-50 p-4 border border-blue-200">
                <p className="text-xs text-blue-800 mb-3">
                  Please enter the code below:
                </p>
                <div className="bg-white rounded-lg px-4 py-3 font-mono text-2xl font-bold text-center tracking-wider border-2 border-stone-300 select-none">
                  {captchaCode}
                </div>
              </div>
              <input
                id="captcha"
                type="text"
                value={captcha}
                onChange={(e) => setCaptcha(e.target.value.toUpperCase())}
                required={requiresCaptcha}
                disabled={loading}
                autoComplete="off"
                className="w-full rounded-xl border-2 border-stone-200 bg-white px-4 py-3 text-stone-900 shadow-sm transition-all placeholder:text-stone-400 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10 disabled:opacity-50"
                placeholder="Enter the code above"
              />
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading || isLocked}
            className="w-full rounded-xl bg-accent px-6 py-3 font-semibold text-white shadow-md transition-all hover:bg-accent/90 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Signing in...</span>
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-stone-600 hover:text-accent transition-colors">
            ← Back to site
          </Link>
        </div>
      </div>
    </div>
  );
}
