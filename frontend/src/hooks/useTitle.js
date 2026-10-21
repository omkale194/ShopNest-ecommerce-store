import { useEffect } from "react";
import { STORE_NAME } from "../config";

export function useTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | ${STORE_NAME}` : `${STORE_NAME}: everyday things, picked well`;
  }, [title]);
}
