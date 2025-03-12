export type UserType = "admin" | "user";

export type Link = {
    url: string;
    protocol: string;
    description?: string;
};

export type ContainerBase = {
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

export type ChallengeDeploy = {
    type: "dynamic" | "static";
    imagePullSecrets?: string[];
    containers: ContainerBase[];
};

export type Challenge = {
    id: number;
    name: string;
    author: string;
    category: string;
    description?: string;
    hints?: string[];
    value: {
        currentValue: number;
        type: "static" | "dynamic";
        initialValue: number;
        decayFunction?: {
            type: "linear" | "logarithmic";
            decay: number;
            minimumValue: number;
        };
    };
    dynamicFlag?: boolean;
    hidden?: boolean;
    files?: string[];
    deploy: ChallengeDeploy;
};

export type ChallengeDeployValues = {
    global: {
        baseDomain: string;
        tlsCert: string;
    };
    labels: Record<string, string>;
    containers: ContainerBase[];
    imagePullSecrets: string[];
};

export type PublicChallengeInfo = {
    id: number;
    name: string;
    description: string | null;
    category: string;
    author: string | null;
    currentValue: number;
    type: "static" | "dynamic";
    hints: string[];
    files: string[];
    links: Link[] | null;
    startTime?: Date;
    instanceName: string | null;
    isSolved: boolean;
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
