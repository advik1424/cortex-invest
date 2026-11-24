package com.cortex.invest.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(
    name = "portfolio_holdings",
    indexes = {
        @Index(name = "idx_holdings_user", columnList = "userEmail"),
        @Index(name = "idx_holdings_ticker", columnList = "ticker"),
        @Index(name = "idx_holdings_user_ticker", columnList = "userEmail, ticker")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioHolding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userEmail;
    private String ticker;
    private String companyName;
    private Integer quantity;
    private Double avgBuyPrice;
    private Double currentMarketPrice;
    private String sector;
    private String category; // Compounder, Cyclical, Dead Capital
}
