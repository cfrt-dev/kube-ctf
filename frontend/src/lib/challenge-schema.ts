export const challengeSchema = {
    type: "object",
    required: ["name", "author", "category", "description", "value", "deploy"],
    properties: {
        name: {
            type: "string",
            description: "The name of the challenge",
        },
        author: {
            type: "string",
            description: "The author of the challenge",
        },
        category: {
            type: "string",
            description: "The category of the challenge",
            enum: ["web", "pwn", "crypto", "forensics", "misc"],
        },
        description: {
            type: "string",
            description: "A description of the challenge",
        },
        hints: {
            type: "array",
            description: "Hints for the challenge",
            items: {
                type: "string",
            },
        },
        value: {
            type: "object",
            required: ["type", "initialValue"],
            description: "The point value configuration for the challenge",
            properties: {
                type: {
                    type: "string",
                    description: "The type of point value",
                    enum: ["Static", "Dynamic"],
                },
                initialValue: {
                    type: "number",
                    description: "The initial point value of the challenge",
                },
                decayFunction: {
                    type: "object",
                    description: "Configuration for dynamic point decay",
                    required: ["type", "decay", "minimumValue"],
                    properties: {
                        type: {
                            type: "string",
                            description: "The type of decay function",
                            enum: ["linear", "logarithmic"],
                        },
                        decay: {
                            type: "number",
                            description: "The rate of decay",
                        },
                        minimumValue: {
                            type: "number",
                            description: "The minimum value after decay",
                        },
                    },
                },
            },
        },
        dynamicFlag: {
            type: "boolean",
            description: "Whether the flag is dynamically generated",
        },
        hidden: {
            type: "boolean",
            description: "Whether the challenge is hidden from participants",
        },
        deploy: {
            type: "object",
            required: ["type", "containers"],
            description: "Deployment configuration for the challenge",
            properties: {
                type: {
                    type: "string",
                    description: "The type of deployment",
                    enum: ["Dynamic", "Static"],
                },
                imagePullSecrets: {
                    type: "array",
                    description: "Secrets for pulling container images",
                    items: {
                        type: "object",
                        required: ["name"],
                        properties: {
                            name: {
                                type: "string",
                                description: "The name of the secret",
                            },
                        },
                    },
                },
                containers: {
                    type: "array",
                    description: "Container configurations for the challenge",
                    items: {
                        type: "object",
                        required: ["image", "name"],
                        properties: {
                            image: {
                                type: "string",
                                description: "The container image to use",
                            },
                            name: {
                                type: "string",
                                description: "The name of the container",
                            },
                            flags: {
                                type: "array",
                                description: "Flag environment variables for the container",
                                items: {
                                    type: "object",
                                    required: ["name", "value"],
                                    properties: {
                                        name: {
                                            type: "string",
                                            description: "The name of the flag environment variable",
                                        },
                                        value: {
                                            type: "string",
                                            description: "The value of the flag",
                                        },
                                    },
                                },
                            },
                            ports: {
                                type: "array",
                                description: "Port configurations for the container",
                                items: {
                                    type: "object",
                                    required: ["number", "protocol"],
                                    properties: {
                                        number: {
                                            type: "number",
                                            description: "The port number",
                                        },
                                        protocol: {
                                            type: "string",
                                            description: "The protocol for the port",
                                            enum: ["http", "tcp"],
                                        },
                                        domain: {
                                            type: "string",
                                            description: "Optional domain for the port",
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
};
