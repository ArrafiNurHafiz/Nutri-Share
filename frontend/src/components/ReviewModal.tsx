import { useState } from "react";
import { X, Star, Heart } from "lucide-react";
import { api } from "../lib/api";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "motion/react";

export function ReviewModal({ donation, onClose, onReviewed }: any) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const donationId = Number(donation?.donation_id || donation?.id);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Mohon pilih rating bintang (1 - 5) terlebih dahulu.");
      return;
    }

    setLoading(true);
    try {
      await api.fetchJSON("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donation_id: donationId,
          donor_id: donation.donor_id,
          recipient_id: donation.recipient_id,
          rating,
          comment,
        }),
      });
      toast.success("Terima kasih atas ulasan dan apresiasi Anda! ⭐");
      onReviewed?.();
      onClose?.();
    } catch (err: any) {
      toast.error(err?.message || "Gagal mengirim ulasan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: -20 }}
          className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 relative border border-stone-200"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1.5 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X size={20} />
          </button>
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Heart size={24} className="fill-amber-500 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-center text-stone-900 font-heading">
            Beri Penilaian & Ulasan
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mb-6 text-center leading-relaxed">
            Bagaimana kualitas dan kondisi makanan <b>{donation.food_name}</b> dari{" "}
            <b>{donation.donor_name || "Donatur"}</b>?
          </p>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-center gap-5"
          >
            <div className="flex gap-2.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  className="transition-transform hover:scale-125 active:scale-95 cursor-pointer p-1"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(rating)}
                  aria-label={`${star} bintang`}
                >
                  <Star
                    size={36}
                    className={
                      star <= (hover || rating)
                        ? "fill-[#F5A623] text-[#F5A623] drop-shadow-xs"
                        : "text-stone-300"
                    }
                  />
                </button>
              ))}
            </div>

            <textarea
              placeholder="Ceritakan kondisi makanan, rasa, ketepatan porsi, atau ucapan terima kasih kepada pahlawan pangan..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border border-stone-200 p-3.5 rounded-xl text-xs focus:ring-2 focus:ring-[#2D7A4F]/30 outline-none resize-none transition-shadow bg-stone-50 focus:bg-white"
              rows={4}
            />

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-[#2D7A4F] hover:bg-emerald-800 text-white font-bold py-3 rounded-xl transition-all shadow-sm active:scale-98 disabled:opacity-50 cursor-pointer text-xs flex items-center justify-center gap-2"
            >
              {loading ? "Mengirimkan Ulasan..." : "Kirim Penilaian Donatur"}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
