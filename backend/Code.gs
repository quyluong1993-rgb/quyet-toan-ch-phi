function doPost(e) {
  try {
    // Parser payload từ text/plain do React gửi lên
    const request = JSON.parse(e.postData.contents);
    const action = request.action;
    const payload = request.payload;
    
    let result = null;
    
    // Router xử lý các action
    switch(action) {
      case 'CREATE_EXPENSE':
        // Gọi module Expenses
        result = ExpensesModule.create(payload);
        break;
      case 'GET_EXPENSES':
        result = ExpensesModule.getAll(payload);
        break;
      case 'SCAN_INVOICE':
        result = OCRModule.scanInvoice(payload.imageBase64);
        break;
      default:
        throw new Error('Action không tồn tại: ' + action);
    }
    
    return ResponseUtils.success(result);
    
  } catch (error) {
    return ResponseUtils.error(error.message);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("ZRG Settlement API is running.");
}
