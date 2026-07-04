import { z, ZodSchema } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email wajib diisi").email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const registerDonorSchema = z.object({
  business_name: z.string().min(1, "Nama bisnis wajib diisi"),
  email: z.string().min(1, "Email wajib diisi").email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  business_type: z.enum(["hotel", "restoran", "kafe", "katering", "lainnya"]),
  address: z.string().min(1, "Alamat wajib diisi"),
  latitude: z.string().min(1, "Latitude wajib diisi"),
  longitude: z.string().min(1, "Longitude wajib diisi"),
  phone: z.string().min(1, "Nomor telepon wajib diisi"),
});

export const registerRecipientSchema = z.object({
  institution_name: z.string().min(1, "Nama institusi wajib diisi"),
  email: z.string().min(1, "Email wajib diisi").email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  institution_type: z.enum(["panti_asuhan", "rumah_singgah", "lembaga_sosial", "lainnya"]),
  address: z.string().min(1, "Alamat wajib diisi"),
  latitude: z.string().min(1, "Latitude wajib diisi"),
  longitude: z.string().min(1, "Longitude wajib diisi"),
  phone: z.string().min(1, "Nomor telepon wajib diisi"),
  resident_count: z.string().min(1, "Jumlah penghuni wajib diisi"),
  age_range: z.string().min(1, "Rentang usia wajib diisi"),
  health_condition: z.string().min(1, "Kondisi kesehatan wajib diisi"),
  daily_protein_need: z.string().min(1, "Kebutuhan protein wajib diisi"),
  daily_calorie_need: z.string().min(1, "Kebutuhan kalori wajib diisi"),
  daily_iron_need: z.string().min(1, "Kebutuhan zat besi wajib diisi"),
  daily_vitamin_c_need: z.string().min(1, "Kebutuhan vitamin C wajib diisi"),
});

export const registerAdminSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  email: z.string().min(1, "Email wajib diisi").email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  admin_key: z.string().min(1, "Kunci admin wajib diisi"),
});

export const createDonationSchema = z.object({
  food_name: z.string().min(1, "Nama makanan wajib diisi"),
  food_type: z.enum(["makanan_berat", "sayur", "lauk_protein", "snack", "minuman", "lainnya"]),
  portion_count: z.string().regex(/^\d+$/, "Jumlah porsi harus angka"),
  protein_per_portion: z.string().regex(/^\d+(\.\d+)?$/, "Protein harus angka"),
  calorie_per_portion: z.string().regex(/^\d+(\.\d+)?$/, "Kalori harus angka"),
  hours_valid: z.string().regex(/^\d+$/, "Masa berlaku harus angka"),
  pickup_latitude: z.string().min(1, "Latitude wajib diisi"),
  pickup_longitude: z.string().min(1, "Longitude wajib diisi"),
  notes: z.string().optional().default(""),
  iron_mg: z.string().optional(),
  vitamin_c_mg: z.string().optional(),
});

export const claimDonationSchema = z.object({
  recipient_id: z.number().int().positive("ID penerima tidak valid").optional(),
});

export const reviewSchema = z.object({
  donation_id: z.number().int().positive(),
  donor_id: z.number().int().positive(),
  recipient_id: z.number().int().positive(),
  rating: z.number().int().min(1, "Rating minimal 1").max(5, "Rating maksimal 5"),
  comment: z.string().optional().default(""),
});

export const adminVerifySchema = z.object({
  urgency_score: z.string().optional(),
});

export const emergencySchema = z.object({
  user_id: z.number().int().positive("ID user tidak valid"),
});

export function validate(schema: ZodSchema) {
  return (req: any, res: any, next: any) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const first: any = result.error.issues[0];
      const msg = first.code === "invalid_type"
        ? "Field '" + first.path.join(".") + "' wajib diisi"
        : first.message;
      res.status(400).json({ message: msg });
      return;
    }
    req.body = result.data;
    next();
  };
}
