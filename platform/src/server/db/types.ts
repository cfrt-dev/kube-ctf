import type { UserType } from "./schema";

export type Env = {
    name: string;
    value: string;
};

export type Port = {
    number: number;
    protocol: "http" | "tcp";
    domain?: string;
};

export type Container = {
    image: string;
    name: string;
    flags: Env[];
    ports: Port[];
};

export type ChallengeDeploy = {
    type: "dynamic" | "static";
    imagePullSecrets: string[];
    containers: Container[];
};

export type User = {
    id: number;
    name: string;
    email: string;
    password: string;
    team_id?: number;
    verified: boolean;
    type: UserType;
    website: string;
    country: string;
    hidden: boolean;
    banned: boolean;
    created: string;
};

export type Team = {
    id: number;
    name: string;
    password: string;
    website: string;
    country: string;
    hidden: boolean;
    banned: boolean;
    captain_id?: number;
    created: string;
};
