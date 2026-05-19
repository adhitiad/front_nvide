# 🚀 NVide Live - Frontend Developer & Maintenance Guide

Selamat datang di repositori frontend **NVide Live**! Proyek ini dibangun menggunakan **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS**, dan **Zustand** untuk manajemen state.

Panduan ini dirancang khusus agar developer baru atau tim pemelihara sistem dapat dengan mudah melakukan pembaruan, perbaikan bug, atau penambahan fitur di masa mendatang tanpa merusak struktur kode yang ada.

---

## 📁 1. Struktur Folder & Desain Pola (Clean Architecture)

Kami menerapkan struktur modular untuk memisahkan logika bisnis dari komponen tampilan (UI):

```text
front_nvide/
├── src/
│   ├── app/                 # Halaman & Rute Aplikasi (Next.js App Router)
│   │   ├── admin/           # Dasbor Keamanan & Moderasi Admin
│   │   ├── creator/         # Tokenisasi Kreator & Detail Kurva Bonding
│   │   ├── dashboard/       # Streamer Creator Studio (Kunci Siaran Dual)
│   │   ├── settings/        # Pengaturan Privasi Tinggi & Blokir/Mute
│   │   ├── streams/         # Halaman Nonton Live & AI Short Clips
│   │   └── vod/             # Galeri VOD & Enkripsi DRM Player
│   │
│   ├── components/          # Komponen UI Modular & Reusable (Shadcn/Custom)
│   │   ├── HLSPlayer.tsx    # Pemutar HLS Video terenkripsi DRM
│   │   ├── PredictionPanel.tsx # Panel Betting Pasar Prediksi
│   │   └── ReportModal.tsx  # Dialog Pelaporan Konten
│   │
│   ├── hooks/               # Custom Hooks (Pembungkus Logika & Sinkronisasi API)
│   ├── store/               # State Management (Zustand Global Stores)
│   └── lib/                 # Utilitas Inti (Axios Interceptor & Auth Client)
```

- **Prinsip Alur Data**: 
  `API / Server Fallback` ➡️ `Zustand Store` ➡️ `Custom Hook` ➡️ `Page / Component UI`

---

## 🧠 2. Panduan Pemeliharaan State Management (Zustand)

Setiap fitur memiliki store tersendiri di dalam `/src/store` untuk menghindari tumpang tindih state global.

### A. Cara Memperbarui API di Store:
Jika skema endpoint backend berubah, Anda hanya perlu mengedit file store terkait di `/src/store/use[Feature]Store.ts`. 

**Contoh Template Edit Store:**
```typescript
import { create } from "zustand";
import api from "@/lib/api";

export const useMyFeatureStore = create((set) => ({
  data: [],
  loading: false,
  
  fetchData: async () => {
    set({ loading: true });
    try {
      // 1. Panggil API backend menggunakan instance Axios yang sudah terenkapsulasi
      const res = await api.get("/new-endpoint-path");
      
      // Catatan: response interceptor di src/lib/api.ts secara otomatis mengembalikan 'res.data'
      set({ data: res, loading: false }); 
    } catch (err) {
      // 2. Berikan fallback dummy terstruktur agar UI tidak crash jika backend offline
      set({ data: DUMMY_FALLBACK, loading: false });
    }
  }
}));
```

### B. Mekanisme Fallback Data (Offline Resiliency)
Semua store baru (seperti `useVODStore`, `usePredictionStore`, `useClipStore`, `usePrivacyStore`, dll.) telah dilengkapi dengan data **fallback/dummy terstruktur**. 
> 💡 *Manfaat*: Developer dapat melakukan pengetesan UI secara instan bahkan ketika database postgresql lokal atau backend Go sedang offline.

---

## 🔌 3. Integrasi API & Autentikasi (Axios & JWT)

Klien API didefinisikan di `src/lib/api.ts` menggunakan instance **Axios**. 

- **Token Bearer JWT**: Disematkan secara otomatis di header permintaan jika token tersedia di penyimpanan lokal.
- **Auto Refresh Token**: Jika server mengembalikan status `401 (Unauthorized)`, interceptor Axios akan melakukan panggilan ke `/auth/refresh` secara otomatis untuk memperbarui token akses di belakang layar sebelum mengulangi permintaan asli.
- **Penyaringan Keamanan Tinggi**: Di dalam chat room (`/streams/[id]/page.tsx`), pesan dari pengguna yang diblokir atau dibisukan disaring secara real-time di sisi klien menggunakan store `usePrivacyStore`.

---

## 🛠️ 4. Langkah-Langkah Menambahkan Fitur Baru

Untuk menambahkan fitur baru dengan rapi, ikuti 5 langkah ini:

1. **Definisikan Type TypeScript**: Tambahkan interface data baru di folder `/src/store` atau buat file tipe baru.
2. **Buat Zustand Store**: Buat berkas `/src/store/use<NamaFitur>Store.ts` untuk mengelola fetch data API dan data fallback.
3. **Buat Custom Hook**: Buat berkas `/src/hooks/use<NamaFitur>.ts` untuk membungkus store dan menambahkan efek samping seperti sinkronisasi timer atau pemantauan WebSocket.
4. **Buat Komponen UI**: Buat komponen pembantu di `/src/components` jika antarmuka akan digunakan berulang kali.
5. **Buat Rute Halaman**: Buat folder rute di `/src/app/<nama-rute>/page.tsx` lalu hubungkan hook ke dalam tampilan halaman.

---

## 🚀 5. Perintah Pengembangan Lokal

Gunakan **Bun** atau **NPM** untuk mengoperasikan server pengembangan:

```bash
# 1. Install dependensi
npm install  # atau bun install

# 2. Jalankan mode pengembangan dengan reload otomatis
npm run dev  # atau bun dev

# 3. Lakukan build produksi untuk audit tipe TypeScript & linter
npm run build
```

---

## 🛡️ 6. Checklist Sebelum Melakukan Pull Request (PR)

Sebelum menyerahkan kode baru ke repositori produksi, pastikan developer melakukan verifikasi berikut:
- [ ] Menjalankan `npm run build` dan memastikan **0 error TypeScript** serta **0 error linter**.
- [ ] Memastikan tidak ada properti HTML ilegal (seperti `title` langsung di dalam tag ikon Lucide-React). Gunakan pembungkus `<span>` jika memerlukan atribut tooltip.
- [ ] Memastikan bahwa loading skeleton tampil dengan harmonis saat memicu data fetching.
- [ ] Memastikan layout responsif untuk format ganda (Landscape 16:9 & Portrait 9:16) sudah diuji.
