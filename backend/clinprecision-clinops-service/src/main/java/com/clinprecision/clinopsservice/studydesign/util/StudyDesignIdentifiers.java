package com.clinprecision.clinopsservice.studydesign.util;

import java.nio.charset.StandardCharsets;
import java.util.Objects;
import java.util.UUID;

/**
 * Utility methods for deriving deterministic StudyDesign aggregate identifiers.
 */
public final class StudyDesignIdentifiers {

    private static final String STUDY_PREFIX = "study-design-";
    private static final String LEGACY_PREFIX = "legacy-study-design-";

    private StudyDesignIdentifiers() {
    }

    public static UUID deriveFromStudyUuid(UUID studyUuid) {
        Objects.requireNonNull(studyUuid, "studyUuid is required");
        return UUID.nameUUIDFromBytes((STUDY_PREFIX + studyUuid).getBytes(StandardCharsets.UTF_8));
    }

    public static UUID deriveFromLegacyId(Long legacyId) {
        Objects.requireNonNull(legacyId, "legacyId is required");
        return UUID.nameUUIDFromBytes((LEGACY_PREFIX + legacyId).getBytes(StandardCharsets.UTF_8));
    }
}
