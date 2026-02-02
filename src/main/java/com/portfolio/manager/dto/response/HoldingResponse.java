package com.portfolio.manager.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HoldingResponse {

    private Long id;
    private String ticker;
    private BigDecimal quantity;
    private BigDecimal avgBuyPrice;
    private LocalDateTime createdAt;
}
