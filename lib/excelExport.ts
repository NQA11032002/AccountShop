import * as XLSX from 'xlsx';

export const exportToExcel = (data: any[], filename: string, sheetName: string = 'Sheet1') => {
  console.log("Exporting to Excel", { filename, dataLength: data.length });
  
  try {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    
    // Convert data to worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, `${filename}.xlsx`);
    
    console.log("Excel export successful");
    return true;
  } catch (error) {
    console.error("Excel export error:", error);
    return false;
  }
};

export const exportUsersToExcel = (users: any[]) => {
  const exportData = users.map(user => ({
    'ID': user.id,
    'Họ tên': user.name,
    'Email': user.email,
    'Ngày tham gia': new Date(user.joinDate).toLocaleDateString('vi-VN'),
    'Trạng thái': user.status,
    'Tổng đơn hàng': user.totalOrders,
    'Tổng chi tiêu (VNĐ)': user.totalSpent.toLocaleString('vi-VN')
  }));
  
  return exportToExcel(exportData, 'danh-sach-nguoi-dung', 'Người dùng');
};

export const exportProductsToExcel = (products: any[]) => {
  const exportData = products.map(product => ({
    'ID': product.id,
    'Tên sản phẩm': product.name,
    'Danh mục': product.category,
    'Giá bán (VNĐ)': product.price.toLocaleString('vi-VN'),
    'Giá gốc (VNĐ)': product.originalPrice.toLocaleString('vi-VN'),
    'Kho': product.stock,
    'Đã bán': product.sales,
    'Đánh giá': product.rating,
    'Trạng thái': product.status
  }));
  
  return exportToExcel(exportData, 'danh-sach-san-pham', 'Sản phẩm');
};

export const exportOrdersToExcel = (orders: any[]) => {
  const exportData = orders.map(order => ({
    'Mã đơn hàng': order.id,
    'Email khách hàng': order.userEmail,
    'Số sản phẩm': order.products.length,
    'Tổng tiền (VNĐ)': order.total.toLocaleString('vi-VN'),
    'Phương thức thanh toán': order.paymentMethod,
    'Trạng thái': order.status,
    'Ngày tạo': new Date(order.createdAt).toLocaleDateString('vi-VN')
  }));
  
  return exportToExcel(exportData, 'danh-sach-don-hang', 'Đơn hàng');
};

export const exportDetailedOrdersToExcel = (orders: any[]) => {
  const exportData: any[] = [];
  
  orders.forEach(order => {
    order.products.forEach((product: any) => {
      exportData.push({
        'Mã đơn hàng': order.id,
        'Email khách hàng': order.userEmail,
        'Tên sản phẩm': product.name,
        'Số lượng': product.quantity,
        'Đơn giá (VNĐ)': product.price.toLocaleString('vi-VN'),
        'Thành tiền (VNĐ)': (product.price * product.quantity).toLocaleString('vi-VN'),
        'Phương thức thanh toán': order.paymentMethod,
        'Trạng thái đơn hàng': order.status,
        'Ngày tạo': new Date(order.createdAt).toLocaleDateString('vi-VN')
      });
    });
  });
  
  return exportToExcel(exportData, 'chi-tiet-don-hang', 'Chi tiết đơn hàng');
};