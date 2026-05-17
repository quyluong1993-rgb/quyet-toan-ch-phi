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
           - TUYỆT ĐỐI KHÔNG ĐƯỢC tạo thêm một mặt hàng ảo (ví dụ: 'Khung gỗ / 框架' hay 'Khung sắt') với giá gốc ¥160. Hãy bỏ qua hoàn toàn mức giá gốc màu xám/bị gạch ngang này và chỉ lấy đơn giá thực thanh toán (ví dụ ¥144) làm đơn giá ('unitPriceRMB') cho sản phẩm đó.
           - Hãy trích xuất đúng số lượng thực tế đặt mua (ví dụ 'x3' thì 'quantity' = 3).
           - Tuyệt đối không tự suy diễn hoặc bịa ra các mặt hàng phụ trợ như phụ kiện, khung gỗ, bao bì... từ các thông số chi tiết của sản phẩm nếu chúng không phải là một dòng hàng mua riêng biệt có giá riêng.
        
        3. TUYỆT ĐỐI KHÔNG trích xuất các dòng thông tin về phương thức thanh toán, trạng thái thanh toán hoặc dòng lịch sử giao dịch (ví dụ như '支付', '付款', 'Thanh toán', 'WeChat Pay', 'Alipay', '微信支付', '支付宝', 'Đã thanh toán', 'Transaction', 'Payment') thành sản phẩm trong danh sách chi phí ('items'). Các dòng này chỉ ghi nhận hình thức chuyển tiền, không phải hàng hóa/dịch vụ được mua.
           - LƯU Ý ĐẶC BIỆT: Đối với hóa đơn gọi xe/taxi công nghệ (như Didi Chuxing '滴滴出行' hiển thị sản phẩm '先乘车后付款' - Đi xe trước trả tiền sau), đây là khoản chi phí di chuyển/taxi hoàn toàn hợp lệ, tuyệt đối không được bỏ qua. Hãy trích xuất và dịch thành: 'Chi phí di chuyển (Didi Taxi) / 滴滴出行 - 先乘车后付款'.
        
        4. 'content': Nội dung chi tiết của khoản chi phí. PHẢI bao gồm cả tiếng Trung gốc (nếu có) và dịch sang tiếng Việt. Ví dụ: 'Bàn nhôm lớn / 大铝桌'.
        
        5. 'quantity': Số lượng thực tế đặt mua (quét thật kỹ hệ số số lượng như 'x3', '*2', 'x1' hiển thị ở thẻ sản phẩm). TUYỆT ĐỐI không mặc định là 1 nếu ảnh hiển thị số lượng mua khác (ví dụ: x3).
        
        6. 'unitPriceRMB': Đơn giá thanh toán thực tế bằng đồng Nhân dân tệ (RMB/¥). Chỉ lấy giá bán sau giảm, bỏ qua giá gốc bị gạch ngang hoặc có màu xám mờ.
        
        7. 'date': Ngày thanh toán, ngày lập hóa đơn, ngày giao dịch hoặc ngày tạo đơn hàng ghi trên hóa đơn (định dạng YYYY-MM-DD).
           - Hãy quét thật kỹ toàn bộ hóa đơn để tìm ngày/giờ thanh toán hoặc giao dịch (thường đi kèm các cụm từ tiếng Trung như '支付时间', '交易时间', '付款时间', '创建时间', '日期', 'Date', 'Time' hoặc các định dạng ngày tháng như YYYY/MM/DD, YYYY-MM-DD, YYYY年MM月DD日).
           - Ví dụ: Dòng '支付时间 2026年5月5日 09:18:51' thì trường 'date' phải là '2026-05-05'.
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
