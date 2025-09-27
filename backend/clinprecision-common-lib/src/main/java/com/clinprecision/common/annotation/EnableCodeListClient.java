package com.clinprecision.common.annotation;

import com.clinprecision.common.config.CodeListClientConfig;
import org.springframework.context.annotation.Import;

import java.lang.annotation.*;

/**
 * Convenience annotation to enable CodeList client functionality in microservices
 * 
 * Usage:
 * @SpringBootApplication
 * @EnableCodeListClient
 * public class MyServiceApplication {
 *     public static void main(String[] args) {
 *         SpringApplication.run(MyServiceApplication.class, args);
 *     }
 * }
 * 
 * This annotation automatically:
 * - Enables Feign clients for code list communication
 * - Configures caching for code list data
 * - Registers the CodeListClientService
 * - Sets up fallback handling
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Import(CodeListClientConfig.class)
public @interface EnableCodeListClient {
}