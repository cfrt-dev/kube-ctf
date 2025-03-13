export function generateData(count: number) {
    const roles = ["Developer", "Designer", "Manager", "Analyst", "Tester"];
    const departments = ["Engineering", "Design", "Product", "Marketing", "Support"];
    const statuses = ["Active", "Inactive", "Pending"];

    return Array.from({ length: count }, (_, i) => {
        const id = i + 1;
        const firstName = ["Alice", "Bob", "Charlie", "David", "Emma", "Frank", "Grace", "Henry"][
            Math.floor(Math.random() * 8)
        ];
        const lastName = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Miller", "Davis", "Wilson"][
            Math.floor(Math.random() * 8)
        ];
        const name = `${firstName} ${lastName}`;
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
        const role = roles[Math.floor(Math.random() * roles.length)] ?? "";
        const department = departments[Math.floor(Math.random() * departments.length)] ?? "";
        const status = statuses[Math.floor(Math.random() * statuses.length)] ?? "";

        return {
            id,
            name,
            email,
            role,
            department,
            status,
        };
    });
}
