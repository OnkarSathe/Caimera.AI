import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('/api/auth/login', form);
      setAuth(res.data.user, res.data.token);
      navigate('/');
    } catch (err: unknown) {
      setError(
        axios.isAxiosError(err) ? err.response?.data?.error || 'Login failed' : 'Login failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back">
      <form onSubmit={handleSubmit}>
        <Field
          label="Username"
          value={form.username}
          onChange={(v) => setForm((f) => ({ ...f, username: v }))}
        />
        <Field
          label="Password"
          type="password"
          value={form.password}
          onChange={(v) => setForm((f) => ({ ...f, password: v }))}
        />
        {error && <div style={{ color: '#ef4444', fontSize: 13, marginBottom: 12 }}>{error}</div>}
        <SubmitButton loading={loading}>Login</SubmitButton>
      </form>
      <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#64748b' }}>
        No account?{' '}
        <Link to="/register" style={{ color: '#818cf8' }}>
          Register
        </Link>
      </div>
    </AuthLayout>
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('/api/auth/register', form);
      setAuth(res.data.user, res.data.token);
      navigate('/');
    } catch (err: unknown) {
      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.error || 'Registration failed'
          : 'Registration failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create your account">
      <form onSubmit={handleSubmit}>
        <Field
          label="Username"
          value={form.username}
          onChange={(v) => setForm((f) => ({ ...f, username: v }))}
        />
        <Field
          label="Password"
          type="password"
          value={form.password}
          onChange={(v) => setForm((f) => ({ ...f, password: v }))}
        />
        {error && <div style={{ color: '#ef4444', fontSize: 13, marginBottom: 12 }}>{error}</div>}
        <SubmitButton loading={loading}>Create Account</SubmitButton>
      </form>
      <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#64748b' }}>
        Have an account?{' '}
        <Link to="/login" style={{ color: '#818cf8' }}>
          Login
        </Link>
      </div>
    </AuthLayout>
  );
}

// Shared sub-components

function AuthLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#020617',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div
        style={{
          background: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: 16,
          padding: '40px 36px',
          width: '100%',
          maxWidth: 380,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9', letterSpacing: -1 }}>
            Math<span style={{ color: '#818cf8' }}>Race</span>
          </div>
          <div style={{ fontSize: 15, color: '#64748b', marginTop: 6 }}>{title}</div>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 6 }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        style={{
          width: '100%',
          padding: '10px 14px',
          borderRadius: 8,
          border: '1px solid #334155',
          background: '#1e293b',
          color: '#f1f5f9',
          fontSize: 15,
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
}

function SubmitButton({ children, loading }: { children: React.ReactNode; loading: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading}
      style={{
        width: '100%',
        padding: '12px',
        borderRadius: 8,
        border: 'none',
        background: loading ? '#334155' : '#818cf8',
        color: '#fff',
        fontSize: 15,
        fontWeight: 700,
        cursor: loading ? 'not-allowed' : 'pointer',
        marginBottom: 4,
      }}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
}
