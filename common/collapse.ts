const collapseErrorSymbol = Symbol("cyapj.utils2.common.collapse.error");

type MaybePromise<T> = T | PromiseLike<T>;

/**
 * Collapse current object to `T`, return `R`
 */
export class CollapseTo<T, R = unknown> {
  constructor(
    private readonly collapse: (thisObj: object) => MaybePromise<[T, R]>,
  ) {
    Object.defineProperty(this, collapseErrorSymbol, {
      value: "collapseTo",
      configurable: false,
      enumerable: false,
    });
  }

  /**
   * Check if `value` is an instance of `CollapseTo`
   * @param value the value to check
   */
  static is(value: unknown): value is CollapseTo<unknown, unknown> {
    if (!value) return false;
    return Reflect.get(value, collapseErrorSymbol) === "collapseTo";
  }
}

/**
 * Collapse current object, and return `R`
 */
export class CollapseTransform<R> {
  // noinspection JSUnusedLocalSymbols
  constructor(private readonly transform: (newTarget: object) => R) {
    Object.defineProperty(this, collapseErrorSymbol, {
      value: "collapseTsf",
      configurable: false,
      enumerable: false,
    });
  }

  /**
   * Check if `value` is an instance of `CollapseTransform`
   * @param value the value to check
   */
  static is(value: unknown): value is CollapseTransform<unknown> {
    if (!value) return false;
    return Reflect.get(value, collapseErrorSymbol) === "collapseTsf";
  }
}

function tryCollapse(
  reason: unknown,
  bound: unknown,
  collapse: () => unknown,
  tsf?: (nt: object) => unknown,
) {
  if (CollapseTransform.is(reason)) {
    const nt = Reflect.apply(collapse, bound, []);
    tsf?.(nt as object);
    return reason["transform"](nt as object) ?? nt;
  } else if (CollapseTo.is(reason)) {
    const result = reason["collapse"](bound as object);
    if (Object.getPrototypeOf(result) === Promise.prototype) {
      return (async () => {
        const [nt, ret] = await result;
        tsf?.(nt as object);
        return ret;
      })();
    }
    const [nt, ret] = result as [unknown, unknown];
    tsf?.(nt as object);
    return ret;
  } else {
    throw reason;
  }
}

// deno-lint-ignore ban-types
function collapseWrapper<Fn extends Function>(
  p: string | symbol,
  bound: unknown,
  fn: Fn,
  collapse: () => unknown,
  collap: [unknown],
): Fn {
  return new Proxy(fn, {
    apply(target: Fn, thisArg: unknown, argArray: unknown[]): unknown {
      if (collap.length + 1 === 2 && Reflect.has(collap[0] as object, p)) { // collapsed
        return Reflect.apply(
          Reflect.get(collap[0] as object, p),
          collap[0],
          argArray,
        );
      }
      let result;
      const ts = (nt: object) => {
        collap.push(nt);
      };
      try {
        result = Reflect.apply(target, thisArg, argArray);
      } catch (e) {
        return tryCollapse(e, bound, collapse, ts);
      }
      if (typeof result !== "object") return result;
      if (Object.getPrototypeOf(result) !== Promise.prototype) return result;
      // deno-lint-ignore no-explicit-any
      return result.catch((reason: any) =>
        tryCollapse(reason, bound, collapse, ts)
      );
    },
  });
}

/**
 * Base Collapse Class
 *
 * Allowing you to dynamically
 * collapse current object to a new object.
 * You can inherit allow property from both this and the new object.
 */
export class Collapse<FS> {
  static Transform = CollapseTransform;
  static To = CollapseTo;
  static readonly catalysis = Symbol("cyapj.utils2.common.collapse.catalytic");

  constructor(collapse: <T>(thisObj: T) => MaybePromise<FS | object>) {
    const collap: [unknown] = <[unknown]> <unknown> [];
    return new Proxy(this, {
      get(target: Collapse<FS>, p: string | symbol, receiver: object): unknown {
        if (collap.length + 1 === 2 && Reflect.has(collap[0] as object, p)) { // collapsed
          return Reflect.get(collap[0] as object, p);
        }
        const r = Reflect.get(target, p);
        if (p === Collapse.catalysis) {
          return async (object: unknown) => {
            if (object !== receiver) {
              throw new TypeError(
                "bad catalytic collapse (object != receiver)",
              );
            }
            if (collap.length) return collap[0];
            return collap[collap.push(await collapse(target)) - 1];
          };
        }
        if (typeof r !== "function") return r;
        return collapseWrapper(p, target, r, () => collapse(target), collap);
      },
      ownKeys(target: Collapse<FS>) {
        return [
          ...Reflect.ownKeys(target),
          ...(collap.length ? Reflect.ownKeys(collap[0] as object) : []),
          Collapse.catalysis,
        ];
      },
    });
  }

  /**
   * Try force `object` to collapse
   * @param object the object to collapse
   * @return `false` if object is not collapsible, `{ result: MaybePromise<FS> }` if object is collapsible
   */
  static collapse<FS>(
    object: Collapse<FS>,
  ): false | { result: MaybePromise<FS> } {
    if (Reflect.ownKeys(object).includes(this.catalysis)) {
      const collapse = Reflect.get(object, this.catalysis);
      return { result: collapse(object) };
    }
    return false;
  }
}
