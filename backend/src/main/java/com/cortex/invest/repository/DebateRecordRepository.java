package com.cortex.invest.repository;

import com.cortex.invest.model.DebateRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DebateRecordRepository extends JpaRepository<DebateRecord, Long> {
    List<DebateRecord> findTop10ByOrderByCreatedAtDesc();
}
