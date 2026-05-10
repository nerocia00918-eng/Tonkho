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
        // Map common columns
        if (header === 'Mã hàng' || header === 'Mã') obj.sku = row[i];
        else if (header === 'Tên hàng' || header === 'Tên') obj.name = row[i];
        else if (header === 'Giá bán lẻ') obj.price = row[i];
        else if (header === 'Số lượng tồn') obj.stock = row[i];
        else if (header === 'Tồn Max') obj.maxStock = row[i];
        else if (header === 'Thời gian' || header === 'Ngày bắt đầu trưng bày') obj.startedAt = row[i];
        
        // Map stats columns
        else if (header === 'Số lượng bán lẻ') obj.sales30d = row[i];
        else if (header === 'SO Pending') obj.soPending = row[i];
        else if (header === 'Khuyến mãi V2') obj.promo = (row[i] === true || row[i] === 'V2' || row[i] === 'KM');
        else if (header === 'Nhập nội bộ') obj.intImp = row[i];
        else if (header === 'Xuất nội bộ') obj.intExp = row[i];
        
        else obj[header] = row[i];
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
        sheet.getRange(i + 1, 3).setValue(params.payload.startedAt); // Cột C là thời gian
        found = true;
        break;
      }
    }
    
    if (!found) {
      sheet.appendRow([sku, params.payload.name, params.payload.startedAt]);
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
