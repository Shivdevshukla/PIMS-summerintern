// backend/routes/payslip.js
// Requires: npm install pdfkit

const express = require('express');
const PDFDocument = require('pdfkit');
const db = require('../db');
const verifyToken = require('../middleware/auth');

const router = express.Router();

// GET /api/payslip/:entry_id — generate and stream a PDF payslip
router.get('/:entry_id', verifyToken, async (req, res) => {
  try {
    // Fetch entry
    const [[entry]] = await db.query(
      'SELECT * FROM production_entries WHERE id = ?',
      [req.params.entry_id]
    );
    if (!entry) return res.status(404).json({ error: 'Entry not found' });

    // Access control: only HR, admin, or the shift incharge who submitted it
    const allowed =
      ['hr', 'admin'].includes(req.user.role) ||
      (req.user.role === 'shift_incharge' && entry.shift_incharge_id === req.user.id);

    if (!allowed) return res.status(403).json({ error: 'Access denied' });

    // Fetch audit trail for this entry
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

    const PRIMARY   = '#1d4ed8';
    const GRAY      = '#6b7280';
    const LIGHT     = '#f3f4f6';
    const GREEN     = '#16a34a';
    const RED       = '#dc2626';
    const PAGE_W    = doc.page.width - 100;

    // ── Header Banner ──
    doc.rect(0, 0, doc.page.width, 90).fill(PRIMARY);
    doc.fillColor('white').fontSize(22).font('Helvetica-Bold')
      .text('PIMS — Production Incentive Payslip', 50, 28);
    doc.fontSize(10).font('Helvetica')
      .text('Production Incentive Management System', 50, 56);
    doc.fillColor('white').fontSize(10)
      .text(`Generated: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}`, 0, 56, { align: 'right', width: doc.page.width - 50 });

    // ── Status badge ──
    const statusColor  = entry.status === 'approved' ? GREEN : entry.status === 'rejected' ? RED : '#d97706';
    const statusLabel  = entry.status.replace(/_/g, ' ').toUpperCase();
    doc.roundedRect(50, 106, 100, 22, 4).fill(statusColor);
    doc.fillColor('white').fontSize(9).font('Helvetica-Bold')
      .text(statusLabel, 50, 112, { width: 100, align: 'center' });

    doc.moveDown(3.5);

    // ── Section helper ──
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
    y = twoCol('OC Number',           `#${entry.oc_number}`, y);
    y = twoCol('OC Stage',            entry.oc_stage, y);
    y = twoCol('OC Type',             entry.oc_type, y);
    y = twoCol('Machine ID',          entry.machine_id, y);
    y = twoCol('Department / Section', entry.dept_section, y);
    y = twoCol('Shift',               `${entry.shift} (${entry.working_hours} hrs)`, y);
    y = twoCol('Shift Date',          new Date(entry.shift_date).toLocaleDateString('en-IN'), y);
    y = twoCol('Submitted By',        entry.submitted_by_name, y);
    y += 10;

    // ── Production Details ──
    y = sectionHeader('Production Details', y);
    y = twoCol('Workers',             entry.worker_name, y);
    y = twoCol('Production Quantity', entry.production_quantity, y);
    y = twoCol('Raw Material Used',   `${entry.raw_material_used ?? 0} kg`, y);
    if (entry.remarks) {
      y = twoCol('Remarks', entry.remarks, y);
    }
    y += 10;

    // ── Incentive ──
    y = sectionHeader('Incentive', y);
    doc.rect(50, y, PAGE_W, 36).fill('#dcfce7');
    doc.fillColor(GRAY).fontSize(10).font('Helvetica')
      .text('Total Incentive Amount', 58, y + 11);
    doc.fillColor(GREEN).fontSize(16).font('Helvetica-Bold')
      .text(`₹${Number(entry.incentive_amount).toLocaleString('en-IN')}`, 0, y + 9, { align: 'right', width: doc.page.width - 58 });
    y += 46;
    y += 10;

    // ── Approval Trail ──
    y = sectionHeader('Approval Trail', y);
    const ROLE_LABEL = {
      shift_incharge: 'Shift Incharge',
      hod:            'HOD',
      superintendent: 'Superintendent',
      hr:             'HR',
    };

    if (auditRows.length === 0) {
      doc.fillColor(GRAY).fontSize(9).text('No audit events found.', 58, y);
      y += 20;
    } else {
      auditRows.forEach((ev, i) => {
        const evColor = ev.action === 'approved' ? GREEN : ev.action === 'rejected' ? RED : PRIMARY;
        const evLabel = ev.action.toUpperCase();
        const evDate  = new Date(ev.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        const role    = ROLE_LABEL[ev.actor_role] || ev.actor_role;

        // Row bg alternating
        if (i % 2 === 0) doc.rect(50, y - 4, PAGE_W, 22).fill('#f9fafb');

        doc.fillColor(evColor).fontSize(8).font('Helvetica-Bold')
          .text(evLabel, 58, y, { width: 60 });
        doc.fillColor('#111827').fontSize(8).font('Helvetica')
          .text(`${ev.actor_name} (${role})`, 120, y, { width: 220 });
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
        'This is a system-generated payslip from the Production Incentive Management System. No physical signature required.',
        50, doc.page.height - 32, { align: 'center', width: PAGE_W }
      );

    doc.end();

  } catch (err) {
    console.error('Payslip error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;