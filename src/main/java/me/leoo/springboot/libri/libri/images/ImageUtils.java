package me.leoo.springboot.libri.libri.images;

import lombok.experimental.UtilityClass;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Base64;

@UtilityClass
public class ImageUtils {

    // Record per rappresentare un file con i suoi metadati
    public record FileResponse(
            String nome,
            String contentType,
            String base64Content,
            long size
    ) {}

    // Metodi esistenti mantenuti per compatibilità
    public ResponseEntity<byte[]> getImageResponse(Path path) throws IOException {
        return getFileResponse(path);
    }

    public ResponseEntity<byte[]> getImageResponse(byte[] image, String fileName) {
        return getFileResponse(image, fileName);
    }

    // Nuovi metodi generici per qualsiasi tipo di file

    /**
     * Restituisce un ResponseEntity con il contenuto del file come byte array
     */
    public ResponseEntity<byte[]> getFileResponse(Path path) throws IOException {
        byte[] fileContent = Files.readAllBytes(path);
        String fileName = path.getFileName().toString();
        return getFileResponse(fileContent, fileName);
    }

    /**
     * Restituisce un ResponseEntity con il contenuto del file come byte array
     */
    public ResponseEntity<byte[]> getFileResponse(byte[] fileContent, String fileName) {
        String contentType = determineContentType(fileName);

        return ResponseEntity.ok()
                .header("Content-Type", contentType)
                .header("Content-Disposition", "inline; filename=\"" + fileName + "\"")
                .header("Content-Length", String.valueOf(fileContent.length))
                .body(fileContent);
    }

    /**
     * Restituisce un FileResponse con il contenuto del file codificato in base64
     */
    public FileResponse getFileAsBase64Response(Path path) throws IOException {
        byte[] fileContent = Files.readAllBytes(path);
        String fileName = path.getFileName().toString();
        return getFileAsBase64Response(fileContent, fileName);
    }

    /**
     * Restituisce un FileResponse con il contenuto del file codificato in base64
     */
    public FileResponse getFileAsBase64Response(byte[] fileContent, String fileName) {
        String contentType = determineContentType(fileName);
        String base64Content = Base64.getEncoder().encodeToString(fileContent);

        return new FileResponse(
                fileName,
                contentType,
                base64Content,
                fileContent.length
        );
    }

    /**
     * Determina il content type basandosi sull'estensione del file
     */
    public String determineContentType(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return "application/octet-stream";
        }

        String extension = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();

        return switch (extension) {
            // Immagini
            case "jpg", "jpeg" -> "image/jpeg";
            case "png" -> "image/png";
            case "gif" -> "image/gif";
            case "bmp" -> "image/bmp";
            case "webp" -> "image/webp";
            case "svg" -> "image/svg+xml";
            case "ico" -> "image/x-icon";
            case "tiff", "tif" -> "image/tiff";

            // Video
            case "mp4" -> "video/mp4";
            case "avi" -> "video/x-msvideo";
            case "mov" -> "video/quicktime";
            case "wmv" -> "video/x-ms-wmv";
            case "flv" -> "video/x-flv";
            case "webm" -> "video/webm";
            case "mkv" -> "video/x-matroska";

            // Audio
            case "mp3" -> "audio/mpeg";
            case "wav" -> "audio/wav";
            case "ogg" -> "audio/ogg";
            case "aac" -> "audio/aac";
            case "flac" -> "audio/flac";
            case "m4a" -> "audio/mp4";

            // Documenti
            case "pdf" -> "application/pdf";
            case "doc" -> "application/msword";
            case "docx" -> "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            case "xls" -> "application/vnd.ms-excel";
            case "xlsx" -> "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            case "ppt" -> "application/vnd.ms-powerpoint";
            case "pptx" -> "application/vnd.openxmlformats-officedocument.presentationml.presentation";
            case "odt" -> "application/vnd.oasis.opendocument.text";
            case "ods" -> "application/vnd.oasis.opendocument.spreadsheet";
            case "odp" -> "application/vnd.oasis.opendocument.presentation";

            // Testo
            case "txt" -> "text/plain";
            case "html", "htm" -> "text/html";
            case "css" -> "text/css";
            case "js" -> "application/javascript";
            case "json" -> "application/json";
            case "xml" -> "application/xml";
            case "csv" -> "text/csv";
            case "rtf" -> "application/rtf";

            // Archivi
            case "zip" -> "application/zip";
            case "rar" -> "application/vnd.rar";
            case "7z" -> "application/x-7z-compressed";
            case "tar" -> "application/x-tar";
            case "gz" -> "application/gzip";

            // Default
            default -> "application/octet-stream";
        };
    }

    /**
     * Verifica se un file è un'immagine basandosi sul content type
     */
    public boolean isImage(String fileName) {
        String contentType = determineContentType(fileName);
        return contentType.startsWith("image/");
    }

    /**
     * Verifica se un file è un video basandosi sul content type
     */
    public boolean isVideo(String fileName) {
        String contentType = determineContentType(fileName);
        return contentType.startsWith("video/");
    }

    /**
     * Verifica se un file è un audio basandosi sul content type
     */
    public boolean isAudio(String fileName) {
        String contentType = determineContentType(fileName);
        return contentType.startsWith("audio/");
    }

    /**
     * Verifica se un file è un documento basandosi sul content type
     */
    public boolean isDocument(String fileName) {
        String contentType = determineContentType(fileName);
        return contentType.equals("application/pdf") ||
                contentType.contains("document") ||
                contentType.contains("sheet") ||
                contentType.contains("presentation") ||
                contentType.equals("text/plain") ||
                contentType.equals("application/rtf");
    }

    /**
     * Restituisce una descrizione user-friendly del tipo di file
     */
    public String getFileTypeDescription(String fileName) {
        if (isImage(fileName)) return "Immagine";
        if (isVideo(fileName)) return "Video";
        if (isAudio(fileName)) return "Audio";
        if (isDocument(fileName)) return "Documento";

        String contentType = determineContentType(fileName);
        return switch (contentType) {
            case "application/zip", "application/vnd.rar", "application/x-7z-compressed" -> "Archivio";
            case "application/json", "application/xml", "text/csv" -> "Dati";
            case "application/javascript", "text/css" -> "Codice";
            default -> "File";
        };
    }

    /**
     * Formatta la dimensione del file in modo leggibile
     */
    public String formatFileSize(long bytes) {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return String.format("%.1f KB", bytes / 1024.0);
        if (bytes < 1024 * 1024 * 1024) return String.format("%.1f MB", bytes / (1024.0 * 1024.0));
        return String.format("%.1f GB", bytes / (1024.0 * 1024.0 * 1024.0));
    }
}