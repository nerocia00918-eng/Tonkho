/**
 * Google Apps Script (Code.gs)
 * Hệ thống Điều phối & Quản lý Hàng hóa Thông minh - Chi nhánh Bình Thạnh
 */

const CONFIG = {
  BRANCH: 'BT',
  WAREHOUSE_MAIN: '64',
  WAREHOUSE_LARGE: '7bc',
  SHEET_STATS: 'tk',
  WAREHOUSE_TBA: 'Tba',
  DATA_TBA: 'Data Tba'
};

/**
 * Lấy dữ liệu từ tất cả các sheet cần thiết
 */
function getData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const result = {};
  
  const sheetsToLoad = [
    CONFIG.WAREHOUSE_MAIN, 
    CONFIG.BRANCH, 
    CONFIG.WAREHOUSE_LARGE, 
    CONFIG.WAREHOUSE_TBA, 
    CONFIG.SHEET_STATS, 
    CONFIG.DATA_TBA
  ];
  
  sheetsToLoad.forEach(sheetName => {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      result[sheetName] = [];
      return;
    }
    
    const data = sheet.getDataRange().getValues();
    if (data.length === 0) {
      result[sheetName] = [];
      return;
    }
    const headers = data.shift();
    
    result[sheetName] = data.map(row => {
      const obj = {};
      headers.forEach((header, i) => {
        const h = String(header).trim().toLowerCase();
        const val = row[i];
        
        // Map common columns (Case-insensitive)
        if (h === 'mã hàng' || h === 'mã' || h === 'sku') obj.sku = val;
        else if (h === 'tên hàng' || h === 'tên' || h === 'tên sản phẩm') obj.name = val;
        else if (h === 'giá bán lẻ' || h === 'giá') obj.price = val;
        else if (h === 'số lượng tồn' || h === 'tồn') obj.stock = val;
        else if (h === 'tồn max' || h === 'max') obj.maxStock = val;
        else if (h === 'thời gian' || h === 'ngày bắt đầu trưng bày') obj.startedAt = val;
        else if (h === 'ghi chú' || h === 'note') obj.note = val;
        
        // Map stats columns
        else if (h === 'số lượng bán lẻ' || h === 'sales') obj.sales30d = val;
        else if (h === 'so pending' || h === 'so') obj.soPending = val;
        else if (h === 'khuyến mãi v2' || h === 'promo') obj.promo = (val === true || val === 'V2' || val === 'KM' || val === 'X');
        else if (h === 'nhập nội bộ') obj.intImp = val;
        else if (h === 'xuất nội bộ') obj.intExp = val;
        
        // Fallback to original header name
        obj[header] = val;
      });
      return obj;
    });
  });
  
  return result;
}

/**
 * Xử lý yêu cầu từ Web App
 */
function doPost(e) {
  const params = JSON.parse(e.postData.contents);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  if (params.type === 'DataTba_UPDATE') {
    const sheet = ss.getSheetByName(CONFIG.DATA_TBA);
    const data = sheet.getDataRange().getValues();
    const sku = params.payload.sku;
    let found = false;
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === sku) { // Cột A là mã
        if (params.payload.startedAt) sheet.getRange(i + 1, 3).setValue(params.payload.startedAt); // Cột C là thời gian
        if (params.payload.hasOwnProperty('note')) sheet.getRange(i + 1, 4).setValue(params.payload.note); // Cột D là ghi chú
        found = true;
        break;
      }
    }
    
    if (!found) {
      sheet.appendRow([sku, params.payload.name, params.payload.startedAt || '', params.payload.note || '']);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  const data = getData();
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
