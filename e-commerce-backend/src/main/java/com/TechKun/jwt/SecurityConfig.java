package com.TechKun.jwt;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.*;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.*;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.*;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.List;

@Configuration
public class SecurityConfig {

    @Autowired
    private JwtFilter jwtFilter;
    @Autowired
    private AuthEntryPoint authEntryPoint;
    @Autowired
    private PrivateNetworkAccessFilter privateNetworkAccessFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/error",
                    "/v3/api-docs/**",
                    "/swagger-ui/**",
                    "/swagger-ui.html",
                    "/swagger-resources/**",
                    "/webjars/**",
                    "/auth/**",
                    "/reviews/**",
                    "/paytr/**",        // PayTR endpoints (get-token, callback, confirm-test) — no JWT
                    "/stripe/webhook",  // Stripe webhook callbacks — no JWT
                    "/stripe/confirm",  // Stripe confirm API — no JWT
                    "/stripe/config",   // Stripe publishable key config — no JWT
                    "/stripe/create-payment-intent" // Stripe checkout intent — supports logged-in and guest demo checkout
                ).permitAll()
                .requestMatchers(HttpMethod.GET,
                    "/products/**",
                    "/shipping-methods/**",
                    "/categories/**",
                    "/promotions/**",
                    "/variations/**",
                    "/attributes/**",
                    "/roles/**",
                    "/banner-images/**"
                ).permitAll()
                .requestMatchers(
                    "/shop-orders/**",
                    "/cart-items/**",
                    "/wishlist-items/**",
                    "/payment-methods/**"
                )
                .hasAnyAuthority("CUSTOMER", "ADMIN", "PLATFORM_ADMIN")
                .requestMatchers(HttpMethod.POST, "/support-tickets/**")
                .hasAnyAuthority("CUSTOMER", "ADMIN", "PLATFORM_ADMIN")
                .requestMatchers("/roles/**").hasAuthority("PLATFORM_ADMIN")
                .anyRequest().hasAnyAuthority("ADMIN", "PLATFORM_ADMIN")
            )
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        http.exceptionHandling(ex ->
                ex.authenticationEntryPoint(authEntryPoint)
        );
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()));
        http.addFilterBefore(privateNetworkAccessFilter, UsernamePasswordAuthenticationFilter.class);
        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Access-Control-Allow-Private-Network"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

}
