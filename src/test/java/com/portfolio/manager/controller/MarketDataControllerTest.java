package com.portfolio.manager.controller;

import com.portfolio.manager.dto.response.MarketMoverResponse;
import com.portfolio.manager.dto.response.StockDetailResponse;
import com.portfolio.manager.dto.response.StockHistoryResponse;
import com.portfolio.manager.service.MarketDataService;
import com.portfolio.manager.service.YahooFinanceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(MarketDataController.class)
class MarketDataControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MarketDataService marketDataService;

    @MockBean
    private YahooFinanceService yahooFinanceService;

    private StockDetailResponse stockDetail;
    private StockHistoryResponse stockHistory;
    private List<MarketMoverResponse> gainers;
    private List<MarketMoverResponse> losers;

    @BeforeEach
    void setUp() {
        stockDetail = StockDetailResponse.builder()
                .ticker("AAPL")
                .companyName("Apple Inc.")
                .currentPrice(new BigDecimal("182.50"))
                .change(new BigDecimal("2.50"))
                .changePercent(new BigDecimal("1.39"))
                .build();

        stockHistory = StockHistoryResponse.builder()
                .ticker("AAPL")
                .period("1y")
                .data(Arrays.asList())
                .build();

        MarketMoverResponse gainer = MarketMoverResponse.builder()
                .ticker("NVDA")
                .companyName("NVIDIA")
                .price(new BigDecimal("500"))
                .change(new BigDecimal("25"))
                .changePercent(new BigDecimal("5.26"))
                .build();

        MarketMoverResponse loser = MarketMoverResponse.builder()
                .ticker("META")
                .companyName("Meta Platforms")
                .price(new BigDecimal("400"))
                .change(new BigDecimal("-15"))
                .changePercent(new BigDecimal("-3.61"))
                .build();

        gainers = Arrays.asList(gainer);
        losers = Arrays.asList(loser);
    }

    @Test
    void testGetStockDetails() throws Exception {
        when(yahooFinanceService.getStockDetails("AAPL")).thenReturn(stockDetail);

        mockMvc.perform(get("/api/market/stocks/AAPL"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ticker").value("AAPL"))
                .andExpect(jsonPath("$.companyName").value("Apple Inc."));

        verify(yahooFinanceService).getStockDetails("AAPL");
    }

    @Test
    void testGetStockHistory() throws Exception {
        when(yahooFinanceService.getStockHistory("AAPL", "1y")).thenReturn(stockHistory);

        mockMvc.perform(get("/api/market/stocks/AAPL/history").param("period", "1y"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ticker").value("AAPL"))
                .andExpect(jsonPath("$.period").value("1y"));

        verify(yahooFinanceService).getStockHistory("AAPL", "1y");
    }

    @Test
    void testGetTopGainers() throws Exception {
        when(marketDataService.getTopGainers()).thenReturn(gainers);

        mockMvc.perform(get("/api/market/gainers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].ticker").value("NVDA"));

        verify(marketDataService).getTopGainers();
    }

    @Test
    void testGetTopLosers() throws Exception {
        when(marketDataService.getTopLosers()).thenReturn(losers);

        mockMvc.perform(get("/api/market/losers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].ticker").value("META"));

        verify(marketDataService).getTopLosers();
    }
}
