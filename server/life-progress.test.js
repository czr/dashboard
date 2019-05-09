const { getAge, getLifeProgress } = require('./life-progress')

// Date takes a 0-indexed month
const birthDate = new Date(Date.UTC(2000, 0, 1))

describe('getAge', () => {
  test('1 year', () => {
    expect(getAge(birthDate, new Date(Date.UTC(2001, 0, 1)))).toBe(1)
  })

  test('0.5 years', () => {
    const now = new Date(Date.UTC(2000, 6, 1))
    expect(getAge(birthDate, now)).toBeCloseTo(0.5, 2)
  })

  test('1.5 years', () => {
    const now = new Date(Date.UTC(2001, 6, 1))
    expect(getAge(birthDate, now)).toBeCloseTo(1.5, 2)
  })
})

test('greater than 0', () => {
  expect(getLifeProgress(birthDate)).toBeGreaterThan(0)
})

test('less than 1', () => {
  expect(getLifeProgress(birthDate)).toBeLessThan(1)
})
