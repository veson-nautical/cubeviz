cube(`Countries`, {

  sql: `SELECT * from country`,

  measures: {
    count: {
      sql: 'code',
      type: `countDistinct`,
    },
    totalPopulation: {
      sql: 'population',
      type: 'sum',
    },
    avgPopulation: {
      sql: 'population',
      type: 'avg',
    },
    totalSurfacearea: {
      sql: 'surfacearea',
      type: 'sum',
    },
    avgLifeExpectancy: {
      sql: 'surfacearea',
      type: 'avg',
    },
    avgSurfaceArea: {
      sql: 'surfacearea',
      type: 'sum',
    },
    avgGnp: {
      sql: 'gnp',
      type: 'avg',
    },
  },

  dimensions: {
    code: {
      sql: 'code',
      type: 'string',
      primaryKey: true,
    },
    name: {
      sql: 'name',
      type: 'string',
    },
    continent: {
      sql: 'continent',
      type: 'string',
    },
    region: {
      sql: 'region',
      type: 'string',
    },
    localname: {
      sql: 'localname',
      type: 'string',
    },
    governmentform: {
      sql: 'governmentform',
      type: 'string',
    },
    headofstate: {
      sql: 'headofstate',
      type: 'string',
    },
    code2: {
      sql: 'code2',
      type: 'string',
    },
  },
});
