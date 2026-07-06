import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import InputField from '../../Reusable/InputField';
import Button from '../../Reusable/Button';
import { Spinner } from '@/components/ui/spinner';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { sendRegisterOtp, verifyRegisterOtp, setCurrentUser } from '../../services/auth';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';

const Register = () => {
  const [dataForm, setDataForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [step, setStep] = useState('form');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Create Account | Furniture';
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (dataForm.password !== dataForm.confirmPassword) {
      setError('Password dan konfirmasi password tidak sama.');
      return;
    }
    if (dataForm.password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }

    setLoading(true);
    try {
      await sendRegisterOtp(dataForm.email);
      setStep('otp');
      setSuccess(`Kode verifikasi telah dikirim ke ${dataForm.email}.`);
    } catch (err) {
      setError(err.message || 'Gagal mengirim kode verifikasi.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (otp.length !== 6) {
      setError('Masukkan 6 digit kode OTP.');
      return;
    }

    setLoading(true);
    try {
      const user = await verifyRegisterOtp({
        name: dataForm.name,
        email: dataForm.email,
        password: dataForm.password,
        otp,
      });
      setCurrentUser(user);
      setSuccess('Verifikasi berhasil! Mengarahkan…');
      setTimeout(() => navigate('/member'), 900);
    } catch (err) {
      setError(err.message || 'Verifikasi OTP gagal.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setSuccess('');
    setResending(true);
    try {
      await sendRegisterOtp(dataForm.email);
      setOtp('');
      setSuccess('Kode baru telah dikirim.');
    } catch (err) {
      setError(err.message || 'Gagal mengirim ulang kode.');
    } finally {
      setResending(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDataForm((prev) => ({ ...prev, [name]: value }));
  };

  if (step === 'otp') {
    return (
      <div style={styles.container}>
        <button type="button" onClick={() => { setStep('form'); setError(''); setSuccess(''); }} style={styles.backBtn}>
          <FiArrowLeft size={15} /> Back
        </button>
        <h2 style={styles.title}>Verify email</h2>
        <p style={styles.subtitle}>
          Enter the 6-digit code sent to <strong>{dataForm.email}</strong>.
        </p>

        <form onSubmit={handleVerify} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.success}>{success}</div>}

          <div style={styles.otpWrap}>
            <InputOTP maxLength={6} value={otp} onChange={(v) => setOtp(v.replace(/\D/g, ''))} autoFocus>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button type="submit" variant="primary" disabled={loading || otp.length !== 6} style={styles.fullBtn}>
            {loading ? (
              <span style={styles.btnLoading}>
                <Spinner style={{ width: 16, height: 16 }} />
                Verifying…
              </span>
            ) : (
              'Verify & register'
            )}
          </Button>
        </form>

        <p style={styles.footerText}>
          Didn't get the code?{' '}
          <button type="button" onClick={handleResend} disabled={resending} style={styles.linkBtn}>
            {resending ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Spinner style={{ width: 12, height: 12 }} />
                Resending…
              </span>
            ) : (
              'Resend'
            )}
          </button>
        </p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Create account</h2>
      <p style={styles.subtitle}>Fill in your details to sign up.</p>

      <form onSubmit={handleSubmit} style={styles.form}>
        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

        <InputField
          label="Full name"
          type="text"
          name="name"
          value={dataForm.name}
          onChange={handleChange}
          placeholder="Enter your name"
          required
          leftIcon={<FiUser />}
        />

        <InputField
          label="Email address"
          type="email"
          name="email"
          value={dataForm.email}
          onChange={handleChange}
          placeholder="you@example.com"
          required
          leftIcon={<FiMail />}
        />

        <InputField
          label="Password"
          type={showPassword ? 'text' : 'password'}
          name="password"
          value={dataForm.password}
          onChange={handleChange}
          placeholder="Enter password"
          required
          leftIcon={<FiLock />}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={styles.eyeBtn}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          }
        />

        <InputField
          label="Confirm password"
          type={showConfirmPassword ? 'text' : 'password'}
          name="confirmPassword"
          value={dataForm.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm password"
          required
          leftIcon={<FiLock />}
          rightElement={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeBtn}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          }
        />

        <Button type="submit" variant="primary" disabled={loading} style={styles.fullBtn}>
          {loading ? (
            <span style={styles.btnLoading}>
              <Spinner style={{ width: 16, height: 16 }} />
              Sending code…
            </span>
          ) : (
            'Continue'
          )}
        </Button>
      </form>

      <p style={styles.footerText}>
        Already have an account? <Link to="/login" style={styles.link}>Sign in</Link>
      </p>
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  title: {
    fontSize: '24px',
    fontWeight: '500',
    color: '#2c2825',
    margin: '0 0 4px 0',
    letterSpacing: '-0.2px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#8c8278',
    margin: '0 0 28px 0',
    fontWeight: '400',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  fullBtn: {
    width: '100%',
    padding: '11px 20px',
    fontSize: '14px',
    fontWeight: '500',
    borderRadius: '0',
    letterSpacing: '0.2px',
  },
  btnLoading: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  footerText: {
    marginTop: '32px',
    textAlign: 'center',
    fontSize: '13px',
    color: '#8c8278',
  },
  link: {
    color: '#2c2825',
    textDecoration: 'underline',
    textUnderlineOffset: '2px',
    fontWeight: '500',
  },
  otpWrap: {
    display: 'flex',
    justifyContent: 'center',
    padding: '8px 0 4px',
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'transparent',
    border: 'none',
    color: '#8c8278',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    padding: 0,
    marginBottom: '16px',
    fontFamily: 'inherit',
  },
  linkBtn: {
    background: 'transparent',
    border: 'none',
    color: '#2c2825',
    textDecoration: 'underline',
    textUnderlineOffset: '2px',
    fontWeight: 500,
    cursor: 'pointer',
    padding: 0,
    fontSize: '13px',
    fontFamily: 'inherit',
  },
  error: {
    backgroundColor: '#fdf1f0',
    color: '#bc4a3c',
    padding: '10px 14px',
    borderRadius: '0',
    fontSize: '13px',
    border: '1px solid #f0d4d0',
    fontFamily: 'inherit',
  },
  success: {
    backgroundColor: '#f0f7f1',
    color: '#3b7a4e',
    padding: '10px 14px',
    borderRadius: '0',
    fontSize: '13px',
    border: '1px solid #d0e3d4',
    fontFamily: 'inherit',
  },
  eyeBtn: {
    background: 'transparent',
    border: 'none',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#8c8278',
    outline: 'none',
  }
};

export default Register;
