import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/login")({
    component: LoginPage,
});

function LoginPage() {
    const { user, isPending } = useCurrentUserState();
    const navigate = useNavigate();
    const [mode, setMode] = useState<"signin" | "signup">("signin");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

  if (isPending) return null;
    if (user) return <Navigate to="/" />;


  async function onSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);
        setBusy(true);
        try {
                if (mode === "signup") {
                          const { error } = await authClient.signUp.email({
                                      email,
                                      password,
                                      name: name || email,
                          });
                          if (error) throw new Error(error.message ?? "Sign up failed");
                } else {
                          const { error } = await authClient.signIn.email({ email, password });
                          if (error) throw new Error(error.message ?? "Sign in failed");
                }
                await navigate({ to: "/" });
        } catch (err) {
                setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
                setBusy(false);
        }
  }

  return (
        <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 p-6">
              <h1 className="text-2xl font-semibold">
                {mode === "signup" ? "Create account" : "Sign in"}
              </h1>
              <form onSubmit={onSubmit} className="flex flex-col gap-3">
                {mode === "signup" && (
                    <input
                                  required
                                  autoComplete="name"
                                  placeholder="Name"
                                  value={name}
                                  onChange={(e) => setName(e.target.value)}
                                  className="rounded-md border px-3 py-2"
                                />
                  )}
                      <input
                                  required
                                  type="email"
                                  autoComplete="email"
                                  placeholder="Email"
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                  className="rounded-md border px-3 py-2"
                                />
                      <input
                                  required
                                  type="password"
                                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                                  placeholder="Password"
                                  value={password}
                                  minLength={8}
                                  onChange={(e) => setPassword(e.target.value)}
                                  className="rounded-md border px-3 py-2"
                                />
                {error ? <p className="text-sm text-red-600">{error}</p>p> : null}
                      <button
                                  type="submit"
                                  disabled={busy}
                                  className="rounded-md bg-black px-3 py-2 text-white disabled:opacity-50"
                                >
                        {busy ? "Please wait" : mode === "signup" ? "Create account" : "Sign in"}
                      </button>
              </form>
              <button
                        type="button"
                        className="text-sm underline"
                        onClick={() => {
                                    setMode(mode === "signup" ? "signin" : "signup");
                                    setError(null);
                        }}
                      >
                {mode === "signup"
                            ? "Already have an account? Sign in"
                            : "Need an account? Create one"}
              </button>
        </main>
      );
}
</main>
