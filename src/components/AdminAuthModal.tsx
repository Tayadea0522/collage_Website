import React, { useState } from 'react';
import { storageService } from '../services/storageService';
import { AdminUser } from '../types';
import { 
  Lock, 
  X, 
  UserPlus, 
  KeyRound, 
  LogIn, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle, 
  User, 
  Mail, 
  Phone, 
  Sparkles,
  ArrowLeft
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
  type AuthMode = 'signin' | 'signup' | 'forgot_password';
  const [mode, setMode] = useState<AuthMode>('signin');

  // Sign In state
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [signInError, setSignInError] = useState('');

  // Sign Up (Register Administrator) state
  const [signUpData, setSignUpData] = useState({
    name: '',
    username: '',
    email: '',
    mobile: '',
    role: 'Admission Incharge' as AdminUser['role'],
    securityQuestion: 'What is the college code?',
    securityAnswer: '',
    password: '',
    confirmPassword: ''
  });
  const [signUpError, setSignUpError] = useState('');
  const [signUpSuccess, setSignUpSuccess] = useState('');

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

  const adminUsers = storageService.getAdminUsers();

  // 1. Handle Sign In
  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError('');

    const trimmedIdent = usernameInput.trim().toLowerCase();
    const match = adminUsers.find(
      u => (u.username.toLowerCase() === trimmedIdent || u.email.toLowerCase() === trimmedIdent) &&
           u.password === passwordInput
    );

    if (match) {
      onLoginSuccess(match);
      onClose();
    } else {
      setSignInError('Invalid Administrator username/email or password.');
    }
  };

  // Quick Autofill for testing
  const handleAutofill = (u: AdminUser) => {
    setUsernameInput(u.username);
    setPasswordInput(u.password);
    setSignInError('');
  };

  // 2. Handle Sign Up (Add Administrator)
  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError('');
    setSignUpSuccess('');

    if (!signUpData.name || !signUpData.username || !signUpData.email || !signUpData.password) {
      setSignUpError('Please fill in all required fields.');
      return;
    }

    if (signUpData.password.length < 4) {
      setSignUpError('Password must be at least 4 characters long.');
      return;
    }

    if (signUpData.password !== signUpData.confirmPassword) {
      setSignUpError('Passwords do not match.');
      return;
    }

    // Check existing username / email
    const exists = adminUsers.some(
      u => u.username.toLowerCase() === signUpData.username.trim().toLowerCase() ||
           u.email.toLowerCase() === signUpData.email.trim().toLowerCase()
    );

    if (exists) {
      setSignUpError('An Administrator account with this Username or Email already exists.');
      return;
    }

    const newUser: AdminUser = {
      id: `admin-${Date.now()}`,
      name: signUpData.name,
      username: signUpData.username.trim(),
      email: signUpData.email.trim(),
      mobile: signUpData.mobile.trim() || '9822100000',
      role: signUpData.role,
      securityQuestion: signUpData.securityQuestion,
      securityAnswer: signUpData.securityAnswer.trim(),
      password: signUpData.password,
      createdAt: new Date().toISOString().split('T')[0]
    };

    storageService.addAdminUser(newUser);

    setSignUpSuccess(`Administrator account for ${newUser.name} created successfully! You can now sign in.`);
    setUsernameInput(newUser.username);
    setPasswordInput(newUser.password);
    
    setTimeout(() => {
      setMode('signin');
      setSignUpSuccess('');
    }, 1800);
  };

  // 3. Handle Forgot Password - Step 1: Find User
  const handleFindUserForRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    const query = recoveryIdentifier.trim().toLowerCase();

    const user = adminUsers.find(
      u => u.username.toLowerCase() === query ||
           u.email.toLowerCase() === query ||
           u.mobile === recoveryIdentifier.trim()
    );

    if (!user) {
      setForgotError('No Administrator account found with provided Email, Username, or Mobile.');
      return;
    }

    setFoundUser(user);
    // Generate a simulated 6-digit OTP code for instant testing
    const simulatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(simulatedOtp);
    setForgotStep(2);
  };

  // Handle Forgot Password - Step 2: Verify & Reset
  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');

    if (!foundUser) return;

    if (useOtpMethod) {
      if (otpInput.trim() !== generatedOtp) {
        setForgotError(`Invalid OTP code. Please enter the verification code: ${generatedOtp}`);
        return;
      }
    } else {
      if (securityAnswerInput.trim().toLowerCase() !== foundUser.securityAnswer.trim().toLowerCase()) {
        setForgotError('Security answer is incorrect. Please check your recovery answer or try OTP verification.');
        return;
      }
    }

    if (!newPassword || newPassword.length < 4) {
      setForgotError('New password must be at least 4 characters long.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setForgotError('New passwords do not match.');
      return;
    }

    const success = storageService.updateAdminPassword(foundUser.username, newPassword);

    if (success) {
      setForgotSuccess(`Password for ${foundUser.name} updated successfully! Redirecting to Sign In...`);
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
            {mode === 'signup' && <UserPlus className="w-6 h-6 text-amber-300" />}
            {mode === 'forgot_password' && <KeyRound className="w-6 h-6 text-amber-300" />}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#0A2342]">
            {mode === 'signin' && 'Administrator Portal Login'}
            {mode === 'signup' && 'Register New Administrator'}
            {mode === 'forgot_password' && 'Admin Password Recovery'}
          </h2>
          <p className="text-xs text-slate-500">
            {mode === 'signin' && 'Access college CMS, admission desk & campus operations'}
            {mode === 'signup' && 'Add an administrator account for college management'}
            {mode === 'forgot_password' && 'Reset your admin password via security answer or OTP'}
          </p>
        </div>

        {/* Mode Navigation Tabs inside Admin Modal */}
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
            onClick={() => { setMode('signup'); setSignUpError(''); setSignUpSuccess(''); }}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'signup' ? 'bg-white text-[#0A2342] shadow-sm font-extrabold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register Admin</span>
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

        {/* ------------------ MODE 1: SIGN IN ------------------ */}
        {mode === 'signin' && (
          <form onSubmit={handleSignInSubmit} className="space-y-4 text-xs">
            
            {/* Registered Administrators Selector Pills for quick access */}
            <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="block text-[11px] font-bold text-slate-700">
                Registered Administrators ({adminUsers.length}):
              </label>
              <div className="flex flex-wrap gap-1.5">
                {adminUsers.map(u => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleAutofill(u)}
                    className="text-[10px] bg-white hover:bg-amber-50 text-slate-800 border border-slate-300 hover:border-amber-400 px-2 py-1 rounded-md font-medium transition-colors flex items-center gap-1"
                    title={`Click to quick login as ${u.name}`}
                  >
                    <User className="w-3 h-3 text-amber-600" />
                    <span className="font-bold">{u.name.split('(')[0]}</span>
                    <span className="text-slate-400">({u.role})</span>
                  </button>
                ))}
              </div>
            </div>

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
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{signInError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#0A2342] hover:bg-slate-900 text-amber-400 font-extrabold py-3 rounded-xl text-xs shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Login to Admin Panel</span>
            </button>

            <div className="text-center pt-2 text-[11px] text-slate-500 border-t border-slate-100 flex items-center justify-between">
              <span>Need another admin account?</span>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="font-bold text-[#0A2342] hover:underline flex items-center gap-1"
              >
                <UserPlus className="w-3 h-3 text-amber-600" /> Register Administrator
              </button>
            </div>
          </form>
        )}

        {/* ------------------ MODE 2: REGISTER ADMINISTRATOR ------------------ */}
        {mode === 'signup' && (
          <form onSubmit={handleSignUpSubmit} className="space-y-3.5 text-xs max-h-[60vh] overflow-y-auto pr-1">
            
            <div>
              <label className="block font-bold text-slate-700 mb-1">Administrator Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Dr. R. M. Kulkarni"
                value={signUpData.name}
                onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Username *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. kulkarni_admin"
                  value={signUpData.username}
                  onChange={(e) => setSignUpData({ ...signUpData, username: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-mono outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Admin Email *</label>
                <input
                  type="email"
                  required
                  placeholder="admin@lsscdt.ac.in"
                  value={signUpData.email}
                  onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mobile Number</label>
                <input
                  type="tel"
                  placeholder="9822100000"
                  value={signUpData.mobile}
                  onChange={(e) => setSignUpData({ ...signUpData, mobile: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Admin Role *</label>
                <select
                  value={signUpData.role}
                  onChange={(e) => setSignUpData({ ...signUpData, role: e.target.value as AdminUser['role'] })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-bold outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="Admission Incharge">Admission Incharge</option>
                  <option value="Academic Admin">Academic Admin</option>
                  <option value="System Administrator">System Administrator</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Security Question (for password recovery) *</label>
              <select
                value={signUpData.securityQuestion}
                onChange={(e) => setSignUpData({ ...signUpData, securityQuestion: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-white outline-none focus:ring-2 focus:ring-amber-500 mb-1.5"
              >
                <option value="What is the college code?">What is the college code?</option>
                <option value="What city is the college located in?">What city is the college located in?</option>
                <option value="What degree program is offered?">What degree program is offered?</option>
                <option value="What is your employee ID number?">What is your employee ID number?</option>
                <option value="What is your mother's maiden name?">What is your mother's maiden name?</option>
              </select>
              <input
                type="text"
                required
                placeholder="Your Answer (e.g. LSSCDT)"
                value={signUpData.securityAnswer}
                onChange={(e) => setSignUpData({ ...signUpData, securityAnswer: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={signUpData.password}
                  onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-mono outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Confirm Password *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={signUpData.confirmPassword}
                  onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-mono outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {signUpError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{signUpError}</span>
              </div>
            )}

            {signUpSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{signUpSuccess}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#D97706] hover:bg-[#b86202] text-slate-950 font-extrabold py-3 rounded-xl text-xs shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register Administrator</span>
            </button>
          </form>
        )}

        {/* ------------------ MODE 3: FORGOT PASSWORD ------------------ */}
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
                    placeholder="e.g. admin or admin@lsscdt.ac.in or 9822100001"
                    value={recoveryIdentifier}
                    onChange={(e) => setRecoveryIdentifier(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>

                {forgotError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
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

                {/* Switch verification method */}
                <div className="flex gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setUseOtpMethod(false)}
                    className={`flex-1 p-2 rounded-lg border font-bold transition-colors ${
                      !useOtpMethod ? 'bg-amber-100 border-amber-400 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Use Security Question
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseOtpMethod(true)}
                    className={`flex-1 p-2 rounded-lg border font-bold transition-colors ${
                      useOtpMethod ? 'bg-amber-100 border-amber-400 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Use OTP Verification
                  </button>
                </div>

                {!useOtpMethod ? (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Security Question: <span className="text-amber-700">{foundUser?.securityQuestion}</span>
                    </label>
                    <input
                      type="text"
                      required={!useOtpMethod}
                      placeholder="Enter your security answer (e.g. LSSCDT)"
                      value={securityAnswerInput}
                      onChange={(e) => setSecurityAnswerInput(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <div className="text-[10px] text-slate-400 mt-1">Hint: Default initial answer is college code (LSSCDT) or city (Malkapur)</div>
                  </div>
                ) : (
                  <div>
                    <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-200 text-blue-900 text-[11px] mb-2 flex items-center justify-between">
                      <span>Simulated OTP sent to {foundUser?.mobile}:</span>
                      <span className="font-mono font-bold text-blue-950 bg-white px-2 py-0.5 rounded border">{generatedOtp}</span>
                    </div>
                    <label className="block font-bold text-slate-700 mb-1">Enter OTP Code *</label>
                    <input
                      type="text"
                      required={useOtpMethod}
                      placeholder="Enter 6-digit OTP code"
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-300 font-mono outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">New Password *</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-300 font-mono outline-none focus:ring-2 focus:ring-amber-500"
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
                      className="w-full p-2.5 rounded-lg border border-slate-300 font-mono outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {forgotError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{forgotError}</span>
                  </div>
                )}

                {forgotSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>{forgotSuccess}</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="px-4 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold py-3 rounded-xl text-xs shadow-md transition-colors flex items-center justify-center gap-2"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Reset Password & Login</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
