type CamelCase<S extends string> =
  S extends `${infer P1}_${infer P2}${infer P3}`
    ? `${P1}${Capitalize<CamelCase<`${P2}${P3}`>>}`
    : S;
type CamelCaseKeys<T> = {
  [K in keyof T as CamelCase<K & string>]: T[K];
};
type NullToUndefined<T> = {
  [P in keyof T]: T[P] extends infer TP
    ? null extends TP
      ? Exclude<TP, null> | undefined
      : TP
    : never;
};
/**
 * This can be used to take an interface like one commonly used to represent database schema, and easily create a normalized interface.
 * This converts an interface from snake_case to camelCase, and converts nullable fields to optional fields
 * @example
 *  interface DatabasePermissions {
 *    id: number;
 *    friendly_name: string;
 *    description: string | null;
 *    created_at: number;
 *    updated_at: number;
 *   }
 *  type Permissions = DomainInterface<DatabasePermissions>;
 *  // Permissions = {
 *  //   id: number;
 *  //   friendlyName: string;
 *  //   description: string | undefined
 *  //   createdAt: number;
 *  //   updatedAt: number;
 *  // }
 */
export type DomainInterface<T, K extends keyof T = never> = Omit<
  CamelCaseKeys<NullToUndefined<Selectable<T>>>,
  K
>;
