import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { LoadingSpinner } from '../../components/common/Loading';
import { useToast } from '../../hooks/useToast';
import { contactService, type Contact, type ContactResponse } from '../../services/contactService';

type ContactStatus = 'all' | 'moi' | 'dang_xu_ly' | 'da_phan_hoi' | 'da_dong';

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  'moi': { bg: 'bg-amber-500/20', text: 'text-amber-400', dot: 'bg-amber-400', label: 'Mới' },
  'dang_xu_ly': { bg: 'bg-blue-500/20', text: 'text-blue-400', dot: 'bg-blue-400', label: 'Đang xử lý' },
  'da_phan_hoi': { bg: 'bg-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-400', label: 'Đã phản hồi' },
  'da_dong': { bg: 'bg-slate-500/20', text: 'text-slate-400', dot: 'bg-slate-400', label: 'Đã đóng' },
};

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
};

export const ContactManagementPage = () => {
  const { showToast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContactStatus>('all');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [responses, setResponses] = useState<ContactResponse[]>([]);
  const [responseText, setResponseText] = useState('');
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const itemsPerPage = 20;

  // Quick response templates
  const responseTemplates = [
    {
      name: 'Cảm ơn',
      text: 'Cảm ơn bạn đã liên hệ với chúng tôi. Chúng tôi đã nhận được yêu cầu của bạn và sẽ phản hồi sớm nhất có thể.',
    },
    {
      name: 'Đang xử lý',
      text: 'Chúng tôi đã nhận được yêu cầu của bạn và đang xử lý. Chúng tôi sẽ cập nhật thông tin cho bạn ngay khi có kết quả.',
    },
    {
      name: 'Hoàn thành',
      text: 'Yêu cầu của bạn đã được xử lý thành công. Nếu bạn có thắc mắc gì thêm, vui lòng liên hệ với chúng tôi.',
    },
    {
      name: 'Cần thêm thông tin',
      text: 'Cảm ơn bạn đã liên hệ. Để chúng tôi có thể hỗ trợ bạn tốt hơn, vui lòng cung cấp thêm một số thông tin chi tiết.',
    },
  ];

  const commonEmojis = ['😊', '👍', '✅', '🙏', '💯', '🎉', '❤️', '⭐', '🔥', '✨'];

  useEffect(() => {
    loadContacts();
  }, [currentPage, statusFilter]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const offset = (currentPage - 1) * itemsPerPage;
      
      let response;
      if (statusFilter === 'all') {
        response = await contactService.getAllContacts(itemsPerPage, offset);
      } else {
        response = await contactService.getContactsByStatus(statusFilter, itemsPerPage, offset);
      }
      
      setContacts(response.data || []);
      setTotal(response.pagination.total || 0);
    } catch (error: any) {
      console.error('Error loading contacts:', error);
      showToast('Không thể tải danh sách liên hệ', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (contactId: number, newStatus: 'moi' | 'dang_xu_ly' | 'da_phan_hoi' | 'da_dong') => {
    try {
      await contactService.updateContactStatus(contactId, { trang_thai: newStatus });
      showToast('Cập nhật trạng thái thành công!', 'success');
      loadContacts();
      if (selectedContact?.id === contactId) {
        setSelectedContact({ ...selectedContact, trang_thai: newStatus });
      }
    } catch (error: any) {
      console.error('Error updating status:', error);
      showToast(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái', 'error');
    }
  };

  const handleMarkAsRead = async (contactId: number) => {
    try {
      await contactService.markContactAsRead(contactId);
      showToast('Đánh dấu đã đọc thành công!', 'success');
      loadContacts();
      if (selectedContact?.id === contactId) {
        setSelectedContact({ ...selectedContact, da_doc: true });
      }
    } catch (error: any) {
      console.error('Error marking as read:', error);
      showToast(error.response?.data?.message || 'Có lỗi xảy ra', 'error');
    }
  };

  const handleViewDetail = async (contact: Contact) => {
    try {
      // Load full contact details
      const fullContact = await contactService.getContactById(contact.id);
      setSelectedContact(fullContact);
      setShowDetailModal(true);
      
      // Load responses
      loadResponses(contact.id);
      
      // Mark as read if not already read
      if (!fullContact.da_doc) {
        await handleMarkAsRead(contact.id);
      }
    } catch (error: any) {
      console.error('Error loading contact details:', error);
      showToast('Không thể tải chi tiết liên hệ', 'error');
    }
  };

  const loadResponses = async (contactId: number) => {
    try {
      setLoadingResponses(true);
      const contactResponses = await contactService.getContactResponses(contactId);
      setResponses(contactResponses || []);
    } catch (error: any) {
      console.error('Error loading responses:', error);
      showToast('Không thể tải phản hồi', 'error');
      setResponses([]);
    } finally {
      setLoadingResponses(false);
    }
  };

  const handleSubmitResponse = async () => {
    if (!responseText.trim() || !selectedContact) {
      showToast('Vui lòng nhập nội dung phản hồi', 'error');
      return;
    }

    setIsSubmittingResponse(true);
    try {
      console.log('Submitting response:', {
        contactId: selectedContact.id,
        noiDung: responseText.trim(),
        length: responseText.trim().length,
      });
      
      const result = await contactService.createContactResponse(selectedContact.id, responseText.trim());
      console.log('Response submitted successfully:', result);
      
      showToast(result.message || 'Phản hồi đã được gửi thành công!', 'success');
      setResponseText('');
      
      // Reload responses
      await loadResponses(selectedContact.id);
      
      // Update contact status to 'da_phan_hoi' and refresh contact
      await handleStatusChange(selectedContact.id, 'da_phan_hoi');
      
      // Reload contact details
      const updatedContact = await contactService.getContactById(selectedContact.id);
      setSelectedContact(updatedContact);
    } catch (error: any) {
      console.error('Error submitting response:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });
      
      let errorMessage = 'Không thể gửi phản hồi';
      if (error.response?.data) {
        errorMessage = error.response.data.message || error.response.data.error || errorMessage;
        if (error.response.data.details) {
          errorMessage += ': ' + error.response.data.details;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmittingResponse(false);
    }
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.ho_ten?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.tieu_de?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.noi_dung?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const stats = {
    total: total,
    moi: contacts.filter(c => c.trang_thai === 'moi').length,
    dang_xu_ly: contacts.filter(c => c.trang_thai === 'dang_xu_ly').length,
    da_phan_hoi: contacts.filter(c => c.trang_thai === 'da_phan_hoi').length,
    da_dong: contacts.filter(c => c.trang_thai === 'da_dong').length,
    unread: contacts.filter(c => !c.da_doc).length,
  };

  const totalPages = Math.ceil(total / itemsPerPage);

  if (loading && contacts.length === 0) {
    return (
      <DashboardLayout sidebar={<AdminSidebar />}>
        <div className="flex justify-center items-center min-h-[70vh]">
          <LoadingSpinner size="xl" text="Đang tải danh sách liên hệ..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      {/* Header */}
      <div className="relative rounded-3xl overflow-hidden mb-8">
        <div className="absolute inset-0 bg-[#030712]">
          <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'linear-gradient(rgba(99,102,241,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>
        
        <div className="relative z-10 p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-5">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-60"></div>
                <div className="relative w-16 h-16 bg-slate-900/90 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10">
                  <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Quản Lý Liên Hệ</h1>
                <p className="text-slate-400">Xem và quản lý tất cả liên hệ từ khách hàng</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-5 border border-white/10">
          <div className="text-slate-400 text-sm mb-1">Tổng số</div>
          <div className="text-2xl font-bold text-white">{stats.total}</div>
        </div>
        <div className="bg-amber-500/10 backdrop-blur-xl rounded-2xl p-5 border border-amber-500/30">
          <div className="text-amber-400 text-sm mb-1">Mới</div>
          <div className="text-2xl font-bold text-amber-400">{stats.moi}</div>
        </div>
        <div className="bg-blue-500/10 backdrop-blur-xl rounded-2xl p-5 border border-blue-500/30">
          <div className="text-blue-400 text-sm mb-1">Đang xử lý</div>
          <div className="text-2xl font-bold text-blue-400">{stats.dang_xu_ly}</div>
        </div>
        <div className="bg-emerald-500/10 backdrop-blur-xl rounded-2xl p-5 border border-emerald-500/30">
          <div className="text-emerald-400 text-sm mb-1">Đã phản hồi</div>
          <div className="text-2xl font-bold text-emerald-400">{stats.da_phan_hoi}</div>
        </div>
        <div className="bg-slate-500/10 backdrop-blur-xl rounded-2xl p-5 border border-slate-500/30">
          <div className="text-slate-400 text-sm mb-1">Đã đóng</div>
          <div className="text-2xl font-bold text-slate-400">{stats.da_dong}</div>
        </div>
        <div className="bg-rose-500/10 backdrop-blur-xl rounded-2xl p-5 border border-rose-500/30">
          <div className="text-rose-400 text-sm mb-1">Chưa đọc</div>
          <div className="text-2xl font-bold text-rose-400">{stats.unread}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 border border-white/10 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email, tiêu đề..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'moi', 'dang_xu_ly', 'da_phan_hoi', 'da_dong'] as ContactStatus[]).map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  statusFilter === status
                    ? status === 'all'
                      ? 'bg-indigo-500 text-white'
                      : STATUS_STYLES[status].bg + ' ' + STATUS_STYLES[status].text
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                {status === 'all' ? 'Tất cả' : STATUS_STYLES[status].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Người gửi</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Tiêu đề</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Ngày gửi</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    {loading ? 'Đang tải...' : 'Không có liên hệ nào'}
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact) => {
                  const status = contact.trang_thai || 'moi';
                  const statusStyle = STATUS_STYLES[status] || STATUS_STYLES.moi;
                  return (
                    <tr key={contact.id} className={`hover:bg-white/5 transition-colors ${!contact.da_doc ? 'bg-rose-500/5' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">#{contact.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white font-medium">{contact.ho_ten}</div>
                        <div className="text-sm text-slate-400">{contact.email}</div>
                        {contact.so_dien_thoai && (
                          <div className="text-xs text-slate-500">{contact.so_dien_thoai}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-white font-medium max-w-xs truncate">{contact.tieu_de}</div>
                        <div className="text-xs text-slate-400 max-w-xs truncate mt-1">{contact.noi_dung.substring(0, 50)}...</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={status}
                          onChange={(e) => handleStatusChange(contact.id, e.target.value as any)}
                          className={`${statusStyle.bg} ${statusStyle.text} px-3 py-1 rounded-lg text-sm font-medium border ${statusStyle.bg.replace('/20', '/30')} focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                        >
                          <option value="moi">Mới</option>
                          <option value="dang_xu_ly">Đang xử lý</option>
                          <option value="da_phan_hoi">Đã phản hồi</option>
                          <option value="da_dong">Đã đóng</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {formatDate(contact.ngay_tao)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewDetail(contact)}
                            className="px-3 py-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500/30 transition-colors"
                          >
                            Xem
                          </button>
                          {!contact.da_doc && (
                            <button
                              onClick={() => handleMarkAsRead(contact.id)}
                              className="px-3 py-1.5 bg-rose-500/20 text-rose-400 rounded-lg hover:bg-rose-500/30 transition-colors"
                            >
                              Đã đọc
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between">
            <div className="text-sm text-slate-400">
              Trang {currentPage} / {totalPages} ({total} liên hệ)
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white/5 text-slate-400 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Trước
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white/5 text-slate-400 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal - Improved Layout */}
      {showDetailModal && selectedContact && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl border border-white/10 w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Chi tiết liên hệ</h2>
                  <p className="text-slate-400 text-sm">ID: #{selectedContact.id}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setResponseText('');
                  setResponses([]);
                }}
                className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content - Split Layout */}
            <div className="flex-1 overflow-hidden flex min-h-0">
              {/* Left Panel - Contact Info */}
              <div className="w-1/2 border-r border-white/10 overflow-y-auto p-6 space-y-6 flex-shrink-0">
                {/* Contact Info Card */}
                <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {selectedContact.ho_ten.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-white font-semibold">{selectedContact.ho_ten}</div>
                      {selectedContact.ten_nguoi_dung && (
                        <div className="text-slate-400 text-xs">Người dùng đã đăng ký</div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <div className="flex-1">
                        <div className="text-slate-400 text-xs">Email</div>
                        <div className="text-white flex items-center gap-2">
                          {selectedContact.email}
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(selectedContact.email);
                              showToast('Đã copy email', 'success');
                            }}
                            className="text-indigo-400 hover:text-indigo-300"
                            title="Copy email"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    {selectedContact.so_dien_thoai && (
                      <div className="flex items-center gap-3 text-sm">
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <div className="flex-1">
                          <div className="text-slate-400 text-xs">Số điện thoại</div>
                          <div className="text-white">{selectedContact.so_dien_thoai}</div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 text-sm">
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="flex-1">
                        <div className="text-slate-400 text-xs">Ngày gửi</div>
                        <div className="text-white">{formatDate(selectedContact.ngay_tao)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Message Card */}
                <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold">Tin nhắn</h3>
                    <select
                      value={selectedContact.trang_thai || 'moi'}
                      onChange={(e) => {
                        const newStatus = e.target.value as any;
                        handleStatusChange(selectedContact.id, newStatus);
                      }}
                      className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500/50"
                    >
                      <option value="moi">Mới</option>
                      <option value="dang_xu_ly">Đang xử lý</option>
                      <option value="da_phan_hoi">Đã phản hồi</option>
                      <option value="da_dong">Đã đóng</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <div className="text-slate-400 text-xs mb-1">Tiêu đề</div>
                    <div className="text-white font-medium">{selectedContact.tieu_de}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-xs mb-2">Nội dung</div>
                    <div className="text-white bg-slate-800/50 p-4 rounded-xl whitespace-pre-wrap text-sm leading-relaxed">
                      {selectedContact.noi_dung}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Panel - Responses */}
              <div className="w-1/2 overflow-y-auto p-6 bg-slate-800/30 flex-shrink-0">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    Phản hồi ({responses.length})
                  </h3>
                  <p className="text-slate-400 text-sm">Phản hồi lại khách hàng về yêu cầu này</p>
                </div>

                {/* Responses List */}
                <div className="space-y-4 mb-6 min-h-[200px]">
                  {loadingResponses ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <svg className="animate-spin h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <div className="text-slate-400 text-sm">Đang tải phản hồi...</div>
                      </div>
                    </div>
                  ) : responses.length > 0 ? (
                    responses.map((response) => (
                      <div key={response.id} className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl p-4 border border-indigo-500/20 hover:border-indigo-500/40 transition-all">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg">
                            {response.ten_nguoi_phan_hoi?.charAt(0).toUpperCase() || 'A'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-white font-medium text-sm">
                                {response.ten_nguoi_phan_hoi || 'Admin'}
                              </div>
                              <div className="text-slate-400 text-xs whitespace-nowrap ml-2">
                                {formatDate(response.ngay_tao)}
                              </div>
                            </div>
                            <div className="text-white text-sm whitespace-pre-wrap leading-relaxed break-words">
                              {response.noi_dung}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white/5 rounded-2xl p-8 border border-white/10 text-center">
                      <div className="text-4xl mb-3">💬</div>
                      <div className="text-slate-400 text-sm">Chưa có phản hồi nào</div>
                      <div className="text-slate-500 text-xs mt-1">Hãy gửi phản hồi đầu tiên cho khách hàng</div>
                    </div>
                  )}
                </div>

                {/* Response Form */}
                <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-white font-medium text-sm">Gửi phản hồi mới</label>
                      <div className="flex gap-2">
                        {/* Templates Button */}
                        <button
                          onClick={() => {
                            setShowTemplates(!showTemplates);
                            setShowEmojiPicker(false);
                          }}
                          className="px-3 py-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500/30 border border-indigo-500/30 text-xs transition-colors flex items-center gap-1"
                          title="Template nhanh"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Template
                        </button>
                        {/* Emoji Picker Button */}
                        <button
                          onClick={() => {
                            setShowEmojiPicker(!showEmojiPicker);
                            setShowTemplates(false);
                          }}
                          className="px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 border border-purple-500/30 text-xs transition-colors"
                          title="Thêm emoji"
                        >
                          😊
                        </button>
                      </div>
                    </div>

                    {/* Templates Dropdown */}
                    {showTemplates && (
                      <div className="mb-3 bg-slate-800/80 rounded-xl p-3 border border-white/10">
                        <div className="text-slate-400 text-xs mb-2">Chọn template:</div>
                        <div className="grid grid-cols-2 gap-2">
                          {responseTemplates.map((template, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setResponseText(template.text);
                                setShowTemplates(false);
                              }}
                              className="text-left px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-white text-xs transition-colors"
                            >
                              <div className="font-medium mb-1">{template.name}</div>
                              <div className="text-slate-400 text-xs line-clamp-2">{template.text.substring(0, 50)}...</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Emoji Picker */}
                    {showEmojiPicker && (
                      <div className="mb-3 bg-slate-800/80 rounded-xl p-3 border border-white/10">
                        <div className="text-slate-400 text-xs mb-2">Chọn emoji:</div>
                        <div className="flex flex-wrap gap-2">
                          {commonEmojis.map((emoji, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setResponseText(prev => prev + emoji);
                                setShowEmojiPicker(false);
                              }}
                              className="text-2xl hover:scale-125 transition-transform p-1"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder="Nhập nội dung phản hồi cho khách hàng..."
                      rows={6}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
                      onFocus={() => {
                        setShowTemplates(false);
                        setShowEmojiPicker(false);
                      }}
                    />
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-slate-400 text-xs">
                        {responseText.length} ký tự
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const textarea = document.querySelector('textarea');
                            if (textarea) {
                              const start = textarea.selectionStart;
                              const end = textarea.selectionEnd;
                              const selectedText = responseText.substring(start, end);
                              const newText = responseText.substring(0, start) + `**${selectedText}**` + responseText.substring(end);
                              setResponseText(newText);
                            } else {
                              setResponseText('**' + responseText + '**');
                            }
                          }}
                          className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-slate-400 hover:text-white text-xs transition-colors"
                          title="Bold"
                        >
                          <strong>B</strong>
                        </button>
                        <button
                          onClick={() => {
                            const textarea = document.querySelector('textarea');
                            if (textarea) {
                              const start = textarea.selectionStart;
                              const end = textarea.selectionEnd;
                              const selectedText = responseText.substring(start, end);
                              const newText = responseText.substring(0, start) + `*${selectedText}*` + responseText.substring(end);
                              setResponseText(newText);
                            } else {
                              setResponseText('*' + responseText + '*');
                            }
                          }}
                          className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-slate-400 hover:text-white text-xs transition-colors"
                          title="Italic"
                        >
                          <em>I</em>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleSubmitResponse}
                      disabled={isSubmittingResponse || !responseText.trim()}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                    >
                      {isSubmittingResponse ? (
                        <>
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Đang gửi...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          Gửi phản hồi
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setResponseText('');
                        setShowTemplates(false);
                        setShowEmojiPicker(false);
                      }}
                      disabled={!responseText.trim()}
                      className="px-4 py-3 bg-white/5 text-slate-400 rounded-xl hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Xóa nội dung"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

