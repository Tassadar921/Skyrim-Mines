import PDFDocument from 'pdfkit';
import type { DateTime } from 'luxon';
import app from '@adonisjs/core/services/app';

export const COMPANY_NAME = 'Compagnie Minière de la Crevasse';

export type DocumentPdfLine = {
    resourceName: string;
    resourceType: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
};

const RESOURCE_TYPE_SECTIONS: { type: string; label: string }[] = [
    { type: 'minerai', label: 'Minerais' },
    { type: 'lingot', label: 'Lingots' },
];

export type DocumentPdfData = {
    documentLabel: string;
    footerText: string;
    number: number;
    organizationName: string | null;
    requesterName: string;
    createdAt: DateTime;
    lines: DocumentPdfLine[];
    totalAmount: number;
};

function formatAmount(amount: number): string {
    return `${amount.toFixed(2)} s`;
}

export function formatDocumentNumber(number: number): string {
    return String(number).padStart(5, '0');
}

export async function generateDocumentPdf(data: DocumentPdfData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const chunks: Buffer[] = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        doc.registerFont('Title', app.makePath('resources/fonts/MedievalSharp-Regular.ttf'));
        doc.registerFont('Body', app.makePath('resources/fonts/Almendra-Regular.ttf'));
        doc.registerFont('Body-Bold', app.makePath('resources/fonts/Almendra-Bold.ttf'));
        doc.registerFont('Body-Italic', app.makePath('resources/fonts/Almendra-Italic.ttf'));
        doc.font('Body');

        const logoPath = app.publicPath('logo.png');
        const marginLeft = doc.page.margins.left;
        const pageWidth = doc.page.width - marginLeft - doc.page.margins.right;
        const halfWidth = pageWidth / 2;

        doc.image(logoPath, marginLeft, doc.page.margins.top, { width: 50 });
        doc.fontSize(19)
            .font('Title')
            .text(COMPANY_NAME, marginLeft + 65, doc.page.margins.top + 10, { width: halfWidth - 65 });

        const headerRightX = marginLeft + halfWidth;
        let rightY = doc.page.margins.top;
        doc.fontSize(10).font('Body');
        if (data.organizationName) {
            doc.text(`Organisation : ${data.organizationName}`, headerRightX, rightY, { width: halfWidth, align: 'right' });
            rightY += 14;
        }
        doc.text(`Demandé par : ${data.requesterName}`, headerRightX, rightY, { width: halfWidth, align: 'right' });
        rightY += 14;
        doc.font('Body-Bold').text(`${data.documentLabel} n° ${formatDocumentNumber(data.number)}`, headerRightX, rightY, { width: halfWidth, align: 'right' });
        rightY += 14;
        doc.font('Body').text(data.createdAt.setLocale('fr').toFormat('dd/MM/yyyy'), headerRightX, rightY, { width: halfWidth, align: 'right' });

        doc.y = Math.max(doc.page.margins.top + 70, rightY + 30);

        const columns = [
            { label: 'Ressource', width: pageWidth * 0.4, align: 'left' as const },
            { label: 'Quantité', width: pageWidth * 0.15, align: 'right' as const },
            { label: 'Prix unitaire', width: pageWidth * 0.2, align: 'right' as const },
            { label: 'Total', width: pageWidth * 0.25, align: 'right' as const },
        ];

        function drawRow(values: string[], options: { bold?: boolean; fontSize?: number } = {}): void {
            doc.font(options.bold ? 'Body-Bold' : 'Body').fontSize(options.fontSize ?? 10);
            const rowY = doc.y;
            let x = marginLeft;
            for (const [i, column] of columns.entries()) {
                doc.text(values[i], x, rowY, { width: column.width, align: column.align });
                x += column.width;
            }
            doc.moveDown(options.fontSize && options.fontSize > 10 ? 1.4 : 0.7);
        }

        drawRow(
            columns.map((column) => column.label),
            { bold: true },
        );
        doc.moveTo(marginLeft, doc.y)
            .lineTo(marginLeft + pageWidth, doc.y)
            .stroke();
        doc.moveDown(0.4);

        for (const section of RESOURCE_TYPE_SECTIONS) {
            const sectionLines = data.lines.filter((line) => line.resourceType === section.type);
            if (!sectionLines.length) continue;

            doc.font('Body-Bold').fontSize(10).text(section.label, marginLeft, doc.y);
            doc.moveDown(0.5);

            for (const line of sectionLines) {
                drawRow([line.resourceName, String(line.quantity), formatAmount(line.unitPrice), formatAmount(line.totalPrice)]);
            }
            doc.moveDown(0.3);
        }

        doc.moveTo(marginLeft, doc.y)
            .lineTo(marginLeft + pageWidth, doc.y)
            .stroke();
        doc.moveDown(0.6);

        drawRow(['', '', 'TOTAL', formatAmount(data.totalAmount)], { bold: true, fontSize: 14 });

        const footerY = doc.page.height - doc.page.margins.bottom - 30;
        doc.image(logoPath, marginLeft, footerY, { width: 22 });
        doc.fontSize(9)
            .font('Body-Italic')
            .text(data.footerText, marginLeft + 30, footerY + 5, { width: pageWidth - 30 });

        doc.end();
    });
}
