import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useAuth } from "../hooks/useAuth";
export default function LoginForm() {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    try {
      setLoading(true);

      await login({
        email,
        password,
      });

      toast.success("Login successful!");

      navigate("/");
    } catch {
      toast.error("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full space-y-5"
    >
      <div>
        <label className="mb-2 block text-sm text-zinc-400">
          Email
        </label>

        <input
          type="email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          className="w-full rounded-xl border border-zinc-700 bg-[#1C222B] p-3 text-white outline-none focus:border-blue-500"
          placeholder="admin@nexroute.com"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-zinc-400">
          Password
        </label>

        <input
          type="password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          className="w-full rounded-xl border border-zinc-700 bg-[#1C222B] p-3 text-white outline-none focus:border-blue-500"
          placeholder="********"
          required
        />
      </div>

      <button
        disabled={loading}
        className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Signing In..." : "Login"}
      </button>
    </form>
  );
}