import type { ChallengeDecayFunction, ChallengeType } from "./schema";

export type UserType = "admin" | "user";

export type Link = {
    url: string;
    protocol: string;
    description?: string;
};

export type Container = {
    image: string;
    name?: string;
    allowExternalNetwork?: boolean;
    ports?: {
        number: number;
        protocol: "http" | "tcp";
        domain?: string;
    }[];
    envs?: {
        name: string;
        value: string;
    }[];
    resources?: {
        requests?: {
            cpu?: string;
            memory?: string;
        };
        limits?: {
            cpu?: string;
            memory?: string;
        };
    };
};

export type Challenge = {
    id: number;
    name: string;
    flag: string;
    author: string;
    category: string;
    description?: string;
    currentValue: number;
    initialValue: number;
    hints?: string[];
    value: ChallengeValue;
    dynamicFlag?: boolean;
    hidden?: boolean;
    files?: string[];
    deploy: ChallengeDeploy;
};

export type ChallengeDeploy = {
    type: "Dynamic" | "Static";
    imagePullSecrets: string[];
    containers: Container[];
};

export type ChallengeValue = {
    points: number;
    initialPoints: number;
} & (
    | { type: "Static" }
    | {
          type: "Dynamic";
          decayFunction: {
              type: ChallengeDecayFunction;
              decay: number;
              minimum: number;
          };
      }
);

export interface ChallengeConfig {
    name: string;
    flag: string;
    author: string | null;
    category: string;
    description: string | null;
    hints: string[];
    files: ChallengeFile[];
    value: Omit<ChallengeValue, "points">;
    dynamicFlag: boolean;
    hidden: boolean;
    deploy?: ChallengeDeploy;
}

export interface ChallengeFile {
    name: string;
    url: string;
    isUploaded: boolean;
    size?: number;
    type?: string;
}

export type ChallengeDeployValues = {
    global: {
        baseDomain: string;
        tlsCert: string;
    };
    labels: Record<string, string>;
    containers: Container[];
    imagePullSecrets: string[];
};

export type PublicChallengeInfo = {
    id: number;
    name: string;
    description?: string | null;
    category: string;
    author?: string | null;
    value: Omit<ChallengeValue, "initialPoints">;
    hints: string[];
    files: ChallengeFile[];
    links: Link[] | null;
    startTime?: Date;
    instanceName?: string;
    isSolved: boolean;
    deployType: ChallengeType;
};

export type User = {
    id: number;
    name: string;
    email: string;
    password: string;
    team_id: number | null;
    verified: boolean;
    type: UserType;
    website: string | null;
    country: string | null;
    hidden: boolean;
    banned: boolean;
    created: Date;
};

export type Team = {
    id: number;
    name: string;
    password: string;
    website?: string;
    country?: string;
    hidden: boolean;
    banned: boolean;
    captain_id?: number;
    created: string;
};
