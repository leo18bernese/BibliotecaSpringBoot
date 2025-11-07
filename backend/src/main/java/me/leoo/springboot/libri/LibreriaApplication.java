package me.leoo.springboot.libri;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class LibreriaApplication {

    public static void main(String[] args) {
        SpringApplication.run(LibreriaApplication.class, args);
    }

}
