package com.cortex.invest.controller;

import com.cortex.invest.dto.DebateRequest;
import com.cortex.invest.dto.DebateResponse;
import com.cortex.invest.model.DebateRecord;
import com.cortex.invest.repository.DebateRecordRepository;
import com.cortex.invest.service.DebateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/debate")
@RequiredArgsConstructor
public class DebateController {

    private final DebateService debateService;
    private final DebateRecordRepository debateRecordRepository;

    @PostMapping("/analyze")
    public ResponseEntity<DebateResponse> analyzeStock(@RequestBody DebateRequest request) {
        DebateResponse response = debateService.runDebate(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    public ResponseEntity<List<DebateRecord>> getHistory() {
        return ResponseEntity.ok(debateRecordRepository.findTop10ByOrderByCreatedAtDesc());
    }
}
