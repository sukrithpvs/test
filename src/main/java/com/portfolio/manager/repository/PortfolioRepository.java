package com.portfolio.manager.repository;

import com.portfolio.manager.entity.Portfolio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PortfolioRepository extends JpaRepository<Portfolio, Long> {
    
    Optional<Portfolio> findByName(String name);
    
    boolean existsByName(String name);
}
