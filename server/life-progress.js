// date-fns
const differenceInMilliseconds = require('date-fns/difference_in_milliseconds')
const differenceInYears = require('date-fns/difference_in_years')
const getYear = require('date-fns/get_year')
const setYear = require('date-fns/set_year')

function getLifeProgress() {
  var age = getAge();
  var table = getInterpolatedLifeTableForAge(age);
  var expect = table['expect'];
  return age / (age + expect);
};

function getAge() {
  // 1979-12-21 (Date takes a 0-indexed month)
  var birth = new Date(Date.UTC(1979, 11, 21));
  var now = new Date();

  var years = differenceInYears(now, birth);

  var prevBirthday = setYear(birth, getYear(birth) + years);
  var nextBirthday = setYear(birth, getYear(birth) + years + 1);

  var yearProgress = (
    differenceInMilliseconds(now, prevBirthday) /
    differenceInMilliseconds(nextBirthday, prevBirthday)
  );

  return years + yearProgress;
}

function getInterpolatedLifeTableForAge(age) {
  var integerAge = Math.trunc(age);
  var a = getLifeTables()[integerAge];
  var b = getLifeTables()[integerAge + 1];

  var yearProgress = age - integerAge;
  var interpolated = {
    age: age,
    mortality: a['mortality'] * yearProgress + b['mortality'] * (1 - yearProgress),
    expect: a['expect'] * yearProgress + b['expect'] * (1 - yearProgress),
  };

  return interpolated;
}

function getLifeTables() {
  // Based on most recent ONS data as of 2018:
  // https://www.ons.gov.uk/peoplepopulationandcommunity/birthsdeathsandmarriages/lifeexpectancies/datasets/nationallifetablesenglandreferencetables
  return {
    0:    { age: 0,     mortality: 0.004338,    expect: 79.49 },
    1:    { age: 1,     mortality: 0.000269,    expect: 78.83 },
    2:    { age: 2,     mortality: 0.000142,    expect: 77.86 },
    3:    { age: 3,     mortality: 0.000127,    expect: 76.87 },
    4:    { age: 4,     mortality: 0.000097,    expect: 75.88 },
    5:    { age: 5,     mortality: 0.000093,    expect: 74.88 },
    6:    { age: 6,     mortality: 0.000072,    expect: 73.89 },
    7:    { age: 7,     mortality: 0.000083,    expect: 72.90 },
    8:    { age: 8,     mortality: 0.000066,    expect: 71.90 },
    9:    { age: 9,     mortality: 0.000084,    expect: 70.91 },
    10:   { age: 10,    mortality: 0.000080,    expect: 69.91 },
    11:   { age: 11,    mortality: 0.000088,    expect: 68.92 },
    12:   { age: 12,    mortality: 0.000097,    expect: 67.92 },
    13:   { age: 13,    mortality: 0.000103,    expect: 66.93 },
    14:   { age: 14,    mortality: 0.000118,    expect: 65.94 },
    15:   { age: 15,    mortality: 0.000171,    expect: 64.95 },
    16:   { age: 16,    mortality: 0.000212,    expect: 63.96 },
    17:   { age: 17,    mortality: 0.000285,    expect: 62.97 },
    18:   { age: 18,    mortality: 0.000368,    expect: 61.99 },
    19:   { age: 19,    mortality: 0.000420,    expect: 61.01 },
    20:   { age: 20,    mortality: 0.000472,    expect: 60.04 },
    21:   { age: 21,    mortality: 0.000469,    expect: 59.06 },
    22:   { age: 22,    mortality: 0.000475,    expect: 58.09 },
    23:   { age: 23,    mortality: 0.000499,    expect: 57.12 },
    24:   { age: 24,    mortality: 0.000518,    expect: 56.15 },
    25:   { age: 25,    mortality: 0.000574,    expect: 55.18 },
    26:   { age: 26,    mortality: 0.000530,    expect: 54.21 },
    27:   { age: 27,    mortality: 0.000553,    expect: 53.24 },
    28:   { age: 28,    mortality: 0.000625,    expect: 52.26 },
    29:   { age: 29,    mortality: 0.000615,    expect: 51.30 },
    30:   { age: 30,    mortality: 0.000655,    expect: 50.33 },
    31:   { age: 31,    mortality: 0.000701,    expect: 49.36 },
    32:   { age: 32,    mortality: 0.000839,    expect: 48.40 },
    33:   { age: 33,    mortality: 0.000825,    expect: 47.44 },
    34:   { age: 34,    mortality: 0.000894,    expect: 46.47 },
    35:   { age: 35,    mortality: 0.000952,    expect: 45.52 },
    36:   { age: 36,    mortality: 0.001095,    expect: 44.56 },
    37:   { age: 37,    mortality: 0.001090,    expect: 43.61 },
    38:   { age: 38,    mortality: 0.001156,    expect: 42.65 },
    39:   { age: 39,    mortality: 0.001278,    expect: 41.70 },
    40:   { age: 40,    mortality: 0.001404,    expect: 40.76 },
    41:   { age: 41,    mortality: 0.001592,    expect: 39.81 },
    42:   { age: 42,    mortality: 0.001675,    expect: 38.87 },
    43:   { age: 43,    mortality: 0.001865,    expect: 37.94 },
    44:   { age: 44,    mortality: 0.001985,    expect: 37.01 },
    45:   { age: 45,    mortality: 0.002078,    expect: 36.08 },
    46:   { age: 46,    mortality: 0.002227,    expect: 35.16 },
    47:   { age: 47,    mortality: 0.002604,    expect: 34.23 },
    48:   { age: 48,    mortality: 0.002659,    expect: 33.32 },
    49:   { age: 49,    mortality: 0.002967,    expect: 32.41 },
    50:   { age: 50,    mortality: 0.003282,    expect: 31.50 },
    51:   { age: 51,    mortality: 0.003350,    expect: 30.61 },
    52:   { age: 52,    mortality: 0.003640,    expect: 29.71 },
    53:   { age: 53,    mortality: 0.003857,    expect: 28.81 },
    54:   { age: 54,    mortality: 0.004214,    expect: 27.92 },
    55:   { age: 55,    mortality: 0.004764,    expect: 27.04 },
    56:   { age: 56,    mortality: 0.005262,    expect: 26.17 },
    57:   { age: 57,    mortality: 0.005702,    expect: 25.30 },
    58:   { age: 58,    mortality: 0.006188,    expect: 24.44 },
    59:   { age: 59,    mortality: 0.006778,    expect: 23.59 },
    60:   { age: 60,    mortality: 0.007741,    expect: 22.75 },
    61:   { age: 61,    mortality: 0.008338,    expect: 21.92 },
    62:   { age: 62,    mortality: 0.009077,    expect: 21.10 },
    63:   { age: 63,    mortality: 0.010221,    expect: 20.29 },
    64:   { age: 64,    mortality: 0.011155,    expect: 19.50 },
    65:   { age: 65,    mortality: 0.011978,    expect: 18.71 },
    66:   { age: 66,    mortality: 0.013053,    expect: 17.93 },
    67:   { age: 67,    mortality: 0.014088,    expect: 17.16 },
    68:   { age: 68,    mortality: 0.015207,    expect: 16.40 },
    69:   { age: 69,    mortality: 0.016573,    expect: 15.65 },
    70:   { age: 70,    mortality: 0.018266,    expect: 14.90 },
    71:   { age: 71,    mortality: 0.020729,    expect: 14.17 },
    72:   { age: 72,    mortality: 0.022804,    expect: 13.46 },
    73:   { age: 73,    mortality: 0.025226,    expect: 12.76 },
    74:   { age: 74,    mortality: 0.028683,    expect: 12.08 },
    75:   { age: 75,    mortality: 0.032052,    expect: 11.42 },
    76:   { age: 76,    mortality: 0.035624,    expect: 10.78 },
    77:   { age: 77,    mortality: 0.038908,    expect: 10.16 },
    78:   { age: 78,    mortality: 0.043245,    expect: 9.55  },
    79:   { age: 79,    mortality: 0.047895,    expect: 8.96  },
    80:   { age: 80,    mortality: 0.054127,    expect: 8.39  },
    81:   { age: 81,    mortality: 0.060230,    expect: 7.84  },
    82:   { age: 82,    mortality: 0.068265,    expect: 7.31  },
    83:   { age: 83,    mortality: 0.077331,    expect: 6.81  },
    84:   { age: 84,    mortality: 0.086568,    expect: 6.34  },
    85:   { age: 85,    mortality: 0.096815,    expect: 5.89  },
    86:   { age: 86,    mortality: 0.108181,    expect: 5.47  },
    87:   { age: 87,    mortality: 0.121036,    expect: 5.07  },
    88:   { age: 88,    mortality: 0.135392,    expect: 4.70  },
    89:   { age: 89,    mortality: 0.149864,    expect: 4.36  },
    90:   { age: 90,    mortality: 0.167592,    expect: 4.04  },
    91:   { age: 91,    mortality: 0.184066,    expect: 3.75  },
    92:   { age: 92,    mortality: 0.199844,    expect: 3.49  },
    93:   { age: 93,    mortality: 0.219923,    expect: 3.23  },
    94:   { age: 94,    mortality: 0.240932,    expect: 3.01  },
    95:   { age: 95,    mortality: 0.266732,    expect: 2.80  },
    96:   { age: 96,    mortality: 0.286339,    expect: 2.64  },
    97:   { age: 97,    mortality: 0.303974,    expect: 2.50  },
    98:   { age: 98,    mortality: 0.309981,    expect: 2.37  },
    99:   { age: 99,    mortality: 0.342258,    expect: 2.21  },
    100:  { age: 100,   mortality: 0.385394,    expect: 2.09  },
  };
}

module.exports = getLifeProgress;
