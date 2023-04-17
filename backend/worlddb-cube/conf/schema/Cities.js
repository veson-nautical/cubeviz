cube(`Cities`, {

  sql: `SELECT * from city`,

  measures: {
    count: {
      sql: 'id',
      type: `countDistinct`,
    },
    population: {
      sql: 'population',
      type: 'sum',
    },
  },

  dimensions: {
    id: {
      sql: 'id',
      type: 'number',
      primaryKey: true,
    },
    name: {
      sql: 'name',
      type: 'string',
    },
    countrycode: {
      sql: 'countrycode',
      type: 'string',
    },
    district: {
      sql: 'district',
      type: 'string',
    },
  },

  joins: {
    Countries: {
      relationship: `belongsTo`,
      sql: `${CUBE}.countrycode = ${Countries.code}`,
    },
  },
});
