const {
  spreadData,
  shuffle,
} = require('../lib/util')

describe('spread data', () => {
  const ctx = {
    config: {
      separator: '\n',
    },
    mapConf: {
      workersNb: 1,
    },
    mapperNodes: [{}],
  }
  const data = `one line first
  second line
  one more line`

  it('spreads', () => {
    expect(spreadData(ctx, data).length).toBe(1)
    expect(spreadData(ctx, data)[0].length).toBe(3)
  })

  it('handles multi workers', () => {
    ctx.mapConf.workersNb = 3
    expect(spreadData(ctx, data).length).toBe(1)
    expect(spreadData(ctx, data)[0].length).toBe(3)
  })
})


describe('shuffle', () => {
  const data = [{}]
  const nodes = []

  it('shuffle the data', () => {
    expect(shuffle(data, nodes)).toBe()
  })
})
