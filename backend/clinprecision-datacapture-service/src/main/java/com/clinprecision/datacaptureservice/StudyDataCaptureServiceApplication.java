package com.clinprecision.datacaptureservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import com.clinprecision.axon.config.AxonConfig;

@SpringBootApplication
@EnableFeignClients
@Import(AxonConfig.class)
@EnableJpaRepositories(basePackages = {
    "com.clinprecision.common.repository",
    "com.clinprecision.datacaptureservice.patientenrollment.repository",
    "com.clinprecision.datacaptureservice.studydatabase.repository"
})
@EntityScan(basePackages = {
    "com.clinprecision.common.entity",
    "com.clinprecision.datacaptureservice.patientenrollment.entity",
    "com.clinprecision.datacaptureservice.studydatabase.entity",
    "org.axonframework.eventsourcing.eventstore.jpa",
    "org.axonframework.modelling.saga.repository.jpa",
    "org.axonframework.eventhandling.tokenstore.jpa"
})
@ComponentScan(basePackages = {
    "com.clinprecision.datacaptureservice",
    "com.clinprecision.common",
    "com.clinprecision.axon"
})
public class StudyDataCaptureServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(StudyDataCaptureServiceApplication.class, args);
	}

}
