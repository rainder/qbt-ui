import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { fetchVersion } from '@/api/prefs';

type Status = 'checking' | 'authed' | 'unauthed';

export function AuthGate() {
  const [status, setStatus] = useState<Status>('checking');

  useEffect(() => {
    fetchVersion()
      .then(() => setStatus('authed'))
      .catch(() => setStatus('unauthed'));
  }, []);

  if (status === 'checking') return <div className="p-4 text-fg-muted">checking session...</div>;
  if (status === 'unauthed') return <Navigate to="/login" replace />;
  return <Outlet />;
}
