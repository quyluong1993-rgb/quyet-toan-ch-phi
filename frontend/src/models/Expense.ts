export interface Expense {
  id: string; // Tự động generate ở GAS
  date: string; // Định dạng YYYY-MM-DD
  employeeId: string; // Mã nhân viên (có thể có số 0 ở đầu)
  category: string; // Loại chi phí (Tiếp khách, Công tác, VPP...)
  amount: number; // Số tiền trước thuế
  tax: number; // Thuế (nếu có)
  total: number; // Tổng tiền
  description: string; // Diễn giải
  receiptImageBase64?: string; // Dùng khi submit ảnh lên GAS
  receiptImageUrl?: string; // Trả về từ GAS sau khi đã lưu lên Drive
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt?: string;
}
