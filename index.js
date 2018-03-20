const defaultConfig = {
  name: 'api',
  isFetching: 'isFetching',
  error: 'error',
  result: 'result'
}

export const injectService = (service, config = defaultConfig) => ({
  data: () => ({
    [config.name]: {
      started: false,
      pending: false,
      success: false,
      error: null,
      payload: null,
      result: null
    }
  }),
  beforeCreate() {
    this[service.name] = service
      .extend({ meta: { comp: this } })
      .on('change:state', ({ nextState }) => {
        this[config.name] = state
      })
  }
})

export const injectFromTree = tree => (service, config) =>
  injectService(tree(service), conifg)

export const pickApis = tree => services => {
  const inject = injectFromTree(tree)
  return Object.entries(services).map(([name, config]) =>
    inject(name, { ...config, name })
  )
}
