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
    <div className="grid place-items-center min-h-screen bg-bg">
      <form onSubmit={onSubmit} className="w-80 border border-border2 p-6 space-y-4 bg-bg3 rounded-md shadow-2xl">
        <div className="flex items-center gap-2 text-fg2 font-semibold text-md">
          <span className="w-2 h-2 rounded-full bg-accent"></span>
          qbt <span className="text-muted font-normal">/ login</span>
        </div>
        <label className="block text-[10px] font-medium uppercase text-muted">Username
          <input
            className="block w-full mt-1 bg-bg3 border border-border2 rounded px-3 py-1.5 text-fg2 focus:outline-none focus:border-accent"
            value={username} onChange={(e) => setUsername(e.target.value)}
            autoFocus required
          />
        </label>
        <label className="block text-[10px] font-medium uppercase text-muted">Password
          <input
            type="password"
            className="block w-full mt-1 bg-bg3 border border-border2 rounded px-3 py-1.5 text-fg2 focus:outline-none focus:border-accent"
            value={password} onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && <div className="text-danger text-xs">{error}</div>}
        <button
          type="submit" disabled={busy}
          className="w-full bg-[#238636] hover:bg-[#2ea043] text-white px-3 py-1.5 rounded font-medium disabled:opacity-50"
        >{busy ? '...' : 'Connect'}</button>
      </form>
    </div>
  );
}
