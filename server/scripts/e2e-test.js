// Quick end-to-end test of the ride + complete + rating + profile flow
// against the live backend. Run: node scripts/e2e-test.js
const BASE = process.env.TEST_BASE || "https://ride-kojd.onrender.com/api";

const rnd = Math.random().toString(36).slice(2, 8);
const driver = {
  name: "Test Driver",
  email: `driver_${rnd}@test.com`,
  password: "test123",
  phone: "9990001111",
  hasBike: true,
};
const rider = {
  name: "Test Rider",
  email: `rider_${rnd}@test.com`,
  password: "test123",
  phone: "9990002222",
  hasBike: false,
};

let pass = 0;
let fail = 0;
const ok = (cond, label) => {
  if (cond) {
    pass++;
    console.log(`  PASS  ${label}`);
  } else {
    fail++;
    console.log(`  FAIL  ${label}`);
  }
};

async function call(method, path, token, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  let data = null;
  try {
    data = await res.json();
  } catch {}
  return { status: res.status, data };
}

(async () => {
  console.log("Testing against", BASE, "\n");

  // 1. Register both users
  const dReg = await call("POST", "/auth/register", null, driver);
  ok(dReg.status === 201 && dReg.data.token, "register driver");
  const rReg = await call("POST", "/auth/register", null, rider);
  ok(rReg.status === 201 && rReg.data.token, "register rider");
  const dTok = dReg.data.token;
  const rTok = rReg.data.token;
  const riderId = rReg.data.user._id;

  // 2. Driver offers a ride (a few minutes in the future)
  const when = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  const offer = await call("POST", "/rides", dTok, {
    direction: "FROM_HUB",
    place: "Saharanpur",
    departureTime: when,
    note: "e2e test ride",
  });
  ok(offer.status === 201 && offer.data._id, "driver offers ride");
  const rideId = offer.data._id;

  // 3. Rider requests to join
  const reqRes = await call("POST", "/requests", rTok, {
    rideId,
    message: "can I join?",
  });
  ok(reqRes.status === 201, "rider sends join request");
  const requestId = reqRes.data._id;

  // 4. Driver accepts the request
  const accept = await call("PUT", `/requests/${requestId}/respond`, dTok, {
    action: "accept",
  });
  ok(accept.status === 200, "driver accepts request");

  // 5. Try to rate BEFORE completing (should be rejected — ride is future)
  const earlyRate = await call("POST", "/ratings", dTok, {
    rideId,
    stars: 5,
  });
  ok(earlyRate.status >= 400, "rating blocked before ride happens");

  // 6. Driver marks the ride completed
  const complete = await call("PUT", `/rides/${rideId}/complete`, dTok);
  ok(complete.status === 200, "driver marks ride completed");

  // 7. Now driver rates the rider
  const dRate = await call("POST", "/ratings", dTok, {
    rideId,
    stars: 5,
    comment: "great passenger",
  });
  ok(dRate.status === 201, "driver rates passenger after completion");

  // 8. Rider rates the driver
  const rRate = await call("POST", "/ratings", rTok, {
    rideId,
    stars: 4,
    comment: "safe driver",
  });
  ok(rRate.status === 201, "passenger rates driver after completion");

  // 9. Cannot rate twice
  const dup = await call("POST", "/ratings", dTok, { rideId, stars: 3 });
  ok(dup.status === 409, "cannot rate the same ride twice");

  // 10. Driver profile shows the completed ride + can no longer re-rate
  const dProf = await call("GET", "/profile/me", dTok);
  ok(dProf.status === 200, "driver profile loads");
  ok(dProf.data.offered?.length >= 1, "completed ride shows in driver history");
  ok(
    dProf.data.offered?.[0]?.ratedByMe === true,
    "driver history marks ride as rated"
  );

  // 11. Rider's received rating average updated
  const riderRatings = await call("GET", `/ratings/user/${riderId}`, null);
  ok(
    riderRatings.status === 200 && riderRatings.data.length >= 1,
    "rider has a received rating"
  );

  console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch((e) => {
  console.error("Test crashed:", e);
  process.exit(1);
});
