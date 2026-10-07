export function combineResponses(base: { data: any[] }, next: { data: any[] }) {
  return {
    data: [...(base?.data ?? []), ...(next?.data ?? [])],
  };
}
