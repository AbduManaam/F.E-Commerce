// src/utils/generateInvoice.js
// Run: npm install jspdf jspdf-autotable

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Generates and downloads a PDF invoice for a given order.
 * Compatible with the OrderResponse DTO from your Go backend.
 *
 * @param {Object} order - Order object from GET /api/orders or GET /api/orders/:id
 * @param {Object} user  - User object from AuthContext { name, email, phone }
 */
export const generateInvoice = (order, user = {}) => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const PAGE_W = 210;
  const MARGIN = 14;
  const CONTENT_W = PAGE_W - MARGIN * 2;

  // ─── COLORS ───────────────────────────────────────────────
  const BRAND       = [230, 100, 30];   // orange
  const DARK        = [30,  30,  30];
  const MUTED       = [120, 120, 120];
  const LIGHT_BG    = [250, 250, 248];
  const DIVIDER     = [220, 220, 215];
  const SUCCESS     = [34,  139, 34];
  const DANGER      = [200, 50,  50];

  // ─── HELPERS ──────────────────────────────────────────────
  const fmt = (n) => `$${Number(n || 0).toFixed(2)}`;

  const statusColor = (s) => {
    const map = {
      pending:             [217, 119, 6],
      confirmed:           [37,  99, 235],
      paid:                SUCCESS,
      shipped:             [124, 58, 237],
      delivered:           SUCCESS,
      cancelled:           DANGER,
      partially_cancelled: [234, 88, 12],
      refunded:            [109, 40, 217],
    };
    return map[s?.toLowerCase()] || MUTED;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day:   "2-digit",
      month: "short",
      year:  "numeric",
    });
  };

  // ─── INVOICE META ─────────────────────────────────────────
  const invoiceNumber = `INV-${String(order.id).padStart(6, "0")}`;
  const invoiceDate   = formatDate(order.created_at || new Date());
  const orderDate     = formatDate(order.created_at);

  // ─── HEADER BAND ──────────────────────────────────────────
  doc.setFillColor(...BRAND);
  doc.rect(0, 0, PAGE_W, 36, "F");

  // Logo / Brand name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text("Yumzy", MARGIN, 16);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Fresh Food, Fast Delivery", MARGIN, 22);

  // Invoice label on right
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text("INVOICE", PAGE_W - MARGIN, 14, { align: "right" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(invoiceNumber, PAGE_W - MARGIN, 20, { align: "right" });
  doc.text(`Date: ${invoiceDate}`, PAGE_W - MARGIN, 26, { align: "right" });

  // ─── BILL TO / ORDER INFO CARDS ───────────────────────────
  let y = 45;

  // Card backgrounds
  doc.setFillColor(...LIGHT_BG);
  doc.roundedRect(MARGIN, y, CONTENT_W / 2 - 3, 40, 2, 2, "F");
  doc.roundedRect(MARGIN + CONTENT_W / 2 + 3, y, CONTENT_W / 2 - 3, 40, 2, 2, "F");

  // Bill To
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text("BILL TO", MARGIN + 4, y + 7);

  doc.setTextColor(...DARK);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  const customerName =
    order.shipping_address?.full_name || user?.name || "Customer";
  doc.text(customerName, MARGIN + 4, y + 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);

  const addr = order.shipping_address;
  if (addr) {
    const line1 = addr.address || "";
    const line2 = [addr.city, addr.state].filter(Boolean).join(", ");
    const line3 = [addr.zip_code, addr.country].filter(Boolean).join(" - ");
    if (line1) doc.text(line1, MARGIN + 4, y + 21);
    if (line2) doc.text(line2, MARGIN + 4, y + 27);
    if (line3) doc.text(line3, MARGIN + 4, y + 33);
    if (addr.phone) doc.text(`📞 ${addr.phone}`, MARGIN + 4, y + 38);
  }

  if (user?.email) {
    doc.text(user.email, MARGIN + 4, addr ? y + 44 : y + 21);
  }

  // Order Info (right card)
  const rx = MARGIN + CONTENT_W / 2 + 7;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text("ORDER DETAILS", rx, y + 7);

  const infoRows = [
    ["Order ID",       `#${order.id}`],
    ["Order Date",     orderDate],
    ["Payment",        (order.payment_method || "COD").toUpperCase()],
    ["Pay Status",     (order.payment_status || "pending").toUpperCase()],
    ["Order Status",   (order.status || "").toUpperCase()],
  ];

  infoRows.forEach(([label, val], i) => {
    const iy = y + 14 + i * 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...MUTED);
    doc.text(label, rx, iy);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK);
    doc.text(val, rx + 28, iy);
  });

  // Status badge color dot
  doc.setFillColor(...statusColor(order.status));
  doc.circle(rx + 26, y + 38 - 1.5, 2, "F");

  y += 50;

  // ─── SHIPPING ADDRESS (if different) ──────────────────────
  if (addr && addr.landmark) {
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(...MUTED);
    doc.text(`Landmark: ${addr.landmark}`, MARGIN, y);
    y += 6;
  }

  // ─── ITEMS TABLE ──────────────────────────────────────────
  y += 2;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  doc.text("Order Items", MARGIN, y);
  y += 4;

  const tableRows = (order.items || []).map((item, idx) => {
    const name    = item.product?.name || `Item ${idx + 1}`;
    const qty     = item.quantity || 1;
    const price   = item.price || 0;
    const disc    = item.discount_amount || 0;
    const final   = item.final_price || price;
    const sub     = item.subtotal || final * qty;
    const status  = (item.status || "pending").charAt(0).toUpperCase() +
                    (item.status || "pending").slice(1);

    return [
      idx + 1,
      name,
      qty,
      fmt(price),
      disc > 0 ? `-${fmt(disc)}` : "—",
      fmt(final),
      fmt(sub),
      status,
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [["#", "Product", "Qty", "Unit Price", "Discount", "Final Price", "Subtotal", "Status"]],
    body: tableRows,
    theme: "grid",
    styles: {
      fontSize: 8.5,
      cellPadding: 3,
      textColor: DARK,
      lineColor: DIVIDER,
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: BRAND,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
    },
    columnStyles: {
      0: { cellWidth: 8,  halign: "center" },
      1: { cellWidth: 55 },
      2: { cellWidth: 10, halign: "center" },
      3: { cellWidth: 22, halign: "right" },
      4: { cellWidth: 20, halign: "right" },
      5: { cellWidth: 22, halign: "right" },
      6: { cellWidth: 22, halign: "right" },
      7: { cellWidth: 23, halign: "center" },
    },
    alternateRowStyles: { fillColor: [253, 252, 250] },
    didParseCell: (data) => {
      // Color the Status column
      if (data.column.index === 7 && data.section === "body") {
        const val = data.cell.text[0]?.toLowerCase();
        data.cell.styles.textColor =
          val === "cancelled" || val === "refunded" ? DANGER :
          val === "pending"                         ? [180, 100, 0] :
          SUCCESS;
        data.cell.styles.fontStyle = "bold";
      }
      // Color negative discount
      if (data.column.index === 4 && data.section === "body") {
        if (data.cell.text[0]?.startsWith("-")) {
          data.cell.styles.textColor = SUCCESS;
        }
      }
    },
    margin: { left: MARGIN, right: MARGIN },
  });

  // ─── TOTALS SUMMARY ───────────────────────────────────────
  const tableEndY = doc.lastAutoTable.finalY + 6;
  const summaryX  = PAGE_W - MARGIN - 72;
  const summaryW  = 72;

  doc.setFillColor(...LIGHT_BG);
  doc.roundedRect(summaryX, tableEndY, summaryW, 38, 2, 2, "F");

  const totals = [
    ["Subtotal",       fmt(order.total),           false],
    ["Discount",       order.discount > 0 ? `-${fmt(order.discount)}` : "—", true],
    ["Shipping Fee",   fmt(10),                    false],
    ["Tax (2%)",       fmt((order.total || 0) * 0.02), false],
  ];

  let ty = tableEndY + 8;
  totals.forEach(([label, val, isDiscount]) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...MUTED);
    doc.text(label, summaryX + 4, ty);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...(isDiscount && val !== "—" ? SUCCESS : DARK));
    doc.text(val, summaryX + summaryW - 4, ty, { align: "right" });
    ty += 7;
  });

  // Grand Total line
  doc.setDrawColor(...DIVIDER);
  doc.setLineWidth(0.4);
  doc.line(summaryX + 4, ty - 2, summaryX + summaryW - 4, ty - 2);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...BRAND);
  doc.text("Grand Total", summaryX + 4, ty + 5);
  doc.text(fmt(order.final_total), summaryX + summaryW - 4, ty + 5, { align: "right" });

  // ─── PAYMENT STATUS BADGE ─────────────────────────────────
  const badgeY = tableEndY;
  const pStatus = order.payment_status || "pending";
  const isPaid = pStatus === "paid";
  doc.setFillColor(...(isPaid ? [230, 255, 230] : [255, 245, 230]));
  doc.roundedRect(MARGIN, badgeY, 60, 14, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...(isPaid ? SUCCESS : [180, 100, 0]));
  doc.text(
    isPaid ? "✓ Payment Received" : `⏳ Payment: ${pStatus.toUpperCase()}`,
    MARGIN + 4, badgeY + 9
  );

  // ─── NOTES / FOOTER ───────────────────────────────────────
  const footerY = Math.max(tableEndY + 55, 240);

  doc.setFillColor(...BRAND);
  doc.rect(0, footerY, PAGE_W, 0.6, "F");

  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text(
    "• Orders can be cancelled before dispatch.  • For support: support@yumzy.com  • Thank you for ordering with Yumzy! 🍽️",
    PAGE_W / 2, footerY + 7,
    { align: "center" }
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text(
    `Generated on ${new Date().toLocaleString("en-IN")}  |  Invoice ${invoiceNumber}`,
    PAGE_W / 2, footerY + 13,
    { align: "center" }
  );

  // ─── SAVE ─────────────────────────────────────────────────
  doc.save(`${invoiceNumber}_Yumzy.pdf`);
};