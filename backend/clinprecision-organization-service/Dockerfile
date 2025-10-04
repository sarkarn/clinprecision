FROM openjdk:21-jdk-slim
VOLUME /tmp
COPY target/clinprecision-organization-service-0.0.1-SNAPSHOT.jar organization-ws.jar
ENTRYPOINT ["java","-jar","/organization-ws.jar"]
EXPOSE 8087
