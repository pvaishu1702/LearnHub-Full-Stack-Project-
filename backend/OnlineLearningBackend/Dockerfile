
FROM maven:3.9.9-eclipse-temurin-17 AS build

WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN mvn clean package -DskipTests

FROM tomcat:9.0-jdk17-temurin

RUN rm -rf /usr/local/tomcat/webapps/*

COPY ca.pem /usr/local/tomcat/conf/ca.pem

RUN keytool -importcert -noprompt -trustcacerts \
    -alias tidb-ca \
    -file /usr/local/tomcat/conf/ca.pem \
    -keystore "$JAVA_HOME/lib/security/cacerts" \
    -storepass changeit

COPY --from=build /app/target/OnlineLearningBackend.war /usr/local/tomcat/webapps/ROOT.war

EXPOSE 8080

CMD ["sh", "-c", "sed -i 's/port=\"8080\"/port=\"'${PORT:-8080}'\"/' /usr/local/tomcat/conf/server.xml && catalina.sh run"]
