import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  Clock,
  Send,
  HelpCircle,
  ChevronDown,
  Headphones,
  Check,
  MessageCircle,
} from "lucide-react";
import { SEO } from "../components/SEO";
import toast from "react-hot-toast";

interface FAQItem {
  q: string;
  a: string;
  category: "all" | "general" | "donors" | "recipients" | "safety";
}

const FAQS: FAQItem[] = [
  {
    category: "general",
    q: "What is NutriShare and how does it work?",
    a: "NutriShare is an intelligent food rescue platform that connects hotels, restaurants, catering services, and supermarkets that have wholesome edible surplus meals directly to verified orphanages and social shelters across Yogyakarta using the Hybrid Shannon Entropy - TOPSIS optimization algorithm.",
  },
  {
    category: "general",
    q: "Are there any service or platform fees?",
    a: "None at all. NutriShare is 100% free for both donor partners and beneficiary welfare shelters. Our mission is to eliminate organic food waste and alleviate local food insecurity.",
  },
  {
    category: "donors",
    q: "How do hospitality food businesses post surplus meals?",
    a: "Register as a Donor through the registration portal. Once verified by the administrator, you can immediately post surplus food batches with portion counts, safe consumption hours, and nutrient details directly via your Donor Portal.",
  },
  {
    category: "safety",
    q: "How does NutriShare guarantee food safety and hygiene?",
    a: "Every donation strictly follows HACCP and BPOM compliance: meals must be untouched (clean surplus), packaged securely in food-grade containers, stored under temperature control (cold chain <4°C), and verified before pickup.",
  },
  {
    category: "recipients",
    q: "What is the verification procedure for orphanages and shelters?",
    a: "Shelter administrators register by providing legal organizational credentials (Ministry of Social Affairs / Kemenkumham permit). Our verification team validates documentation within 24 hours.",
  },
  {
    category: "donors",
    q: "Who handles logistics, pickup, and transportation?",
    a: "Meals can be picked up directly by the recipient shelter assigned by TOPSIS ranking, or transported via NutriShare volunteer dispatch network for large bulk batches and emergency situations.",
  },
];

export function Support() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [faqCategory, setFaqCategory] = useState<"all" | "general" | "donors" | "recipients" | "safety">("all");
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "", subject: "General Inquiry" });
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const filteredFaqs = faqCategory === "all" ? FAQS : FAQS.filter((f) => f.category === faqCategory);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success("Support ticket sent! Our team will contact you shortly.");
      setForm({ name: "", email: "", phone: "", message: "", subject: "General Inquiry" });
    }, 800);
  };

  const handleCopyWa = () => {
    navigator.clipboard.writeText("081234567890");
    setCopied(true);
    toast.success("WhatsApp hotline number copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#f4fbf7] bg-emerald-grid font-sans text-emerald-950 flex flex-col">
      <SEO title="Support & Help Center | NutriShare" description="User guides, FAQ, and technical support hotline for NutriShare." />

      {/* Top Header Navigation */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-emerald-100 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition-colors">
            <ArrowLeft size={16} /> <span>Back to Home</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <img
              src="/images/logoterbaru.webp"
              alt="NutriShare Logo"
              className="w-8 h-8 object-contain"
            />
            <span className="font-heading font-extrabold text-base text-emerald-950">
              Support &amp; FAQ
            </span>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="relative py-16 sm:py-20 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#34d399_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center space-y-4 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/20 text-[#e1fcad] text-xs font-bold border border-emerald-400/30">
            <Headphones size={13} />
            <span>Community Help Center &amp; Inquiry Portal</span>
          </span>
          <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
            How Can We Assist You?
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/80 max-w-xl mx-auto leading-relaxed">
            Find answers to frequently asked questions about the food rescue protocol, shelter verification, or reach our technical support team.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-12 space-y-12 flex-1">

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-emerald-100 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <MessageCircle size={20} />
            </div>
            <h3 className="font-bold text-sm text-slate-900">WhatsApp Hotline</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Instant coordination for urgent food pickups and logistics dispatch.</p>
            <button
              onClick={handleCopyWa}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer"
            >
              {copied ? <Check size={14} /> : <Phone size={14} />}
              <span>+62 812-3456-7890</span>
            </button>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-emerald-100 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Mail size={20} />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Official Email</h3>
            <p className="text-xs text-slate-500 leading-relaxed">For formal enterprise hospitality partnerships, corporate CSR, and social affairs.</p>
            <a href="mailto:support@nutrishare.org" className="mt-2 inline-block text-xs font-bold text-emerald-700 hover:underline">
              support@nutrishare.org
            </a>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-emerald-100 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Clock size={20} />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Operating Hours</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Monday - Sunday (07:00 - 22:00 WIB) Active monitoring for breakfast and dinner banquet surplus.</p>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
              Active 7 Days / Week
            </span>
          </div>
        </div>

        {/* FAQs & Message Form Bento */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* Left FAQ Accordion */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <HelpCircle size={16} className="text-emerald-700" />
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Frequently Asked Questions</span>
              </div>
              <h2 className="font-heading font-extrabold text-2xl text-emerald-950">
                Community FAQ
              </h2>
            </div>

            {/* Filter Categories */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white rounded-2xl border border-emerald-100 shadow-xs text-xs">
              {[
                { id: "all", label: "All Topics" },
                { id: "general", label: "General" },
                { id: "donors", label: "Donors" },
                { id: "recipients", label: "Recipients" },
                { id: "safety", label: "Food Safety" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFaqCategory(cat.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl font-bold uppercase text-[11px] transition-all cursor-pointer ${
                    faqCategory === cat.id ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-emerald-900 hover:bg-emerald-50"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Accordion List */}
            <div className="space-y-3">
              {filteredFaqs.map((faq, i) => {
                const isOpen = openFaq === i;
                return (
                  <div key={i} className="rounded-2xl bg-white border border-emerald-100 overflow-hidden shadow-xs transition-all">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      className="w-full p-4 text-left flex items-center justify-between gap-3 text-xs font-bold text-slate-900 hover:text-emerald-700 transition-colors cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown size={16} className={`shrink-0 transition-transform ${isOpen ? "rotate-180 text-emerald-700" : "text-slate-400"}`} />
                    </button>
                    {isOpen && (
                      <div className="p-4 pt-0 text-xs text-slate-600 leading-relaxed border-t border-emerald-50 bg-[#f4fbf7]/40">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Message Form */}
          <div className="lg:col-span-5 rounded-3xl bg-white border border-emerald-200/90 p-8 shadow-xl space-y-6">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">Get in Touch</span>
              <h3 className="font-heading font-extrabold text-xl text-emerald-950 mt-1">Direct Support Ticket</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-emerald-950 block mb-1">Full Name</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your Name / PIC"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-50/40 border border-emerald-200 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-emerald-600/30 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-emerald-950 block mb-1">Email</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="email@domain.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-50/40 border border-emerald-200 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-emerald-600/30 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-emerald-950 block mb-1">WhatsApp</label>
                  <input
                    required
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="0812xxxxxxxx"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-50/40 border border-emerald-200 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-emerald-600/30 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-emerald-950 block mb-1">Support Category</label>
                <select
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-50/40 border border-emerald-200 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-emerald-600/30 outline-none"
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Account Verification">Account Verification Status</option>
                  <option value="TOPSIS Inquiries">TOPSIS Algorithm Inquiries</option>
                  <option value="Partnership">Hospitality Partnership</option>
                  <option value="Other">Other Assistance</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-emerald-950 block mb-1">Message</label>
                <textarea
                  required
                  rows={3}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Describe your inquiry or issue..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-50/40 border border-emerald-200 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-emerald-600/30 outline-none"
                />
              </div>

              <button
                disabled={submitting}
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send size={13} />
                <span>{submitting ? "Sending..." : "Submit Support Ticket"}</span>
              </button>
            </form>
          </div>

        </div>

      </main>
    </div>
  );
}

export default Support;
