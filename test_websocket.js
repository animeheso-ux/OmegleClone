import WebSocket from "ws";
import assert from "node:assert/strict";

const URL = "ws://localhost:3000";

function connectUser(id) {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket(URL);

        ws.on("open", () => {
            console.log(`${id} connected!`);

            ws.send(JSON.stringify({
                type: "addUser",
                id
            }));

            resolve(ws);
        });

        ws.on("error", reject);
    });
}

function waitForPeers(ws) {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error("Timed out waiting for getPeers"));
        }, 3000);

        ws.on("message", function handler(data) {
            const response = JSON.parse(data);

            if (response.type === "getPeers") {
                clearTimeout(timeout);
                ws.off("message", handler);
                resolve(response.otherPeers);
            }
        });
    });
}

async function joinCall(ws, call_type) {
    const responsePromise = waitForPeers(ws);

    ws.send(JSON.stringify({
        type: "joinCall",
        call_type
    }));

    return await responsePromise;
}

async function runTests() {
    const users = [];

    try {
        console.log("\n--- Starting WebSocket tests ---\n");

        // Test 1: Connect users
        const A = await connectUser("UserA");
        const B = await connectUser("UserB");
        const C = await connectUser("UserC");

        users.push(A, B, C);

        // Test 2: User A joins single call
        const peersA = await joinCall(A, "single");

        assert.equal(peersA.length, 0);

        console.log("PASS: User A receives no peers initially");

        // Test 3: User B joins single call
        const peersB = await joinCall(B, "single");

        assert.equal(peersB.length, 1);
        assert.equal(peersB[0].id, "UserA");

        console.log("PASS: User B finds User A");

        // Test 4: User C joins group call
        const peersC = await joinCall(C, "group");

        assert.equal(peersC.length, 0);

        console.log("PASS: Group call does not return single-call users");

        console.log("\n--- All tests passed! ---");

    } catch (error) {
        console.error("\nTEST FAILED:", error);

    } finally {
        users.forEach(ws => ws.close());
    }
}

runTests();