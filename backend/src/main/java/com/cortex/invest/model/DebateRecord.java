package com.cortex.invest.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "debate_records")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DebateRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String ticker;
    private String horizon;
    private Integer convictionScore;
    private String verdict;

    @Lob
    @Column(columnDefinition = "CLOB")
    private String bullArgument;

    @Lob
    @Column(columnDefinition = "CLOB")
    private String bearArgument;

    @Lob
    @Column(columnDefinition = "CLOB")
    private String riskSynthesis;

    private LocalDateTime createdAt;
}
