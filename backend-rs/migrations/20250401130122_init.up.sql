-- Add up migration script here

DO
$$
    BEGIN
        CREATE TYPE UserRole AS ENUM ('user', 'admin');
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
$$;

CREATE TABLE IF NOT EXISTS users
(
    id       SERIAL PRIMARY KEY,
    name     VARCHAR  NOT NULL,
    email    VARCHAR  NOT NULL,
    password VARCHAR  not null,
    team_id  INT,
    verified BOOLEAN           DEFAULT FALSE,
    role     UserRole NOT NULL DEFAULT 'user',
    website  VARCHAR,
    country  VARCHAR,
    language VARCHAR,
    hidden   BOOLEAN  NOT NULL DEFAULT FALSE,
    banned   BOOLEAN  NOT NULL DEFAULT FALSE,
    created  TIMESTAMP         default now(),
    UNIQUE (email)
);

CREATE TABLE IF NOT EXISTS teams
(
    id         SERIAL PRIMARY KEY,
    name       VARCHAR not null,
    website    VARCHAR,
    country    VARCHAR,
    language   VARCHAR,
    hidden     BOOLEAN NOT NULL DEFAULT FALSE,
    banned     BOOLEAN NOT NULL DEFAULT FALSE,
    captain_id INT     NOT NULL,
    created    TIMESTAMP        default now()
);

ALTER TABLE users
    ADD FOREIGN KEY (team_id) REFERENCES teams (id);

ALTER TABLE teams
    ADD FOREIGN KEY (captain_id) REFERENCES users (id);

DO
$$
    BEGIN
        CREATE TYPE ChallengeType AS ENUM ('Static', 'Dynamic');
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    end;
$$;

CREATE TABLE IF NOT EXISTS challenges
(
    id            SERIAL PRIMARY KEY,
    name          VARCHAR         NOT NULL,
    flag          VARCHAR         NOT NULL,
    author        VARCHAR,
    category      VARCHAR         NOT NULL,
    description   VARCHAR,
    type          ChallengeType   NOT NULL,
    points        INT             NOT NULL,
    initialPoints INT             NOT NULL,
    hidden        BOOLEAN         NOT NULL,
    dynamicFlag   BOOLEAN         NOT NULL,
    hints         VARCHAR[]       NOT NULL,
    deploy        JSONB,
    UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS files
(
    id           UUID PRIMARY KEY,
    challenge_id INT,
    name         VARCHAR NOT NULL,
    url          VARCHAR NOT NULL,
    FOREIGN KEY (challenge_id) REFERENCES challenges (id)
);

