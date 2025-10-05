package me.leoo.springboot.libri.image;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.images")
@Data
public class ImageProperties {
    private String commonDir;
    private String ordersDir;
    private String categoriesDir;

}