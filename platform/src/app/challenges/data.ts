import type { Challenge } from "~/server/db/types";

export const challengeMock: Challenge = {
    id: 2,
    name: "Happy new year",
    author: "cfrt-dev",
    category: "web",
    description:
        "Мою маму заскамил какой-то Иван Гойденко, помогите мне найти название его телефона и модели((( Хочу задудосить ему телефон, чтобы жизнь мёдом не казалась. Это самый патриотичный скамер как оказалось, он зарегистрирован только в отечественных соцсетях. Ну или друзей его найдите, нефиг с такими дружить\nФормат флага: goidactf{Phone_Model}",
    value: {
        type: "static",
        initialValue: 1000,
        currentValue: 1000,
    },
    deploy: {
        type: "dynamic",
        containers: [
            {
                image: "nginx:alpine",
                allowExternalNetwork: true,
                envs: [
                    {
                        name: "FLAG",
                        value: "flag{test_flag}",
                    },
                ],
                ports: [
                    {
                        number: 80,
                        protocol: "http",
                    },
                    {
                        number: 22,
                        protocol: "tcp",
                        domain: "ssh",
                    },
                ],
                resources: {
                    requests: {
                        cpu: "100m",
                        memory: "128Mi",
                    },
                    limits: {
                        cpu: "100m",
                        memory: "128Mi",
                    },
                },
            },
            {
                image: "httpd",
                name: "httpd",
                ports: [
                    {
                        number: 80,
                        protocol: "http",
                    },
                ],
            },
        ],
    },
};
