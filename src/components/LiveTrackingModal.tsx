import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import { X, CheckCircle, Clock, MapPin, Hand } from "lucide-react";
import "leaflet/dist/leaflet.css";
import "../lib/mapIcons";
import { donorIcon, recipientIcon, courierIcon } from "../lib/mapIcons";
import { api } from "../lib/api";
import toast from "react-hot-toast";

const SIMULATION_MS = 30000;

export function LiveTrackingModal({ donation, user, onClose, onComplete }: any) {
  const [progress, setProgress] = useState(0);
  const [arrivalConfirmed, setArrivalConfirmed] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);
  const isDonor = user?.id === donation.donor_id;

  useEffect(() => {
    let cancelled = false;
    api.fetchJSON(`/api/donations/${donation.id}`).then((d: any) => {
      if (cancelled) return;
      if (d.status === "completed") { setDone(true); return; }
      if (d.claimed_at) {
        const elapsed = Date.now() - new Date(d.claimed_at).getTime();
        if (elapsed >= SIMULATION_MS) setProgress(1);
        else setProgress(Math.max(0, elapsed / SIMULATION_MS));
      }
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [donation.id]);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(p => {
         if (p >= 1) {
           clearInterval(timer);
           return 1;
         }
         return p + 0.005;
      });
    }, 150);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isDonor || done) return;
    const poll = setInterval(async () => {
      try {
        const d = await api.fetchJSON(`/api/donations/${donation.id}`);
        if (d.status === "completed") {
          setDone(true);
          clearInterval(poll);
          toast.success("Donor telah mengkonfirmasi serah terima!");
          setTimeout(() => { onComplete?.(); onClose(); }, 2000);
        }
      } catch {}
    }, 3000);
    return () => clearInterval(poll);
  }, [isDonor, done]);

  const getLat = () => donation.donor_lat + (donation.recipient_lat - donation.donor_lat) * progress;
  const getLon = () => donation.donor_lon + (donation.recipient_lon - donation.donor_lon) * progress;

  const center: [number, number] = [
    (donation.donor_lat + donation.recipient_lat) / 2,
    (donation.donor_lon + donation.recipient_lon) / 2
  ];

  const handleConfirmArrival = async () => {
    setConfirming(true);
    try {
      await api.fetchJSON(`/api/donations/${donation.id}/complete`, { method: "POST" });
      setDone(true);
      toast.success("Serah terima berhasil dikonfirmasi!");
      setTimeout(() => { onComplete?.(); onClose(); }, 1500);
    } catch (err: any) {
      toast.error(err.message || "Gagal konfirmasi");
    } finally {
      setConfirming(false);
    }
  };

  const arrived = progress >= 1;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
       <div className="bg-white rounded-[2rem] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col border border-gray-100">
           <div className={`p-5 border-b flex justify-between items-center ${done ? 'bg-[#2D7A4F]' : arrived && !arrivalConfirmed ? 'bg-[#E65100]' : arrived ? 'bg-[#1565C0]' : 'bg-[#2D7A4F]'} text-white`}>
              <div>
                <div className="flex items-center gap-2">
                  {done ? (
                    <CheckCircle size={20} />
                  ) : (
                    <span className={`w-2 h-2 ${arrived ? 'bg-green-400' : 'bg-red-400'} rounded-full ${!arrived ? 'animate-pulse' : ''}`}></span>
                  )}
                  <h3 className="font-bold text-lg leading-tight">
                    {done ? "Pengiriman Selesai" : arrived && !arrivalConfirmed ? "Kurir Telah Sampai" : arrived ? "Tunggu Konfirmasi Serah Terima" : "Live Tracking Pengiriman"}
                  </h3>
                </div>
               <p className="text-sm opacity-80 mt-1">{donation.food_name}</p>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X size={24}/></button>
          </div>
          <div className="h-[60vh] w-full bg-gray-100 relative">
             <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
               <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" referrerPolicy="origin" />
               
                <Marker position={[donation.donor_lat, donation.donor_lon]} icon={donorIcon}>
                  <Popup><b>{donation.donor_name || "Lokasi Donor"}</b><br/>Titik Jemput</Popup>
                </Marker>
                
                <Marker position={[donation.recipient_lat, donation.recipient_lon]} icon={recipientIcon}>
                  <Popup><b>{donation.recipient_name || "Lokasi Penerima"}</b><br/>Tujuan</Popup>
                </Marker>

               <Polyline positions={[
                 [donation.donor_lat, donation.donor_lon],
                 [donation.recipient_lat, donation.recipient_lon]
               ]} color="#2D7A4F" weight={4} dashArray="8, 8" opacity={0.6} />

               {!done && (
                 <Marker position={[getLat(), getLon()]} icon={courierIcon} zIndexOffset={1000}>
                   <Popup>Kurir NUTRI-SHARE<br/>{(progress * 100).toFixed(0)}% Perjalanan Selesai</Popup>
                 </Marker>
               )}
             </MapContainer>
             
             {!done && (
               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] bg-white px-6 py-3 rounded-full shadow-lg border border-gray-100 flex items-center gap-4">
                  <div className="bg-gray-100 w-32 h-2 rounded-full overflow-hidden">
                     <div className="h-full bg-[#2D7A4F]" style={{ width: `${progress * 100}%` }}></div>
                  </div>
                  <span className="font-bold text-[#2D7A4F] text-sm whitespace-nowrap">{(progress * 100).toFixed(0)}% Selesai</span>
               </div>
             )}
          </div>

           {arrived && !done && !arrivalConfirmed && (
             <div className="p-5 bg-[#FFF3E0] border-t border-[#FFB74D]">
               <div className="flex items-start justify-between gap-4">
                 <div className="flex items-start gap-3">
                   <MapPin className="text-[#E65100] mt-1 shrink-0" size={24} />
                   <div>
                     <p className="font-bold text-[#E65100] text-lg">Kurir telah sampai di tujuan</p>
                     <p className="text-sm text-gray-600">{donation.recipient_name || "Penerima"}</p>
                     {isDonor ? (
                       <p className="text-xs text-gray-500 mt-1">Konfirmasi bahwa kurir telah tiba</p>
                     ) : (
                       <p className="text-xs text-gray-500 mt-1">Menunggu donor mengkonfirmasi kedatangan kurir...</p>
                     )}
                   </div>
                 </div>
<div className="flex gap-2 shrink-0">
                    {isDonor && (
                      <button
                        onClick={async () => {
                          try {
                            await api.fetchJSON(`/api/donations/${donation.id}/arrived`, { method: "POST" });
                            setArrivalConfirmed(true);
                          } catch (err: any) {
                            toast.error(err.message || "Gagal konfirmasi kedatangan");
                          }
                        }}
                        className="bg-[#E65100] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-opacity-90 shadow-md transition-all"
                      >
                        <Hand size={18} /> Konfirmasi Kedatangan
                      </button>
                    )}
                  </div>
               </div>
             </div>
           )}

           {arrived && arrivalConfirmed && !done && (
             <div className="p-5 bg-[#F0F8FF] border-t border-[#90CAF9]">
               <div className="flex items-start justify-between gap-4">
                 <div className="flex items-start gap-3">
                   <CheckCircle className="text-[#2D7A4F] mt-1 shrink-0" size={24} />
                   <div>
                     <p className="font-bold text-[#1565C0] text-lg">Kedatangan telah dikonfirmasi</p>
                     <p className="text-sm text-gray-600">{donation.recipient_name || "Penerima"}</p>
                     {isDonor ? (
                       <p className="text-xs text-gray-500 mt-1">Konfirmasi untuk menyelesaikan pengiriman</p>
                     ) : (
                       <p className="text-xs text-gray-500 mt-1">Menunggu donor mengkonfirmasi serah terima...</p>
                     )}
                   </div>
                 </div>
                 <div className="flex gap-2 shrink-0">
                   {isDonor && (
                     <button
                       onClick={handleConfirmArrival}
                       disabled={confirming}
                       className="bg-[#2D7A4F] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-opacity-90 shadow-md transition-all disabled:opacity-50"
                     >
                       {confirming ? (
                         <><Clock size={18} className="animate-spin" /> Memproses...</>
                       ) : (
                         <><CheckCircle size={18} /> Konfirmasi Selesai</>
                       )}
                     </button>
                   )}
                 </div>
               </div>
             </div>
           )}

          {done && (
            <div className="p-5 bg-[#E8F5E9] border-t border-[#52C77F] text-center">
              <CheckCircle size={40} className="mx-auto text-[#2D7A4F] mb-2" />
              <p className="font-bold text-[#2D7A4F] text-lg">Serah terima berhasil!</p>
              <p className="text-sm text-gray-600">Donasi telah selesai disalurkan ke {donation.recipient_name}</p>
            </div>
          )}
       </div>
    </div>
  );
}
