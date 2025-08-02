package me.leoo.springboot.libri.libri.descrizione;

import com.vladsch.flexmark.ext.gfm.strikethrough.StrikethroughExtension;
import com.vladsch.flexmark.ext.gfm.tasklist.TaskListExtension;
import com.vladsch.flexmark.ext.tables.TablesExtension;
import com.vladsch.flexmark.html.HtmlRenderer;
import com.vladsch.flexmark.parser.Parser;
import com.vladsch.flexmark.util.ast.Document;
import com.vladsch.flexmark.util.data.MutableDataSet;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import java.util.Arrays;

@Service
@Component
public class MarkdownService {

    private final Parser parser;
    private final HtmlRenderer renderer;

    public MarkdownService() {
        MutableDataSet options = new MutableDataSet();

        // Opzioni per un HTML più pulito
        options.set(HtmlRenderer.SOFT_BREAK, "<br />");
        options.set(HtmlRenderer.HARD_BREAK, "<br />");

        // Abilita estensioni utili
        options.set(Parser.EXTENSIONS, Arrays.asList(
                TablesExtension.create(),      // Tabelle
                StrikethroughExtension.create(), // ~~testo~~
                TaskListExtension.create()     // - [x] task
        ));

        this.parser = Parser.builder(options).build();
        this.renderer = HtmlRenderer.builder(options).build();
    }

    public String convertToHtml(String markdown) {
        if (markdown == null || markdown.trim().isEmpty()) {
            return "";
        }

        Document document = parser.parse(markdown);
        return renderer.render(document);
    }
}