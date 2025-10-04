package com.clinprecision.organizationservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
@ComponentScan(basePackages = {
    "com.clinprecision.organizationservice",
    "com.clinprecision.common.mapper",
    "com.clinprecision.common.util"
},
excludeFilters = {
    @ComponentScan.Filter(
        type = FilterType.REGEX, 
        pattern = "com.clinprecision.common.mapper.(Site|User|UserType|UserStudyRole).*"
    )
})
@EntityScan(basePackages = {
    "com.clinprecision.common.entity"
})
@EnableJpaRepositories(basePackages = {
    "com.clinprecision.organizationservice.repository",
    "com.clinprecision.common.repository"
})
public class OrganizationApplication {

    public static void main(String[] args) {
        SpringApplication.run(OrganizationApplication.class, args);
    }
}
