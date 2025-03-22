export interface ChallengePort {
    number: number;
    protocol: "http" | "tcp";
    domain?: string;
}

export interface ChallengeContainer {
    image: string;
    name: string;
    flags?: {
        name: string;
        value: string;
    }[];
    ports?: ChallengePort[];
}

export interface ChallengeDecay {
    type: "linear" | "logarithmic";
    decay: number;
    minimumValue: number;
}

export interface ChallengeValue {
    type: "static" | "dynamic";
    initialValue: number;
    decayFunction?: ChallengeDecay;
}
