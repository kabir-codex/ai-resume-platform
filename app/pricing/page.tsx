"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const plans = [
  { name: "Free", price: "$0", features: ["3 resume analyses", "Basic interview questions", "Limited chat"] },
  { name: "Pro", price: "$19/mo", features: ["Unlimited resume analyses", "Advanced interview prep", "Unlimited chat", "Priority support"] },
];

export default function PricingPage() {
  const { data: session } = useSession();
  const router = useRouter();

  async function upgrade() {
    if (!session) { router.push("/login"); return; }
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-10 text-slate-900 dark:text-slate-50">Simple, transparent pricing</h1>
      <div className="grid md:grid-cols-2 gap-6">
        {plans.map((p) => (
          <div key={p.name} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">{p.name}</h3>
            <p className="text-3xl font-extrabold my-4 text-slate-900 dark:text-slate-50">{p.price}</p>
            <ul className="space-y-2 mb-6 text-sm text-slate-600 dark:text-slate-400">
              {p.features.map((f) => <li key={f}>✓ {f}</li>)}
            </ul>
            {p.name === "Pro" ? (
              <button onClick={upgrade} className="w-full bg-brand-600 text-white py-2 rounded-lg font-semibold hover:bg-brand-700">
                Upgrade to Pro
              </button>
            ) : (
              <button disabled className="w-full border border-slate-300 dark:border-slate-600 py-2 rounded-lg font-semibold text-slate-400">
                Current default
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

