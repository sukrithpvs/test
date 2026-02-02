package com.portfolio.manager.repository;

import com.portfolio.manager.entity.Holding;
import com.portfolio.manager.entity.Portfolio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HoldingRepository extends JpaRepository<Holding, Long> {
    
    List<Holding> findByPortfolio(Portfolio portfolio);
    
    List<Holding> findByPortfolioId(Long portfolioId);
    
    Optional<Holding> findByPortfolioAndTicker(Portfolio portfolio, String ticker);
    
    boolean existsByPortfolioAndTicker(Portfolio portfolio, String ticker);
}
