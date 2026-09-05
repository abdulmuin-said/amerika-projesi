package com.TechKun;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableJpaRepositories(basePackages = "com.TechKun.repository")
@EntityScan(basePackages = "com.TechKun.model")
@EnableAsync

public class  EcomTurkApplication {
	public static void main(String[] args) {
		SpringApplication.run(EcomTurkApplication.class, args);
	}
}