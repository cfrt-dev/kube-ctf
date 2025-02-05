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
