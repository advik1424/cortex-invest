package com.cortex.invest.controller;

import com.cortex.invest.dto.ChartAnalysisResponse;
import com.cortex.invest.service.ChartVisionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/chart")
@RequiredArgsConstructor
public class ChartVisionController {

    private final ChartVisionService chartVisionService;

    @PostMapping(value = "/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ChartAnalysisResponse> analyzeChartMultipart(
            @RequestParam(value = "files", required = false) List<MultipartFile> files,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "tradingCategory", required = false, defaultValue = "SWING") String tradingCategory,
            @RequestParam(value = "userQuery", required = false) String userQuery,
            @RequestParam(value = "ticker", required = false) String ticker,
            @RequestParam(value = "timeframe", required = false) String timeframe) {

        List<MultipartFile> fileList = new ArrayList<>();
        if (files != null && !files.isEmpty()) {
            fileList.addAll(files);
        } else if (file != null && !file.isEmpty()) {
            fileList.add(file);
        }

        ChartAnalysisResponse response = chartVisionService.analyzeCharts(fileList, tradingCategory, userQuery, ticker, timeframe);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/scan")
    public ResponseEntity<ChartAnalysisResponse> scanChart(
            @RequestParam(value = "tradingCategory", required = false, defaultValue = "SWING") String tradingCategory,
            @RequestParam(value = "userQuery", required = false) String userQuery,
            @RequestParam(value = "ticker", required = false) String ticker,
            @RequestParam(value = "timeframe", required = false) String timeframe) {

        ChartAnalysisResponse response = chartVisionService.analyzeCharts(null, tradingCategory, userQuery, ticker, timeframe);
        return ResponseEntity.ok(response);
    }
}
