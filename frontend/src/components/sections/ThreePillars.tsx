import { UtensilsCrossed, Users, Truck, Check, Network } from "lucide-react";
import { Link } from "react-router-dom";

const PILLARS = [
  {
    icon: UtensilsCrossed,
    title: "HoReKa Donors",
    role: "Hotels, Restaurants & Catering",
    stat: "15+ Active Partners",
    desc: "Channel high-quality surplus meals before consumption window expires to prevent organic food waste in landfills.",
    img: "/images/donor_kitchen.jpg",
    ctaLabel: "Join as Donor",
    ctaLink: "/register/donor",
    items: [
      "Fast surplus entry in under 2 minutes",
      "Automated ESG & CO₂e reduction metrics",
      "Enhanced CSR credentials & audit certificates",
    ],
  },
  {
    icon: Users,
    title: "Beneficiary Shelters",
    role: "Orphanages & Social Homes",
    stat: "24 Verified Shelters",
    desc: "Receive balanced, nutritious meals allocated fairly based on real deficit rankings without manual queue bias.",
    img: "/images/recipient_kids.jpg",
    ctaLabel: "Register as Recipient",
    ctaLink: "/register/recipient",
    items: [
      "100% free nutritious food supply",
      "Objective priority based on calorie & protein needs",
      "Real-time schedule & delivery tracking",
    ],
  },
  {
    icon: Truck,
    title: "Logistics & Volunteers",
    role: "Rapid Dispatch Fleet",
    stat: "Avg. <45 Minutes",
    desc: "Maintain strict cold chain and hygienic standards from donor kitchens to dining tables with route optimization.",
    img: "/images/delivery.webp",
    ctaLabel: "Learn More",
    ctaLink: "/support",
    items: [
      "Automated GIS-based route pickup",
      "Digital proof-of-delivery with geotags & photos",
      "Food-grade temperature-controlled containers",
    ],
  },
];

export function ThreePillars() {
  return (
    <section id="ecosystem" className="relative py-20 sm:py-28 bg-[#f8fafc] text-slate-900 border-b border-emerald-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <Network size={13} className="text-emerald-700" />
            <span>Three-Pillar Collaborative Ecosystem</span>
          </div>
          <h2 className="font-heading font-extrabold text-3xl sm:text-5xl text-emerald-950 tracking-tight">
            Integrated Food Network
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Sustainable synergy between commercial food providers, verified social shelters, and logistics volunteers across Yogyakarta.
          </p>
        </div>

        {/* 3 Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PILLARS.map((p, idx) => (
            <div
              key={idx}
              className="rounded-3xl bg-white border border-emerald-100 hover:border-emerald-300 flex flex-col justify-between overflow-hidden group transition-all duration-300 hover:-translate-y-1 shadow-xs hover:shadow-md"
            >
              <div>
                {/* Photo Header */}
                <div className="relative h-48 w-full bg-emerald-50 overflow-hidden">
                  <img
                    src={p.img}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-lg bg-white/90 backdrop-blur-md text-emerald-950 text-xs font-bold border border-emerald-200/60 shadow-xs">
                    {p.title}
                  </div>
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-emerald-950/85 backdrop-blur-md text-[#e1fcad] text-[11px] font-semibold">
                    {p.stat}
                  </div>
                </div>

                {/* Content & Checklist */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="font-heading font-bold text-lg text-emerald-950 leading-tight">
                      {p.title}
                    </h3>
                    <span className="text-xs font-semibold text-emerald-700 block mt-1">
                      {p.role}
                    </span>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {p.desc}
                    </p>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-100">
                    {p.items.map((item, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700">
                        <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                          <Check size={11} />
                        </div>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-6 pt-0">
                <Link
                  to={p.ctaLink}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs text-center block transition-all shadow-xs"
                >
                  {p.ctaLabel}
                </Link>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
