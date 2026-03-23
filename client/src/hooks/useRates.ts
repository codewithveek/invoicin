import { getRate } from "../constants";

export function useRate(from: string, to: string): number {
  return getRate(from, to);
}
