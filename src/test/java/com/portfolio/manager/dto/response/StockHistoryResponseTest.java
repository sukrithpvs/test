package com.portfolio.manager.dto.response;

import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

class StockHistoryResponseTest {

    @Test
    void testBuilder() {
        List<StockHistoryResponse.HistoricalDataPoint> dataPoints = new ArrayList<>();
        dataPoints.add(StockHistoryResponse.HistoricalDataPoint.builder()
                .date("2024-01-15")
                .open(new BigDecimal("180.00"))
                .high(new BigDecimal("185.00"))
                .low(new BigDecimal("178.00"))
                .close(new BigDecimal("182.50"))
                .volume(50000000L)
                .build());

        StockHistoryResponse response = StockHistoryResponse.builder()
                .ticker("AAPL")
                .period("1y")
                .data(dataPoints)
                .build();

        assertEquals("AAPL", response.getTicker());
        assertEquals("1y", response.getPeriod());
        assertEquals(1, response.getData().size());
    }

    @Test
    void testNoArgsConstructor() {
        StockHistoryResponse response = new StockHistoryResponse();
        assertNull(response.getTicker());
        assertNull(response.getPeriod());
    }

    @Test
    void testSettersAndGetters() {
        StockHistoryResponse response = new StockHistoryResponse();
        response.setTicker("TSLA");
        response.setPeriod("5y");
        response.setData(new ArrayList<>());

        assertEquals("TSLA", response.getTicker());
        assertEquals("5y", response.getPeriod());
        assertNotNull(response.getData());
    }

    @Test
    void testHistoricalDataPoint() {
        StockHistoryResponse.HistoricalDataPoint point = new StockHistoryResponse.HistoricalDataPoint();
        point.setDate("2024-01-20");
        point.setOpen(new BigDecimal("100"));
        point.setHigh(new BigDecimal("110"));
        point.setLow(new BigDecimal("95"));
        point.setClose(new BigDecimal("105"));
        point.setVolume(1000000L);

        assertEquals("2024-01-20", point.getDate());
        assertEquals(new BigDecimal("100"), point.getOpen());
        assertEquals(new BigDecimal("110"), point.getHigh());
        assertEquals(new BigDecimal("95"), point.getLow());
        assertEquals(new BigDecimal("105"), point.getClose());
        assertEquals(1000000L, point.getVolume());
    }

    @Test
    void testHistoricalDataPointBuilder() {
        StockHistoryResponse.HistoricalDataPoint point = StockHistoryResponse.HistoricalDataPoint.builder()
                .date("2024-02-01")
                .open(new BigDecimal("200"))
                .close(new BigDecimal("210"))
                .build();

        assertEquals("2024-02-01", point.getDate());
        assertEquals(new BigDecimal("200"), point.getOpen());
        assertEquals(new BigDecimal("210"), point.getClose());
    }

    @Test
    void testToString() {
        StockHistoryResponse response = StockHistoryResponse.builder().ticker("GOOGL").period("1m").build();
        assertNotNull(response.toString());
    }
}
