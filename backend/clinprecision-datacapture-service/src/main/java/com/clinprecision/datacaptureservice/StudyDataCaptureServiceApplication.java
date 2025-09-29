package com.clinprecision.datacaptureservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableFeignClients
@EnableJpaRepositories(basePackages = {
    "com.clinprecision.common.repository",
    "com.clinprecision.datacaptureservice.patientenrollment.repository"
})
@EntityScan(basePackages = {
    "com.clinprecision.common.entity",
    "com.clinprecision.datacaptureservice.patientenrollment.entity"
})
@ComponentScan(basePackages = {
    "com.clinprecision.datacaptureservice",
    "com.clinprecision.common"
})
public class StudyDataCaptureServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(StudyDataCaptureServiceApplication.class, args);
	}

}
