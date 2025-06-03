import { Awaitable } from "npm:cosmokit";

const collapseErrorSymbol = Symbol('cyapj.utils2.common.collapse.error')

export class CollapseTransform {
  // noinspection JSUnusedLocalSymbols
  constructor(private readonly transform: (newTarget: object) => unknown) {
    Object.defineProperty(this, collapseErrorSymbol, {
      value: true,
      configurable: false,
      enumerable: false
    })
  }

  static is(value: unknown): value is CollapseTransform {
    if (typeof value !== 'object') return false
    if (!value) return false;
    return Reflect.get(value, collapseErrorSymbol) === true
  }
}

function tryCollapse(reason: unknown, bound: unknown, transform: () => unknown, tsf?: (nt: object) => unknown) {
  if (CollapseTransform.is(reason)) {
    const nt = Reflect.apply(transform, bound, [])
    tsf?.(nt as object)
    return reason['transform'](nt as object) ?? nt
  } else {
    throw reason
  }
}

// deno-lint-ignore ban-types
function collapseWrapper<Fn extends Function>(p: string | symbol, bound: unknown, collapse: () => unknown, fn: Fn, collap: [unknown], tsf: <T>(nt: T) => void): Fn {
  return new Proxy(fn, {
    apply(target: Fn, thisArg: any, argArray: any[]): any {
      if (collap.length + 1 === 2 && Reflect.has(collap[0] as object, p)) // collapsed
        return Reflect.apply(Reflect.get(collap[0] as object, p), collap[0], argArray)
      let result;
      const ts = async (nt: object) => tsf(await (nt as Promise<object>));
      try {
        result = Reflect.apply(target, thisArg, argArray)
      } catch (e) {
        tryCollapse(e, bound, collapse, ts)
      }
      if (Object.getPrototypeOf(result) !== Promise.prototype) return result;
      // deno-lint-ignore no-explicit-any
      return result.catch((reason: any) => tryCollapse(reason, bound, collapse, ts))
    }
  })
}

export abstract class Collapse<FS> {
  static CollapseTransform = CollapseTransform
  static readonly catalysis = Symbol('cyapj.utils2.common.collapse.catalytic');

  constructor(collapse: <T>(thisObj: T) => Awaitable<FS | object>) {
    const collap: [unknown] = <[unknown]><unknown>[];
    return new Proxy(this, {
      get(target: Collapse<FS>, p: string | symbol, receiver: any): any {
        if (collap.length + 1 === 2 && Reflect.has(collap[0] as object, p)) // collapsed
          return Reflect.get(collap[0] as object, p)
        const r = Reflect.get(target, p, receiver)
        if (p === Collapse.catalysis) return async (object: unknown) => {
          if (object !== receiver) throw new TypeError("bad catalytic collapse (object != receiver)")
          if (collap.length) return collap[0]
          return collap[collap.push(await collapse(target)) - 1]
        }
        if (typeof r !== 'function') return r;
        return collapseWrapper(p, target, r, () => collapse(target), collap, (at) => {
          collap.push(at);
        })
      },
      ownKeys(target: Collapse<FS>) {
        return [
          ...Reflect.ownKeys(target),
          ...(collap.length ? Reflect.ownKeys(collap[0] as object) : []),
          Collapse.catalysis,
        ]
      }
    })
  }

  static async collapse<FS>(object: Collapse<FS>): Promise<false | Awaited<FS>> {
    if (Reflect.ownKeys(object).includes(this.catalysis)) {
      const collapse = Reflect.get(object, this.catalysis);
      return await collapse(object)
    }
    return false
  }
}
