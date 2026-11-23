package com.cortex.invest;

import com.cortex.invest.dto.AskAnalystRequest;
import com.cortex.invest.dto.AskAnalystResponse;
import com.cortex.invest.service.GeminiService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class GeminiGuardrailTest {

    private GeminiService geminiService;

    @BeforeEach
    void setup() {
        geminiService = new GeminiService();
    }

    @Test
    void testNonFinancialQueriesAreBlocked() {
        String[] offTopicQueries = {
            "who is sachin tendulkar",
            "[Quantitative Setup Context: High-Win-Rate Swing Setup] who is sachin tendulkar",
            "Based on chart analysis (Setup in SWING category): who is virat kohli",
            "tell me a joke",
            "how to cook biryani at home",
            "what is the capital of france",
            "write python code to reverse a string",
            "what is the weather in Delhi today",
            "how are you feeling today?",
            "are you an artificial intelligence bot?",
            "who won the football match yesterday",
            "what is the best movie of 2024",
            "lyrics of despacito",
            "hello",
            "hi"
        };

        for (String q : offTopicQueries) {
            boolean isFinancial = geminiService.isFinancialQuery(q);
            Assertions.assertFalse(isFinancial, "Expected query to be BLOCKED by guardrail: " + q);

            AskAnalystResponse response = geminiService.answerAnalystQuestion(AskAnalystRequest.builder()
                    .ticker("RELIANCE")
                    .question(q)
                    .build());
            Assertions.assertTrue(response.getAnswer().contains("Scope Notice"),
                    "Expected Scope Notice for off-topic query: " + q);
        }
    }

    @Test
    void testFinancialQueriesAreAllowedAndFormatted() {
        String[] financialQueries = {
            "What if market corrects further, should I wait for Tranche 2?",
            "Should I hold, average down, or exit right now?",
            "Is the 20 EMA breakout sustainable or a bull trap?",
            "How is the debt situation and promoter pledge?",
            "Is the stock P/E cheap or expensive compared to ROE?",
            "Where should I place the stop loss level?",
            "What did management guide in the quarterly concall?",
            "What is the dividend yield and free cash flow conversion?",
            "Should I buy at CMP or wait for pullback?"
        };

        for (String q : financialQueries) {
            boolean isFinancial = geminiService.isFinancialQuery(q);
            Assertions.assertTrue(isFinancial, "Expected financial query to PASS guardrail: " + q);

            AskAnalystResponse response = geminiService.answerAnalystQuestion(AskAnalystRequest.builder()
                    .ticker("TCS")
                    .companyName("Tata Consultancy Services")
                    .currentPrice(3500.0)
                    .sector("Information Technology")
                    .pe(28.5)
                    .roe(32.0)
                    .roce(38.0)
                    .question(q)
                    .build());

            Assertions.assertNotNull(response.getAnswer());
            Assertions.assertFalse(response.getAnswer().contains("Scope Notice"),
                    "Did not expect Scope Notice for valid query: " + q);
            Assertions.assertTrue(response.getAnswer().contains("### 1. Direct Analyst Verdict"),
                    "Expected clean Markdown Verdict section for: " + q);
            Assertions.assertTrue(response.getAnswer().contains("### 2. Fundamental & Quantitative Analysis"),
                    "Expected clean Markdown Fundamental section for: " + q);
            Assertions.assertTrue(response.getAnswer().contains("### 3."),
                    "Expected Section 3 for: " + q);
            Assertions.assertTrue(response.getAnswer().contains("### 4. Strategic Investment Takeaway"),
                    "Expected Section 4 for: " + q);
        }
    }
}
