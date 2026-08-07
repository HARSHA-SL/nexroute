import LoginForm from "./components/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0F172A] px-6">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#171B22] p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white">
            NexRoute
          </h1>

          <p className="mt-2 text-zinc-400">
            AI Powered Logistics Platform
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
    
  );
}