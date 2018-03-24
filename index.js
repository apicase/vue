const defaultConfig = {
  name: 'api'
}

/**
 * Injects request instance of service to component data. Also adds a listeners to update data
 * @param {ApiService} service Service name
 * @param {object} [config=defaultConfig] Config object
 * @param {string} [config.name="api"] Name for property in component data
 * @return {object} Vue mixin
 */
export const injectService = (service, config = defaultConfig) => ({
  data: function() {
    const res = {}
    res[config.name] = {
      started: false,
      pending: false,
      success: false,
      error: null,
      payload: null,
      result: null
    }
    return res
  },
  beforeCreate: function() {
    this[service.name] = service
      .extend({ meta: { comp: this } })
      .on('change:state', ctx => {
        this[config.name] = ctx.nextState
      })
  }
})

/**
 * Gets service by its name from services tree and returns Vue mixin
 * @param {tree} tree Services tree to get service from
 */
export const injectFromTree = tree => (service, config) =>
  injectService(tree(service), config)

/**
 * Picks services from services tree and returns array of Vue mixins
 * @param {tree} tree Services tree to get service from
 */
export const pickApis = tree => services => {
  const inject = injectFromTree(tree)
  return Object.entries(services).map(service =>
    inject(
      service[0],
      Object.assign({}, { config: service[1], name: service[0] })
    )
  )
}

const getApi = (service, ctx) =>
  typeof service === 'string'
    ? ctx.app.$api(service)
    : ctx.app.$service(service)

const defaultPayload = ctx => ({})
const defaultResult = state => ({
  success: state.success,
  data: state.success ? state.result.body : state.result
})

/**
 * Creates asyncData callback to get data from Apicase services
 * @param {string|ApiService} service Service name from tree or custom service instance
 * @param {Function} [payload=ctx => ({})] Callback that accepts context and returns payload
 * @param {Function} [result=res => ({ success: res.result.success, data: res.result.success ? res.result.body : res.result })] Callback that transforms request state after finish to data
 * @return {Function} asyncData callback
 */
export const asyncData = config => ctx =>
  getApi(config.service, ctx)
    .doRequest((config.payload || defaultPayload)(ctx))
    .then(config.result || defaultResult)
