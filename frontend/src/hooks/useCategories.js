import { useEffect, useState } from "react";
import { CatalogApi } from "../api";

// Categories appear in the header, home page, shop filters and admin forms, so they are fetched once.
let cache = null;
let inflight = null;
const subscribers = new Set();

export function invalidateCategories() {
  cache = null;
  inflight = null;
  subscribers.forEach((load) => load());
}

export function useCategories() {
  const [categories, setCategories] = useState(cache || []);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    let alive = true;
    const load = () => {
      if (cache) {
        setCategories(cache);
        setLoading(false);
        return;
      }
      if (!inflight) {
        inflight = CatalogApi.categories()
          .then((list) => (cache = list))
          .catch(() => [])
          .finally(() => {
            inflight = null;
          });
      }
      inflight.then((list) => {
        if (alive) {
          setCategories(list);
          setLoading(false);
        }
      });
    };
    load();
    subscribers.add(load);
    return () => {
      alive = false;
      subscribers.delete(load);
    };
  }, []);

  return { categories, loading };
}
