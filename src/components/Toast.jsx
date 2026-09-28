import { useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function Toast() {
  const { toast, setToast } = useApp();

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast, setToast]);

  if (!toast) return null;
  return <div className={`toast ${toast.type === 'error' ? 'error' : ''}`}>{toast.message}</div>;
}
