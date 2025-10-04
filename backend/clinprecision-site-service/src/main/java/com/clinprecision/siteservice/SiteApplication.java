package com.clinprecision.siteservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
@ComponentScan(basePackages = {"com.clinprecision.siteservice", "com.clinprecision.common", "com.clinprecision.axon"})
@EntityScan(basePackages = {
    "com.clinprecision.siteservice.data.entity", 
    "com.clinprecision.common.entity",
    "org.axonframework.eventsourcing.eventstore.jpa",
    "org.axonframework.modelling.saga.repository.jpa",
    "org.axonframework.eventhandling.tokenstore.jpa"
})
@EnableJpaRepositories(basePackages = {"com.clinprecision.siteservice.repository", "com.clinprecision.common.repository"})
public class SiteApplication {

	
	public static void main(String[] args) {
		SpringApplication.run(SiteApplication.class, args);
	}

    @Bean
    public BCryptPasswordEncoder bCryptPasswordEncoder()
    {
        return new BCryptPasswordEncoder();
    }

}
