


Right now, to have full SSR feature, you should not use localStorage but a session stored on the server instead.



To everyone who want to use <no-ssr>, this.refs doesn't contain your ref="" on mounted. You have to wrap your logic in this.$nextTick(() => { ... })



https://github.com/lewebsimple/feathers-nuxt/blob/master/server/middleware/nuxt.js
?? any use?


https://github.com/nuxt/nuxt.js/blob/dev/examples/no-ssr/pages/index.vue