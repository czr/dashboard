const healthLog = require('./health-log')

const transformRecordsToArray = healthLog.transformRecordsToArray
const transformRecordsToCSV = healthLog.transformRecordsToCSV

describe('transformRecordsToArray', () => {
  it('transforms empty set', () => {
    const schema = {
      'Sore throat': ['Mild', 'Moderate', 'Severe'],
    }
    const records =[]
    const expected = [
      [ 'date', 'Sore throat (numeric)', 'Sore throat (string)' ],
    ]
    expect(transformRecordsToArray(records, schema)).toEqual(expected)
  })

  it('transforms record with all schema fields', () => {
    const schema = {
      'Sore throat': ['Mild', 'Moderate', 'Severe'],
    }
    const records = [
      {
        '_id': '2019-03-23',
        'Sore throat': 1,
      },
    ]
    const expected = [
      [ 'date', 'Sore throat (numeric)', 'Sore throat (string)' ],
      [ '2019-03-23', 1, 'Mild' ],
    ]
    expect(transformRecordsToArray(records, schema)).toEqual(expected)
  })

  it('transforms record with missing schema fields', () => {
    const schema = {
      'Sore throat': ['Mild', 'Moderate', 'Severe'],
      'Headache': ['Mild', 'Moderate', 'Severe'],
    }
    const records = [
      {
        '_id': '2019-03-23',
        'Sore throat': 1,
      },
    ]
    const expected = [
      [ 'date', 'Headache (numeric)', 'Headache (string)', 'Sore throat (numeric)', 'Sore throat (string)' ],
      [ '2019-03-23', 0, '', 1, 'Mild' ],
    ]
    expect(transformRecordsToArray(records, schema)).toEqual(expected)
  })

  it('sorts records by date', () => {
    const schema = {
      'Sore throat': ['Mild', 'Moderate', 'Severe'],
    }
    const records = [
      {
        '_id': '2019-03-21',
        'Sore throat': 1,
      },
      {
        '_id': '2019-03-23',
        'Sore throat': 1,
      },
      {
        '_id': '2019-03-22',
        'Sore throat': 1,
      },
    ]
    const expected = [
      [ 'date', 'Sore throat (numeric)', 'Sore throat (string)' ],
      [ '2019-03-21', 1, 'Mild' ],
      [ '2019-03-22', 1, 'Mild' ],
      [ '2019-03-23', 1, 'Mild' ],
    ]
    expect(transformRecordsToArray(records, schema)).toEqual(expected)
  })

})

describe('transformRecordsToCSV', () => {
  it('transforms record with missing schema fields', () => {
    const schema = {
      'Sore throat': ['Mild', 'Moderate', 'Severe'],
      'Headache': ['Mild', 'Moderate', 'Severe'],
    }
    const records = [
      {
        '_id': '2019-03-23',
        'Sore throat': 1,
      },
    ]
    const expected = (
      'date,Headache (numeric),Headache (string),Sore throat (numeric),Sore throat (string)\n' +
      '2019-03-23,0,,1,Mild\n'
    )
    expect(transformRecordsToCSV(records, schema)).toEqual(expected)
  })
})