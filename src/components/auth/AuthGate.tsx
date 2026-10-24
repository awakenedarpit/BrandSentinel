import React, { FormEvent, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [signup, setSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [workspaceReady, setWorkspaceReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (alive) { setSession(data.session); setLoading(false); }
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setWorkspaceReady(false);
    });
    return () => { alive = false; data.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!session) { setWorkspaceReady(false); return; }
    let alive = true;
    (async () => {
      const { data, error: err } = await (supabase as any).from('company_memberships')
        .select('company_id').eq('user_id', session.user.id).limit(1).maybeSingle();
      if (!alive) return;
      if (err) {
        console.error('[BrandSentinel] Workspace membership check failed:', err.message);
        setError(err.message.includes('company_memberships') || err.code === 'PGRST205'
          ? 'Workspace database setup is missing. Apply supabase/migrations/202610240001_company_workspaces.sql to the Supabase project configured for this app, then reload.'
          : 'Could not check workspace access: ' + err.message);
        setLoading(false);
        return;
      }
      if (data) setWorkspaceReady(true);
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [session]);

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setBusy(true); setError(''); setNotice('');
    try {
      if (signup) {
        const { data, error: err } = await supabase.auth.signUp({
          email: email.trim(), password,
          options: { data: { full_name: name.trim() } }
        });
        if (err) throw err;
        if (!data.session) setNotice('Account created. Check your email to verify it, then sign in.');
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (err) throw err;
      }
    } catch (err) { setError(err instanceof Error ? err.message : 'Authentication failed.'); }
    finally { setBusy(false); }
  };

  const createWorkspace = async (e: FormEvent) => {
    e.preventDefault(); setBusy(true); setError('');
    try {
      const { error: err } = await (supabase as any).rpc('create_company_workspace', { company_name: company.trim() });
      if (err) throw err;
      setWorkspaceReady(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not create workspace.';
      console.error('[BrandSentinel] Workspace creation failed:', message);
      setError(message.includes('create_company_workspace') || message.includes('schema cache')
        ? 'The workspace database function is missing. Apply supabase/migrations/202610240001_company_workspaces.sql to the Supabase project configured for this app, then reload.'
        : message);
    }
    finally { setBusy(false); }
  };

  if (!isSupabaseConfigured()) return <div className="min-h-screen grid place-items-center bg-slate-50 p-6"><div className="max-w-lg rounded-2xl bg-white p-8 shadow-xl"><h1 className="text-2xl font-bold">Connect Supabase Auth</h1><p className="mt-3 text-slate-600">Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then apply the workspace migration. Authentication fails closed until configured.</p></div></div>;
  if (loading) return <div className="min-h-screen grid place-items-center bg-slate-50">Checking secure session…</div>;

  if (session && !workspaceReady) return <div className="min-h-screen grid place-items-center bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-5"><form onSubmit={createWorkspace} className="w-full max-w-lg rounded-3xl border bg-white p-8 shadow-xl"><div className="text-sm font-bold uppercase tracking-widest text-indigo-600">BrandSentinel AI</div><h1 className="mt-3 text-3xl font-bold text-slate-900">Create your company workspace</h1><p className="mt-2 text-slate-600">Your brand rules, policy documents, knowledge base and audit history belong to this workspace.</p><label className="mt-6 block text-sm font-semibold">Company name</label><input required minLength={2} maxLength={120} value={company} onChange={e=>setCompany(e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3" placeholder="Acme Ltd."/><button disabled={busy} className="mt-5 w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white disabled:opacity-50">{busy?'Creating…':'Create workspace'}</button>{error&&<p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}<button type="button" onClick={()=>supabase.auth.signOut()} className="mt-3 w-full text-sm text-slate-500">Sign out</button></form></div>;

  if (session && workspaceReady) return <><div className="flex items-center justify-between border-b bg-white px-5 py-2 text-sm"><span className="text-slate-600">Signed in as <b>{session.user.email}</b></span><button onClick={()=>supabase.auth.signOut()} className="font-semibold text-indigo-700">Sign out</button></div>{children}</>;

  return <div className="min-h-screen bg-gradient-to-br from-[#f5f6ff] via-white to-[#ecefff] p-5"><div className="mx-auto grid min-h-[85vh] max-w-5xl overflow-hidden rounded-3xl border bg-white shadow-2xl md:grid-cols-2"><section className="flex flex-col justify-between bg-gradient-to-br from-[#101a3a] via-[#252d68] to-[#5b4ce2] p-10 text-white"><div className="text-lg font-bold">◈ BrandSentinel AI</div><div><p className="text-xs font-bold uppercase tracking-[.2em] text-indigo-200">Protect what your brand stands for</p><h1 className="mt-4 text-4xl font-bold leading-tight">Your rules.<br/>Your company.<br/>Your control.</h1><p className="mt-5 text-sm leading-6 text-indigo-100">A private workspace for your company's brand rules, regulations, documents and audits.</p></div><p className="text-xs text-indigo-200">Secure sign-in powered by Supabase Auth</p></section><section className="flex items-center p-8 md:p-10"><form onSubmit={submit} className="w-full"><p className="text-xs font-bold uppercase tracking-widest text-indigo-600">{signup?'Create account':'Welcome back'}</p><h2 className="mt-2 text-3xl font-bold">{signup?'Start your workspace':'Sign in'}</h2>{signup&&<><label className="mt-6 block text-sm font-semibold">Full name</label><input required value={name} onChange={e=>setName(e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3" placeholder="Your name"/></>}<label className="mt-6 block text-sm font-semibold">Work email</label><input type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3" placeholder="you@company.com"/><label className="mt-5 block text-sm font-semibold">Password</label><input type="password" required minLength={8} autoComplete={signup?'new-password':'current-password'} value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3" placeholder="At least 8 characters"/>{error&&<p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}{notice&&<p role="status" className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</p>}<button disabled={busy} className="mt-6 w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white disabled:opacity-50">{busy?'Please wait…':signup?'Create account':'Sign in'}</button><button type="button" onClick={()=>{setSignup(!signup);setError('');setNotice('');}} className="mt-5 w-full text-sm font-semibold text-indigo-700">{signup?'Already registered? Sign in':'New here? Create an account'}</button></form></section></div></div>;
}
