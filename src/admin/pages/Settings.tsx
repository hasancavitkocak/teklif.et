export default function Settings() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Ayarlar</h1>
      <div className="bg-white rounded-2xl shadow-sm border p-8">
        <h2 className="text-xl font-bold mb-4">Uygulama Ayarları</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Günlük Ücretsiz Teklif Limiti
            </label>
            <input type="number" defaultValue={3} className="px-4 py-2 border rounded-xl" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Premium Aylık Fiyat (₺)
            </label>
            <input type="number" defaultValue={3000} className="px-4 py-2 border rounded-xl" />
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-semibold">
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}
