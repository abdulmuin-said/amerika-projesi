package com.TechKun;

import javax.sql.DataSource;

import com.zaxxer.hikari.HikariDataSource;
import jakarta.annotation.PreDestroy;
import org.springframework.stereotype.Component;

@Component
public class DataSourceManager {

    private final DataSource dataSource;

    public DataSourceManager(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @PreDestroy
    public void closeDataSource() {
        if (dataSource instanceof HikariDataSource hikari) {
            hikari.close();
        }
    }
}
