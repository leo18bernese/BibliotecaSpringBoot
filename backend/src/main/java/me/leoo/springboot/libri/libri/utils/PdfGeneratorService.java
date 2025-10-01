package me.leoo.springboot.libri.libri.utils;

import com.itextpdf.text.Document;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.Element;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.pdf.PdfWriter;
import me.leoo.springboot.libri.libri.Libro;
import me.leoo.springboot.libri.ordini.Ordine;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.function.Function;

@Service
public class PdfGeneratorService {

    public byte[] generateBookReportPdf(Libro book) throws DocumentException, IOException {
        Document document = new Document();
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        PdfWriter.getInstance(document, outputStream);
        document.open();

        // Aggiungi il titolo e i dettagli del libro
        document.add(new Paragraph("Scheda tecnica del libro"));
        document.add(new Paragraph("Titolo: " + book.getTitolo()));
        document.add(new Paragraph("Autore: " + book.getAutore()));
        document.add(new Paragraph("Editore: " + book.getEditore()));
        document.add(new Paragraph("Genere: " + book.getGenere()));
        document.add(new Paragraph("Lingua: " + book.getLingua()));

        // Puoi aggiungere più dati qui, come la descrizione, l'ISBN, ecc.

        document.close();

        return outputStream.toByteArray();
    }

    public byte[] generateOrderPdf(Ordine ordine)  throws DocumentException, IOException {
        return getBasePdf(document -> {
            try {
                document.add(new Paragraph("Dettagli dell'ordine"));
                document.add(new Paragraph("ID Ordine: " + ordine.getId()));
                document.add(new Paragraph("Data Ordine: " + ordine.getDataOrdine()));
                document.add(new Paragraph("Totale: " + ordine.getTotale() + " EUR"));
                document.add(new Paragraph("Stato: " + ordine.getStato()));
                document.add(new Paragraph(" "));
                document.add(new Paragraph("Libri nell'ordine:"));
                ordine.getLibri().forEach(libro -> {
                    try {
                        document.add(new Paragraph("- " + libro.getTitolo() + " di " + libro.getAutore() + " (Quantità: " + libro.getQuantita() + ")"));
                    } catch (DocumentException e) {
                        throw new RuntimeException(e);
                    }
                });
            } catch (DocumentException e) {
                throw new RuntimeException(e);
            }
            return document;
        }
    }

    private Element getCommonHeader(){
        // Ritorna un header comune per i PDF per il nome del ecommerce, sito, e altro


    }

    public ByteArrayOutputStream getBasePdf(Function<Document, Document> pdfContentFunction) throws DocumentException {
        Document document = new Document();
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        PdfWriter.getInstance(document, outputStream);
        document.open();

        document = pdfContentFunction.apply(document);

        document.close();

        return outputStream;
    }
}