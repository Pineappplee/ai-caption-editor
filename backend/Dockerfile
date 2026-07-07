# Build stage
FROM maven:3.9.8-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
# Download dependencies for caching
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests -B

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create a non-root system group and user
RUN addgroup -S spring && adduser -S spring -G spring \
    && mkdir -p /app/uploads \
    && chown -R spring:spring /app

COPY --from=build /app/target/*.jar app.jar
RUN chown spring:spring app.jar

USER spring:spring

EXPOSE 8080
ENV SPRING_PROFILES_ACTIVE=prod

# Health check calling the health endpoint
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/api/v1/health || exit 1

ENTRYPOINT ["java", "-XX:+UseG1GC", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
