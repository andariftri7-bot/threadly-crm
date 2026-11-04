// ==============================================================================
// THREADLY - Elegant PDF Invoice Generator (jsPDF)
// ==============================================================================

import { jsPDF } from 'jspdf';
import { Order, Store } from '@/types';
import { formatDateWIB, formatRupiah } from './utils';

export function generateOrderInvoicePDF(order: Order, store: Store): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Primary colors
  const primaryNavy = [15, 23, 42]; // #0F172A
  const accentViolet = [124, 108, 240]; // #7C6CF0
  const textMuted = [100, 116, 139]; // #64748B

  // Header background bar
  doc.setFillColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Brand title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(store.name || 'THREADLY STORE', 14, 17);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('FAKTUR PENJUALAN RESMI', pageWidth - 14, 17, { align: 'right' });

  // Order meta section
  let currentY = 40;
  doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`No. Pesanan: ${order.order_number}`, 14, currentY);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(`Tanggal: ${formatDateWIB(order.created_at)}`, 14, currentY + 5);
  doc.text(`Status: ${order.status.toUpperCase()}`, 14, currentY + 10);
  doc.text(`Metode Pembayaran: ${order.payment_method}`, 14, currentY + 15);

  // Customer block (Right aligned)
  doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('Tujuan Pengiriman:', pageWidth - 14, currentY, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(order.customer_name, pageWidth - 14, currentY + 5, { align: 'right' });
  doc.text(`WhatsApp: ${order.customer_phone}`, pageWidth - 14, currentY + 10, { align: 'right' });
  if (order.customer_address) {
    const splitAddr = doc.splitTextToSize(order.customer_address, 70);
    doc.text(splitAddr, pageWidth - 14, currentY + 15, { align: 'right' });
  }

  // Items Table Header
  currentY = 75;
  doc.setFillColor(248, 249, 250);
  doc.rect(14, currentY, pageWidth - 28, 8, 'F');
  doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');

  doc.text('PRODUK & VARIAN', 18, currentY + 5.5);
  doc.text('JUMLAH', 120, currentY + 5.5, { align: 'center' });
  doc.text('HARGA SATUAN', 150, currentY + 5.5, { align: 'right' });
  doc.text('SUBTOTAL', pageWidth - 18, currentY + 5.5, { align: 'right' });

  currentY += 12;
  doc.setFont('helvetica', 'normal');

  // Items Rows
  if (order.items && order.items.length > 0) {
    for (const item of order.items) {
      doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
      doc.text(item.product_name, 18, currentY);

      doc.setFontSize(8);
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.text(item.variant_name, 18, currentY + 4);

      doc.setFontSize(9);
      doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
      doc.text(`${item.quantity} pcs`, 120, currentY, { align: 'center' });
      doc.text(formatRupiah(item.price), 150, currentY, { align: 'right' });
      doc.text(formatRupiah(item.subtotal), pageWidth - 18, currentY, { align: 'right' });

      currentY += 10;
    }
  }

  // Divider line
  doc.setDrawColor(226, 232, 240);
  doc.line(14, currentY, pageWidth - 14, currentY);
  currentY += 8;

  // Calculation totals (Right aligned)
  const calcXLabel = 140;
  const calcXValue = pageWidth - 18;

  doc.setFontSize(9);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Subtotal:', calcXLabel, currentY, { align: 'right' });
  doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.text(formatRupiah(order.subtotal), calcXValue, currentY, { align: 'right' });

  currentY += 6;
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Ongkos Kirim:', calcXLabel, currentY, { align: 'right' });
  doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.text(formatRupiah(order.shipping_cost), calcXValue, currentY, { align: 'right' });

  if (order.discount > 0) {
    currentY += 6;
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text('Diskon:', calcXLabel, currentY, { align: 'right' });
    doc.setTextColor(accentViolet[0], accentViolet[1], accentViolet[2]);
    doc.text(`-${formatRupiah(order.discount)}`, calcXValue, currentY, { align: 'right' });
  }

  currentY += 8;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.text('TOTAL PEMBAYARAN:', calcXLabel, currentY, { align: 'right' });
  doc.setTextColor(accentViolet[0], accentViolet[1], accentViolet[2]);
  doc.text(formatRupiah(order.total_amount), calcXValue, currentY, { align: 'right' });

  // Footer notes
  currentY += 25;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Terima kasih telah berbelanja di toko kami!', pageWidth / 2, currentY, { align: 'center' });
  doc.text(`Kenali pelangganmu, ajak mereka kembali - Dibuat otomatis oleh Threadly CRM`, pageWidth / 2, currentY + 5, { align: 'center' });

  return doc;
}
