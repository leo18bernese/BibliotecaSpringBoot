# Fase 1: Build dell'applicazione
# Usa l'immagine ufficiale Gradle con JDK 17
FROM gradle:8.2.1-jdk17 AS builder

# Imposta la directory di lavoro all'interno del container
WORKDIR /app

# Copia i file di build e di configurazione di Gradle per primi.
# Questo permette a Docker di riutilizzare lo strato delle dipendenze
# se solo i file sorgente cambiano, non i file di configurazione di Gradle.
COPY build.gradle settings.gradle ./
COPY gradlew gradlew.bat ./
COPY gradle gradle ./

# Esegui un build per scaricare le dipendenze.
# Questo strato sarà cachato da Docker e riutilizzato.
# `--no-daemon` evita l'uso del Gradle Daemon, spesso problematico in Docker.
RUN ./gradlew dependencies --no-daemon

# Copia il resto del codice sorgente dell'applicazione.
# Questo strato verrà invalidato solo quando il codice sorgente cambia.
COPY . .

# Esegui il build completo dell'applicazione.
# Il JAR finale sarà in build/libs/
RUN ./gradlew build --no-daemon

# Fase 2: Crea un'immagine leggera con solo il JAR eseguibile
# Usa un'immagine JRE (Java Runtime Environment) leggera, senza strumenti di build.
FROM eclipse-temurin:17-jre-alpine

# Imposta la directory di lavoro per l'applicazione finale
WORKDIR /app

# Copia il file JAR compilato dalla fase 'builder' all'immagine finale.
# Assicurati che il nome del JAR sia corretto, basato sul tuo build.gradle.
# Il nome predefinito è solitamente nome_progetto-versione.jar.
# Se il tuo progetto si chiama 'Libri' e la versione è 0.0.1-SNAPSHOT, il nome sarà 'Libri-0.0.1-SNAPSHOT.jar'.
COPY --from=builder /app/build/libs/Libri-0.0.1-SNAPSHOT.jar app.jar

# Specifica il comando per avviare l'applicazione quando il container viene eseguito.
# `CMD` è preferibile a `ENTRYPOINT` per i comandi di avvio dell'applicazione.
CMD ["java", "-jar", "app.jar"]

# Esponi la porta su cui l'applicazione Spring Boot è in ascolto (di default 8080).
# Questo informa Docker che questa porta dovrebbe essere accessibile.
EXPOSE 8080