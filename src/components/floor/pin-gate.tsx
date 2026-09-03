import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pinStatus, unlockFloor } from "@/lib/floor/pin";

export function PinGate({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient();
  const status = useQuery({
    queryKey: ["floor-pin"],
    queryFn: () => pinStatus(),
  });
  const [digits, setDigits] = useState("");
  const [wrong, setWrong] = useState(false);
  const unlock = useMutation({
    mutationFn: (pin: string) => unlockFloor({ data: { pin } }),
    onSuccess: async () => {
      setWrong(false);
      setDigits("");
      await qc.invalidateQueries({ queryKey: ["floor-pin"] });
    },
    onError: () => {
      setWrong(true);
      setDigits("");
    },
  });

  function submit(pin: string) {
    const next = pin.replace(/\D/g, "").slice(0, 4);
    if (next.length < 4) {
      setDigits(next);
      return;
    }
    unlock.mutate(next);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (digits.length === 4) unlock.mutate(digits);
  }

  if (status.isLoading) {
    return (
      <div className="pin-gate">
        <div className="pin-card">
          <p className="font-semibold tracking-tight text-lg text-primary">CE Master</p>
          <p className="text-sm text-muted">Checking access…</p>
        </div>
      </div>
    );
  }
  if (!status.data?.unlocked) {
    return (
      <div className="pin-gate">
        <form className="pin-card" onSubmit={onSubmit}>
          <p className="font-semibold tracking-tight text-lg text-primary">CE Master</p>
          <p className="text-sm text-muted">Enter the PIN to open the board.</p>
          <input
            value={digits}
            inputMode="numeric"
            autoComplete="off"
            maxLength={4}
            aria-label="PIN"
            className={`pin-input ${wrong ? "is-wrong" : ""}`}
            onChange={(e) => submit(e.target.value)}
          />
          <div className="pin-pad">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", ""].map((key, i) =>
              key ? (
                <button
                  key={key}
                  type="button"
                  className="pin-key"
                  onClick={() => submit(digits + key)}
                >
                  {key}
                </button>
              ) : (
                <span key={`pad-${i}`} />
              ),
            )}
          </div>
          <p className="text-sm text-muted">
            {unlock.isPending ? "Checking…" : wrong ? "Wrong PIN" : "Four digits"}
          </p>
        </form>
      </div>
    );
  }
  return <>{children}</>;
}
