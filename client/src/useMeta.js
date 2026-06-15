import { useEffect, useState } from "react";
import api from "./api";

// Module-level cache so we only hit /api/meta once per session.
let cache = null;
let inflight = null;

export default function useMeta() {
  const [meta, setMeta] = useState(cache);

  useEffect(() => {
    if (cache) return;
    if (!inflight) inflight = api.get("/meta").then((res) => res.data);
    inflight.then((data) => {
      cache = data;
      setMeta(data);
    });
  }, []);

  return meta || { hub: "", hubCoords: null, destinations: [] };
}

export function findDestination(meta, name) {
  return meta.destinations?.find((d) => d.name === name) || null;
}
