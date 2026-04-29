import { useEffect, useState } from 'react';
import { Modal, useCloseModal } from './Modal';
import {
  getDownloadLimits,
  getUploadLimits,
  setDownloadLimit,
  setUploadLimit,
} from '@/api/torrents';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

/** Returns the shared value in KB/s if all hashes have the same limit, else `null` (mixed). */
function sharedKbps(limits: Record<string, number>, hashes: string[]): number | null {
  if (hashes.length === 0) return 0;
  const values = hashes.map((h) => limits[h] ?? 0);
  const first = values[0]!;
  if (values.every((v) => v === first)) return Math.round(first / 1024);
  return null; // mixed
}

export function SetRateLimits({ hashes }: { hashes: string[] }) {
  const close = useCloseModal();

  const [loading, setLoading] = useState(true);

  // null means "mixed" (different values across selection)
  const [initialDl, setInitialDl] = useState<number | null>(0);
  const [initialUp, setInitialUp] = useState<number | null>(0);

  // Controlled field values — empty string when mixed/unset
  const [dlValue, setDlValue] = useState('');
  const [upValue, setUpValue] = useState('');

  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (hashes.length === 0) {
      setLoading(false);
      return;
    }
    void (async () => {
      try {
        const [dlLimits, upLimits] = await Promise.all([
          getDownloadLimits(hashes),
          getUploadLimits(hashes),
        ]);
        const dl = sharedKbps(dlLimits, hashes);
        const up = sharedKbps(upLimits, hashes);
        setInitialDl(dl);
        setInitialUp(up);
        setDlValue(dl !== null ? String(dl) : '');
        setUpValue(up !== null ? String(up) : '');
      } finally {
        setLoading(false);
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const dlMixed = initialDl === null;
  const upMixed = initialUp === null;
  const anyMixed = dlMixed || upMixed;

  async function apply() {
    setBusy(true);
    try {
      const dlKbps = dlValue.trim() === '' ? null : Number(dlValue);
      const upKbps = upValue.trim() === '' ? null : Number(upValue);

      const currentDlKbps = dlMixed ? null : initialDl;
      const currentUpKbps = upMixed ? null : initialUp;

      const promises: Promise<unknown>[] = [];

      if (dlKbps !== null && dlKbps !== currentDlKbps) {
        promises.push(setDownloadLimit(hashes, dlKbps * 1024));
      }
      if (upKbps !== null && upKbps !== currentUpKbps) {
        promises.push(setUploadLimit(hashes, upKbps * 1024));
      }

      await Promise.all(promises);
      close();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title="Rate limits" onClose={close}>
      <div className="space-y-4 w-[28rem]">
        {loading ? (
          <p className="text-sm text-fg-muted py-2">Loading current limits…</p>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <label className="w-32 text-sm font-medium text-fg-default">Download</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  step={1}
                  value={dlValue}
                  onChange={(e) => setDlValue(e.target.value)}
                  placeholder={dlMixed ? '(mixed)' : '0 = unlimited'}
                  className="w-32"
                  autoFocus
                />
                <span className="text-fg-muted text-sm">KB/s</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="w-32 text-sm font-medium text-fg-default">Upload</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  step={1}
                  value={upValue}
                  onChange={(e) => setUpValue(e.target.value)}
                  placeholder={upMixed ? '(mixed)' : '0 = unlimited'}
                  className="w-32"
                />
                <span className="text-fg-muted text-sm">KB/s</span>
              </div>
            </div>
            {anyMixed && (
              <p className="text-xs text-fg-muted">
                Different limits across selection — Apply will overwrite all.
              </p>
            )}
            <p className="text-xs text-fg-muted">0 = unlimited</p>
          </>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="default" onClick={close}>Cancel</Button>
          <Button variant="primary" disabled={busy || loading} onClick={() => { void apply(); }}>
            Apply
          </Button>
        </div>
      </div>
    </Modal>
  );
}
