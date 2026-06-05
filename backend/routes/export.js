const express = require("express");
const ExcelJS = require("exceljs");
const db = require("../db");
const verifyToken = require("../middleware/auth");

const router = express.Router();

router.get("/excel", async (req, res) => {
  try {

    const [rows] =
      await db.query(
        "SELECT * FROM production_entries"
      );

    const workbook =
      new ExcelJS.Workbook();

    const worksheet =
      workbook.addWorksheet(
        "Production Report"
      );

    worksheet.columns = [
      {
        header: "OC Number",
        key: "oc_number",
        width: 20,
      },
      {
        header: "Quantity",
        key: "production_quantity",
        width: 20,
      },
      {
        header: "Status",
        key: "status",
        width: 20,
      },
      {
        header: "Incentive",
        key: "incentive_amount",
        width: 20,
      },
    ];

    rows.forEach((row) => {
      worksheet.addRow(row);
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=report.xlsx"
    );

    await workbook.xlsx.write(res);

    res.end();

  } catch (err) {

    res.status(500).json({
      error: err.message,
    });

  }
});

module.exports = router;