# Apicase Vue

Helper functions for better experience with Apicase and Vue.js and Nuxt!

[**Apicase docs**](https://kelin2025.gitbooks.io/apicase/)

## Installation

```
yarn add @apicase/vue
npm install @apicase/vue
```

## Vue.js helpers

#### injectService - service, config={ name: "api }

Creates mixin that injects service to component instance. Adds request state to `config.name` and service to `service.name` properties

```javascript
import { GetPosts } from "./api"
import { injectService } from "@apicase/vue"

export default {
  mixins: [injectService(GetPosts, { name: "posts" })],
  async created() {
    await this.getPost.doRequest()
    console.log(this.posts) // { success, payload, result, ... }
  }
}
```

#### injectFromTree - tree => (service, config={ name: "api })

Like `injectService`, but accepts tree and gets service by its name from `@apicase/services` tree

```javascript
import fetch from '@apicase/adapter-fetch'
import { ApiTree } from '@apicase/services'
import { injectFromTree } from '@apicase/vue'

export const tree = new ApiTree(fetch, [
  { name: 'getPosts', { url: 'posts' }},
  { name: 'helloFoo', { url: 'fooba' }}
])

export const inject = injectFromTree(tree)
```

```javascript
import { inject } from "./api"

export default {
  mixin: [inject("getPosts", { name: "posts" })]
}
```

## Nuxt helpers

**NOTE:** these helpers require [**Nuxt plugin**](https://github.com/apicase/nuxt) for Apicase

#### asyncData - config

Creates asyncData callback that calls service and returns data

```vue
<template>
  <div v-if="success">
    <post :item="item" v-for="item in data" />
  </div>
  <div v-else>
    <h4>Error happened</h4>
    <p>{{data}}</p>
  </div>
</template>

<script>
import { asyncData } from "@apicase/vue"

export default {
  asyncData: asyncData({
    service: "getPosts",
    payload: ({ route }) => ({
      query: { pageId: route.params.pageId }
    }),
    result: ({ success, result }) => ({
      success,
      data: success ? result.body : result
    })
  })
}
</script>
```

`payload` and `result` properties are optional. Default values are:

```javascript
const defaultPayload = ctx => ({})
const defaultResult = ({ success, result }) => ({
  success: success,
  data: success ? result.body : result
})
```

#### commitToStore/dispatchToStore - (name, converter)

Helper for events that commits mutation or dipatches action to store that was passed in `meta`.  
[**Nuxt plugin**](https://github.com/apicase/nuxt) automatically adds store to `meta` but you also can do it manually

```javascript
import fetch from "@apicase/adapter-fetch"
import { ApiTree } from "@apicase/services"
import { ApiService } from "@apicase/core"
import { commitToStore, dispatchToStore } from "@apicase/vue"

import store from "./store"

const WithStore = new ApiService({
  meta: { store }
})

export const tree = new ApiTree(WithStore, [
  {
    url: "posts",
    on: {
      done: commitToStore("posts/setList", ({ result }) => result.body),
      fail: dispatchToStore("alerts/push", ({ result }) => result)
    }
  }
])
```

2nd callback accepts `state` and converts it for action/mutation. It's optional, default value:

```javascript
const defaultConverter = ({ result }) => (result && result.body) || result
```

## License

MIT
