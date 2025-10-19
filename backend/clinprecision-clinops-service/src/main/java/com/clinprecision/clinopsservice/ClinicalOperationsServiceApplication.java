package com.clinprecision.clinopsservice;

import feign.Logger;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.web.client.RestTemplate;

import com.clinprecision.axon.config.AxonConfig;

@SpringBootApplication
@EnableFeignClients
@Import(AxonConfig.class)
@EnableJpaRepositories(basePackages = {
        // Study Design bounded context
        "com.clinprecision.clinopsservice.studydesign.studymgmt.repository",
        "com.clinprecision.clinopsservice.studydesign.protocolmgmt.repository",
        "com.clinprecision.clinopsservice.studydesign.documentmgmt.repository",
        "com.clinprecision.clinopsservice.studydesign.metadatamgmt.repository",
        "com.clinprecision.clinopsservice.studydesign.build.repository",
        "com.clinprecision.clinopsservice.studydesign.design.repository",
        "com.clinprecision.clinopsservice.studydesign.design.arm.repository",
        "com.clinprecision.clinopsservice.studydesign.design.form.repository",
        "com.clinprecision.clinopsservice.studydesign.design.visitdefinition.repository",
        // Study Operation bounded context
        "com.clinprecision.clinopsservice.studyoperation.patientenrollment.repository",
        "com.clinprecision.clinopsservice.studyoperation.visit.repository",
        "com.clinprecision.clinopsservice.studyoperation.datacapture.formdata.repository",
        // Common
        "com.clinprecision.common.repository"
})
@EntityScan(basePackages = {
        // Study Design bounded context
        "com.clinprecision.clinopsservice.studydesign.studymgmt.entity",
        "com.clinprecision.clinopsservice.studydesign.protocolmgmt.entity",
        "com.clinprecision.clinopsservice.studydesign.documentmgmt.entity",
        "com.clinprecision.clinopsservice.studydesign.metadatamgmt.entity",
        "com.clinprecision.clinopsservice.studydesign.build.entity",
        "com.clinprecision.clinopsservice.studydesign.design.entity",
        "com.clinprecision.clinopsservice.studydesign.design.arm.entity",
        "com.clinprecision.clinopsservice.studydesign.design.form.entity",
        "com.clinprecision.clinopsservice.studydesign.design.visitdefinition.entity",
        // Study Operation bounded context
        "com.clinprecision.clinopsservice.studyoperation.patientenrollment.entity",
        "com.clinprecision.clinopsservice.studyoperation.visit.entity",
        "com.clinprecision.clinopsservice.studyoperation.datacapture.formdata.entity",
        // Common
        "com.clinprecision.common.entity",
        "com.clinprecision.common.entity.clinops",
        // Axon Framework
        "org.axonframework.eventsourcing.eventstore.jpa",
        "org.axonframework.modelling.saga.repository.jpa",
        "org.axonframework.eventhandling.tokenstore.jpa"
})
@ComponentScan(basePackages = {
        "com.clinprecision.clinopsservice",
        "com.clinprecision.common.mapper",
        "com.clinprecision.common.mapper.clinops",
        "com.clinprecision.axon"
})
public class ClinicalOperationsServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(ClinicalOperationsServiceApplication.class, args);
	}

    @Bean
    @LoadBalanced
    public RestTemplate getRestTemplate()
    {
        return new RestTemplate();
    }

    @Bean
    @Profile("production")
    Logger.Level feignLoggerLevel()
    {
        return Logger.Level.NONE;
    }

    @Bean
    @Profile("!production")
    Logger.Level feignDefaultLoggerLevel()
    {
        return Logger.Level.FULL;
    }

}



