package com.cortex.invest.repository;

import com.cortex.invest.model.PortfolioHolding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PortfolioRepository extends JpaRepository<PortfolioHolding, Long> {
    Optional<PortfolioHolding> findByTicker(String ticker);
    List<PortfolioHolding> findByUserEmailIgnoreCase(String userEmail);
    Optional<PortfolioHolding> findByIdAndUserEmailIgnoreCase(Long id, String userEmail);
    void deleteByIdAndUserEmailIgnoreCase(Long id, String userEmail);
}
