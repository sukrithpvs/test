package com.portfolio.manager.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "portfolios")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Portfolio {

    private static final BigDecimal DEFAULT_CASH_BALANCE = new BigDecimal("100000.00");

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "cash_balance", precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal cashBalance = DEFAULT_CASH_BALANCE;

    @OneToMany(mappedBy = "portfolio", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Holding> holdings = new ArrayList<>();

    /**
     * Get cash balance with null safety - returns default if null
     */
    public BigDecimal getCashBalanceSafe() {
        return cashBalance != null ? cashBalance : DEFAULT_CASH_BALANCE;
    }

    /**
     * Initialize cash balance if null (for existing records)
     */
    public void initializeCashBalanceIfNull() {
        if (cashBalance == null) {
            cashBalance = DEFAULT_CASH_BALANCE;
        }
    }

    public void addHolding(Holding holding) {
        holdings.add(holding);
        holding.setPortfolio(this);
    }

    public void removeHolding(Holding holding) {
        holdings.remove(holding);
        holding.setPortfolio(null);
    }
}
