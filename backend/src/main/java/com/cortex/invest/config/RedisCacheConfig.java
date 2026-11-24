package com.cortex.invest.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.CacheManager;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

/**
 * Enterprise Dual-Mode Cache Configuration
 * Supports Redis distributed caching when a Redis server/URL is active,
 * and seamlessly provides High-Performance In-Memory Concurrent caching as fallback.
 */
@Slf4j
@Configuration
public class RedisCacheConfig {

    @Bean
    @Primary
    public CacheManager cacheManager(
            @Value("${spring.cache.type:simple}") String cacheType,
            @Autowired(required = false) RedisConnectionFactory redisConnectionFactory) {

        if ("redis".equalsIgnoreCase(cacheType) && redisConnectionFactory != null) {
            try {
                // Probe Redis ping connection to guarantee server health before binding
                redisConnectionFactory.getConnection().ping();
                log.info("[REDIS CACHE] Connection verified. Initializing distributed RedisCacheManager with JSON serializers & TTLs.");

                RedisCacheConfiguration defaultCacheConfig = RedisCacheConfiguration.defaultCacheConfig()
                        .entryTtl(Duration.ofMinutes(15))
                        .disableCachingNullValues()
                        .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                        .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(new GenericJackson2JsonRedisSerializer()));

                Map<String, RedisCacheConfiguration> cacheConfigurations = new HashMap<>();
                cacheConfigurations.put("market_intelligence", defaultCacheConfig.entryTtl(Duration.ofMinutes(5)));
                cacheConfigurations.put("quote_cache", defaultCacheConfig.entryTtl(Duration.ofMinutes(2)));
                cacheConfigurations.put("screener_data", defaultCacheConfig.entryTtl(Duration.ofHours(1)));
                cacheConfigurations.put("value_buys", defaultCacheConfig.entryTtl(Duration.ofMinutes(30)));
                cacheConfigurations.put("swing_signals", defaultCacheConfig.entryTtl(Duration.ofMinutes(15)));
                cacheConfigurations.put("intraday_signals", defaultCacheConfig.entryTtl(Duration.ofMinutes(5)));

                return RedisCacheManager.builder(redisConnectionFactory)
                        .cacheDefaults(defaultCacheConfig)
                        .withInitialCacheConfigurations(cacheConfigurations)
                        .build();
            } catch (Exception e) {
                log.warn("[REDIS CACHE] Redis ping probe failed ({}). Gracefully falling back to High-Performance ConcurrentMapCacheManager.", e.getMessage());
            }
        }

        log.info("[CACHE] Initializing High-Performance In-Memory ConcurrentMapCacheManager (Local/Zero-Latency Mode).");
        return new ConcurrentMapCacheManager(
                "market_intelligence",
                "screener_data",
                "quote_cache",
                "value_buys",
                "swing_signals",
                "intraday_signals",
                "radar_summary"
        );
    }
}
