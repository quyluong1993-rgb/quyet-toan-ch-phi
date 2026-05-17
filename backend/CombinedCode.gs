function doPost(e) {
  try {
    // Parser payload tá»« text/plain do React gá»­i lÃªn
    const request = JSON.parse(e.postData.contents);
    const action = request.action;
    const payload = request.payload;
    
    let result = null;
    
    // Router xá»­ lÃ½ cÃ¡c action
    switch(action) {
      case 'CREATE_EXPENSE':
        // Gá»i module Expenses
        result = ExpensesModule.create(payload);
        break;
      case 'GET_EXPENSES':
        result = ExpensesModule.getAll(payload);
        break;
      case 'SCAN_INVOICE':
        result = OCRModule.scanInvoice(payload.imageBase64);
        break;
      default:
        throw new Error('Action khÃ´ng tá»“n táº¡i: ' + action);
    }
    
    return ResponseUtils.success(result);
    
  } catch (error) {
    return ResponseUtils.error(error.message);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("ZRG Settlement API is running.");
}
const ExpensesModule = {
  create: function(payload) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Expenses');
    if (!sheet) throw new Error("KhÃ´ng tÃ¬m tháº¥y sheet 'Expenses'");

    // Táº¡o ID Ä‘á»™c nháº¥t
    const expenseId = 'EXP_' + new Date().getTime();
    
    // Xá»­ lÃ½ Zero-Preservation Pattern (Claukit-Engineer rule)
    // Ãp dá»¥ng nhÃ¡y Ä‘Æ¡n (') trÆ°á»›c mÃ£ nhÃ¢n viÃªn Ä‘á»ƒ trÃ¡nh máº¥t sá»‘ 0 trong Google Sheets
    const employeeId = payload.employeeId ? ("'" + payload.employeeId.toString()) : '';
    
    // Náº¿u cÃ³ áº£nh hÃ³a Ä‘Æ¡n Base64, gá»i module FileUpload xá»­ lÃ½ (Giáº£ Ä‘á»‹nh)
    let receiptUrl = '';
    if (payload.receiptImageBase64) {
      // receiptUrl = FileUploadModule.saveBase64ToDrive(payload.receiptImageBase64, expenseId);
      receiptUrl = 'https://drive.google.com/file/d/.../view'; // placeholder
    }

    // Xá»­ lÃ½ táº¡o nhiá»u dÃ²ng náº¿u cÃ³ payload.items
    if (payload.items && Array.isArray(payload.items)) {
      const rows = payload.items.map(item => [
        item.stt || '',                                    // A: STT
        expenseId,                                         // B: MÃƒ QUYáº¾T TOÃN
        item.date !== undefined && item.date !== null ? item.date : (payload.date !== undefined && payload.date !== null ? payload.date : new Date().toISOString().split('T')[0]), // C: NGÃ€Y PHÃT SINH
        employeeId,                                        // D: MÃƒ NHÃ‚N VIÃŠN
        item.content || '',                                // E: Ná»˜I DUNG (Trung/Viá»‡t)
        item.quantity || 1,                                // F: Sá» LÆ¯á»¢NG
        item.unitPriceRMB || 0,                            // G: ÄÆ N GIÃ RMB
        item.unitPriceVND || 0,                            // H: ÄÆ N GIÃ VND
        item.totalAmount || 0,                             // I: THÃ€NH TIá»€N (VND)
        item.exchangeRate || payload.exchangeRate || 3800, // J: Tá»¶ GIÃ ÃP Dá»¤NG
        receiptUrl,                                        // K: LINK HÃ“A ÄÆ N
        'PENDING',                                         // L: TRáº NG THÃI
        new Date().toISOString()                           // M: NGÃ€Y Táº O Báº¢N GHI
      ]);
      if (rows.length > 0) {
        sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
      }
    } else {
      const newRow = [
        payload.stt || '',                                    // A: STT
        expenseId,                                            // B: MÃƒ QUYáº¾T TOÃN
        payload.date !== undefined && payload.date !== null ? payload.date : new Date().toISOString().split('T')[0], // C: NGÃ€Y PHÃT SINH
        employeeId,                                           // D: MÃƒ nhÃ¢n viÃªn
        payload.content || '',                                // E: Ná»™i dung
        payload.quantity || 1,                                // F: SL
        payload.unitPriceRMB || 0,                            // G: ÄÆ¡n giÃ¡ RMB
        payload.unitPriceVND || 0,                            // H: ÄÆ¡n giÃ¡ VND
        payload.totalAmount || 0,                             // I: ThÃ nh tiá»n
        payload.exchangeRate || 3800,                         // J: Tá»· giÃ¡
        receiptUrl,                                           // K: Link
        'PENDING',                                            // L: Tráº¡ng thÃ¡i
        new Date().toISOString()                              // M: NgÃ y táº¡o
      ];
      sheet.appendRow(newRow);
    }
    
    return {
      id: expenseId,
      status: 'PENDING',
      message: 'Ná»™p chi phÃ­ thÃ nh cÃ´ng!'
    };
  },
  
  getAll: function(payload) {
    // Logic láº¥y danh sÃ¡ch chi phÃ­...
    return [];
  }
};
const OCRModule = {
  scanInvoice: function(imageBase64) {
    // Sử dụng API Key OpenAI (ưu tiên lấy từ Properties, nếu không có thì lấy key mặc định của user)
    const apiKey = PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY') || '';
    
    if (!apiKey) {
      return this.mockScanResult();
    }

    try {
      const url = "https://api.openai.com/v1/chat/completions";
      
      const promptText = `
        Bạn là một kế toán viên thành thạo tiếng Trung và tiếng Việt.
        Nhiệm vụ của bạn là phân tích hình ảnh hoá đơn/biên lai và trích xuất các khoản chi phí cùng ngày thanh toán của hóa đơn đó.
        
        QUY TẮC BẮT BUỘC ĐỂ TRÁNH LỖI PHÂN TÍCH HÓA ĐƠN TMĐT (Taobao, 1688, Pinduoduo...):
        
        1. TUYỆT ĐỐI KHÔNG được thêm dòng tổng số tiền thanh toán thực tế (thường đi kèm chữ '实付款', '合计', 'Tổng cộng', 'Total') vào danh sách chi phí ('items'). Dòng này chỉ dùng để đối chiếu chéo tính logic chứ KHÔNG phải sản phẩm được mua.
        
        2. TUYỆT ĐỐI KHÔNG tách một thẻ sản phẩm đơn lẻ (Product Card) thành nhiều mặt hàng khác nhau dựa trên việc nó hiển thị nhiều mức giá:
           - Một thẻ sản phẩm thường hiển thị giá mua thực tế (màu đen/đỏ nổi bật, ví dụ ¥144) và giá gốc chưa giảm (màu xám mờ hoặc bị gạch ngang, ví dụ ¥160).
           - TUYỆT Đ�        3. TUYỆT ĐỐI KHÔNG trích xuất các dòng thông tin về phương thức thanh toán, trạng thái thanh toán hoặc dòng lịch sử giao dịch (ví dụ như '支付', '付款', 'Thanh toán', 'WeChat Pay', 'Alipay', '微信支付', '支付宝', 'Đã thanh toán', 'Transaction', 'Payment') thành sản phẩm trong danh sách chi phí ('items'). Các dòng này chỉ ghi nhận hình thức chuyển tiền, không phải hàng hóa/dịch vụ được mua.
           - LƯU Ý ĐẶC BIỆT: Đối với hóa đơn gọi xe/taxi công nghệ (như Didi Chuxing '滴滴出行' hiển thị sản phẩm '先乘车后付款' - Đi xe trước trả tiền sau), đây là khoản chi phí di chuyển/taxi hoàn toàn hợp lệ, tuyệt đối không được bỏ qua. Hãy trích xuất và dịch thành: 'Chi phí di chuyển (Didi Taxi) / 滴滴出行 - 先乘车后付款'.
        
        4. 'content': Nội dung chi tiết của khoản chi phí. PHẢI bao gồm cả tiếng Trung gốc (nếu có) và dịch sang tiếng Việt. Ví dụ: 'Bàn nhôm lớn / 大铝桌'.
        
        5. 'quantity': Số lượng thực tế đặt mua (quét thật kỹ hệ số số lượng như 'x3', '*2', 'x1' hiển thị ở thẻ sản phẩm). TUYỆT ĐỐI không mặc định là 1 nếu ảnh hiển thị số lượng mua khác (ví dụ: x3).
        
        6. 'unitPriceRMB': Đơn giá thanh toán thực tế bằng đồng Nhân dân tệ (RMB/¥). Chỉ lấy giá bán sau giảm, bỏ qua giá gốc bị gạch ngang hoặc có màu xám mờ.
        
        7. 'date': Ngày thanh toán, ngày lập hóa đơn, ngày giao dịch hoặc ngày tạo đơn hàng ghi trên hóa đơn (định dạng YYYY-MM-DD).
           - Hãy quét thật kỹ toàn bộ hóa đơn để tìm ngày/giờ thanh toán hoặc giao dịch (thường đi kèm các cụm từ tiếng Trung như '支付时间', '交易时间', '付款时间', '创建时间', '日期', 'Date', 'Time' hoặc các định dạng ngày tháng như YYYY/MM/DD, YYYY-MM-DD, YYYY年MM月DD日).
           - Ví dụ: Dòng '支付时间 2026年5月5日 09:18:51' thì trường 'date' phải là '2026-05-05'.
           - NẾU TRÊN ẢNH HOÀN TOÀN KHÔNG CÓ THÔNG TIN NGÀY/GIỜ THANH TOÁN HOẶC GIAO DỊCH NÀO, TRƯỜNG 'date' BẮT BUỘC PHẢI ĐỂ CHUỖI RỖNG `""`. TUYỆT ĐỐI KHÔNG tự bịa ra ngày, không lấy ngày hiện tại của hệ thống, không đoán mò ngày.
            
        * Quy tắc đối chiếu logic: Tổng thành tiền của tất cả các dòng mặt hàng (Đơn giá thực thanh toán * Số lượng) PHẢI khớp hoặc xấp xỉ khớp với số tiền thực thanh toán ('实付款') hiển thị trên hóa đơn. Nếu phát hiện lệch, hãy rà soát lại số lượng mua thực tế (quantity) và đơn giá thực thanh toán.ch ngang hoặc có màu xám mờ.
        
        7. 'date': Ngày thanh toán, ngày lập hóa đơn, ngày giao dịch hoặc ngày tạo đơn hàng ghi trên hóa đơn (định dạng YYYY-MM-DD).
           - Hãy quét thật kỹ toàn bộ hóa đơn để tìm ngày/giờ thanh toán hoặc giao dịch (thường đi kèm các cụm từ tiếng Trung như '交易时间', '付款时间', '创建时间', '日期', 'Date', 'Time' hoặc các định dạng ngày tháng như YYYY/MM/DD, YYYY-MM-DD, YYYY年MM月DD日).
           - NẾU TRÊN ẢNH HOÀN TOÀN KHÔNG CÓ THÔNG TIN NGÀY/GIỜ THANH TOÁN HOẶC GIAO DỊCH NÀO, TRƯỜNG 'date' BẮT BUỘC PHẢI ĐỂ CHUỖI RỖNG `""`. TUYỆT ĐỐI KHÔNG tự bịa ra ngày, không lấy ngày hiện tại của hệ thống, không đoán mò ngày.
           
        * Quy tắc đối chiếu logic: Tổng thành tiền của tất cả các dòng mặt hàng (Đơn giá thực thanh toán * Số lượng) PHẢI khớp hoặc xấp xỉ khớp với số tiền thực thanh toán ('实付款') hiển thị trên hóa đơn. Nếu phát hiện lệch, hãy rà soát lại số lượng mua thực tế (quantity) và đơn giá thực thanh toán.

        Dữ liệu trả về PHẢI là đối tượng JSON có dạng:
        {
          "items": [
            {
              "content": "tên chi phí tiếng Trung / tiếng Việt",
              "quantity": 1,
              "unitPriceRMB": 12.5,
              "date": "YYYY-MM-DD hoặc chuỗi rỗng"
            }
          ]
        }
      `;

      // Phân tách mimeType và base64 từ imageBase64 nhận được
      let mimeType = "image/jpeg";
      let base64Data = imageBase64;
      if (imageBase64.includes(";base64,")) {
        const parts = imageBase64.split(";base64,");
        mimeType = parts[0].replace("data:", "");
        base64Data = parts[1];
      }

      const payload = {
        "model": "gpt-4o-mini",
        "messages": [
          {
            "role": "user",
            "content": [
              {
                "type": "text",
                "text": promptText
              },
              {
                "type": "image_url",
                "image_url": {
                  "url": "data:" + mimeType + ";base64," + base64Data
                }
              }
            ]
          }
        ],
        "response_format": {
          "type": "json_object"
        },
        "temperature": 0.0
      };

      const options = {
        "method": "post",
        "headers": {
          "Authorization": "Bearer " + apiKey,
          "Content-Type": "application/json"
        },
        "payload": JSON.stringify(payload),
        "muteHttpExceptions": true
      };

      const response = UrlFetchApp.fetch(url, options);
      const jsonResponse = JSON.parse(response.getContentText());
      
      if (jsonResponse.error) {
        throw new Error(jsonResponse.error.message);
      }

      if (!jsonResponse.choices || jsonResponse.choices.length === 0) {
        throw new Error("Không nhận được kết quả phân tích từ OpenAI API. Response: " + response.getContentText());
      }

      const textResult = jsonResponse.choices[0].message.content;
      const parsedResult = JSON.parse(textResult);
      
      return {
        items: parsedResult.items || []
      };
      
    } catch (error) {
      console.error("OCR Error (OpenAI):", error);
      return {
        items: [
          {
            content: "LỖI HỆ THỐNG AI (OpenAI): " + error.message,
            quantity: 0,
            unitPriceRMB: 0,
            date: ""
          }
        ]
      };
    }
  },

  mockScanResult: function() {
    const randPrice = Math.floor(Math.random() * 500) + 50;
    return {
      items: [
        {
          content: "Chi phí công tác (Mocked)\n出差费用",
          quantity: 1,
          unitPriceRMB: randPrice,
          date: new Date().toISOString().split('T')[0]
        }
      ]
    };
  }
};
const ResponseUtils = {
  success: function(data) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      data: data
    })).setMimeType(ContentService.MimeType.JSON);
  },

  error: function(message) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: message
    })).setMimeType(ContentService.MimeType.JSON);
  }
};
