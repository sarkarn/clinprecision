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
        "com.clinprecision.clinopsservice.repository",
        "com.clinprecision.clinopsservice.studydatabase.repository",
        "com.clinprecision.clinopsservice.patientenrollment.repository",
        "com.clinprecision.common.repository"
})
@EntityScan(basePackages = {
        "com.clinprecision.clinopsservice.entity",
        "com.clinprecision.clinopsservice.studydatabase.entity",
        "com.clinprecision.clinopsservice.patientenrollment.entity",
        "com.clinprecision.common.entity",
        "com.clinprecision.common.entity.clinops",
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



