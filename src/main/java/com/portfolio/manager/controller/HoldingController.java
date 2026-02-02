package com.portfolio.manager.controller;

import com.portfolio.manager.dto.request.AddHoldingRequest;
import com.portfolio.manager.dto.request.UpdateHoldingRequest;
import com.portfolio.manager.dto.response.HoldingResponse;
import com.portfolio.manager.service.HoldingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/holdings")
@RequiredArgsConstructor
@Tag(name = "Holdings", description = "Holdings CRUD endpoints")
public class HoldingController {

    private final HoldingService holdingService;

    @GetMapping
    @Operation(summary = "Get all holdings")
    public ResponseEntity<List<HoldingResponse>> getAllHoldings() {
        List<HoldingResponse> holdings = holdingService.getAllHoldings();
        return ResponseEntity.ok(holdings);
    }

    @PostMapping
    @Operation(summary = "Add a new holding")
    public ResponseEntity<HoldingResponse> addHolding(
            @Valid @RequestBody AddHoldingRequest request) {
        HoldingResponse response = holdingService.addHolding(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing holding")
    public ResponseEntity<HoldingResponse> updateHolding(
            @PathVariable Long id,
            @Valid @RequestBody UpdateHoldingRequest request) {
        HoldingResponse response = holdingService.updateHolding(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a holding")
    public ResponseEntity<Void> deleteHolding(@PathVariable Long id) {
        holdingService.deleteHolding(id);
        return ResponseEntity.noContent().build();
    }
}
