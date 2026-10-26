import { useEffect, useRef, useState } from 'react';

export type SignedInUser = { id: string; email: string; name: string; picture?: string; role: 'user' | 'admin' };
declare global { interface Window { google?: any } }

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || import.meta.env.VITE_googleId || import.meta.env.VITE_GOOGLE_ID;

export function AuthScreen({ role, onSignedIn }: { role: 'user' | 'admin'; onSignedIn: (user: SignedInUser) => void }) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState('');

  const startGoogleRedirect = () => {
    const returnTo = `${window.location.origin}${role === 'user' ? '/user/' : '/'}`;
    window.location.assign(`/api/auth/google/start?role=${role}&returnTo=${encodeURIComponent(returnTo)}`);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authError = params.get('authError');
    if (!authError) return;
    setError(authError);
    params.delete('authError');
    const query = params.toString();
    window.history.replaceState({}, '', `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`);
  }, []);

  useEffect(() => {
    let active = true;
    const renderButton = () => {
      if (!googleClientId || !window.google || !buttonRef.current || !active) return;
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async ({ credential }: { credential: string }) => {
          try {
            const response = await fetch('/api/auth/google', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ credential, role }),
            });
            const body = await response.json();
            if (!response.ok) throw new Error(body.error || 'Google sign-in failed');
            if (body.user.role !== role) throw new Error(role === 'admin' ? 'บัญชีนี้ไม่มีสิทธิ์ Admin' : 'กรุณาใช้หน้าเข้าสู่ระบบ User');
            onSignedIn(body.user);
          } catch (reason) {
            setError(reason instanceof Error ? reason.message : 'Google sign-in failed');
          }
        },
      });
      window.google.accounts.id.renderButton(buttonRef.current, { theme: 'outline', size: 'large', shape: 'pill', text: 'continue_with', width: 300 });
    };
    if (window.google) renderButton();
    else {
      let script = document.querySelector<HTMLScriptElement>('script[data-google-identity]');
      if (!script) {
        script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.dataset.googleIdentity = 'true';
        document.head.append(script);
      }
      script.addEventListener('load', renderButton);
    }
    return () => { active = false; };
  }, [role, onSignedIn]);

  return <main className="min-h-screen grid place-items-center bg-slate-50 px-4"><section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm"><div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-sky-50 text-2xl">💧</div><h1 className="text-2xl font-bold text-slate-900">Fresh Drink {role === 'admin' ? 'Admin' : ''}</h1><p className="mt-2 text-sm text-slate-500">เข้าสู่ระบบด้วย Google เพื่อใช้งานระบบ</p><div className="mt-7 flex justify-center" ref={buttonRef}/><button type="button" onClick={startGoogleRedirect} className="mt-4 w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">Continue with Google</button>{!googleClientId && <p className="mt-4 text-sm text-amber-700">กรุณาตั้งค่า VITE_GOOGLE_CLIENT_ID และ OAuth ฝั่งเซิร์ฟเวอร์ใน .env</p>}{error && <p role="alert" className="mt-4 text-sm text-rose-600">{error}</p>}</section></main>;
}
