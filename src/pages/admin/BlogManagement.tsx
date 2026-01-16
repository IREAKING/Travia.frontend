import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { LoadingSpinner } from '../../components/common/Loading';
import { useToast } from '../../hooks/useToast';
import { blogService, type BlogPost, type CreateBlogRequest, type UpdateBlogRequest, type BlogStats } from '../../services/blogService';

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  'nhap': { bg: 'bg-gray-500/20', text: 'text-gray-400' },
  'cong_bo': { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
  'luu_tru': { bg: 'bg-amber-500/20', text: 'text-amber-400' },
};

const STATUS_LABELS: Record<string, string> = {
  'nhap': 'Nháp',
  'cong_bo': 'Công bố',
  'luu_tru': 'Lưu trữ',
};

export const BlogManagementPage = () => {
  const { showToast } = useToast();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [stats, setStats] = useState<BlogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Form states
  const [formData, setFormData] = useState<CreateBlogRequest>({
    tieu_de: '',
    slug: '',
    tom_tat: '',
    noi_dung: '',
    anh_dai_dien: '',
    danh_muc: '',
    tu_khoa: [],
    trang_thai: 'nhap',
    noi_bat: false,
  });

  // AI states
  const [aiTopic, setAiTopic] = useState('');
  const [aiBlogType, setAiBlogType] = useState('kinh_nghiem');
  const [aiContext, setAiContext] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiContent, setAiContent] = useState<{ title: string; summary: string; content: string } | null>(null);

  useEffect(() => {
    loadBlogs();
    loadStats();
  }, [currentPage]);

  const loadBlogs = async () => {
    try {
      setLoading(true);
      const offset = (currentPage - 1) * pageSize;
      const data = await blogService.getAllBlogs(pageSize, offset);
      setBlogs(data);
      // Calculate total pages (simplified - should come from API)
      setTotalPages(Math.ceil(data.length / pageSize) || 1);
    } catch (error: any) {
      showToast('Lỗi khi tải danh sách blog', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await blogService.getBlogStats();
      setStats(data);
    } catch (error: any) {
      console.error('Error loading stats:', error);
    }
  };

  const handleCreate = async () => {
    try {
      await blogService.createBlog(formData);
      showToast('Tạo blog thành công', 'success');
      setShowCreateModal(false);
      resetForm();
      loadBlogs();
      loadStats();
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Lỗi khi tạo blog', 'error');
    }
  };

  const handleUpdate = async () => {
    if (!selectedBlog) return;
    try {
      const updateData: UpdateBlogRequest = {
        tieu_de: formData.tieu_de || undefined,
        tom_tat: formData.tom_tat || undefined,
        noi_dung: formData.noi_dung || undefined,
        anh_dai_dien: formData.anh_dai_dien || undefined,
        danh_muc: formData.danh_muc || undefined,
        tu_khoa: formData.tu_khoa || undefined,
        trang_thai: formData.trang_thai || undefined,
        noi_bat: formData.noi_bat || undefined,
      };
      await blogService.updateBlog(selectedBlog.id, updateData);
      showToast('Cập nhật blog thành công', 'success');
      setShowEditModal(false);
      resetForm();
      loadBlogs();
      loadStats();
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Lỗi khi cập nhật blog', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await blogService.deleteBlog(deletingId);
      showToast('Xóa blog thành công', 'success');
      setShowDeleteModal(false);
      setDeletingId(null);
      loadBlogs();
      loadStats();
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Lỗi khi xóa blog', 'error');
    }
  };

  const handleGenerateAI = async () => {
    if (!aiTopic.trim()) {
      showToast('Vui lòng nhập chủ đề', 'error');
      return;
    }
    try {
      setAiGenerating(true);
      const result = await blogService.generateBlogContent({
        topic: aiTopic,
        blog_type: aiBlogType,
        additional_context: aiContext || undefined,
      });
      setAiContent(result);
      // Auto-fill form
      setFormData(prev => ({
        ...prev,
        tieu_de: result.title,
        tom_tat: result.summary,
        noi_dung: result.content,
      }));
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Lỗi khi tạo nội dung bằng AI', 'error');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleCreateWithAI = async () => {
    if (!aiContent) return;
    try {
      await blogService.createBlogWithAI({
        topic: aiTopic,
        blog_type: aiBlogType,
        additional_context: aiContext || undefined,
        trang_thai: formData.trang_thai,
        noi_bat: formData.noi_bat,
        danh_muc: formData.danh_muc || undefined,
        tu_khoa: formData.tu_khoa || undefined,
        anh_dai_dien: formData.anh_dai_dien || undefined,
      });
      showToast('Tạo blog với AI thành công', 'success');
      setShowAIModal(false);
      resetForm();
      setAiContent(null);
      setAiTopic('');
      setAiContext('');
      loadBlogs();
      loadStats();
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Lỗi khi tạo blog với AI', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      tieu_de: '',
      slug: '',
      tom_tat: '',
      noi_dung: '',
      anh_dai_dien: '',
      danh_muc: '',
      tu_khoa: [],
      trang_thai: 'nhap',
      noi_bat: false,
    });
    setSelectedBlog(null);
  };

  const openEditModal = (blog: BlogPost) => {
    setSelectedBlog(blog);
    setFormData({
      tieu_de: blog.tieu_de,
      slug: blog.slug,
      tom_tat: blog.tom_tat || '',
      noi_dung: blog.noi_dung || '',
      anh_dai_dien: blog.anh_dai_dien || '',
      danh_muc: blog.danh_muc || '',
      tu_khoa: blog.tu_khoa || [],
      trang_thai: blog.trang_thai || 'nhap',
      noi_bat: blog.noi_bat || false,
    });
    setShowEditModal(true);
  };

  if (loading && blogs.length === 0) {
    return (
      <DashboardLayout sidebar={<AdminSidebar />}>
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Quản lý Blog</h1>
            <p className="text-slate-400 mt-1">Quản lý và tạo bài viết blog</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAIModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Tạo với AI
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tạo Blog
            </button>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="text-slate-400 text-sm">Tổng số bài</div>
              <div className="text-2xl font-bold text-white mt-1">
                {(stats.tong_so_da_dang || 0) + (stats.tong_so_nhap || 0) + (stats.tong_so_luu_tru || 0)}
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="text-slate-400 text-sm">Đã công bố</div>
              <div className="text-2xl font-bold text-emerald-400 mt-1">{stats.tong_so_da_dang || 0}</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="text-slate-400 text-sm">Tổng lượt xem</div>
              <div className="text-2xl font-bold text-cyan-400 mt-1">{stats.tong_luot_xem || 0}</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="text-slate-400 text-sm">Tổng lượt thích</div>
              <div className="text-2xl font-bold text-pink-400 mt-1">{stats.tong_luot_thich || 0}</div>
            </div>
          </div>
        )}

        {/* Blog List */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Tiêu đề</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Danh mục</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Lượt xem</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Ngày tạo</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {blogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-slate-700/30">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{blog.tieu_de}</div>
                      {blog.tom_tat && (
                        <div className="text-sm text-slate-400 mt-1 line-clamp-1">{blog.tom_tat}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-300">{blog.danh_muc || '-'}</td>
                    <td className="px-6 py-4">
                      {blog.trang_thai && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[blog.trang_thai]?.bg} ${STATUS_STYLES[blog.trang_thai]?.text}`}>
                          {STATUS_LABELS[blog.trang_thai] || blog.trang_thai}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-300">{blog.luot_xem || 0}</td>
                    <td className="px-6 py-4 text-slate-300">
                      {blog.ngay_tao ? new Date(blog.ngay_tao).toLocaleDateString('vi-VN') : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(blog)}
                          className="p-2 text-cyan-400 hover:bg-cyan-500/20 rounded-lg transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => {
                            setDeletingId(blog.id);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-700 flex items-center justify-between">
              <div className="text-sm text-slate-400">
                Trang {currentPage} / {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-slate-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600"
                >
                  Trước
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-slate-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Tạo Blog Mới</h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Tiêu đề *</label>
                  <input
                    type="text"
                    value={formData.tieu_de}
                    onChange={(e) => setFormData({ ...formData, tieu_de: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Tóm tắt</label>
                  <textarea
                    value={formData.tom_tat}
                    onChange={(e) => setFormData({ ...formData, tom_tat: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Nội dung *</label>
                  <textarea
                    value={formData.noi_dung}
                    onChange={(e) => setFormData({ ...formData, noi_dung: e.target.value })}
                    rows={10}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Danh mục</label>
                    <input
                      type="text"
                      value={formData.danh_muc}
                      onChange={(e) => setFormData({ ...formData, danh_muc: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Trạng thái</label>
                    <select
                      value={formData.trang_thai}
                      onChange={(e) => setFormData({ ...formData, trang_thai: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="nhap">Nháp</option>
                      <option value="cong_bo">Công bố</option>
                      <option value="luu_tru">Lưu trữ</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Ảnh đại diện (URL)</label>
                  <input
                    type="text"
                    value={formData.anh_dai_dien}
                    onChange={(e) => setFormData({ ...formData, anh_dai_dien: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.noi_bat}
                    onChange={(e) => setFormData({ ...formData, noi_bat: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label className="text-sm text-slate-300">Nổi bật</label>
                </div>
              </div>
              <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreate}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600"
                >
                  Tạo Blog
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal - Similar to Create Modal */}
        {showEditModal && selectedBlog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Chỉnh sửa Blog</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Tiêu đề *</label>
                  <input
                    type="text"
                    value={formData.tieu_de}
                    onChange={(e) => setFormData({ ...formData, tieu_de: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Tóm tắt</label>
                  <textarea
                    value={formData.tom_tat}
                    onChange={(e) => setFormData({ ...formData, tom_tat: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Nội dung *</label>
                  <textarea
                    value={formData.noi_dung}
                    onChange={(e) => setFormData({ ...formData, noi_dung: e.target.value })}
                    rows={10}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Danh mục</label>
                    <input
                      type="text"
                      value={formData.danh_muc}
                      onChange={(e) => setFormData({ ...formData, danh_muc: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Trạng thái</label>
                    <select
                      value={formData.trang_thai}
                      onChange={(e) => setFormData({ ...formData, trang_thai: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="nhap">Nháp</option>
                      <option value="cong_bo">Công bố</option>
                      <option value="luu_tru">Lưu trữ</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Ảnh đại diện (URL)</label>
                  <input
                    type="text"
                    value={formData.anh_dai_dien}
                    onChange={(e) => setFormData({ ...formData, anh_dai_dien: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.noi_bat}
                    onChange={(e) => setFormData({ ...formData, noi_bat: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label className="text-sm text-slate-300">Nổi bật</label>
                </div>
              </div>
              <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
                >
                  Hủy
                </button>
                <button
                  onClick={handleUpdate}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600"
                >
                  Cập nhật
                </button>
              </div>
            </div>
          </div>
        )}

        {/* AI Modal */}
        {showAIModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Tạo Blog với AI</h2>
                <button
                  onClick={() => {
                    setShowAIModal(false);
                    setAiContent(null);
                    setAiTopic('');
                    setAiContext('');
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Chủ đề *</label>
                  <input
                    type="text"
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    placeholder="Ví dụ: Kinh nghiệm du lịch Đà Lạt"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Loại blog</label>
                  <select
                    value={aiBlogType}
                    onChange={(e) => setAiBlogType(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="kinh_nghiem">Kinh nghiệm</option>
                    <option value="dia_diem">Địa điểm</option>
                    <option value="huong_dan">Hướng dẫn</option>
                    <option value="tin_tuc">Tin tức</option>
                    <option value="review">Review</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Thông tin thêm (tùy chọn)</label>
                  <textarea
                    value={aiContext}
                    onChange={(e) => setAiContext(e.target.value)}
                    rows={3}
                    placeholder="Thêm thông tin chi tiết về chủ đề..."
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <button
                  onClick={handleGenerateAI}
                  disabled={aiGenerating || !aiTopic.trim()}
                  className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {aiGenerating ? (
                    <>
                      <LoadingSpinner />
                      <span>Đang tạo nội dung...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Tạo nội dung với AI
                    </>
                  )}
                </button>

                {aiContent && (
                  <div className="mt-6 space-y-4 border-t border-slate-700 pt-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Tiêu đề</label>
                      <input
                        type="text"
                        value={aiContent.title}
                        readOnly
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Tóm tắt</label>
                      <textarea
                        value={aiContent.summary}
                        readOnly
                        rows={3}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Nội dung</label>
                      <textarea
                        value={aiContent.content}
                        readOnly
                        rows={10}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Trạng thái</label>
                        <select
                          value={formData.trang_thai}
                          onChange={(e) => setFormData({ ...formData, trang_thai: e.target.value })}
                          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="nhap">Nháp</option>
                          <option value="cong_bo">Công bố</option>
                          <option value="luu_tru">Lưu trữ</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2 pt-8">
                        <input
                          type="checkbox"
                          checked={formData.noi_bat}
                          onChange={(e) => setFormData({ ...formData, noi_bat: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <label className="text-sm text-slate-300">Nổi bật</label>
                      </div>
                    </div>
                    <button
                      onClick={handleCreateWithAI}
                      className="w-full px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600"
                    >
                      Lưu Blog
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-white mb-4">Xác nhận xóa</h3>
              <p className="text-slate-300 mb-6">Bạn có chắc chắn muốn xóa blog này? Hành động này không thể hoàn tác.</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletingId(null);
                  }}
                  className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
