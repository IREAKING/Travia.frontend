import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Mock data for suppliers revenue
const suppliersRevenueData = [
  { name: 'Vietnam Travel', revenue: 25000000, tours: 15 },
  { name: 'Saigon Tours', revenue: 22000000, tours: 12 },
  { name: 'Hanoi Explorer', revenue: 18000000, tours: 10 },
  { name: 'Mekong Delta', revenue: 15000000, tours: 8 },
  { name: 'Central Vietnam', revenue: 12000000, tours: 6 },
];

const AdminSuppliersChart = () => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Doanh Thu Nhà Cung Cấp</h3>
        <p className="text-sm text-gray-600">Top 5 nhà cung cấp có doanh thu cao nhất</p>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart 
          data={suppliersRevenueData}
          layout="horizontal"
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            type="number"
            stroke="#6B7280"
            fontSize={12}
            tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
          />
          <YAxis 
            type="category"
            dataKey="name"
            stroke="#6B7280"
            fontSize={12}
            width={120}
          />
          <Tooltip 
            formatter={(value, name) => [
              name === 'revenue' ? `${(value as number).toLocaleString()} VND` : value,
              name === 'revenue' ? 'Doanh thu' : 'Số tour'
            ]}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Bar 
            dataKey="revenue" 
            fill="#F59E0B" 
            radius={[0, 4, 4, 0]}
            name="Doanh thu"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export { AdminSuppliersChart };
export default AdminSuppliersChart;
