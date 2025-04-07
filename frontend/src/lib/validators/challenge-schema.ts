import { z } from "zod";

const envSchema = z.object({
    name: z.string().min(1, "Env name is required"),
    value: z.string().min(1, "Env value is required"),
});

const portSchema = z.object({
    number: z.number().int().max(65535, "65535 is the max number for port").positive("Port number must be positive"),
    protocol: z.enum(["http", "tcp"], {
        errorMap: () => ({ message: "Protocol must be either http or tcp" }),
    }),
    domain: z.string().optional(),
});

const containerSchema = z.object({
    name: z.string(),
    image: z.string().min(1, "Container image is required"),
    envs: z.array(envSchema).optional(),
    ports: z.array(portSchema).optional(),
});

const fileSchema = z.object({
    name: z.string().min(1, "File name is required"),
    url: z.string().min(1, "File URL is required"),
    isUploaded: z.boolean(),
    size: z.number().optional(),
    type: z.string().optional(),
});

const challengeValueSchema = z.object({
    type: z.enum(["Static", "Dynamic"], {
        errorMap: () => ({ message: "Value type must be either Static or Dynamic" }),
    }),
    points: z.number().int().optional(),
    initialPoints: z.number().int().positive("Initial value must be positive"),
    decayFunction: z
        .object({
            type: z.enum(["Linear", "Logarithmic"]),
            decay: z.number().positive("Decay must be positive"),
            minimum: z.number().positive("Minimum value must be positive"),
        })
        .optional(),
});

const deploymentSchema = z
    .object({
        type: z.enum(["Dynamic", "Static"], {
            errorMap: () => ({ message: "Deployment type must be either Dynamic or Static" }),
        }),
        imagePullSecrets: z.array(z.string()),
        containers: z.array(containerSchema),
    })
    .optional()
    .refine(
        (data) => {
            if (!data) return true;
            const containerNames = data.containers.map((c) => c.name);
            const uniqueNames = new Set(containerNames);
            return uniqueNames.size === containerNames.length;
        },
        {
            message: "Container names must be unique",
            path: ["containers"],
        },
    )
    .refine(
        (data) => {
            if (!data) return true;

            for (const container of data.containers) {
                if (!container.ports) continue;

                const domains = container.ports.filter((p) => p.domain).map((p) => p.domain);

                const uniqueDomains = new Set(domains);
                if (uniqueDomains.size !== domains.length) {
                    return false;
                }
            }

            return true;
        },
        {
            message: "Domains must be unique within each container",
            path: ["containers"],
        },
    );

export const challengeSchema = z.object({
    name: z.string().min(1, "Challenge name is required"),
    author: z.string().optional(),
    category: z.string().min(1, "Category is required"),
    description: z.string().optional(),
    hints: z.array(z.string()).optional(),
    flag: z.string().min(1, "Flag is required"),
    files: z.array(fileSchema).optional(),
    value: challengeValueSchema,
    dynamicFlag: z.boolean().optional(),
    hidden: z.boolean().optional(),
    deploy: deploymentSchema.optional(),
});

export type ChallengeFormValues = z.infer<typeof challengeSchema>;
