import { Link } from "react-router-dom";
import { motion } from "motion/react"
import { SEO } from "../components/SEO";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F7F4EE] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="text-center max-w-md"
      >
        <div className="text-8xl font-black text-[#2D7A4F]/20 mb-4">404</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-3">Halaman Tidak Ditemukan</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Halaman yang Anda cari mungkin telah dipindahkan, dihapus, atau tidak pernah ada.
          Tenang, masih ada makanan bergizi yang menunggu untuk disalurkan!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="bg-[#2D7A4F] text-white px-6 py-3 rounded-xl font-bold inline-flex items-center gap-2 hover:bg-opacity-90 transition-all shadow-md"
          >
            <Home size={18} /> Kembali ke Beranda
          </Link>
          <Link
            to="/login"
            className="bg-white border border-[#2D7A4F] text-[#2D7A4F] px-6 py-3 rounded-xl font-bold inline-flex items-center gap-2 hover:bg-gray-50 transition-all"
          >
            <ArrowLeft size={18} /> Masuk ke Akun
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
