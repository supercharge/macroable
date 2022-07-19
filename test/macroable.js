'use strict'

const { expect } = require('expect')
const { test } = require('@japa/runner')
const { Macroable } = require('../dist')

class Parent extends Macroable {
  firstname () {
    return 'super'
  }
}

class Child extends Macroable {}

test.group('Macroable', () => {
  test('macro', () => {
    function macroFn () {}
    Parent.macro('macro', macroFn)

    expect(Parent.getMacro('macro')).toEqual(macroFn)
    expect((new Parent()).macro).toEqual(macroFn)
  })

  test('macro does not add a static function', () => {
    Parent.macro('staticFn', () => {})

    expect(Parent.staticFn).toBeUndefined()
    expect((new Parent()).staticFn).toBeDefined()
  })

  test('macro ensures the class binding', () => {
    Parent.macro('fullname', function () {
      return this.firstname() + 'charge'
    })

    const fullname = new Parent().fullname()
    expect(fullname).toEqual('supercharge')
  })

  test('throws when creating a macro without name', () => {
    expect(() => {
      Parent.macro()
    }).toThrow('The first argument of ".macro(name, callback)" must be a valid string')
  })

  test('throws when creating a macro with an empty name', () => {
    expect(() => {
      Parent.macro('')
    }).toThrow('The first argument of ".macro(name, callback)" must be a valid string')
  })

  test('throws when creating a macro without a function', () => {
    expect(() => {
      Parent.macro('name')
    }).toThrow('The second argument ".macro(name, callback)" must be a function')
  })

  test('throws when creating a macro without function', () => {
    expect(Parent.hasMacro('notExisting')).toBe(false)
  })

  test('hasMacro', () => {
    Parent.macro('macroFn', () => {})
    expect(Parent.hasMacro('macroFn')).toBe(true)
    expect(Parent.hasMacro('notExisting')).toBe(false)
  })

  test('flushMacros', () => {
    Parent.macro('macroFn', () => {})

    expect(Parent.hasMacro('macroFn')).toBe(true)

    Parent.flushMacros()
    expect(Parent.hasMacro('macroFn')).toBe(false)
  })

  test('classes do not share macros', () => {
    Child.macro('childMacro', () => {})
    Parent.macro('parentMacro', () => {})

    expect(Child.hasMacro('childMacro')).toBe(true)
    expect(Child.hasMacro('parentMacro')).toBe(false)

    expect(Parent.hasMacro('childMacro')).toBe(false)
    expect(Parent.hasMacro('parentMacro')).toBe(true)
  })
})
