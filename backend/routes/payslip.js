// backend/routes/payslip.js
const express = require('express');
const PDFDocument = require('pdfkit');
const db = require('../db');
const verifyToken = require('../middleware/auth');

const router = express.Router();

// ========================
// BULK PAYSLIP DOWNLOAD
// GET /api/payslip/bulk
// HR and Admin only — generates one PDF with all approved entries
// ⚠️ Must be declared BEFORE /:entry_id, otherwise Express treats
//    "bulk" as an entry_id param.
// ========================
router.get('/bulk', verifyToken, async (req, res) => {
  if (!['hr', 'admin'].includes(req.user.role))
    return res.status(403).json({ error: 'Only HR and Admin can download bulk payslips' });

  try {
    const [entries] = await db.query(
      `SELECT pe.*, u.name as submitted_by_name
       FROM production_entries pe
       LEFT JOIN users u ON pe.shift_incharge_id = u.id
       WHERE pe.status = 'approved'
       ORDER BY pe.created_at DESC`
    );

    if (!entries.length)
      return res.status(404).json({ error: 'No approved entries found' });

    const doc = new PDFDocument({ margin: 50, size: 'A4', autoFirstPage: false });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="PIMS_Payslips_${new Date().toISOString().split('T')[0]}.pdf"`
    );
    doc.pipe(res);

    const PRIMARY = '#1d4ed8';
    const GRAY    = '#6b7280';
    const LIGHT   = '#f3f4f6';
    const GREEN   = '#16a34a';
    const RED     = '#dc2626';
    const PAGE_W  = 495; // doc.page.width - 100

    entries.forEach((entry, idx) => {
      doc.addPage();

      // ── Header Banner ──
      doc.rect(0, 0, doc.page.width, 80).fill(PRIMARY);
      doc.fillColor('white').fontSize(18).font('Helvetica-Bold')
        .text('PIMS — Production Incentive Payslip', 50, 20);
      doc.fontSize(9).font('Helvetica')
        .text(
          `Entry ${idx + 1} of ${entries.length}  |  Generated: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`,
          50, 48
        );

      // ── Status badge ──
      const statusColor = entry.status === 'approved' ? GREEN : RED;
      doc.roundedRect(50, 92, 90, 20, 4).fill(statusColor);
      doc.fillColor('white').fontSize(8).font('Helvetica-Bold')
        .text(entry.status.replace(/_/g, ' ').toUpperCase(), 50, 98, { width: 90, align: 'center' });

      let y = 126;

      // ── Section helper ──
      const sectionHeader = (title) => {
        doc.rect(50, y, PAGE_W, 22).fill(LIGHT);
        doc.fillColor(PRIMARY).fontSize(9).font('Helvetica-Bold')
          .text(title.toUpperCase(), 58, y + 7);
        y += 28;
      };

      const row = (label, value, valueColor = '#111827') => {
        doc.fillColor(GRAY).fontSize(8.5).font('Helvetica')
          .text(label, 58, y, { width: PAGE_W / 2 - 10 });
        doc.fillColor(valueColor).fontSize(8.5).font('Helvetica-Bold')
          .text(String(value || '—'), 58 + PAGE_W / 2, y, { width: PAGE_W / 2 - 10, align: 'right' });
        y += 17;
      };

      // ── Entry Details ──
      sectionHeader('Entry Details');
      row('OC Number',            `#${entry.oc_number}`);
      row('OC Stage',             entry.oc_stage);
      row('OC Type',              entry.oc_type);
      row('Machine ID',           entry.machine_id);
      row('Department / Section', entry.dept_section);
      row('Shift',                `${entry.shift} (${entry.working_hours} hrs)`);
      row('Shift Date',           new Date(entry.shift_date || entry.created_at).toLocaleDateString('en-IN'));
      row('Submitted By',         entry.submitted_by_name || '—');
      y += 8;

      // ── Production Details ──
      sectionHeader('Production Details');
      row('Workers',              entry.worker_name);
      row('Production Quantity',  entry.production_quantity);
      row('Raw Material Used',    `${entry.raw_material_used ?? 0} kg`);
      if (entry.remarks) row('Remarks', entry.remarks);
      y += 8;

      // ── Incentive ──
      sectionHeader('Incentive');
      doc.rect(50, y, PAGE_W, 34).fill('#dcfce7');
      doc.fillColor(GRAY).fontSize(9).font('Helvetica')
        .text('Total Incentive Amount', 58, y + 11);
      doc.fillColor(GREEN).fontSize(15).font('Helvetica-Bold')
        .text(
          `₹${Number(entry.incentive_amount).toLocaleString('en-IN')}`,
          0, y + 9,
          { align: 'right', width: doc.page.width - 58 }
        );
      y += 44;

      // ── Footer ──
      doc.rect(0, doc.page.height - 40, doc.page.width, 40).fill(LIGHT);
      doc.fillColor(GRAY).fontSize(7.5).font('Helvetica')
        .text(
          'System-generated payslip — PIMS, Universal Cables Limited, Satna Plant. No physical signature required.',
          50, doc.page.height - 26,
          { align: 'center', width: PAGE_W }
        );
    });

    doc.end();
  } catch (err) {
    console.error('Bulk payslip error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ========================
// SINGLE ENTRY PAYSLIP
// GET /api/payslip/:entry_id
// HR, Admin, Shift Incharge (own entries), Worker (own name in entry)
// ⚠️ Must be declared AFTER /bulk
// ========================
router.get('/:entry_id', verifyToken, async (req, res) => {
  try {
    const [[entry]] = await db.query(
      'SELECT * FROM production_entries WHERE id = ?',
      [req.params.entry_id]
    );
    if (!entry) return res.status(404).json({ error: 'Entry not found' });

    // ── Access control ──
    let allowed = ['hr', 'admin'].includes(req.user.role);

    if (!allowed && req.user.role === 'shift_incharge') {
      allowed = entry.shift_incharge_id === req.user.id;
    }

    if (!allowed && req.user.role === 'worker') {
      const [[worker]] = await db.query(
        'SELECT name FROM workers WHERE user_id = ? AND active = 1',
        [req.user.id]
      );
      if (worker) {
        const names = (entry.worker_name || '')
          .split(',').map(n => n.trim().toLowerCase());
        allowed = names.includes(worker.name.toLowerCase());
      }
    }

    if (!allowed) return res.status(403).json({ error: 'Access denied' });

    // ── Audit trail ──
    const [auditRows] = await db.query(
      'SELECT * FROM audit_log WHERE entry_id = ? ORDER BY created_at ASC',
      [entry.id]
    );

    // ── Build PDF ──
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="payslip-OC${entry.oc_number}-${entry.id}.pdf"`
    );
    doc.pipe(res);

    const PRIMARY = '#1d4ed8';
    const GRAY    = '#6b7280';
    const LIGHT   = '#f3f4f6';
    const GREEN   = '#16a34a';
    const RED     = '#dc2626';
    const PAGE_W  = doc.page.width - 100;

    // ── Header ──
    doc.rect(0, 0, doc.page.width, 90).fill(PRIMARY);
    doc.fillColor('white').fontSize(22).font('Helvetica-Bold')
      .text('PIMS — Production Incentive Payslip', 50, 28);
    doc.fontSize(10).font('Helvetica')
      .text('Production Incentive Management System', 50, 56);
    doc.fillColor('white').fontSize(10)
      .text(
        `Generated: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}`,
        0, 56,
        { align: 'right', width: doc.page.width - 50 }
      );

    // ── Status badge ──
    const statusColor = entry.status === 'approved' ? GREEN : entry.status === 'rejected' ? RED : '#d97706';
    doc.roundedRect(50, 106, 100, 22, 4).fill(statusColor);
    doc.fillColor('white').fontSize(9).font('Helvetica-Bold')
      .text(entry.status.replace(/_/g, ' ').toUpperCase(), 50, 112, { width: 100, align: 'center' });

    doc.moveDown(3.5);

    const sectionHeader = (title, y) => {
      doc.rect(50, y, PAGE_W, 24).fill(LIGHT);
      doc.fillColor(PRIMARY).fontSize(10).font('Helvetica-Bold')
        .text(title.toUpperCase(), 58, y + 7);
      return y + 30;
    };

    const twoCol = (label, value, y, valueColor = '#111827') => {
      doc.fillColor(GRAY).fontSize(9).font('Helvetica')
        .text(label, 58, y, { width: PAGE_W / 2 - 10 });
      doc.fillColor(valueColor).fontSize(9).font('Helvetica-Bold')
        .text(String(value || '—'), 58 + PAGE_W / 2, y, { width: PAGE_W / 2 - 10, align: 'right' });
      return y + 18;
    };

    let y = 140;

    // ── Entry Details ──
    y = sectionHeader('Entry Details', y);
    y = twoCol('OC Number',            `#${entry.oc_number}`, y);
    y = twoCol('OC Stage',             entry.oc_stage, y);
    y = twoCol('OC Type',              entry.oc_type, y);
    y = twoCol('Machine ID',           entry.machine_id, y);
    y = twoCol('Department / Section', entry.dept_section, y);
    y = twoCol('Shift',                `${entry.shift} (${entry.working_hours} hrs)`, y);
    y = twoCol('Shift Date',           new Date(entry.shift_date).toLocaleDateString('en-IN'), y);
    y = twoCol('Submitted By',         entry.submitted_by_name, y);
    y += 10;

    // ── Production Details ──
    y = sectionHeader('Production Details', y);
    y = twoCol('Workers',             entry.worker_name, y);
    y = twoCol('Production Quantity', entry.production_quantity, y);
    y = twoCol('Raw Material Used',   `${entry.raw_material_used ?? 0} kg`, y);
    if (entry.remarks) y = twoCol('Remarks', entry.remarks, y);
    y += 10;

    // ── Incentive ──
    y = sectionHeader('Incentive', y);
    doc.rect(50, y, PAGE_W, 36).fill('#dcfce7');
    doc.fillColor(GRAY).fontSize(10).font('Helvetica')
      .text('Total Incentive Amount', 58, y + 11);
    doc.fillColor(GREEN).fontSize(16).font('Helvetica-Bold')
      .text(
        `₹${Number(entry.incentive_amount).toLocaleString('en-IN')}`,
        0, y + 9,
        { align: 'right', width: doc.page.width - 58 }
      );
    y += 56;

    // ── Approval Trail ──
    y = sectionHeader('Approval Trail', y);
    const ROLE_LABEL = {
      shift_incharge: 'Shift Incharge',
      hod:            'HOD',
      superintendent: 'Superintendent',
      hr:             'HR',
    };

    if (!auditRows.length) {
      doc.fillColor(GRAY).fontSize(9).text('No audit events found.', 58, y);
    } else {
      auditRows.forEach((ev, i) => {
        const evColor = ev.action === 'approved' ? GREEN : ev.action === 'rejected' ? RED : PRIMARY;
        const evDate  = new Date(ev.created_at).toLocaleDateString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric',
        });
        const role = ROLE_LABEL[ev.actor_role] || ev.actor_role;

        if (i % 2 === 0) doc.rect(50, y - 4, PAGE_W, 22).fill('#f9fafb');

        doc.fillColor(evColor).fontSize(8).font('Helvetica-Bold')
          .text(ev.action.toUpperCase(), 58, y, { width: 70 });
        doc.fillColor('#111827').fontSize(8).font('Helvetica')
          .text(`${ev.actor_name} (${role})`, 130, y, { width: 210 });
        doc.fillColor(GRAY).fontSize(8)
          .text(evDate, 340, y, { width: 170, align: 'right' });
        y += 18;

        if (ev.remarks) {
          doc.fillColor(GRAY).fontSize(7.5).font('Helvetica-Oblique')
            .text(`  "${ev.remarks}"`, 58, y, { width: PAGE_W - 10 });
          y += 14;
        }
      });
    }

    // ── Footer ──
    doc.rect(0, doc.page.height - 45, doc.page.width, 45).fill(LIGHT);
    doc.fillColor(GRAY).fontSize(8).font('Helvetica')
      .text(
        'This is a system-generated payslip from PIMS. No physical signature required.',
        50, doc.page.height - 32,
        { align: 'center', width: PAGE_W }
      );

    doc.end();
  } catch (err) {
    console.error('Payslip error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;