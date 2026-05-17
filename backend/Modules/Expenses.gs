const ExpensesModule = {
  create: function(payload) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Expenses');
    if (!sheet) throw new Error("Không tìm thấy sheet 'Expenses'");

    // Tạo ID độc nhất
    const expenseId = 'EXP_' + new Date().getTime();
    
    // Xử lý Zero-Preservation Pattern (Claukit-Engineer rule)
    // Áp dụng nháy đơn (') trước mã nhân viên để tránh mất số 0 trong Google Sheets
    const employeeId = payload.employeeId ? ("'" + payload.employeeId.toString()) : '';
    
    // Nếu có ảnh hóa đơn Base64, gọi module FileUpload xử lý (Giả định)
    let receiptUrl = '';
    if (payload.receiptImageBase64) {
      // receiptUrl = FileUploadModule.saveBase64ToDrive(payload.receiptImageBase64, expenseId);
      receiptUrl = 'https://drive.google.com/file/d/.../view'; // placeholder
    }

    // Xử lý tạo nhiều dòng nếu có payload.items
    if (payload.items && Array.isArray(payload.items)) {
      const rows = payload.items.map(item => [
        item.stt || '',                                    // A: STT
        expenseId,                                         // B: MÃ QUYẾT TOÁN
        item.date !== undefined && item.date !== null ? item.date : (payload.date !== undefined && payload.date !== null ? payload.date : new Date().toISOString().split('T')[0]), // C: NGÀY PHÁT SINH
        employeeId,                                        // D: MÃ NHÂN VIÊN
        item.content || '',                                // E: NỘI DUNG (Trung/Việt)
        item.quantity || 1,                                // F: SỐ LƯỢNG
        item.unitPriceRMB || 0,                            // G: ĐƠN GIÁ RMB
        item.unitPriceVND || 0,                            // H: ĐƠN GIÁ VND
        item.totalAmount || 0,                             // I: THÀNH TIỀN (VND)
        item.exchangeRate || payload.exchangeRate || 3800, // J: TỶ GIÁ ÁP DỤNG
        receiptUrl,                                        // K: LINK HÓA ĐƠN
        'PENDING',                                         // L: TRẠNG THÁI
        new Date().toISOString()                           // M: NGÀY TẠO BẢN GHI
      ]);
      if (rows.length > 0) {
        sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
      }
    } else {
      const newRow = [
        payload.stt || '',                                    // A: STT
        expenseId,                                            // B: MÃ QUYẾT TOÁN
        payload.date !== undefined && payload.date !== null ? payload.date : new Date().toISOString().split('T')[0], // C: NGÀY PHÁT SINH
        employeeId,                                           // D: MÃ nhân viên
        payload.content || '',                                // E: Nội dung
        payload.quantity || 1,                                // F: SL
        payload.unitPriceRMB || 0,                            // G: Đơn giá RMB
        payload.unitPriceVND || 0,                            // H: Đơn giá VND
        payload.totalAmount || 0,                             // I: Thành tiền
        payload.exchangeRate || 3800,                         // J: Tỷ giá
        receiptUrl,                                           // K: Link
        'PENDING',                                            // L: Trạng thái
        new Date().toISOString()                              // M: Ngày tạo
      ];
      sheet.appendRow(newRow);
    }
    
    return {
      id: expenseId,
      status: 'PENDING',
      message: 'Nộp chi phí thành công!'
    };
  },
  
  getAll: function(payload) {
    // Logic lấy danh sách chi phí...
    return [];
  }
};
