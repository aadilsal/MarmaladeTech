import { useEffect } from "react"

export function useDebouncedEffect(effect: () => void, deps: any[], delay = 500) {
  useEffect(() => {
    const handler = setTimeout(() => effect(), delay)
    return () => clearTimeout(handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, delay])
}
