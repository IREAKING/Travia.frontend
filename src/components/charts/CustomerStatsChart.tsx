import { useEffect, useState } from 'react';
import { supplierService } from '../../services/supplierService';
import type { SupplierCustomerStats } from '../../types';
import { LoadingSpinner } from '../common/Loading';
import { exportToCsv, exportToXlsx } from '../../utils/export';
import { ExportDropdown } from '../common/ExportDropdown';

const CustomerStatsChart = () => {
  const [data, setData] = useState<SupplierCustomerStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'spent' | 'bookings'>('spent');
  const [limit, setLimit] = useState(10);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await supplierService.getCustomerStats(
        sortBy,
        limit,
        startDate || undefined,
        endDate || undefined
      );
      setData(result);
    } catch (error) {
      console.error('Error fetching customer stats:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [sortBy, limit, startDate, endDate]);

  const formatCurrency = (value: number | string): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(num);
  };

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const canExport = data.length > 0;
  const handleExportCsv = () => {
    if (!canExport) return;
    const rows = data.map((customer) => ({
      khach_hang: customer.ten_khach_hang,
      email: customer.email_khach_hang,
      so_dat_cho: customer.so_dat_cho,
      tong_tien: customer.tong_tien,
      so_khach: customer.so_nguoi_lon_va_tre_em,
      ngay_dat_dau_tien: formatDate(customer.ngay_dat_dau_tien),
      ngay_dat_cuoi_cung: formatDate(customer.ngay_dat_cuoi_cung),
    }));
    exportToCsv('supplier-thong-ke-khach-hang.csv', rows);
  };
  const handleExportXlsx = () => {
    if (!canExport) return;
    const rows = data.map((customer) => ({
      khach_hang: customer.ten_khach_hang,
      email: customer.email_khach_hang,
      so_dat_cho: customer.so_dat_cho,
      tong_tien: customer.tong_tien,
      so_khach: customer.so_nguoi_lon_va_tre_em,
      ngay_dat_dau_tien: formatDate(customer.ngay_dat_dau_tien),
      ngay_dat_cuoi_cung: formatDate(customer.ngay_dat_cuoi_cung),
    }));
    exportToXlsx('supplier-thong-ke-khach-hang.xlsx', rows);
  };

  return (
    <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg p-6">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Thống Kê Khách Hàng</h3>
          <p className="text-sm text-purple-300/80">Top khách hàng theo số lần đặt hoặc tổng tiền</p>
        </div>
        <ExportDropdown
          onExportCsv={handleExportCsv}
          onExportXlsx={handleExportXlsx}
          disabled={!canExport}
          label="Xuất file"
        />
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Sắp xếp theo</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'spent' | 'bookings')}
            className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          >
            <option value="spent">Tổng tiền</option>
            <option value="bookings">Số lần đặt</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Số lượng</label>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          >
            <option value="5">Top 5</option>
            <option value="10">Top 10</option>
            <option value="20">Top 20</option>
            <option value="50">Top 50</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Từ ngày</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Đến ngày</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[400px]">
          <LoadingSpinner />
        </div>
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center h-[400px] text-gray-400">
          <p>Chưa có dữ liệu</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">STT</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Khách hàng</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Số lần đặt</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Tổng tiền</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Số khách</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Lần đặt đầu</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Lần đặt cuối</th>
              </tr>
            </thead>
            <tbody>
              {data.map((customer, index) => (
                <tr
                  key={customer.khach_hang_id || `customer-${index}`}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="py-4 px-4 text-sm text-gray-300">{index + 1}</td>
                  <td className="py-4 px-4">
                    <div className="text-sm font-medium text-white">{customer.ten_khach_hang}</div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-400">{customer.email_khach_hang}</td>
                  <td className="py-4 px-4 text-sm text-right text-white font-semibold">
                    {customer.so_dat_cho}
                  </td>
                  <td className="py-4 px-4 text-sm text-right text-green-400 font-semibold">
                    {formatCurrency(customer.tong_tien)}
                  </td>
                  <td className="py-4 px-4 text-sm text-right text-gray-300">
                    {customer.so_nguoi_lon_va_tre_em}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-400">
                    {formatDate(customer.ngay_dat_dau_tien)}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-400">
                    {formatDate(customer.ngay_dat_cuoi_cung)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export { CustomerStatsChart };
export default CustomerStatsChart;

