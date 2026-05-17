import { useState } from 'react';
import { gasClient } from '../../api/gasClient';

interface SettlementPreviewProps {
  items?: any[];
  onItemUpdate?: (id: string, field: string, value: any) => void;
  exchangeRate: number;
}

export function SettlementPreview({ items = [], onItemUpdate, exchangeRate }: SettlementPreviewProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [employeeName, setEmployeeName] = useState('');
  const [settlementDate, setSettlementDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Tính tổng tiền dựa trên items truyền vào
  const totalAmount = items.reduce((sum, item) => sum + (item.totalAmount || 0), 0);

  const handleComplete = async () => {
    if (items.length === 0) {
      alert('Chưa có dữ liệu để quyết toán!');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        employeeId: 'EMP_001', // Giả sử nhân viên hiện tại
        employeeName: employeeName || 'Chưa rõ', // Tên nhập vào
        date: settlementDate, // Ngày thanh toán
        exchangeRate: exchangeRate,
        items: items
      };
      
      const response = await gasClient('CREATE_EXPENSE', payload);
      alert('Đã gửi quyết toán thành công! Mã ID: ' + response.id);
    } catch (error: any) {
      alert('Lỗi: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (id: string, field: string, value: string) => {
    if (onItemUpdate) {
      if (field === 'quantity' || field === 'unitPriceRMB') {
        const numValue = parseFloat(value) || 0;
        onItemUpdate(id, field, numValue);
      } else {
        onItemUpdate(id, field, value);
      }
    }
  };

  const handleExportExcel = async () => {
    if (items.length === 0) {
      alert('Không có dữ liệu để xuất!');
      return;
    }

    try {
      const ExcelJS = (await import('exceljs')).default;
      const { saveAs } = await import('file-saver');

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Quyet_Toan');

      // 1. Cài đặt độ rộng cột
      sheet.columns = [
        { key: 'A', width: 6 },   // STT
        { key: 'B', width: 45 },  // NỘI DUNG
        { key: 'C', width: 8 },   // SỐ LƯỢNG
        { key: 'D', width: 14 },  // ĐƠN GIÁ RMB
        { key: 'E', width: 14 },  // ĐƠN GIÁ VND
        { key: 'F', width: 15 },  // THÀNH TIỀN
        { key: 'G', width: 12 },  // GHI CHÚ
      ];

      // Blue color for outer border
      const blueBorderColor = { argb: 'FF004080' }; // Dark blue
      const thickBlue = { style: 'medium' as const, color: blueBorderColor };
      const thinBlack = { style: 'thin' as const, color: { argb: 'FF000000' } };

      // Hàm helper vẽ border ngoài cùng cho toàn bộ bảng
      const applyOuterBorders = (lastRow: number) => {
        for (let r = 1; r <= lastRow; r++) {
          for (let c = 1; c <= 7; c++) {
            const cell = sheet.getCell(r, c);
            const currentBorder = cell.border || {};
            
            // Khởi tạo border object nếu chưa có
            const newBorder: any = { ...currentBorder };
            
            if (r === 1) newBorder.top = thickBlue;
            if (r === lastRow) newBorder.bottom = thickBlue;
            if (c === 1) newBorder.left = thickBlue;
            if (c === 7) newBorder.right = thickBlue;
            
            cell.border = newBorder;
          }
        }
      };

      // 2. Thêm thông tin công ty (Header 3 dòng đầu)
      sheet.mergeCells('A1:B3');
      const logoCell = sheet.getCell('A1');
      logoCell.value = 'ZRG';
      logoCell.font = { name: 'Arial Black', size: 36, bold: true, color: { argb: 'FF003399' } };
      logoCell.alignment = { horizontal: 'center', vertical: 'middle' };

      sheet.mergeCells('C1:G1');
      const c1 = sheet.getCell('C1');
      c1.value = 'CÔNG TY CỔ PHẦN SẢN XUẤT VÀ THƯƠNG MẠI ZRG VIỆT NAM';
      c1.font = { name: 'Times New Roman', size: 12, bold: true };
      c1.alignment = { horizontal: 'center', vertical: 'middle' };

      sheet.mergeCells('C2:G2');
      const c2 = sheet.getCell('C2');
      c2.value = 'Mã số thuế: 0111207803';
      c2.font = { name: 'Times New Roman', size: 10 };
      c2.alignment = { horizontal: 'center', vertical: 'middle' };

      sheet.mergeCells('C3:G3');
      const c3 = sheet.getCell('C3');
      c3.value = 'Địa chỉ: Thôn Thanh Huệ Đình, Xã Đa Phúc, TP. Hà Nội, Việt Nam';
      c3.font = { name: 'Times New Roman', size: 10 };
      c3.alignment = { horizontal: 'center', vertical: 'middle' };

      // Dòng phân cách (Row 4)
      sheet.mergeCells('A4:G4');
      const r4 = sheet.getCell('A4');
      r4.border = { bottom: thickBlue };

      // 3. Tiêu đề đơn (Row 5 - 7)
      sheet.mergeCells('A5:G5');
      const r5 = sheet.getCell('A5');
      r5.value = 'ĐỀ NGHỊ QUYẾT TOÁN TẠM ỨNG';
      r5.font = { name: 'Times New Roman', size: 16, bold: true };
      r5.alignment = { horizontal: 'center', vertical: 'middle' };

      const selectedDate = new Date(settlementDate);
      sheet.mergeCells('A6:G6');
      const r6 = sheet.getCell('A6');
      r6.value = `Ngày ${selectedDate.getDate()} tháng ${selectedDate.getMonth() + 1} năm ${selectedDate.getFullYear()}`;
      r6.font = { name: 'Times New Roman', size: 12, italic: true };
      r6.alignment = { horizontal: 'center', vertical: 'middle' };

      sheet.mergeCells('A7:G7');
      const r7 = sheet.getCell('A7');
      r7.value = 'Nội dung công tác: Quyết toán chi phí';
      r7.font = { name: 'Times New Roman', size: 12, bold: true };
      r7.alignment = { horizontal: 'center', vertical: 'middle' };

      // 4. Họ tên & Tỷ giá (Row 8 - 9)
      sheet.mergeCells('A8:G8');
      const r8 = sheet.getCell('A8');
      r8.value = `Họ và tên: ${employeeName || '(Chưa có tên)'}`;
      r8.font = { name: 'Times New Roman', size: 11 };
      r8.alignment = { horizontal: 'left', vertical: 'middle' };

      sheet.getCell('A9').value = '汇率';
      sheet.getCell('A9').font = { name: 'Times New Roman', size: 11 };
      
      sheet.mergeCells('B9:G9');
      const r9b = sheet.getCell('B9');
      r9b.value = exchangeRate;
      r9b.font = { name: 'Times New Roman', size: 11 };
      r9b.alignment = { horizontal: 'center', vertical: 'middle' };

      // 5. Header bảng (Row 10)
      const headerRow = sheet.getRow(10);
      headerRow.values = ['STT', 'NỘI DUNG', 'SỐ\nLƯỢN\nG', 'ĐƠN GIÁ\n单价 RMB', '单价\n\n越南盾', 'THÀNH TIỀN', 'GHI CHÚ'];
      headerRow.font = { name: 'Times New Roman', size: 9, bold: true };
      headerRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      headerRow.height = 45;

      for (let c = 1; c <= 7; c++) {
        const cell = sheet.getCell(10, c);
        cell.border = { top: thinBlack, bottom: thinBlack, left: thinBlack, right: thinBlack };
      }

      // 6. Data
      let currentRow = 11;
      items.forEach((item, idx) => {
        const row = sheet.getRow(currentRow);
        const displayDate = item.date && !isNaN(Date.parse(item.date)) ? new Date(item.date).toLocaleDateString('vi-VN') : '';
        row.values = [
          idx + 1,
          item.content,
          item.quantity || 1,
          item.unitPriceRMB || 0,
          item.unitPriceVND || 0,
          item.totalAmount || 0,
          displayDate // Ghi chú
        ];
        
        row.font = { name: 'Times New Roman', size: 11 };
        row.alignment = { vertical: 'middle', wrapText: true };
        
        sheet.getCell(`A${currentRow}`).alignment = { horizontal: 'center', vertical: 'middle' };
        sheet.getCell(`C${currentRow}`).alignment = { horizontal: 'center', vertical: 'middle' };
        
        const formatRMB = '#,##0.00';
        const formatVND = '#,##0';
        
        const cellD = sheet.getCell(`D${currentRow}`);
        cellD.numFmt = formatRMB;
        cellD.value = item.unitPriceRMB ? item.unitPriceRMB : '-';
        cellD.alignment = { horizontal: 'center', vertical: 'middle' };

        const cellE = sheet.getCell(`E${currentRow}`);
        cellE.numFmt = formatVND;
        cellE.alignment = { horizontal: 'center', vertical: 'middle' };

        const cellF = sheet.getCell(`F${currentRow}`);
        cellF.numFmt = formatVND;
        cellF.alignment = { horizontal: 'center', vertical: 'middle' };

        for (let c = 1; c <= 7; c++) {
          sheet.getCell(currentRow, c).border = { top: thinBlack, bottom: thinBlack, left: thinBlack, right: thinBlack };
        }

        currentRow++;
      });

      // Thêm vài dòng trống cho giống form
      for (let i = 0; i < 3; i++) {
        currentRow++;
        for (let c = 1; c <= 7; c++) {
          sheet.getCell(currentRow - 1, c).border = { top: thinBlack, bottom: thinBlack, left: thinBlack, right: thinBlack };
        }
      }

      // 7. Tổng chi
      sheet.mergeCells(`A${currentRow}:E${currentRow}`);
      const tA = sheet.getCell(`A${currentRow}`);
      tA.value = 'Tổng chi';
      tA.font = { name: 'Times New Roman', size: 12, bold: true };
      tA.alignment = { horizontal: 'center', vertical: 'middle' };
      
      const tF = sheet.getCell(`F${currentRow}`);
      tF.value = totalAmount;
      tF.font = { name: 'Times New Roman', size: 12, bold: true };
      tF.numFmt = '#,##0';
      tF.alignment = { horizontal: 'center', vertical: 'middle' };
      
      for (let c = 1; c <= 7; c++) {
        sheet.getCell(currentRow, c).border = { top: thinBlack, bottom: thinBlack, left: thinBlack, right: thinBlack };
      }
      currentRow++;

      // 8. Bằng chữ
      sheet.mergeCells(`A${currentRow}:G${currentRow}`);
      const wordCell = sheet.getCell(`A${currentRow}`);
      // Giả sử có hàm đọc số thành chữ, tạm thời để placeholder
      wordCell.value = 'Bằng chữ: '; 
      wordCell.font = { name: 'Times New Roman', size: 11, bold: true, underline: true };
      wordCell.alignment = { horizontal: 'left', vertical: 'middle' };
      currentRow++;

      // Dòng trống
      sheet.mergeCells(`A${currentRow}:G${currentRow}`);
      currentRow++;

      // 9. Chữ ký
      sheet.mergeCells(`A${currentRow}:C${currentRow}`);
      const sig1 = sheet.getCell(`A${currentRow}`);
      sig1.value = 'Thủ quỹ';
      sig1.font = { name: 'Times New Roman', size: 11 };
      sig1.alignment = { horizontal: 'center' };

      sheet.mergeCells(`D${currentRow}:G${currentRow}`);
      const sig2 = sheet.getCell(`D${currentRow}`);
      sig2.value = 'Người đề nghị';
      sig2.font = { name: 'Times New Roman', size: 11 };
      sig2.alignment = { horizontal: 'center' };
      
      // Chừa không gian ký
      currentRow += 4; 

      // Áp dụng viền xanh ngoài cùng
      applyOuterBorders(currentRow);

      // Xuất file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `ZRG_QuyetToan_${settlementDate}.xlsx`);

    } catch (err) {
      console.error('Lỗi khi xuất Excel:', err);
      alert('Không thể xuất file Excel. Vui lòng thử lại.');
    }
  };

  return (
    <section className="bg-surface p-lg rounded-xl card-shadow border border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-lg gap-4">
            <h2 className="font-headline-md text-headline-md text-primary">Settlement Preview</h2>
            <div className="flex flex-wrap gap-sm items-center">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline-variant">person</span>
                  <input 
                    type="text" 
                    placeholder="Nhập tên nhân sự..." 
                    value={employeeName} 
                    onChange={(e) => setEmployeeName(e.target.value)}
                    className="pl-10 pr-md py-xs border border-outline rounded-lg text-label-md font-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-surface min-w-[200px]"
                  />
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline-variant">calendar_today</span>
                  <input 
                    type="date" 
                    value={settlementDate}
                    onChange={(e) => setSettlementDate(e.target.value)}
                    className="pl-10 pr-sm py-xs border border-outline rounded-lg text-label-md font-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-surface cursor-pointer hover:bg-surface-container-low transition-colors"
                  />
                </div>
                <button onClick={handleExportExcel} className="px-md py-xs border border-outline text-primary font-label-md text-label-md rounded-lg hover:bg-surface-container-low flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  Xuất Excel
                </button>
                <button 
                  onClick={handleComplete}
                  disabled={isSubmitting || items.length === 0}
                  className="px-md py-xs bg-secondary text-white font-label-md text-label-md rounded-lg hover:brightness-110 disabled:opacity-50">
                  {isSubmitting ? 'Đang gửi...' : 'Hoàn thành'}
                </button>
            </div>
        </div>
        
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant">
                        <th className="px-md py-sm font-label-md text-label-md text-on-surface-variant uppercase w-16">STT</th>
                        <th className="px-md py-sm font-label-md text-label-md text-on-surface-variant uppercase w-44">NGÀY THANH TOÁN</th>
                        <th className="px-md py-sm font-label-md text-label-md text-on-surface-variant uppercase w-1/3">NỘI DUNG (Trung/Việt)</th>
                        <th className="px-md py-sm font-label-md text-label-md text-on-surface-variant uppercase text-right w-24">SỐ LƯỢNG</th>
                        <th className="px-md py-sm font-label-md text-label-md text-on-surface-variant uppercase text-right w-32">ĐƠN GIÁ RMB</th>
                        <th className="px-md py-sm font-label-md text-label-md text-on-surface-variant uppercase text-right">ĐƠN GIÁ VND</th>
                        <th className="px-md py-sm font-label-md text-label-md text-on-surface-variant uppercase text-right">THÀNH TIỀN</th>
                        <th className="px-md py-sm font-label-md text-label-md text-on-surface-variant uppercase text-center w-16">SỬA</th>
                    </tr>
                </thead>
                <tbody className="font-body-sm text-body-sm divide-y divide-gray-100">
                    {items.map((item, index) => {
                      const isEditing = editingRowId === item.id;
                      return (
                      <tr key={item.id || index} className={`hover:bg-surface-container-lowest transition-colors group ${isEditing ? 'bg-primary/5' : ''}`}>
                          <td className="px-md py-md text-on-surface font-medium align-top pt-5">{index + 1}</td>
                          
                          <td className="px-md py-md align-top">
                            {isEditing ? (
                              <input
                                type="date"
                                value={item.date || ''}
                                onChange={(e) => handleInputChange(item.id, 'date', e.target.value)}
                                className="w-full bg-surface border border-primary p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary/20"
                              />
                            ) : (
                              <div className="font-bold text-on-surface pt-2">
                                {item.date && !isNaN(Date.parse(item.date)) ? new Date(item.date).toLocaleDateString('vi-VN') : ''}
                              </div>
                            )}
                          </td>
                          
                          <td className="px-md py-md align-top">
                            {isEditing ? (
                              <textarea
                                value={item.content}
                                onChange={(e) => handleInputChange(item.id, 'content', e.target.value)}
                                className="w-full bg-surface border border-primary p-2 rounded resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                                rows={2}
                                spellCheck={false}
                                autoFocus
                              />
                            ) : (
                              <div className="whitespace-pre-wrap pt-2">
                                  {item.content}
                              </div>
                            )}
                          </td>

                          <td className="px-md py-md align-top text-right">
                            {isEditing ? (
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => handleInputChange(item.id, 'quantity', e.target.value)}
                                className="w-full text-right bg-surface border border-primary p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary/20"
                                min="1"
                              />
                            ) : (
                              <div className="font-bold text-on-surface pt-2">{item.quantity}</div>
                            )}
                          </td>

                          <td className="px-md py-md align-top text-right">
                            {isEditing ? (
                              <input
                                type="number"
                                value={item.unitPriceRMB}
                                onChange={(e) => handleInputChange(item.id, 'unitPriceRMB', e.target.value)}
                                className="w-full text-right bg-surface border border-primary p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary/20"
                                step="0.01"
                                min="0"
                              />
                            ) : (
                              <div className="font-bold text-on-surface pt-2">
                                {Number(item.unitPriceRMB).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </div>
                            )}
                          </td>

                          <td className="px-md py-md text-right font-bold text-on-surface align-top pt-6">
                            {Number(item.unitPriceVND).toLocaleString('vi-VN')}
                          </td>
                          <td className="px-md py-md text-right font-bold text-primary align-top pt-6">
                            {Number(item.totalAmount).toLocaleString('vi-VN')}
                          </td>
                          <td className="px-md py-md text-center align-top pt-4">
                            {isEditing ? (
                              <button 
                                onClick={() => setEditingRowId(null)}
                                className="p-2 bg-primary text-on-primary rounded-full hover:scale-110 transition-transform shadow-sm flex items-center justify-center mx-auto"
                                title="Lưu"
                              >
                                <span className="material-symbols-outlined text-[18px]">check</span>
                              </button>
                            ) : (
                              <button 
                                onClick={() => setEditingRowId(item.id)}
                                className="p-2 text-outline-variant hover:text-primary hover:bg-primary/10 rounded-full transition-colors flex items-center justify-center mx-auto opacity-0 group-hover:opacity-100"
                                title="Chỉnh sửa"
                              >
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                              </button>
                            )}
                          </td>
                      </tr>
                    )})}
                    
                    {items.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-md py-xl text-center text-outline-variant italic">
                          Chưa có dữ liệu. Vui lòng tải ảnh hóa đơn để AI tự động trích xuất.
                        </td>
                      </tr>
                    )}

                    {items.length > 0 && (
                      <tr className="bg-surface-container-low border-t-2 border-outline-variant font-bold">
                          <td className="px-md py-md text-right text-on-surface" colSpan={6}>Tổng cộng (Total):</td>
                          <td className="px-md py-md text-right text-primary text-headline-md" colSpan={2}>
                            {totalAmount.toLocaleString('vi-VN')} ₫
                          </td>
                      </tr>
                    )}
                </tbody>
            </table>
        </div>
    </section>
  );
}
