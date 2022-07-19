'use strict'

/**
 * Defines the shape of a macro function.
 */
type MacroFn = (...args: any[]) => any

export interface MacroableCtor {
  macro<T extends typeof Macroable> (this: T, name: string, callback: MacroFn): T
  flushMacros<T extends typeof Macroable> (this: T): T
  hasMacro (name: string): boolean
}

export class Macroable {
  /**
   * The registered macros.
   */
  protected static macros: Map<string, MacroFn> = new Map()

  /**
   * Add a macro with the given `name` to this class. The related `callback`
   * method will be assigned to the class’s prototype without you manually
   * adding it. It’s basically a function that can be removed at any time.
   *
   * @example
   * ```js
   * Macroable.macro('getUsername', () => {
   *   return 'supercharge'
   * })
   * ```
   */
  public static macro<T extends typeof Macroable> (this: T, name: string, callback: MacroFn): T {
    this.validateMacro(name, callback)

    // @ts-expect-error
    this.prototype[name] = callback
    this.macros.set(name, callback)

    return this
  }

  /**
   * Ensures the given `name` and `callback` are valid macro values.
   *
   * @param name
   * @param callback
   *
   * @throws
   */
  private static validateMacro (name: string, callback: MacroFn): void {
    if (!name) {
      throw new Error('The first argument of ".macro(name, callback)" must be a valid string')
    }

    if (typeof callback !== 'function') {
      throw new Error('The second argument ".macro(name, callback)" must be a function')
    }
  }

  /**
   * Determine whether a macro is registered.
   *
   * @param name
   */
  public static hasMacro (name: string): boolean {
    return this.macros.has(name)
  }

  /**
   * Returns the registered macro for the given `name`.
   *
   * @param name
   */
  public static getMacro (name: string): MacroFn | undefined {
    return this.macros.get(name)
  }

  /**
   * Determine whether a macro is registered.
   *
   * @param name
   */
  public static flushMacros<T extends typeof Macroable> (this: T): T {
    for (const key of this.macros.keys()) {
      Reflect.deleteProperty(this.prototype, key)
    }

    this.macros = new Map()

    return this
  }
}
