import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // Tambahkan Header CORS sederhana agar bisa diakses dari file HTML lokal saat testing
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const KV_KEY = 'kamus_singkatan_data';

  // 1. JIKA REQ METHOD GET: Ambil semua data singkatan
  if (req.method === 'GET') {
    try {
      const data = await kv.get(KV_KEY) || {};
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Gagal mengambil data dari KV Storage' });
    }
  }

  // 2. JIKA REQ METHOD POST: Tambah singkatan baru
  if (req.method === 'POST') {
    try {
      const { singkatan, arti } = req.body;
      if (!singkatan || !arti) {
        return res.status(400).json({ error: 'Singkatan dan arti wajib diisi' });
      }

      // Ambil data lama, masukkan data baru, lalu simpan kembali
      const dataLama = await kv.get(KV_KEY) || {};
      dataLama[singkatan.toUpperCase().trim()] = arti.trim();
      
      await kv.set(KV_KEY, dataLama);
      return res.status(200).json({ success: true, data: dataLama });
    } catch (error) {
      return res.status(500).json({ error: 'Gagal menyimpan data ke KV Storage' });
    }
  }

  return res.status(405).json({ error: 'Method tidak diizinkan' });
}