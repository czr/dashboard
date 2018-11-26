const getLifeProgress = require('./life-progress')

test('greater than 0', () => {
    expect(getLifeProgress()).toBeGreaterThan(0)
})

test('less than 1', () => {
    expect(getLifeProgress()).toBeLessThan(1)
})
