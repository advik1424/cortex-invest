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

    @Test
    void testWhyFallingQueriesProvideDirectCauses() {
        // Query 1: why tcs is fail
        String tcsFailQ = "why tcs is fail";
        Assertions.assertTrue(geminiService.isFinancialQuery(tcsFailQ), "Expected 'why tcs is fail' to pass guardrail");
        AskAnalystResponse tcsFailResp = geminiService.answerAnalystQuestion(AskAnalystRequest.builder()
                .ticker("TCS")
                .companyName("Tata Consultancy Services")
                .currentPrice(2460.0)
                .question(tcsFailQ)
                .build());

        Assertions.assertFalse(tcsFailResp.getAnswer().contains("Scope Notice"), "Should not trigger Scope Notice");
        Assertions.assertTrue(tcsFailResp.getAnswer().contains("NOT failing") || tcsFailResp.getAnswer().contains("not failing"),
                "Expected clear clarification that TCS is NOT failing");
        Assertions.assertTrue(tcsFailResp.getAnswer().contains("BFSI") || tcsFailResp.getAnswer().contains("discretionary"),
                "Expected fundamental cause for TCS slowdown");
        Assertions.assertFalse(tcsFailResp.getAnswer().contains("Target 1 at"),
                "Must NOT dump irrelevant Target 1 for a why failing query");
        Assertions.assertFalse(tcsFailResp.getAnswer().contains("Strict Stop Loss"),
                "Must NOT dump irrelevant Stop Loss for a why failing query");

        // Query 2: why tcs share is fall
        String tcsQ = "why tcs share is fall";
        Assertions.assertTrue(geminiService.isFinancialQuery(tcsQ), "Expected 'why tcs share is fall' to pass guardrail");
        AskAnalystResponse tcsResp = geminiService.answerAnalystQuestion(AskAnalystRequest.builder()
                .ticker("TCS")
                .companyName("Tata Consultancy Services")
                .currentPrice(2460.0)
                .question(tcsQ)
                .build());

        Assertions.assertFalse(tcsResp.getAnswer().contains("Scope Notice"), "Should not trigger Scope Notice");
        Assertions.assertFalse(tcsResp.getAnswer().contains("Regarding your inquiry on market corrections and tranche deployment"),
                "Must NOT return generic tranche deployment template for why falling");
        Assertions.assertTrue(tcsResp.getAnswer().contains("BFSI") || tcsResp.getAnswer().contains("discretionary"),
                "Expected direct fundamental cause for TCS fall: " + tcsResp.getAnswer());

        // Query 3: why cdsl is down
        String cdslQ = "why cdsl is down";
        Assertions.assertTrue(geminiService.isFinancialQuery(cdslQ), "Expected 'why cdsl is down' to pass guardrail");
        AskAnalystResponse cdslResp = geminiService.answerAnalystQuestion(AskAnalystRequest.builder()
                .ticker("CDSL")
                .companyName("Central Depository Services Ltd")
                .currentPrice(1395.0)
                .question(cdslQ)
                .build());

        Assertions.assertFalse(cdslResp.getAnswer().contains("Scope Notice"), "Should not trigger Scope Notice");
        Assertions.assertFalse(cdslResp.getAnswer().contains("Regarding gap-downs and risk containment"),
                "Must NOT return generic gap-down risk template for why down");
        Assertions.assertTrue(cdslResp.getAnswer().contains("Valuation") || cdslResp.getAnswer().contains("turnover") || cdslResp.getAnswer().contains("consolidation"),
                "Expected direct fundamental cause for CDSL drop: " + cdslResp.getAnswer());
    }

    @Test
    void testMeetingOutcomeQueriesProvideConcallAndBoardDecisions() {
        // Query: Recent metting mein kya discuss huaa
        String meetingQ = "Recent metting mein kya discuss huaa";
        Assertions.assertTrue(geminiService.isFinancialQuery(meetingQ),
                "Expected Hindi/Hinglish meeting query to PASS guardrail: " + meetingQ);

        AskAnalystResponse resp = geminiService.answerAnalystQuestion(AskAnalystRequest.builder()
                .ticker("TCS")
                .companyName("Tata Consultancy Services")
                .currentPrice(2460.0)
                .question(meetingQ)
                .build());

        Assertions.assertFalse(resp.getAnswer().contains("Scope Notice"),
                "Meeting query must NOT trigger Scope Notice");
        Assertions.assertTrue(resp.getAnswer().contains("Board") || resp.getAnswer().contains("Concall") || resp.getAnswer().contains("Dividend"),
                "Expected Board/Concall decisions in meeting response");
        Assertions.assertFalse(resp.getAnswer().contains("Strict Stop Loss"),
                "Must NOT dump irrelevant Stop Loss for a meeting query");
        Assertions.assertFalse(resp.getAnswer().contains("disciplined stop loss"),
                "Must NOT dump irrelevant disciplined stop loss for a meeting query");
        Assertions.assertTrue(resp.getAnswer().contains("### 1. Direct Analyst Verdict"));
        Assertions.assertTrue(resp.getAnswer().contains("### 2. Fundamental & Quantitative Analysis"));
        Assertions.assertTrue(resp.getAnswer().contains("### 3. Key Catalysts & Risk Watch"));
        Assertions.assertTrue(resp.getAnswer().contains("### 4. Strategic Investment Takeaway"));
    }

    @Test
    void testNewsCatalystQueriesProvideHeadlinesAndWeightage() {
        String newsQ = "what is the latest news and catalyst weightage";
        Assertions.assertTrue(geminiService.isFinancialQuery(newsQ));

        AskAnalystResponse resp = geminiService.answerAnalystQuestion(AskAnalystRequest.builder()
                .ticker("CDSL")
                .companyName("Central Depository Services Ltd")
                .currentPrice(1395.0)
                .question(newsQ)
                .build());

        Assertions.assertFalse(resp.getAnswer().contains("Scope Notice"));
        Assertions.assertTrue(resp.getAnswer().contains("News Sentiment") || resp.getAnswer().contains("Catalyst"));
        Assertions.assertTrue(resp.getAnswer().contains("40%-50% weightage") || resp.getAnswer().contains("weight"));
    }

    @Test
    void testFutureExpectationQueriesProvideBrokerageAndMarginReality() {
        String hdfcQ = "Abhi HDFCBANL mein kya future expecttation hn";
        Assertions.assertTrue(geminiService.isFinancialQuery(hdfcQ),
                "Expected future expectation query with typo to PASS guardrail");

        AskAnalystResponse resp = geminiService.answerAnalystQuestion(AskAnalystRequest.builder()
                .ticker("HDFCBANL")
                .companyName("HDFC Bank Ltd")
                .currentPrice(817.8)
                .question(hdfcQ)
                .build());

        Assertions.assertFalse(resp.getAnswer().contains("Scope Notice"));
        // Must NOT return the stale valuation template
        Assertions.assertFalse(resp.getAnswer().contains("Regarding valuation multiples and fair price assessment"),
                "Must NOT return generic valuation assessment for future expectation");
        Assertions.assertFalse(resp.getAnswer().contains("operating margin (OPM)"),
                "Bank must NOT have OPM mentioned");
        // Must contain genuine future outlook, brokerages and margin context
        Assertions.assertTrue(resp.getAnswer().contains("Bernstein") || resp.getAnswer().contains("JPMorgan") || resp.getAnswer().contains("Brokerage"),
                "Expected top brokerage consensus in future expectation response");
        Assertions.assertTrue(resp.getAnswer().contains("NIM") || resp.getAnswer().contains("Margin") || resp.getAnswer().contains("LDR"),
                "Expected authentic banking margin watch in response");
        Assertions.assertTrue(resp.getAnswer().contains("### 1. Direct Analyst Verdict"));
        Assertions.assertTrue(resp.getAnswer().contains("### 2. Fundamental & Quantitative Analysis"));
        Assertions.assertTrue(resp.getAnswer().contains("### 3. Key Catalysts & Risk Watch"));
        Assertions.assertTrue(resp.getAnswer().contains("### 4. Strategic Investment Takeaway"));
    }
}
