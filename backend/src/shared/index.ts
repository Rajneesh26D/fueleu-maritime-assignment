/** Shared kernel types and utilities used across layers. */
export type Brand<T, B extends string> = T & { readonly __brand: B };
