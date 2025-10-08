package com.clinprecision.clinopsservice.studydesign.debug;

import org.axonframework.eventsourcing.eventstore.DomainEventStream;
import org.axonframework.eventsourcing.eventstore.EventStore;
import org.axonframework.messaging.MetaData;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.concurrent.atomic.AtomicInteger;

/**
 * Utility runner that dumps the raw event stream for a given StudyDesign aggregate.
 *
 * <p>
 * Activate by running the ClinOps service with the {@code study-design-debug} Spring profile and
 * providing the aggregate identifier via {@code debug.studyDesignId}. Example:
 *
 * <pre>
 *   mvn spring-boot:run -Dspring-boot.run.profiles=study-design-debug \
 *       -Dspring-boot.run.arguments="--debug.studyDesignId=860e6343-b6cf-4b22-ad63-b6e29f3c2e19"
 * </pre>
 *
 * This runner will execute at startup, dump each event (sequence, type, payload class, revision)
 * and then terminate the application. It is meant for troubleshooting corrupted event streams and
 * should not be enabled in normal environments.
 */
@Profile("study-design-debug")
@Component
public class StudyDesignEventDebugRunner implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(StudyDesignEventDebugRunner.class);

    private final EventStore eventStore;

    @Value("${debug.studyDesignId:}")
    private String studyDesignId;

    public StudyDesignEventDebugRunner(EventStore eventStore) {
        this.eventStore = eventStore;
    }

    @Override
    public void run(String... args) {
        if (studyDesignId == null || studyDesignId.isBlank()) {
            log.warn("[StudyDesignEventDebugRunner] No debug.studyDesignId provided. Skipping event dump.");
            return;
        }

        String trimmedId = studyDesignId.trim();
        log.info("[StudyDesignEventDebugRunner] Dumping events for StudyDesign aggregate: {}", trimmedId);

        try {
            DomainEventStream stream = eventStore.readEvents(trimmedId);

            if (!stream.hasNext()) {
                log.warn("[StudyDesignEventDebugRunner] No events found for aggregate {}", trimmedId);
                return;
            }

            AtomicInteger counter = new AtomicInteger();
            stream.asStream().forEach(event -> {
                int index = counter.incrementAndGet();
                Object payload = event.getPayload();
                Class<?> payloadType = event.getPayloadType();
                MetaData metaData = event.getMetaData();

        log.info("[StudyDesignEventDebugRunner] #{}, seq={}, type={}, payloadClass={}, metadataKeys={}",
                        index,
                        event.getSequenceNumber(),
            event.getType(),
                        payloadType.getName(),
                        metaData.keySet());
                log.info("[StudyDesignEventDebugRunner] Payload: {}", payload);
            });

            log.info("[StudyDesignEventDebugRunner] Event dump complete for aggregate {}", trimmedId);
        } catch (Exception ex) {
            log.error("[StudyDesignEventDebugRunner] Failed to dump events for aggregate {}", trimmedId, ex);
        }
    }
}
