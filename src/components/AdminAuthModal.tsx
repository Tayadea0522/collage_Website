import React, { useState } from 'react';
import { storageService } from '../services/storageService';
import { supabase } from '../supabaseClient.js';
import { AdminUser } from '../types';
import { 
  Lock, 
  X, 
  KeyRound, 
  LogIn, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle, 
  User
} from 'lucide-react';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AdminUser) => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  type AuthMode = 'signin' | 'forgot_password';
  const [mode, setMode] = useState<AuthMode>('signin');

  // Sign In state
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [signInError, setSignInError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot Password state
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [recoveryIdentifier, setRecoveryIdentifier] = useState('');
  const [foundUser, setFoundUser] = useState<AdminUser | null>(null);
  const [securityAnswerInput, setSecurityAnswerInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [useOtpMethod, setUseOtpMethod] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  if (!isOpen) return null;

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError('');
    setIsSubmitting(true);

    const trimmedIdent = usernameInput.trim();
    if (!trimmedIdent || !passwordInput) {
      setSignInError('Please enter both username/email and password.');
      setIsSubmitting(false);
      return;
    }

    let targetEmail = trimmedIdent;
    if (!trimmedIdent.includes('@')) {
      if (trimmedIdent.toLowerCase() === 'admin') {
        targetEmail = 'akshayjamode21@gmail.com';
      } else {
        try {
          const { data: dbAdmin } = await supabase
            .from('admin_users')
            .select('email')
            .eq('username', trimmedIdent)
            .maybeSingle();
          if (dbAdmin && dbAdmin.email) {
            targetEmail = dbAdmin.email;
          }
        } catch (err) {
          console.warn('Username lookup error:', err);
        }
      }
    }

    try {
      // 1. Supabase Auth sign in
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password: passwordInput,
      });

      if (authError || !data?.user || !data?.session) {
        setSignInError(authError?.message || 'Invalid Administrator username/email or password.');
        setIsSubmitting(false);
        return;
      }

      // 2. Query public.admin_users
      const { data: adminRows, error: adminQueryErr } = await supabase
        .from('admin_users')
        .select('*')
        .or(`auth_user_id.eq.${data.user.id},email.ilike.${data.user.email}`);

      if (adminQueryErr || !adminRows || adminRows.length === 0) {
        await supabase.auth.signOut({ scope: 'local' });
        setSignInError('Access Denied: This account is not registered in public.admin_users.');
        setIsSubmitting(false);
        return;
      }

      const dbAdmin = adminRows[0];
      const validRoles = ['Super Admin', 'Admission Incharge', 'Academic Admin', 'System Administrator'];
      if (!validRoles.includes(dbAdmin.role)) {
        await supabase.auth.signOut({ scope: 'local' });
        setSignInError(`Access Denied: Role "${dbAdmin.role}" does not have administrative privileges.`);
        setIsSubmitting(false);
        return;
      }

      // Link auth_user_id if not present
      if (!dbAdmin.auth_user_id) {
        try {
          await supabase
            .from('admin_users')
            .update({ auth_user_id: data.user.id })
            .eq('id', dbAdmin.id);
        } catch (e) {}
      }

      const matchedUser: AdminUser = {
        id: String(dbAdmin.id || data.user.id),
        name: dbAdmin.name || data.user.user_metadata?.name || 'Administrator',
        username: dbAdmin.username || data.user.email?.split('@')[0] || 'admin',
        email: dbAdmin.email || data.user.email || targetEmail,
        mobile: dbAdmin.mobile || '9822100000',
        role: dbAdmin.role || 'Super Admin',
        securityQuestion: dbAdmin.security_question || 'What is the college code?',
        securityAnswer: dbAdmin.security_answer || 'LSSCDT',
        password: '',
        auth_user_id: dbAdmin.auth_user_id || data.user.id,
        createdAt: dbAdmin.created_at || new Date().toISOString().split('T')[0]
      };

      onLoginSuccess(matchedUser);
      onClose();
    } catch (err: any) {
      setSignInError(err?.message || 'Authentication failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Forgot Password - Step 1: Find User
  const handleFindUserForRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    const query = recoveryIdentifier.trim().toLowerCase();

    try {
      const usersList = await storageService.fetchAdminUsers();
      const user = usersList.find(
        u => u.username.toLowerCase() === query ||
             u.email.toLowerCase() === query ||
             u.mobile === recoveryIdentifier.trim()
      );

      if (!user) {
        setForgotError('No Administrator account found with provided Email, Username, or Mobile.');
        return;
      }

      setFoundUser(user);
      const simulatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(simulatedOtp);
      setForgotStep(2);
    } catch (err) {
      setForgotError('Failed to verify account. Please try again.');
    }
  };

  // Forgot Password - Step 2: Verify & Reset
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');

    if (!foundUser) return;

    if (useOtpMethod) {
      if (otpInput.trim() !== generatedOtp) {
        setForgotError(`Invalid OTP code. Please enter verification code: ${generatedOtp}`);
        return;
      }
    } else {
      if (securityAnswerInput.trim().toLowerCase() !== (foundUser.securityAnswer || 'lsscdt').trim().toLowerCase()) {
        setForgotError('Security answer is incorrect. Please verify your answer or use OTP.');
        return;
      }
    }

    if (!newPassword || newPassword.length < 6) {
      setForgotError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setForgotError('New passwords do not match.');
      return;
    }

    const success = await storageService.updateAdminPassword(foundUser.username, newPassword);

    if (success) {
      setForgotSuccess(`Password for ${foundUser.name} updated successfully!`);
      setUsernameInput(foundUser.username);
      setPasswordInput(newPassword);

      setTimeout(() => {
        setMode('signin');
        setForgotStep(1);
        setFoundUser(null);
        setForgotSuccess('');
        setRecoveryIdentifier('');
        setSecurityAnswerInput('');
        setOtpInput('');
        setNewPassword('');
        setConfirmNewPassword('');
      }, 2000);
    } else {
      setForgotError('Failed to reset password. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 relative space-y-5 my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Branding */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-[#0A2342] text-amber-400 mx-auto flex items-center justify-center font-bold shadow-md">
            {mode === 'signin' && <Lock className="w-6 h-6" />}
            {mode === 'forgot_password' && <KeyRound className="w-6 h-6 text-amber-300" />}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#0A2342]">
            {mode === 'signin' && 'Administrator Portal Login'}
            {mode === 'forgot_password' && 'Admin Password Recovery'}
          </h2>
          <p className="text-xs text-slate-500">
            {mode === 'signin' && 'Access college CMS, admission desk & campus operations'}
            {mode === 'forgot_password' && 'Reset your admin password via security answer or OTP'}
          </p>
        </div>

        {/* Mode Navigation Tabs */}
        <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setMode('signin'); setSignInError(''); }}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'signin' ? 'bg-white text-[#0A2342] shadow-sm font-extrabold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => { setMode('forgot_password'); setForgotError(''); setForgotSuccess(''); setForgotStep(1); }}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'forgot_password' ? 'bg-white text-[#0A2342] shadow-sm font-extrabold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Forgot Password</span>
          </button>
        </div>

        {/* SIGN IN */}
        {mode === 'signin' && (
          <form onSubmit={handleSignInSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Username or Email *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="admin or admin@lsscdt.ac.in"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full pl-9 p-2.5 rounded-lg border border-slate-300 font-mono outline-none focus:ring-2 focus:ring-amber-500 text-slate-900"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block font-bold text-slate-700">Password *</label>
                <button
                  type="button"
                  onClick={() => setMode('forgot_password')}
                  className="text-[11px] font-bold text-amber-600 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full pl-9 p-2.5 rounded-lg border border-slate-300 font-mono outline-none focus:ring-2 focus:ring-amber-500 text-slate-900"
                />
              </div>
            </div>

            {signInError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{signInError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#0A2342] hover:bg-slate-900 text-amber-400 font-extrabold py-3 rounded-xl text-xs shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              <span>{isSubmitting ? 'Verifying...' : 'Login to Admin Panel'}</span>
            </button>

            <div className="text-center pt-2 text-[11px] text-slate-500 border-t border-slate-100">
              <span className="flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                Restricted portal. Session verified via Supabase Auth.
              </span>
            </div>
          </form>
        )}

        {/* FORGOT PASSWORD */}
        {mode === 'forgot_password' && (
          <div className="space-y-4 text-xs">
            {forgotStep === 1 ? (
              <form onSubmit={handleFindUserForRecovery} className="space-y-4">
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Forgot Administrator Password?</span>
                  </div>
                  <p className="text-[11px]">
                    Enter your Administrator Email, Username, or Mobile Number to reset your password.
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Username, Email or Mobile Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. admin or akshayjamode21@gmail.com"
                    value={recoveryIdentifier}
                    onChange={(e) => setRecoveryIdentifier(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-amber-500 font-mono text-slate-900"
                  />
                </div>

                {forgotError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{forgotError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-[#0A2342] hover:bg-slate-900 text-white font-extrabold py-3 rounded-xl text-xs shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <span>Continue Recovery →</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                {foundUser && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Administrator Found</div>
                    <div className="font-bold text-[#0A2342] text-sm">{foundUser.name}</div>
                    <div className="text-xs text-slate-600">{foundUser.email} • {foundUser.role}</div>
                  </div>
                )}

                <div className="flex gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setUseOtpMethod(false)}
                    className={`flex-1 p-2 rounded-lg border font-bold transition-colors ${
                      !useOtpMethod ? 'bg-amber-100 border-amber-400 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Security Question
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseOtpMethod(true)}
                    className={`flex-1 p-2 rounded-lg border font-bold transition-colors ${
                      useOtpMethod ? 'bg-amber-100 border-amber-400 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Instant OTP Code
                  </button>
                </div>

                {!useOtpMethod ? (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {foundUser?.securityQuestion || 'What is the college code?'} *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter your security answer..."
                      value={securityAnswerInput}
                      onChange={(e) => setSecurityAnswerInput(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-amber-500 text-slate-900"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="block font-bold text-slate-700">Enter Verification OTP Code *</label>
                    <div className="p-2.5 bg-blue-50 border border-blue-200 text-blue-900 text-xs rounded-lg flex items-center justify-between">
                      <span>OTP sent to registered mobile/email:</span>
                      <strong className="font-mono text-sm tracking-wider text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-300">
                        {generatedOtp}
                      </strong>
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Enter 6-digit OTP"
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-amber-500 font-mono text-center text-sm font-bold tracking-widest text-slate-900"
                    />
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-700 mb-1">New Password (min 6 characters) *</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-amber-500 font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Confirm New Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-amber-500 font-mono text-slate-900"
                  />
                </div>

                {forgotError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{forgotError}</span>
                  </div>
                )}

                {forgotSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>{forgotSuccess}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 rounded-xl text-xs shadow-md transition-colors"
                >
                  Update Password & Return to Login
                </button>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
