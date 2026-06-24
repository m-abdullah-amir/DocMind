"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="glass-panel p-8 sm:p-10 flex flex-col items-center text-center max-w-sm w-full">
        <h1 className="text-2xl sm:text-3xl font-semibold mb-4 text-white">DocMind</h1>
        <p className="text-sm sm:text-base text-[#D9CBC2] mb-8">Sign in to organize your academic life with AI.</p>
        <button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="w-full sm:w-auto bg-[#E0C58F] text-[#173450] font-semibold py-3 px-6 rounded hover:bg-[#dec38d] transition-colors text-sm sm:text-base"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
