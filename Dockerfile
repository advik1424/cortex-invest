# Multi-stage Dockerfile for Spring Boot 3 (Java 21) from repo root
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copy pom.xml from backend
COPY backend/pom.xml .

# Download dependencies for layer caching
RUN mvn dependency:go-offline -B

# Copy backend source code and build jar
COPY backend/src ./src
RUN mvn clean package -DskipTests

# Production Run Stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
VOLUME /tmp
COPY --from=build /app/target/cortex-invest-0.0.1-SNAPSHOT.jar app.jar

ENV PORT=8080
EXPOSE 8080
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
