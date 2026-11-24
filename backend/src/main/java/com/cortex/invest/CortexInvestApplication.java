package com.cortex.invest;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@EnableCaching
@SpringBootApplication
public class CortexInvestApplication {

	public static void main(String[] args) {
		SpringApplication.run(CortexInvestApplication.class, args);
	}

}
