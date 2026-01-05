import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useEffect, useState } from 'react';
import { supplierService } from '../../services/supplierService';
import { LoadingSpinner } from '../common/Loading';

const colors = ['#6366F1', '#A855F7', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#14B8A6'];

const TourCategoriesChart = () => {
  const [data, setData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await supplierService.getTourStatsByCategory();
        
        // Transform data for chart
        const chartData = result
          .filter((item) => item.tong_tour > 0) // Chỉ lấy danh mục có tour
          .map((item, index) => {
            const categoryName = item.ten_danh_muc || 'Chưa phân loại';
          return {
              name: categoryName,
              value: item.tong_tour,
            color: colors[index % colors.length],
          };
        });
        setData(chartData);
      } catch (error) {
        console.error('Error fetching tour categories data:', error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  return (
    <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white">Phân Bố Tour Theo Danh Mục</h3>
        <p className="text-sm text-purple-300/80">Tỷ lệ các loại tour trong hệ thống</p>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center h-[300px]">
          <LoadingSpinner />
        </div>
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center h-[300px] text-gray-400">
          <p>Chưa có dữ liệu</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          <Tooltip 
            formatter={(value) => [`${value} tour`, 'Số lượng']}
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
              color: '#F3F4F6'
            }}
            labelStyle={{ color: '#F3F4F6' }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value) => (
              <span style={{ color: '#9CA3AF', fontSize: '12px' }}>
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      )}
      
      {!loading && data.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-4">
          {data.map((category, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: category.color }}
              ></div>
              <span className="text-sm text-gray-400">{category.name}</span>
              <span className="text-sm font-semibold text-white">{category.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export { TourCategoriesChart };
export default TourCategoriesChart;
