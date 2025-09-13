package com.clinprecision.userservice;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.client.RestTemplate;

import feign.Logger;

@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
@ComponentScan(basePackages = {"com.clinprecision.userservice", "com.clinprecision.common"})
@EntityScan(basePackages = {"com.clinprecision.userservice", "com.clinprecision.common.entity"})
@EnableJpaRepositories(basePackages = {"com.clinprecision.userservice.repository", "com.clinprecision.common.repository"})
public class UsersApplication {

	@Autowired
	Environment environment;
	
	public static void main(String[] args) {
		SpringApplication.run(UsersApplication.class, args);
	}
	
	@Bean
	public BCryptPasswordEncoder bCryptPasswordEncoder()
	{
		return new BCryptPasswordEncoder();
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
	
	@Bean
	@Profile("production")
	public String createProductionBean() {
		System.out.println("Production bean created. myapplication.environment = " + environment.getProperty("myapplication.environment"));
		return "Production bean";
	}
	
	@Bean
	@Profile("!production")
	public String createNotProductionBean() {
		System.out.println("Not Production bean created. myapplication.environment = " + environment.getProperty("myapplication.environment"));
		return "Not production bean";
	}
	
	@Bean
	@Profile("default")
	public String createDevelopmentBean() {
		System.out.println("Development bean created. myapplication.environment = " + environment.getProperty("myapplication.environment"));
		return "Development bean";
	}
	
}
