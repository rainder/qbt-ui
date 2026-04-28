import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '@/api/auth';

const inputCls =
  'block w-full bg-canvas-inset border border-border-default rounded-md px-3 py-[5px] text-sm text-fg-default focus-accent';

export default function LoginPage() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(username, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid place-items-center min-h-screen bg-canvas">
      <div className="flex flex-col items-center gap-4">
        {/* Brand above card */}
        <div className="flex items-center gap-2 text-fg-default font-light text-2xl">
          <span className="w-4 h-4 rounded-full bg-accent-fg" />
          qbt
        </div>

        {/* Login card */}
        <form
          onSubmit={onSubmit}
          className="w-80 bg-canvas-subtle border border-border-default rounded-md p-6 space-y-4 shadow-2xl"
        >
          <h1 className="text-base font-semibold text-fg-default text-center">
            Sign in to qBittorrent
          </h1>

          <div>
            <label className="block text-sm font-medium text-fg-default mb-1">Username</label>
            <input
              className={inputCls}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-fg-default mb-1">Password</label>
            <input
              type="password"
              className={inputCls}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="text-danger-fg text-sm">{error}</div>}

          <button
            type="submit"
            disabled={busy}
            className="w-full bg-success-emphasis hover:bg-success-emphasis-h text-fg-on-emphasis border border-subtle rounded-md px-3 py-[5px] text-sm font-medium disabled:opacity-50"
          >
            {busy ? '…' : 'Connect'}
          </button>
        </form>
      </div>
    </div>
  );
}
