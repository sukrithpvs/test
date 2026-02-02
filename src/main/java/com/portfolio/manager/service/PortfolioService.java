package com.portfolio.manager.service;

import com.portfolio.manager.dto.request.CreatePortfolioRequest;
import com.portfolio.manager.dto.response.HoldingResponse;
import com.portfolio.manager.dto.response.PortfolioResponse;
import com.portfolio.manager.entity.Portfolio;
import com.portfolio.manager.exception.ResourceNotFoundException;
import com.portfolio.manager.repository.PortfolioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PortfolioService {

    private final PortfolioRepository portfolioRepository;

    @Transactional
    public PortfolioResponse createPortfolio(CreatePortfolioRequest request) {
        log.info("Creating portfolio with name: {}", request.getName());

        Portfolio portfolio = Portfolio.builder()
                .name(request.getName())
                .build();

        Portfolio saved = portfolioRepository.save(portfolio);
        log.info("Portfolio created with ID: {}", saved.getId());

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public PortfolioResponse getPortfolio() {
        log.info("Fetching portfolio");

        Portfolio portfolio = portfolioRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found. Please create one first."));

        return toResponse(portfolio);
    }

    @Transactional(readOnly = true)
    public Portfolio getPortfolioEntity() {
        return portfolioRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found. Please create one first."));
    }

    @Transactional(readOnly = true)
    public boolean hasPortfolio() {
        return portfolioRepository.count() > 0;
    }

    private PortfolioResponse toResponse(Portfolio portfolio) {
        List<HoldingResponse> holdingResponses = portfolio.getHoldings().stream()
                .map(holding -> HoldingResponse.builder()
                        .id(holding.getId())
                        .ticker(holding.getTicker())
                        .quantity(holding.getQuantity())
                        .avgBuyPrice(holding.getAvgBuyPrice())
                        .createdAt(holding.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return PortfolioResponse.builder()
                .id(portfolio.getId())
                .name(portfolio.getName())
                .holdings(holdingResponses)
                .build();
    }
}
