import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '@/api/auth';

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
    <div className="grid place-items-center min-h-screen">
      <form onSubmit={onSubmit} className="w-80 border border-border p-6 space-y-3 bg-bg2">
        <div className="text-fg2 text-lg">qbt / login</div>
        <label className="block text-xs text-muted">USERNAME
          <input
            className="block w-full mt-1 border border-border bg-bg px-2 py-1 text-fg2"
            value={username} onChange={(e) => setUsername(e.target.value)}
            autoFocus required
          />
        </label>
        <label className="block text-xs text-muted">PASSWORD
          <input
            type="password"
            className="block w-full mt-1 border border-border bg-bg px-2 py-1 text-fg2"
            value={password} onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && <div className="text-danger text-xs">{error}</div>}
        <button
          type="submit" disabled={busy}
          className="w-full border border-accent text-accent px-2 py-1 disabled:opacity-50"
        >{busy ? '...' : 'Connect'}</button>
      </form>
    </div>
  );
}
