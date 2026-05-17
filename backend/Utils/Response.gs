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
