import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  Shield,
  Eye,
  EyeOff,
  Users,
  Building2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  LogOut,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useBoard } from '../../context/BoardContext';

export const LoginModal = () => {
  const {
    currentUser,
    allUsers,
    isLoginModalOpen,
    setIsLoginModalOpen,
    loginWithCredentials,
    loginAsUser,
    registerUser,
    logout
  } = useAuth();
  const { addToast } = useBoard();

  const [mode, setMode] = useState('signin'); // 'signin' | 'register' | 'switch'
  const [emailOrId, setEmailOrId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Registration states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('Member');
  const [regDepartment, setRegDepartment] = useState('Engineering');

  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Modal display logic: Must show if user is logged out, OR if explicitly opened via header/sidebar
  const isForcedLogout = !currentUser;
  const isOpen = isForcedLogout || isLoginModalOpen;

  if (!isOpen) return null;

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!emailOrId.trim()) {
      setErrorMsg('Please enter your Email or User ID');
      return;
    }
    setErrorMsg('');
    setSubmitting(true);
    try {
      const user = await loginWithCredentials({ emailOrId, password });
      addToast && addToast('Welcome Back', `Logged in as ${user.name} (${user.role})`, 'success');
      setEmailOrId('');
      setPassword('');
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) {
      setErrorMsg('Full name and email address are required.');
      return;
    }
    setErrorMsg('');
    setSubmitting(true);
    try {
      const newUser = await registerUser(regName, regEmail, regRole, regDepartment, regPassword);
      addToast && addToast('Account Created', `Logged in as ${newUser.name} to shared workspace!`, 'success');
      setRegName('');
      setRegEmail('');
      setRegPassword('');
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickSwitch = async (userId, name, role) => {
    setSubmitting(true);
    try {
      await loginAsUser(userId);
      addToast && addToast('Switched Account', `Now active as ${name} (${role})`, 'info');
    } catch (err) {
      setErrorMsg('Failed to switch user.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 sm:p-8 shadow-2xl my-auto relative overflow-hidden text-slate-100">
        {/* Glow Accent */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-inner">
              <Building2 className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-xl text-white tracking-tight">
                  {currentUser ? 'User Session & Account Switcher' : 'Workspace Multi-User Login'}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                  SHARED WORKSPACE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Sign in or switch identity to collaborate on shared Kanban boards & chat
              </p>
            </div>
          </div>

          {!isForcedLogout && (
            <button
              onClick={() => setIsLoginModalOpen(false)}
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Workspace Active Session Badge */}
        {currentUser && (
          <div className="bg-slate-950/80 border border-indigo-500/30 rounded-2xl p-3 mb-5 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-9 h-9 rounded-full object-cover border border-indigo-400/50"
              />
              <div>
                <div className="font-bold text-slate-100 flex items-center gap-1.5">
                  {currentUser.name}
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                    {currentUser.role}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">{currentUser.email}</div>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold transition shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        )}

        {/* Tab Selection */}
        <div className="grid grid-cols-3 gap-1 bg-slate-950/90 p-1.5 rounded-2xl border border-slate-800 text-xs font-semibold mb-6">
          <button
            type="button"
            onClick={() => { setMode('signin'); setErrorMsg(''); }}
            className={`py-2 rounded-xl transition text-center font-bold ${
              mode === 'signin'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMsg(''); }}
            className={`py-2 rounded-xl transition text-center font-bold ${
              mode === 'register'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => { setMode('switch'); setErrorMsg(''); }}
            className={`py-2 rounded-xl transition text-center font-bold ${
              mode === 'switch'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Quick Switch ({allUsers.length})
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3 rounded-xl text-xs mb-4 flex items-start gap-2">
            <Lock className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>{errorMsg}</div>
          </div>
        )}

        {/* TAB 1: Sign In with ID & Password */}
        {mode === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Email Address or User ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. alex.vance@subpilot.io or user_admin_1"
                  value={emailOrId}
                  onChange={(e) => setEmailOrId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-300 font-semibold">Password</label>
                <span className="text-[10px] text-indigo-400 font-mono">Demo password: password123</span>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-10 py-2 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-xs disabled:opacity-50"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In to Workspace <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            <div className="text-[11px] text-slate-500 text-center pt-2">
              Looking for quick testing? Switch to <span className="text-indigo-400 underline cursor-pointer" onClick={() => setMode('switch')}>Quick Switch</span> to log in as any team member with 1 click!
            </div>
          </form>
        )}

        {/* TAB 2: Register New Account */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Elena Rostova"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Work Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="e.g. elena@subpilot.io"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Set Password</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  placeholder="Password (e.g. password123)"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Workspace Role</label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs"
                >
                  <option value="Admin">Admin</option>
                  <option value="Member">Member</option>
                  <option value="Guest">Guest</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Department</label>
                <input
                  type="text"
                  placeholder="e.g. Engineering, Design"
                  value={regDepartment}
                  onChange={(e) => setRegDepartment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-xs disabled:opacity-50"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Register & Join Shared Workspace
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: Quick One-Click Switch Teammates */}
        {mode === 'switch' && (
          <div className="space-y-3">
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>Select any teammate account to instantly log in:</span>
              <span className="font-mono text-indigo-400">Default pwd: password123</span>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {allUsers.map((u) => {
                const isActive = currentUser?.id === u.id;
                return (
                  <div
                    key={u.id}
                    onClick={() => !isActive && handleQuickSwitch(u.id, u.name, u.role)}
                    className={`p-3 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600/20 border-indigo-500/50 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-700"
                        />
                        <span
                          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${
                            u.status === 'active'
                              ? 'bg-emerald-400'
                              : u.status === 'away'
                              ? 'bg-amber-400'
                              : 'bg-slate-500'
                          }`}
                        />
                      </div>

                      <div>
                        <div className="font-bold text-sm text-white flex items-center gap-2">
                          {u.name}
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase border ${
                              u.role === 'Admin' || u.role === 'Owner'
                                ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                                : u.role === 'Member'
                                ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                : 'bg-slate-700/50 text-slate-300 border-slate-600'
                            }`}
                          >
                            {u.role}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {u.email} • ID: <span className="text-slate-300">{u.id}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      {isActive ? (
                        <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-xl text-[10px] font-mono font-bold">
                          ACTIVE NOW
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="px-3 py-1.5 bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition border border-slate-700"
                        >
                          Sign In
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
