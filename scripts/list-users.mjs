import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

initializeApp({ credential: applicationDefault() });
const res = await getAuth().listUsers(10);
res.users.forEach((u) =>
  console.log(u.uid, u.email, u.providerData.map((p) => p.providerId).join(","))
);
