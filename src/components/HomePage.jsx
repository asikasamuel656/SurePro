import { useState, useEffect } from "react";

// ── tiny pulse dot ──────────────────────────────────────────────
function Pulse() {
  return (
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
    </span>
  );
}

// ── tracker bar ─────────────────────────────────────────────────
function Tracker({ steps = 3, total = 4 }) {
  const dots = Array.from({ length: total });
  return (
    <div>
      <div className="flex items-center mt-3">
        {dots.map((_, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div
              className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                i < steps ? "bg-emerald-500" : i === steps ? "bg-amber-400" : "bg-gray-200"
              }`}
            />
            {i < total - 1 && (
              <div className={`flex-1 h-0.5 ${i < steps - 1 ? "bg-emerald-500" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-1">
        {["Booked", "Accepted", "En route", "Done"].map((l) => (
          <span key={l} className="text-[10px] text-gray-400">{l}</span>
        ))}
      </div>
    </div>
  );
}

// ── badge ────────────────────────────────────────────────────────
function Badge({ type }) {
  const map = {
    enroute: "bg-amber-100 text-amber-800",
    done: "bg-emerald-100 text-emerald-800",
    new: "bg-blue-100 text-blue-800",
  };
  const label = { enroute: "En route", done: "Completed ✓", new: "New request" };
  return (
    <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap ${map[type]}`}>
      {label[type]}
    </span>
  );
}

// ── live panel ───────────────────────────────────────────────────
function LivePanel() {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 w-full max-w-sm ml-auto">
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3.5">Live jobs</p>

      {/* card 1 */}
      <div className="bg-white border border-gray-200 rounded-xl p-3.5 mb-2.5">
        <div className="flex justify-between items-start mb-2">
          <span className="text-sm font-medium">Electrical fault repair</span>
          <Badge type="enroute" />
        </div>
        <div className="flex gap-3 text-xs text-gray-400">
          <span>👤 Emeka A.</span>
          <span>📍 Lekki Phase 1</span>
        </div>
        <Tracker steps={3} total={4} />
      </div>

      {/* card 2 */}
      <div className="bg-white border border-gray-200 rounded-xl p-3.5 mb-2.5">
        <div className="flex justify-between items-start mb-2">
          <span className="text-sm font-medium">Burst pipe fix</span>
          <Badge type="done" />
        </div>
        <div className="flex gap-3 text-xs text-gray-400">
          <span>👤 Funmi O.</span>
          <span>📍 Yaba</span>
          <span>⭐ 5.0</span>
        </div>
      </div>

      {/* card 3 */}
      <div className="bg-white border border-gray-200 rounded-xl p-3.5">
        <div className="flex justify-between items-start mb-2">
          <span className="text-sm font-medium">AC installation</span>
          <Badge type="new" />
        </div>
        <div className="flex gap-3 text-xs text-gray-400">
          <span>👤 Kemi T.</span>
          <span>📍 Victoria Island</span>
        </div>
      </div>
    </div>
  );
}

// ── categories ───────────────────────────────────────────────────
const CATS = [
  { icon: "⚡", name: "Electricians", count: "38 verified", bg: "bg-emerald-50", fg: "text-emerald-700" },
  { icon: "💧", name: "Plumbers", count: "24 verified", bg: "bg-blue-50", fg: "text-blue-700" },
  { icon: "🏠", name: "Cleaners", count: "51 verified", bg: "bg-amber-50", fg: "text-amber-700" },
  { icon: "🎨", name: "Painters", count: "17 verified", bg: "bg-orange-50", fg: "text-orange-700" },
  { icon: "❄️", name: "AC Technicians", count: "22 verified", bg: "bg-emerald-50", fg: "text-emerald-800" },
  { icon: "🪚", name: "Carpenters", count: "19 verified", bg: "bg-violet-50", fg: "text-violet-700" },
];

function CategoryGrid() {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
      {CATS.map((c) => (
        <div
          key={c.name}
          className="bg-white border border-gray-200 rounded-2xl p-5 text-center cursor-pointer
                     hover:border-emerald-400 hover:-translate-y-0.5 transition-all duration-150"
        >
          <div className={`w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center text-2xl ${c.bg}`}>
            {c.icon}
          </div>
          <p className="text-sm font-medium mb-0.5">{c.name}</p>
          <p className="text-xs text-gray-400">{c.count}</p>
        </div>
      ))}
    </div>
  );
}

// ── steps ────────────────────────────────────────────────────────
const STEPS = [
  { n: 1, title: "Request a service", desc: "Pick your category, describe the job, and enter your address. Takes under 2 minutes." },
  { n: 2, title: "Get matched", desc: "We connect you with a verified nearby professional — usually within minutes." },
  { n: 3, title: "Track the job", desc: "Follow progress live. Receive before and after photo proof on WhatsApp." },
  { n: 4, title: "Pay and rate", desc: "Pay only when the job is complete. Rate your experience to help the next customer." },
];

// ── verify cards ─────────────────────────────────────────────────
const VERIFY = [
  { icon: "🪪", title: "National ID verified", desc: "Every pro submits a valid NIN or government-issued ID before listing on the platform." },
  { icon: "📱", title: "Phone number confirmed", desc: "Active phone verification ensures customers can always reach their assigned professional." },
  { icon: "📷", title: "Photo proof on every job", desc: "Pros upload before-and-after photos on completion, building a public portfolio of real work." },
  { icon: "⭐", title: "Verified customer reviews", desc: "Only customers who completed a booking can leave a review. No fake ratings." },
];

// ── diaspora demo ─────────────────────────────────────────────────
function DiasporaDemo() {
  const updates = [
    { text: "Plumber Bello A. arrived at the property", time: "10:14am" },
    { text: "Work started — burst pipe in kitchen", time: "10:22am" },
  ];
  return (
    <div className="bg-emerald-950 rounded-2xl p-5">
      <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-3.5">
        Job updates — Ikeja family home
      </p>
      {updates.map((u) => (
        <div key={u.text} className="bg-emerald-800 rounded-lg px-3.5 py-2.5 mb-2 flex items-center gap-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
          <span className="text-xs text-emerald-200 flex-1">{u.text}</span>
          <span className="text-[11px] text-emerald-500">{u.time}</span>
        </div>
      ))}
      <div className="bg-emerald-700 rounded-lg h-12 flex items-center justify-center gap-2 text-xs text-emerald-100 my-2">
        📷 Before photo uploaded by Bello A.
      </div>
      <div className="bg-emerald-950 border border-emerald-700 rounded-lg px-3.5 py-2.5 mb-2 flex items-center gap-2.5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 flex-shrink-0" />
        <span className="text-xs text-emerald-200 flex-1">Job complete ✓ — pipe replaced and sealed</span>
        <span className="text-[11px] text-emerald-500">11:48am</span>
      </div>
      <div className="bg-emerald-600 rounded-lg h-12 flex items-center justify-center gap-2 text-xs text-emerald-100">
        📷 After photo uploaded by Bello A.
      </div>
    </div>
  );
}

// ── main app ─────────────────────────────────────────────────────
export default function SurePro() {
  return (
    <div className="font-sans text-gray-900 bg-white leading-relaxed">

      {/* NAV */}
      <nav className="flex items-center justify-between px-10 py-4 border-b border-gray-100 bg-white sticky top-0 z-50">
        <div className="text-xl font-semibold tracking-tight">
          Sure<span className="text-emerald-600">Pro</span>
        </div>
        <div className="flex items-center gap-7">
          <a href="#" className="text-sm text-gray-500 hover:text-gray-900 hidden sm:block">Services</a>
          <a href="#" className="text-sm text-gray-500 hover:text-gray-900 hidden sm:block">How it works</a>
          <a href="#" className="text-sm text-gray-500 hover:text-gray-900 hidden sm:block">Become a pro</a>
          <button className="bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors">
            Book a service
          </button>
        </div>
      </nav>

      {/* HERO */}
      <div className="max-w-6xl mx-auto px-10">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-14 py-20 items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-medium px-3.5 py-1.5 rounded-full mb-6">
              ✓ Verified professionals only
            </div>
            <h1 className="text-5xl font-semibold leading-[1.1] tracking-tight text-gray-900 mb-5">
              Find trusted local pros<br />— and track every<br />
              <em className="not-italic text-emerald-500">job live</em>
            </h1>
            <p className="text-base text-gray-500 leading-relaxed mb-8 max-w-md">
              Book verified electricians, plumbers, cleaners, and technicians in Lagos. Photo proof. Real-time updates. Pay only when done.
            </p>
            <div className="flex gap-3 flex-wrap">
              <button className="bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-medium px-7 py-3.5 rounded-xl transition-colors">
                Book a service →
              </button>
              <button className="border border-gray-300 hover:bg-gray-50 text-gray-800 text-sm font-medium px-7 py-3.5 rounded-xl transition-colors">
                Join as a professional
              </button>
            </div>
            <div className="flex items-center gap-2 mt-5 text-sm text-gray-400">
              <Pulse />
              14 jobs completed in Lagos today
            </div>
          </div>
          <LivePanel />
        </section>
      </div>

      {/* PROOF BAR */}
      <div className="flex flex-wrap gap-6 justify-center px-10 py-5 border-t border-b border-gray-100">
        {[
          "✅ NIN-verified professionals",
          "📷 Before & after photo proof",
          "📍 Lagos-based, fast response",
          "💬 WhatsApp job updates",
          "🔒 Pay only when done",
        ].map((item) => (
          <div key={item} className="flex items-center gap-2 text-sm text-gray-500">{item}</div>
        ))}
      </div>

      {/* CATEGORIES */}
      <div className="max-w-6xl mx-auto px-10 py-16">
        <p className="text-xs font-semibold tracking-widest uppercase text-emerald-600 mb-2">Services</p>
        <div className="flex justify-between items-end mb-8 flex-wrap gap-3">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-gray-900">Book the right pro for every job</h2>
            <p className="text-sm text-gray-500 mt-1.5 max-w-sm">
              Every professional is identity-verified and rated by real customers before they list on SurePro.
            </p>
          </div>
        </div>
        <CategoryGrid />
      </div>

      {/* URGENT */}
      <div className="max-w-6xl mx-auto px-10 pb-10">
        <div className="bg-amber-900 rounded-2xl px-8 py-7 flex items-center justify-between gap-5 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 bg-amber-400 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
              ⚡
            </div>
            <div>
              <p className="text-lg font-semibold text-amber-200 mb-1">Need help urgently?</p>
              <p className="text-sm text-amber-400">
                Electrician, plumber, or generator repair within the hour — premium rates apply
              </p>
            </div>
          </div>
          <button className="bg-amber-400 hover:bg-amber-300 text-amber-900 font-semibold text-sm px-6 py-3.5 rounded-xl whitespace-nowrap transition-colors">
            Book emergency service →
          </button>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="bg-gray-50">
        <div className="max-w-6xl mx-auto px-10 py-16">
          <p className="text-xs font-semibold tracking-widest uppercase text-emerald-600 mb-2">How it works</p>
          <h2 className="text-3xl font-semibold tracking-tight text-gray-900">From request to rated in 4 steps</h2>
          <div className="bg-white border border-gray-200 rounded-2xl p-10 mt-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {STEPS.map((s) => (
                <div key={s.n} className="text-center px-3 py-2">
                  <div className="w-9 h-9 rounded-full bg-emerald-700 text-white text-sm font-medium flex items-center justify-center mx-auto mb-3.5">
                    {s.n}
                  </div>
                  <p className="text-sm font-medium mb-1.5">{s.title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* VERIFICATION */}
      <div className="max-w-6xl mx-auto px-10 py-16">
        <p className="text-xs font-semibold tracking-widest uppercase text-emerald-600 mb-2">Trust & verification</p>
        <h2 className="text-3xl font-semibold tracking-tight text-gray-900 mb-2">We vet every professional</h2>
        <p className="text-sm text-gray-500 mb-10 max-w-md">
          Anyone can claim experience. We verify it before they appear on SurePro.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {VERIFY.map((v) => (
            <div key={v.title} className="bg-white border border-gray-200 rounded-2xl p-5">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-xl mb-3.5">
                {v.icon}
              </div>
              <p className="text-sm font-medium mb-1.5">{v.title}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* DIASPORA */}
      <div className="max-w-6xl mx-auto px-10 pb-16">
        <div className="bg-emerald-950 rounded-2xl p-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-emerald-400 mb-2">For the diaspora</p>
            <h2 className="text-3xl font-semibold text-emerald-300 tracking-tight mb-4">
              Care for family at home — from anywhere in the world
            </h2>
            <p className="text-sm text-emerald-500 leading-relaxed mb-6">
              Living in the UK, US, or Canada? Book and pay for home services for your parents in Lagos. Get photo updates and a completion report, without a single phone call back home.
            </p>
            {[
              { icon: "📍", text: "You're in London. Your parents are in Ikeja. We handle everything between." },
              { icon: "📷", text: "Before and after photos delivered to your WhatsApp in real time." },
              { icon: "💳", text: "Pay securely in GBP, USD, or EUR. No naira transfers needed." },
            ].map((f) => (
              <div key={f.text} className="flex gap-3 mb-3.5 items-start">
                <span className="text-base mt-0.5 flex-shrink-0">{f.icon}</span>
                <span className="text-sm text-emerald-300 leading-relaxed">{f.text}</span>
              </div>
            ))}
          </div>
          <DiasporaDemo />
        </div>
      </div>

      {/* CTA FOOTER */}
      <div className="text-center px-10 py-20 border-t border-gray-100">
        <p className="text-xs font-semibold tracking-widest uppercase text-emerald-600 mb-2.5">Get started</p>
        <h2 className="text-4xl font-semibold tracking-tight text-gray-900 mb-3.5">
          Your first booking takes<br />under two minutes
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed mb-8">
          Join 800+ Lagos residents who've moved from "finding a guy"<br />
          to booking a verified professional with live job tracking.
        </p>
        <div className="flex gap-3.5 justify-center flex-wrap">
          <button className="bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-sm px-8 py-4 rounded-xl transition-colors">
            Book your first service →
          </button>
          <button className="border border-gray-300 hover:bg-gray-50 text-gray-800 font-medium text-sm px-8 py-4 rounded-xl transition-colors">
            Join as a professional
          </button>
        </div>
      </div>

      {/* SITE FOOTER */}
      <footer className="flex justify-between items-center flex-wrap gap-3 px-10 py-6 border-t border-gray-100">
        <div className="text-base font-semibold tracking-tight">
          Sure<span className="text-emerald-600">Pro</span>
        </div>
        <div className="flex gap-5">
          {["Services", "For providers", "Diaspora", "Contact"].map((l) => (
            <a key={l} href="#" className="text-sm text-gray-400 hover:text-gray-700">{l}</a>
          ))}
        </div>
        <span className="text-sm text-gray-300">© 2025 SurePro. Nigeria.</span>
      </footer>
    </div>
  );
}