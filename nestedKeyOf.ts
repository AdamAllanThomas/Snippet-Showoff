type Undefined<T> = { [P in keyof T]: P extends undefined ? T[P] : never };
type FilterFlags<Base, Condition> = {
  [Key in keyof Base]: Base[Key] extends Condition ? Key : never;
};
type AllowedNames<Base, Condition> = FilterFlags<Base, Condition>[keyof Base];
type SubType<Base, Condition> = Pick<Base, AllowedNames<Base, Condition>>;
type OptionalKeys<T> = Exclude<
  keyof T,
  NonNullable<keyof SubType<Undefined<T>, never>>
>;
type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, ...0[]];
type DottedKey<
  Prefix extends string,
  K extends string,
> = `${Prefix}${Prefix extends "" ? "" : "."}${K}`;
type NestedKeyRecursion<
  T,
  K extends string & keyof T,
  Prefix extends string,
  Depth extends number,
> = `${DottedKey<Prefix, K>}` extends infer Dotted extends string
  ? K extends OptionalKeys<T>
    ? `${Dotted}?` | NestedKeyOf<NonNullable<T[K]>, `${Dotted}?`, Prev[Depth]>
    : NestedKeyOf<NonNullable<T[K]>, Dotted, Prev[Depth]>
  : never;
/**
 *  @example
 * interface Something {
 *  a: {
 *   b?: {
 *     c?: {
 *      d: string;
 *      }
 *    }
 *  }
 * }
 *
 * const foo: NestedKeyOf<Something, "something"> = "something.a.b?.c?.d"; // valid
 * const bar: NestedKeyOf<Something, "something"> = "something.a.b.c.d"; // invalid
 **/
export type NestedKeyOf<T, Prefix extends string, Depth extends number = 3> = [
  Depth,
] extends [never]
  ? never
  : T extends object
    ? {
        [K in keyof T & string]:
          | DottedKey<Prefix, K>
          | NestedKeyRecursion<T, K, Prefix, Depth>;
      }[keyof T & string]
    : "";
