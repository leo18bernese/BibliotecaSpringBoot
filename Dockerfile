# Fase 1: build con Gradle e Java 17
FROM gradle:8.2.1-jdk17 as builder

WORKDIR /app
COPY . .

RUN gradle build --no-daemon

# Fase 2: solo JAR finale in un'immagine leggera
FROM eclipse-temurin:17-jre

WORKDIR /app
COPY --from=builder /app/build/libs/Libri-0.0.1-SNAPSHOT.jar app.jar

CMD ["java", "-jar", "app.jar"]
