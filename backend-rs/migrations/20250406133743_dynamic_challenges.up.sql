-- Add up migration script here

DO
$$
    BEGIN
        CREATE TYPE ChallengeDecayFunction AS ENUM ('Linear', 'Logarithmic');
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
$$;

CREATE TABLE IF NOT EXISTS dynamic_challenges (
    id      INT                    NOT NULL,
    minimum INT                    NOT NULL,
    decay   INT                    NOT NULL,
    type    ChallengeDecayFunction NOT NULL,
    FOREIGN KEY (id) REFERENCES challenges (id)
);
