package me.leoo.springboot.libri.libri.utils;

import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import me.leoo.springboot.libri.buono.Buono;
import me.leoo.springboot.libri.libri.Libro;
import me.leoo.springboot.libri.ordini.Ordine;
import me.leoo.springboot.libri.spedizione.SpedizioneIndirizzo;
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
                addDeliveryDetails(document, ordine);
                addCouponDetails(document, ordine);

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

        Cell headerCell = new Cell().setBorder(null);
        headerCell.add(getText("Dani Commerce"));
        headerCell.setFontSize(26).setFontColor(BLUE_PRIMARY).setFont(bold);

        Cell companyCell = new Cell().setBorder(null);
        companyCell.add(getText("Dani Commerce S.r.l."));
        companyCell.add(getText("Via Roma, 123"));
        companyCell.add(getText("00100 Roma, Italia"));
        companyCell.add(getText("P.IVA: 12345678901"));
        companyCell.add(getText("Email: info@danicommerce.store"));
        companyCell.add(getText("Website: www.danicommerce.store"));
        companyCell.setTextAlignment(TextAlignment.RIGHT).setFontSize(9).setFontColor(GRAY_TEXT);


        table.addCell(headerCell);
        table.addCell(companyCell);

        document.add(table);
    }

    private void addUserDetails(Document document, Ordine ordine) throws IOException {
        Table table = new Table(UnitValue.createPercentArray(new float[]{50, 50})).setMarginTop(20f);
        PdfFont bold = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
        Utente utente = ordine.getUtente();

        // Colonna utente
        Cell userCell = new Cell().setBorder(null).setPaddingRight(15f);
        userCell.add(new Paragraph("INFORMAZIONI CLIENTE").setFont(bold).setFontColor(BLUE_PRIMARY).setFontSize(10));
        userCell.add(getSeparator(BLUE_PRIMARY, 1, 0, 2, 2));

        userCell.add(getRow("Nome", utente.getNome(), bold));
        userCell.add(getRow("Cognome", utente.getCognome(), bold));
        userCell.add(getRow("Email", utente.getEmail(), bold));
        userCell.add(getRow("Telefono", utente.getTelefono(), bold));

        userCell.setFontSize(10).setFontColor(GRAY_TEXT);

        // Colonna ordine
        Cell orderCell = new Cell().setBorder(null).setPaddingLeft(15f);
        orderCell.add(new Paragraph("DETTAGLI ORDINE").setFont(bold).setFontColor(BLUE_PRIMARY).setFontSize(10));
        orderCell.add(getSeparator(BLUE_PRIMARY, 1, 0, 2, 2));

        orderCell.add(getRow("Data invio", ordine.getDataCreazione().toString(), bold));
        orderCell.add(getRow("Ultimo aggiornamento", ordine.wasDateUpdated() ? ordine.getUltimaModifica().toString() : "-", bold));
        //orderCell.add(getRow("Stato al momento della generazione del file", ordine.getStato().getDisplayName(), bold));

        orderCell.setFontSize(10).setFontColor(GRAY_TEXT);

        table.addCell(userCell);
        table.addCell(orderCell);

        document.add(table);
    }

    private void addDeliveryDetails(Document document, Ordine ordine) throws IOException {
        Table table = new Table(UnitValue.createPercentArray(new float[]{100})).setMarginTop(20f);


        PdfFont bold = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
        Utente utente = ordine.getUtente();
        SpedizioneIndirizzo indirizzo = ordine.getIndirizzoSpedizione();

        // Main cell
        Cell mainCell = new Cell().setBorder(null);
        mainCell.add(new Paragraph("INFORMAZIONI SPEDIZIONE").setFont(bold).setFontColor(BLUE_PRIMARY).setFontSize(10));
        mainCell.add(getSeparator(BLUE_PRIMARY, 1, 0, 2, 2));

        Table subTable = new Table(UnitValue.createPercentArray(new float[]{50, 50})).setWidth(UnitValue.createPercentValue(100));

        // Colonna utente
        Cell typeCell = new Cell().setBorder(null).setPaddingRight(15f);

        typeCell.add(getRow("Tipologia", ordine.getLuogoSpedizione().getDescrizione(), bold));
        typeCell.add(getRow("Corriere", ordine.getNomeCorriere(), bold));
        typeCell.add(getRow("Tipo spedizione", ordine.getTipoSpedizione(), bold));

        typeCell.setFontSize(10).setFontColor(GRAY_TEXT);

        // Indirizzo di spedizione
        Cell addressCell = new Cell().setBorder(null).setPaddingLeft(15f);

        if (indirizzo != null && indirizzo.isValid()) {
            addressCell.add(getRow("Nome", indirizzo.getNome(), bold));
            addressCell.add(getRow("Indirizzo", indirizzo.getIndirizzo(), bold));
            addressCell.add(getRow("Città", indirizzo.getCitta(), bold));
            addressCell.add(getRow("Provincia", indirizzo.getProvincia(), bold));
            addressCell.add(getRow("CAP", indirizzo.getCap(), bold));
            addressCell.add(getRow("Telefono", indirizzo.getTelefono(), bold));
        } else {
            addressCell.add(new Paragraph("Impossibile recuperare l'indirizzo di spedizione").setFontColor(GRAY_TEXT).setFontSize(10));
        }

        addressCell.setFontSize(10).setFontColor(GRAY_TEXT);

        subTable.addCell(typeCell);
        subTable.addCell(addressCell);

        mainCell.add(subTable);
        table.addCell(mainCell);

        document.add(table);
    }

    private void addCouponDetails(Document document, Ordine ordine) throws IOException {
        Table table = new Table(UnitValue.createPercentArray(new float[]{100})).setMarginTop(20f)
                .setBackgroundColor(GRAY_LIGHT);

        PdfFont bold = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);

        Cell mainCell = new Cell().setBorder(null);

        if (ordine.getCouponCodes().isEmpty()) {
            mainCell.add(new Paragraph("Nessun buono applicato").setFontColor(GRAY_TEXT).setFontSize(10));
        } else {
            mainCell.add(new Paragraph("BUONI APPLICATI").setFont(bold).setFontColor(BLUE_PRIMARY).setFontSize(10));
            mainCell.add(getSeparator(BLUE_PRIMARY, 1, 0, 2, 2));

            for (Buono buono : ordine.getCouponCodes()) {
                if (buono == null || buono.getSconto() == null) continue;

                mainCell.add(getRow(buono.getCodice(), buono.getSconto().toString(), bold));
            }
        }

        mainCell.setFontSize(10).setFontColor(GRAY_TEXT);
        table.addCell(mainCell);

        document.add(table);
    }


    private Table getText(String text) {
        Table table = new Table(UnitValue.createPercentArray(new float[]{100})).setWidth(UnitValue.createPercentValue(100));

        table.addCell(new Cell().add(new Paragraph(text)).setBorder(null).setFontSize(10).setFontColor(GRAY_TEXT));

        return table;
    }

    private Table getRow(String label, String value, PdfFont bold) {
        Table row = new Table(UnitValue.createPercentArray(new float[]{35, 65})).setWidth(UnitValue.createPercentValue(100));

        row.addCell(new Cell().add(new Paragraph(label + ":").setFont(bold)).setBorder(null).setFontSize(10).setFontColor(GRAY_TEXT));
        row.addCell(new Cell().add(new Paragraph(value)).setBorder(null).setFontSize(10).setFontColor(GRAY_TEXT));

        return row;
    }

    private Table getSeparator(DeviceRgb color, float thickness, float padding, float topMargin, float bottomMargin) {
        Table table = new Table(UnitValue.createPercentArray(new float[]{100})).setWidth(UnitValue.createPercentValue(100));

        table.addCell(new Cell().setBorderTop(new SolidBorder(color, thickness)).setBorderBottom(null).setBorderLeft(null).setBorderRight(null).setPadding(padding)
                .setMarginTop(topMargin)
                .setMarginBottom(bottomMargin)
                .setFontSize(1)
                .setHeight(thickness));

        return table;
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