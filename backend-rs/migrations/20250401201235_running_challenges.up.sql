-- Add up migration script here

CREATE TABLE IF NOT EXISTS running_challenges
(
    id           VARCHAR PRIMARY KEY,
    challenge_id INT       NOT NULL,
    user_id      INT       NOT NULL,
    flag         VARCHAR   NOT NULL,
    start_time   TIMESTAMP NOT NULL DEFAULT NOW(),
    end_time     TIMESTAMP NOT NULL DEFAULT NOW() + INTERVAL '1 hour',
    UNIQUE (challenge_id, user_id),
    FOREIGN KEY (challenge_id) REFERENCES challenges (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS submissions (
    id SERIAL PRIMARY KEY,
    user_id      INT       NOT NULL,
    team_id      INT,
    challenge_id INT       NOT NULL,
    is_correct   BOOLEAN   NOT NULL DEFAULT FALSE,
    answer       VARCHAR   NOT NULL,
    submitted_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (challenge_id) REFERENCES challenges (id),
    FOREIGN KEY (team_id) REFERENCES teams (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
);

