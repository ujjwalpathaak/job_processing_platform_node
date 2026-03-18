// seed-jobs.js
import fetch from "node-fetch";

const BASE_URL = "http://localhost:8080/api/new";
const TOTAL_REQUESTS = 200;
const INTERVAL_MS = 300;

const JOB_DISTRIBUTION = {
    email: 0.2,
    report_generation: 0.1,
    webhook_trigger: 0.2,
    crm_sync: 0.3,
    payment: 0.1,
    refund: 0.1,
};

function pickJobType() {
    const rand = Math.random();
    let cumulative = 0;

    for (const [type, prob] of Object.entries(JOB_DISTRIBUTION)) {
        cumulative += prob;
        if (rand <= cumulative) return type;
    }

    return "crm_sync"; // fallback
}

function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

const generators = {
    email: (i) => ({
        to: `user${i}@example.com`,
        subject: `Test Email ${i}`,
        body: "This is a seeded email job",
    }),

    report_generation: (i) => ({
        report_type: randomFrom(["daily", "weekly", "monthly"]),
        user_id: `user_${i}`,
    }),

    webhook_trigger: (i) => ({
        url: "https://webhook.site/test",
        payload: {
            event: "seed_event",
            id: i,
        },
    }),

    crm_sync: (i) => ({
        crm_id: randomFrom(["hubspot", "salesforce"]),
        entity: randomFrom(["contact", "deal", "company"]),
        entity_id: `entity_${i}`,
    }),

    payment: (i) => ({
        amount: Math.floor(Math.random() * 5000) + 100,
        currency: "INR",
        user_id: `user_${i}`,
    }),

    refund: (i) => ({
        payment_id: `pay_${i}`,
        reason: randomFrom(["duplicate", "fraud", "requested"]),
    }),
};

async function main() {
    console.log(`Seeding ${TOTAL_REQUESTS} jobs...\n`);

    const stats = {};

    for (let i = 0; i < TOTAL_REQUESTS; i++) {
        const jobType = pickJobType();
        const payload = generators[jobType](i);

        try {
            const res = await fetch(`${BASE_URL}/${jobType}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            stats[jobType] = (stats[jobType] || 0) + 1;

            console.log(
                `#${i + 1} | ${jobType} | Status: ${res.status}`
            );
        } catch (err) {
            console.error(`#${i + 1} ERROR:`, err.message);
        }

        await new Promise((r) => setTimeout(r, INTERVAL_MS));
    }

    console.log("\nSeeding completed.\n");
    console.log("Job distribution:", stats);
}

main();