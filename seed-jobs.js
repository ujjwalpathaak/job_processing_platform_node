const BASE_URL = process.env.LOAD_BASE_URL || "http://localhost:3000/api/new";
const TOTAL_REQUESTS = Number.parseInt(process.env.LOAD_TOTAL_REQUESTS || "1000", 10);
const CONCURRENCY = Number.parseInt(process.env.LOAD_CONCURRENCY || "40", 10);

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

async function sendOne(index, stats) {
    const jobType = pickJobType();
    const payload = generators[jobType](index);
    const startedAt = Date.now();

    try {
        const res = await fetch(`${BASE_URL}/${jobType}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const latency = Date.now() - startedAt;
        stats.sent += 1;
        stats.byType[jobType] = (stats.byType[jobType] || 0) + 1;
        stats.byStatus[res.status] = (stats.byStatus[res.status] || 0) + 1;
        stats.totalLatency += latency;
        if (latency > stats.maxLatency) {
            stats.maxLatency = latency;
        }

        return;
    } catch (error) {
        stats.errors += 1;
        console.error(`#${index + 1} ERROR:`, error && error.message ? error.message : error);
    }
}

async function worker(startIndex, step, stats) {
    for (let i = startIndex; i < TOTAL_REQUESTS; i += step) {
        await sendOne(i, stats);
    }
}

async function main() {
    if (typeof fetch !== "function") {
        throw new Error("Global fetch is unavailable. Use Node.js 18+ for load script execution.");
    }

    const stats = {
        sent: 0,
        errors: 0,
        byType: {},
        byStatus: {},
        totalLatency: 0,
        maxLatency: 0,
    };

    const startedAt = Date.now();
    console.log(
        `Starting load generation: total=${TOTAL_REQUESTS}, concurrency=${CONCURRENCY}, baseUrl=${BASE_URL}`,
    );

    await Promise.all(
        Array.from({ length: CONCURRENCY }, (_, index) => worker(index, CONCURRENCY, stats)),
    );

    const elapsedMs = Date.now() - startedAt;
    const rps = elapsedMs > 0 ? ((stats.sent / elapsedMs) * 1000).toFixed(2) : "0.00";
    const avgLatency = stats.sent > 0 ? Math.round(stats.totalLatency / stats.sent) : 0;

    console.log("\nLoad run completed\n");
    console.log("Total attempted:", TOTAL_REQUESTS);
    console.log("Total succeeded:", stats.sent);
    console.log("Total failed:", stats.errors);
    console.log("RPS:", rps);
    console.log("Average latency (ms):", avgLatency);
    console.log("Max latency (ms):", stats.maxLatency);
    console.log("HTTP status breakdown:", stats.byStatus);
    console.log("Job distribution:", stats.byType);
}

main().catch((error) => {
    console.error("Load generation failed:", error && error.message ? error.message : error);
    process.exit(1);
});