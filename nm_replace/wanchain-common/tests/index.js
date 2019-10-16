const tape = require('tape')
const params = require('../index.js')

tape('JSON validity/Param reachability', function (t) {
  t.test('should be able to read value from params.json', function (st) {
    st.equal(params.genesisHash.v, '0x0376899c001618fc7d5ab4f31cfd7f57ca3a896ccc1581a57d8f129ecf40b840')
    st.end()
  })

  t.test('genesisState.json is empty', function (st) {
    st.deepEqual(params.genesisState, {})
    st.end()
  })

  t.test('should be able to read value from bootstrapNodes.json', function (st) {
    st.equal(params.bootstrapNodes[0].port, '17717')
    st.end()
  })
})
