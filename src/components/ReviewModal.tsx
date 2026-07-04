import { useState } from "react";
import { X, Star } from "lucide-react";
import { api } from "../lib/api";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "motion/react";

export function ReviewModal({ donation, onClose, onReviewed }: any) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Silakan pilih rating bintang terlebih dahulu.");
      return;
    }
    
    setLoading(true);
    try {
      await api.fetchJSON("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donation_id: donation.donation_id,
          donor_id: donation.donor_id,
          recipient_id: donation.recipient_id,
          rating,
          comment
        })
      });
      toast.success("Terima kasih atas ulasan Anda!");
      onReviewed();
      onClose();
    } catch(err) {
      toast.error("Gagal mengirim ulasan");
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
          className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 relative border border-gray-100"
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black">
            <X size={24} />
          </button>
          <h2 className="text-xl font-bold mb-1 text-center">Beri Ulasan</h2>
          <p className="text-sm text-gray-500 mb-6 text-center">Bagaimana pengalaman Anda menerima makanan <b>{donation.food_name}</b> dari <b>{donation.donor_name}</b>?</p>
          
          <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  className={`transition-transform hover:scale-110 `}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(rating)}
                >
                  <Star 
                    size={40} 
                    className={star <= (hover || rating) ? "fill-[#F5A623] text-[#F5A623]" : "text-gray-300"} 
                  />
                </button>
              ))}
            </div>
            
            <textarea 
              placeholder="Bagikan pengalaman Anda, atau ucapan terima kasih kepada pahlawan pangan... (Opsional)" 
              value={comment} 
              onChange={(e) => setComment(e.target.value)} 
              className="w-full border border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-[#1565C0] outline-none resize-none transition-shadow"
              rows={4} 
            />
            
            <button disabled={loading} type="submit" className="w-full bg-[#1565C0] text-white font-bold py-3 rounded-xl hover:bg-opacity-90 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:active:scale-100">
              {loading ? "Mengirim..." : "Kirim Ulasan"}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
