const state = {
  info: {
    token: '',
    ip: '',
    port: '',
    ssl: null
  }
}

const mutations = {
  ADD_USER (state, payload) {
    state.info.token = payload.token
    state.info.ip = payload.ip
    state.info.port = payload.port
    state.info.ssl = payload.ssl
  }
}

const actions = {
  settings ({ commit }, payload) {
    commit('ADD_USER', payload)
  }
}

const getters = {
  getInfo: state => state.info
}
export default {
  state,
  mutations,
  actions,
  getters
}
