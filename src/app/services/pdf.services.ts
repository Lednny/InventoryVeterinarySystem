import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface VentaParaNota {
  id: number;
  producto: string;
  marca: string;
  categoria: string;
  cantidad_vendida: number;
  precio_venta: number;
  subtotal: number;
  fecha_venta: Date;
  cliente: string;
  lote: string;
}

export interface NotaVentaCompleta {
  numeroNota: string;
  fecha: Date;
  cliente: string;
  vendedor?: string;
  ventas: VentaParaNota[];
  subtotal: number;
  iva: number;
  total: number;
  observaciones?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PdfService {
    supabaseClient: any;

  constructor() { }

  generarNotaVentasSeleccionadas(notaVenta: NotaVentaCompleta): void {
    const doc = new jsPDF();
    
    // Configuración del documento
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    let yPosition = 15;

    // Header de la empresa
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('COMERCIALIZADORA BIOFARMEX', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 12;
    
    // Información bancaria y contacto con mejor espaciado
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('SCOTIABANK 08806538681', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 5;
    doc.text('CLABE INTERBANCARIA: 044790088065386811', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 5;
    doc.text('Cel: 9931160194', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 5;
    doc.text('E-mail: gtdelao@hotmail.com', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 5;
    doc.text('Tila del Carmen Garcia de la O', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 5;
    doc.text('R.F.C: GAOT711104A79', pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 15;
    
    // Subtítulo con separación
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Nota de Ventas Realizadas', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 20;

    // Información de la nota con mejor espaciado
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Nota No: ${notaVenta.numeroNota}`, margin, yPosition);
    doc.text(`Fecha: ${this.formatearFecha(notaVenta.fecha)}`, pageWidth - 80, yPosition);
    
    yPosition += 18;

    // Información del cliente principal con espaciado mejorado
    const clientesUnicos = [...new Set(notaVenta.ventas.map(v => v.cliente))];
    if (clientesUnicos.length === 1) {
      doc.setFont('helvetica', 'bold');
      doc.text('CLIENTE:', margin, yPosition);
      yPosition += 10;
      doc.setFont('helvetica', 'normal');
      doc.text(`${clientesUnicos[0]}`, margin, yPosition);
      yPosition += 18;
    } else {
      doc.setFont('helvetica', 'bold');
      doc.text('VENTAS MÚLTIPLES (Varios clientes)', margin, yPosition);
      yPosition += 18;
    }

    // Tabla de ventas
    const tableData = notaVenta.ventas.map(venta => {
      const row = [
        venta.cantidad_vendida.toString(),
        venta.producto || 'Producto no especificado',
        venta.marca || 'Sin marca',
        `$${venta.precio_venta.toFixed(2)}`,
        `$${venta.subtotal.toFixed(2)}`,
        this.formatearFechaCorta(venta.fecha_venta)
      ];
      
      // Solo agregar cliente si hay múltiples clientes
      if (clientesUnicos.length > 1) {
        row.splice(3, 0, venta.cliente || 'Sin cliente'); // Insertar cliente en posición 3
      }
      
      return row;
    });

    const headers = clientesUnicos.length > 1 
      ? [['Cant.', 'Producto', 'Marca', 'Cliente', 'Precio Unit.', 'Subtotal', 'Fecha']]
      : [['Cant.', 'Producto', 'Marca', 'Precio Unit.', 'Subtotal', 'Fecha']];

    autoTable(doc, {
      startY: yPosition,
      head: headers,
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [34, 197, 94], // Color verde para ventas
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
        cellPadding: 3
      },
      bodyStyles: {
        fontSize: 9,
        textColor: 50,
        cellPadding: 3,
        halign: 'center',
        valign: 'middle'
      },
      columnStyles: clientesUnicos.length > 1 ? {
        0: { halign: 'center', cellWidth: 20 },      // Cant.
        1: { halign: 'left', cellWidth: 50 },        // Producto
        2: { halign: 'center', cellWidth: 25 },      // Marca
        3: { halign: 'center', cellWidth: 30 },      // Cliente
        4: { halign: 'right', cellWidth: 25 },       // Precio Unit.
        5: { halign: 'right', cellWidth: 25 },       // Subtotal
        6: { halign: 'center', cellWidth: 22 }       // Fecha
      } : {
        0: { halign: 'center', cellWidth: 20 },      // Cant.
        1: { halign: 'left', cellWidth: 55 },        // Producto
        2: { halign: 'center', cellWidth: 30 },      // Marca
        3: { halign: 'right', cellWidth: 30 },       // Precio Unit.
        4: { halign: 'right', cellWidth: 30 },       // Subtotal
        5: { halign: 'center', cellWidth: 22 }       // Fecha
      },
      margin: { left: 15, right: 15 },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap'
      },
      tableWidth: 'auto'
    });

    // Obtener la posición Y después de la tabla
    yPosition = (doc as any).lastAutoTable.finalY + 8;

    // Totales (sin IVA) con mejor espaciado
    const totalWidth = 60;
    const totalX = pageWidth - 15 - totalWidth;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Subtotal: $${notaVenta.subtotal.toFixed(2)}`, totalX, yPosition);
    yPosition += 10;
    doc.text(`IVA (0%): $0.00`, totalX, yPosition);
    yPosition += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`Total: $${notaVenta.subtotal.toFixed(2)}`, totalX, yPosition);

    // Resumen de ventas con mejor espaciado
    yPosition += 15;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN:', 15, yPosition);
    yPosition += 8;
    doc.setFont('helvetica', 'normal');
    doc.text(`Total de productos vendidos: ${notaVenta.ventas.length}`, 15, yPosition);
    yPosition += 6;
    doc.text(`Total de unidades: ${notaVenta.ventas.reduce((sum, v) => sum + v.cantidad_vendida, 0)}`, 15, yPosition);

    // Observaciones si existen con mejor espaciado
    if (notaVenta.observaciones) {
      yPosition += 12;
      doc.setFont('helvetica', 'bold');
      doc.text('Observaciones:', 15, yPosition);
      yPosition += 8;
      doc.setFont('helvetica', 'normal');
      const observacionesLines = doc.splitTextToSize(notaVenta.observaciones, pageWidth - 30);
      doc.text(observacionesLines, 15, yPosition);
    }

    // Footer
    yPosition = doc.internal.pageSize.height - 30;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('Nota de ventas realizadas', pageWidth / 2, yPosition, { align: 'center' });
    doc.text(`Generado el ${this.formatearFecha(new Date())} - Sistema de Inventario Veterinario`, pageWidth / 2, yPosition + 8, { align: 'center' });

    // Guardar el PDF
    const fileName = `nota-ventas-${notaVenta.numeroNota}-${this.formatearFechaArchivo(notaVenta.fecha)}.pdf`;
    doc.save(fileName);
  }

  private formatearFecha(fecha: Date): string {
    return fecha.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private formatearFechaCorta(fecha: Date): string {
    return fecha.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  }

  private formatearFechaArchivo(fecha: Date): string {
    return fecha.toISOString().split('T')[0];
  }

}