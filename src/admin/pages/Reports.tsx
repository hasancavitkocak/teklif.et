import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Flag, User, Clock, CheckCircle, XCircle, Eye, Loader2 } from 'lucide-react';

type Report = {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  report_type: string;
  description: string;
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  admin_notes?: string;
  created_at: string;
  reporter?: {
    name: string;
    photo_url?: string;
  };
  reported_user?: {
    name: string;
    photo_url?: string;
  };
};

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewing' | 'resolved' | 'dismissed'>('all');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadReports();
  }, [filter]);

  const loadReports = async () => {
    try {
      let query = supabase
        .from('user_reports')
        .select(`
          *,
          reporter:reporter_id(name, photo_url),
          reported_user:reported_user_id(name, photo_url)
        `)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (reportId: string, status: string) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('user_reports')
        .update({
          status,
          admin_notes: adminNotes,
          resolved_at: status === 'resolved' || status === 'dismissed' ? new Date().toISOString() : null,
        })
        .eq('id', reportId);

      if (error) throw error;

      await loadReports();
      setSelectedReport(null);
      setAdminNotes('');
    } catch (error) {
      console.error('Error updating report:', error);
      alert('Rapor güncellenirken hata oluştu');
    } finally {
      setUpdating(false);
    }
  };

  const getReportTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      spam: 'Spam',
      inappropriate: 'Uygunsuz İçerik',
      fake: 'Sahte Profil',
      harassment: 'Taciz',
      other: 'Diğer',
    };
    return types[type] || type;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      reviewing: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      dismissed: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Beklemede',
      reviewing: 'İnceleniyor',
      resolved: 'Çözüldü',
      dismissed: 'Reddedildi',
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Kullanıcı Raporları</h1>
        <div className="flex gap-2">
          {['all', 'pending', 'reviewing', 'resolved', 'dismissed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === f
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f === 'all' ? 'Tümü' : getStatusLabel(f)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Bekleyen</p>
              <p className="text-2xl font-bold text-gray-800">
                {reports.filter((r) => r.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">İnceleniyor</p>
              <p className="text-2xl font-bold text-gray-800">
                {reports.filter((r) => r.status === 'reviewing').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Çözüldü</p>
              <p className="text-2xl font-bold text-gray-800">
                {reports.filter((r) => r.status === 'resolved').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gray-100 rounded-lg">
              <XCircle className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Reddedildi</p>
              <p className="text-2xl font-bold text-gray-800">
                {reports.filter((r) => r.status === 'dismissed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        {reports.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            <Flag className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>Henüz rapor bulunmuyor</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Raporlayan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Bildirilen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tür
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tarih
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    İşlem
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {report.reporter?.photo_url ? (
                          <img
                            src={report.reporter.photo_url}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-500" />
                          </div>
                        )}
                        <span className="font-medium text-gray-800">
                          {report.reporter?.name || 'Bilinmiyor'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {report.reported_user?.photo_url ? (
                          <img
                            src={report.reported_user.photo_url}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-500" />
                          </div>
                        )}
                        <span className="font-medium text-gray-800">
                          {report.reported_user?.name || 'Bilinmiyor'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {getReportTypeLabel(report.report_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          report.status
                        )}`}
                      >
                        {getStatusLabel(report.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(report.created_at).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedReport(report);
                          setAdminNotes(report.admin_notes || '');
                        }}
                        className="text-pink-500 hover:text-pink-600 font-medium"
                      >
                        Detay
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">Rapor Detayı</h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rapor Türü
                </label>
                <p className="text-gray-800">{getReportTypeLabel(selectedReport.report_type)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama
                </label>
                <p className="text-gray-800">{selectedReport.description || 'Açıklama yok'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mevcut Durum
                </label>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    selectedReport.status
                  )}`}
                >
                  {getStatusLabel(selectedReport.status)}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Notları
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Notlarınızı buraya yazın..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => updateReportStatus(selectedReport.id, 'reviewing')}
                  disabled={updating}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 disabled:opacity-50"
                >
                  İnceleniyor Olarak İşaretle
                </button>
                <button
                  onClick={() => updateReportStatus(selectedReport.id, 'resolved')}
                  disabled={updating}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 disabled:opacity-50"
                >
                  Çözüldü
                </button>
                <button
                  onClick={() => updateReportStatus(selectedReport.id, 'dismissed')}
                  disabled={updating}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-xl font-medium hover:bg-gray-600 disabled:opacity-50"
                >
                  Reddet
                </button>
              </div>
            </div>

            <div className="p-6 border-t">
              <button
                onClick={() => setSelectedReport(null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl font-medium hover:bg-gray-50"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
