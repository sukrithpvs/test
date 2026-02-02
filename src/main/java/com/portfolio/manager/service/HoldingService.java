package com.portfolio.manager.service;

import com.portfolio.manager.dto.request.AddHoldingRequest;
import com.portfolio.manager.dto.request.UpdateHoldingRequest;
import com.portfolio.manager.dto.response.HoldingResponse;
import com.portfolio.manager.entity.Holding;
import com.portfolio.manager.entity.Portfolio;
import com.portfolio.manager.exception.BadRequestException;
import com.portfolio.manager.exception.ResourceNotFoundException;
import com.portfolio.manager.repository.HoldingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class HoldingService {

    private final HoldingRepository holdingRepository;
    private final PortfolioService portfolioService;

    @Transactional(readOnly = true)
    public List<HoldingResponse> getAllHoldings() {
        log.info("Fetching all holdings");

        Portfolio portfolio = portfolioService.getPortfolioEntity();

        return holdingRepository.findByPortfolio(portfolio).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public HoldingResponse addHolding(AddHoldingRequest request) {
        String ticker = request.getTicker().toUpperCase();
        log.info("Adding holding for ticker: {}", ticker);

        Portfolio portfolio = portfolioService.getPortfolioEntity();

        // Check if holding already exists for this ticker
        if (holdingRepository.existsByPortfolioAndTicker(portfolio, ticker)) {
            throw new BadRequestException("Holding for ticker " + ticker + " already exists. Use update instead.");
        }

        Holding holding = Holding.builder()
                .portfolio(portfolio)
                .ticker(ticker)
                .quantity(request.getQuantity())
                .avgBuyPrice(request.getAvgBuyPrice())
                .build();

        Holding saved = holdingRepository.save(holding);
        log.info("Holding created with ID: {}", saved.getId());

        return toResponse(saved);
    }

    @Transactional
    public HoldingResponse updateHolding(Long id, UpdateHoldingRequest request) {
        log.info("Updating holding with ID: {}", id);

        Holding holding = holdingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Holding", "id", id));

        holding.setQuantity(request.getQuantity());
        holding.setAvgBuyPrice(request.getAvgBuyPrice());

        Holding updated = holdingRepository.save(holding);
        log.info("Holding updated: {}", updated.getTicker());

        return toResponse(updated);
    }

    @Transactional
    public void deleteHolding(Long id) {
        log.info("Deleting holding with ID: {}", id);

        if (!holdingRepository.existsById(id)) {
            throw new ResourceNotFoundException("Holding", "id", id);
        }

        holdingRepository.deleteById(id);
        log.info("Holding deleted with ID: {}", id);
    }

    @Transactional(readOnly = true)
    public List<Holding> getAllHoldingEntities() {
        Portfolio portfolio = portfolioService.getPortfolioEntity();
        return holdingRepository.findByPortfolio(portfolio);
    }

    private HoldingResponse toResponse(Holding holding) {
        return HoldingResponse.builder()
                .id(holding.getId())
                .ticker(holding.getTicker())
                .quantity(holding.getQuantity())
                .avgBuyPrice(holding.getAvgBuyPrice())
                .createdAt(holding.getCreatedAt())
                .build();
    }
}
