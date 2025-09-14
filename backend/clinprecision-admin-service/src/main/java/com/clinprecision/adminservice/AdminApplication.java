package com.clinprecision.adminservice;

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
@ComponentScan(basePackages = {"com.clinprecision.adminservice", "com.clinprecision.common"})
@EntityScan(basePackages = {"com.clinprecision.adminservice.data.entity", "com.clinprecision.common.entity"})
@EnableJpaRepositories(basePackages = {"com.clinprecision.adminservice.repository", "com.clinprecision.common.repository"})
public class AdminApplication {

	
	public static void main(String[] args) {
		SpringApplication.run(AdminApplication.class, args);
	}

    @Bean
    public BCryptPasswordEncoder bCryptPasswordEncoder()
    {
        return new BCryptPasswordEncoder();
    }

}
