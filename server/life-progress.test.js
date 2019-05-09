const { getLifeProgress } = require('./life-progress')

// Date takes a 0-indexed month
const birthDate = new Date(Date.UTC(2000, 0, 1))

test('greater than 0', () => {
  expect(getLifeProgress(birthDate)).toBeGreaterThan(0)
})

test('less than 1', () => {
  expect(getLifeProgress(birthDate)).toBeLessThan(1)
})
