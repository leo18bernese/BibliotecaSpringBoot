package me.leoo.springboot.libri.libri.utils;

import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.element.Text;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import me.leoo.springboot.libri.libri.Libro;
import me.leoo.springboot.libri.ordini.Ordine;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.function.Function;

@Service
public class PdfGeneratorService {

    private static final DeviceRgb BLUE_PRIMARY = new DeviceRgb(37, 99, 235); // #2563eb
    private static final DeviceRgb GRAY_LIGHT = new DeviceRgb(243, 244, 246);
    private static final DeviceRgb GRAY_TEXT = new DeviceRgb(102, 102, 102);
    private static final DeviceRgb GREEN_SUCCESS = new DeviceRgb(22, 163, 74);

    public byte[] generateBookReportPdf(Libro book) throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(outputStream);
        PdfDocument pdfDoc = new PdfDocument(writer);
        Document document = new Document(pdfDoc);

        // Aggiungi il titolo e i dettagli del libro
        document.add(new Paragraph("Scheda tecnica del libro"));
        document.add(new Paragraph("Titolo: " + book.getTitolo()));
        document.add(new Paragraph("Autore: " + book.getAutore()));
        document.add(new Paragraph("Editore: " + book.getEditore()));
        document.add(new Paragraph("Genere: " + book.getGenere()));
        document.add(new Paragraph("Lingua: " + book.getLingua()));

        // Puoi aggiungere più dati qui, come la descrizione, l'ISBN, ecc.

        document.close();
        pdfDoc.close();
        writer.close();

        return outputStream.toByteArray();
    }

    public byte[] generateOrderPdf(Ordine ordine) throws IOException {
        return getBasePdf(document -> {

            try {
                addCompanyHeader(document);
            } catch (IOException e) {
                throw new RuntimeException(e);
            }

            return document;
        }).toByteArray();
    }

    private void addCompanyHeader(Document document) throws IOException {
        Table headerTable = new Table(UnitValue.createPercentArray(new float[]{60, 40}))
                .useAllAvailableWidth();

        PdfFont bold = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);

        // Left
        Paragraph header = new Paragraph()
                .add(new Text("Dani Commerce\n")
                        .setFontSize(26)
                        .setFontColor(BLUE_PRIMARY)
                        .setFont(bold));

        headerTable.addCell(new Cell().add(header).setBorder(null));

        // Right
        Paragraph companyInfo = new Paragraph()
                .add(new Text("Dani Commerce S.r.l.\n").setFont(bold))
                .add("Via Roma, 123\n")
                .add("00100 Roma, Italia\n")
                .add("P.IVA: 12345678901\n")
                .add("Email: info@danicommerce.store")
                .add("Website: www.danicommerce.store")
                        .setTextAlignment(TextAlignment.RIGHT)
                .setFontSize(9)
                .setFontColor(GRAY_TEXT);

        headerTable.addCell(new Cell().add(companyInfo).setBorder(null));

        document.add(headerTable);
    }

    public ByteArrayOutputStream getBasePdf(Function<Document, Document> pdfContentFunction) throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(outputStream);
        PdfDocument pdfDoc = new PdfDocument(writer);
        Document document = new Document(pdfDoc);

        document = pdfContentFunction.apply(document);

        document.close();
        pdfDoc.close();
        writer.close();

        return outputStream;
    }
}