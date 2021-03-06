import Vue from 'vue'
import App from './App.vue'
import './../node_modules/bulma/css/bulma.css';

// Import the Auth0 configuration
import { domain, clientId } from "../auth_config.json";

// Import the plugin here
import { Auth0Plugin } from "./auth";

// Install the authentication plugin here
Vue.use(Auth0Plugin, {
  domain,
  clientId,
});

Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')