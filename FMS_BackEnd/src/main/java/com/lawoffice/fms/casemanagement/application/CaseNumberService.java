package com.lawoffice.fms.casemanagement.application;

import com.lawoffice.fms.casemanagement.infrastructure.CaseRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CaseNumberService {

    private final CaseRepository caseRepository;
    private static final Pattern CASE_NUM_PATTERN = Pattern.compile("^(\\d{4})/(\\d+)$");

    public CaseNumberService(CaseRepository caseRepository) {
        this.caseRepository = caseRepository;
    }

    @Transactional(readOnly = true)
    public synchronized String generateNextCaseNumber() {
        int currentYear = LocalDate.now().getYear();
        String yearPrefix = String.valueOf(currentYear);

        List<String> existingNumbers = caseRepository.findCaseNumbersByYearPrefix(yearPrefix);

        int maxSeq = 0;
        for (String num : existingNumbers) {
            if (num != null) {
                Matcher matcher = CASE_NUM_PATTERN.matcher(num.trim());
                if (matcher.matches()) {
                    try {
                        int seq = Integer.parseInt(matcher.group(2));
                        if (seq > maxSeq) {
                            maxSeq = seq;
                        }
                    } catch (NumberFormatException ignored) {
                        // ignore malformed numbers
                    }
                }
            }
        }

        int nextSeq = maxSeq + 1;
        String generated = String.format("%s/%03d", yearPrefix, nextSeq);

        while (caseRepository.existsByCaseNumber(generated)) {
            nextSeq++;
            generated = String.format("%s/%03d", yearPrefix, nextSeq);
        }

        return generated;
    }
}
