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
import me.leoo.springboot.libri.utente.Utente;
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
                addUserDetails(document, ordine);
            } catch (IOException e) {
                throw new RuntimeException(e);
            }

            return document;
        }).toByteArray();
    }

    private void addCompanyHeader(Document document) throws IOException {
        Table table = new Table(UnitValue.createPercentArray(new float[]{60, 40}))
                .useAllAvailableWidth();

        PdfFont bold = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);

        Paragraph header = new Paragraph()
                .add(new Text("Dani Commerce\n")
                        .setFontSize(26)
                        .setFontColor(BLUE_PRIMARY)
                        .setFont(bold));

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

        table.addCell(new Cell().add(header).setBorder(null));
        table.addCell(new Cell().add(companyInfo).setBorder(null));

        document.add(table);
    }

    private void addUserDetails(Document document, Ordine ordine) throws IOException {
        Table table = new Table(UnitValue.createPercentArray(new float[]{50, 50}));
        PdfFont bold = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
        Utente utente = ordine.getUtente();

        // Colonna utente
        Cell userCell = new Cell().setBorder(null);
        userCell.add(new Paragraph("INFORMAZIONI CLIENTE").setFont(bold).setFontColor(BLUE_PRIMARY).setFontSize(10));

        userCell.add(getRow("Nome", utente.getNome(), bold));
        userCell.add(getRow("Cognome", utente.getCognome(), bold));
        userCell.add(getRow("Email", utente.getEmail(), bold));
        userCell.add(getRow("Telefono", utente.getTelefono(), bold));

        userCell.setFontSize(10).setFontColor(GRAY_TEXT);

        // Colonna ordine
        Cell orderCell = new Cell().setBorder(null);
        orderCell.add(new Paragraph("DETTAGLI ORDINE").setFont(bold).setFontColor(BLUE_PRIMARY).setFontSize(10));

        orderCell.add(getRow("Data invio", ordine.getDataCreazione().toString(), bold));
        orderCell.add(getRow("Ultimo aggiornamento", ordine.wasDateUpdated() ? ordine.getUltimaModifica().toString() : "-", bold));
        orderCell.add(getRow("Stato al momento della generazione del file", ordine.getStato().getDisplayName(), bold));

        orderCell.setFontSize(10).setFontColor(GRAY_TEXT);

        table.addCell(userCell);
        table.addCell(orderCell);

        document.add(table);
    }

    private Table getRow(String label, String value, PdfFont bold) {
        Table row = new Table(UnitValue.createPercentArray(new float[]{35, 65})).setWidth(UnitValue.createPercentValue(100));

        row.addCell(new Cell().add(new Paragraph(label + ":").setFont(bold)).setBorder(null).setFontSize(10).setFontColor(GRAY_TEXT));
        row.addCell(new Cell().add(new Paragraph(value)).setBorder(null).setFontSize(10).setFontColor(GRAY_TEXT));

        return row;
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