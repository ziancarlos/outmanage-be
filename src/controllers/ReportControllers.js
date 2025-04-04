import CustomerServices from "../services/CustomerServices.js";
import ReportServices from "../services/ReportServices.js";
import ExcelJs from "exceljs";

async function getOutgoingItems(req, res, next) {
  try {
    const body =
      req.query.startDate || req.query.endDate
        ? {
            itemId: req.query.itemId,
            customerId: req.query.customerId,
            date: {
              startDate: req.query.startDate,
              endDate: req.query.endDate,
            },
            limit: req.query.limit,
            sort: req.query.sort,
          }
        : {
            itemId: req.query.itemId,
            customerId: req.query.customerId,
            limit: req.query.limit,
            sort: req.query.sort,
          };

    const result = await ReportServices.getOutgoingItems(body);

    res.status(200).json({
      data: result,
    });
  } catch (e) {
    console.log(e);
    next(e);
  }
}

async function downloadOutgoingItemsExcel(req, res, next) {
  try {
    const { customerId, startDate, endDate } = req.query;

    // Build request body for service
    const body = {
      customerId,
      ...(startDate || endDate
        ? {
            date: {
              startDate: startDate || "Tidak ditentukan",
              endDate: endDate || "Tidak ditentukan",
            },
          }
        : {}),
    };

    const result = await ReportServices.getOutgoingItems(body);

    // Create workbook and worksheet
    const workbook = new ExcelJs.Workbook();
    const worksheet = workbook.addWorksheet("Outgoing Items");

    // 1️⃣ REPORT TITLE
    const titleRow = worksheet.addRow(["Laporan Pengeluaran Barang"]);
    titleRow.font = { bold: true, size: 14 };
    titleRow.height = 25;

    // 2️⃣ FILTER INFORMATION
    const filters = [];
    if (customerId) {
      const customers = await CustomerServices.getCustomerByConstraints({
        customerId: +customerId,
      });
      filters.push(`Pelanggan: C-${customerId} | ${customers.name}`);
    }

    if (startDate && endDate) {
      filters.push(`Periode: ${startDate} s/d ${endDate}`);
    } else if (startDate) {
      filters.push(`Tanggal Mulai: ${startDate}`);
    } else if (endDate) {
      filters.push(`Tanggal Akhir: ${endDate}`);
    }

    // Add filter rows
    if (filters.length > 0) {
      filters.forEach((filter) => {
        const filterRow = worksheet.addRow([filter]);
        filterRow.font = { italic: true };
      });
      worksheet.addRow([]); // Spacer row
    }

    // 3️⃣ TABLE HEADERS - Manually add headers
    const headerRow = worksheet.addRow([
      "ID Barang",
      "Nama Barang",
      "Total Kuantitas Keluar",
    ]);
    headerRow.font = { bold: true, color: { argb: "FFFFFF" }, size: 12 };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "000000" },
    };
    headerRow.alignment = {
      horizontal: "center",
      vertical: "middle",
      wrapText: true,
    };
    headerRow.height = 20;

    // Set column widths
    worksheet.getColumn(1).width = 15; // ID Barang
    worksheet.getColumn(2).width = 30; // Nama Barang
    worksheet.getColumn(3).width = 25; // Total Kuantitas Keluar

    // 4️⃣ DATA ROWS - Ensure proper data insertion
    if (result.length === 0) {
      worksheet.addRow(["Tidak ada data", "", ""]);
    } else {
      result.forEach((item) => {
        worksheet.addRow([
          `I-${item.item.itemId}`, // ID Barang
          item.item.name, // Nama Barang
          parseInt(item.totalShippedQuantity).toLocaleString("id-ID"), // Total Kuantitas Keluar
        ]);
      });
    }

    // 5️⃣ EXPORT SETUP
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Laporan_Pengeluaran_${new Date().toISOString()}.xlsx"`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (e) {
    console.log(e);
    next(e);
  }
}

export default {
  getOutgoingItems,
  downloadOutgoingItemsExcel,
};
