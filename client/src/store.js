import Vue from 'vue'
import Vuex from 'vuex'
import {VuexPersistence} from 'vuex-persist'
Vue.use(Vuex)

// ORM/Axios
import VuexORM, {Query} from '@vuex-orm/core'
import VuexORMAxios from '@vuex-orm/plugin-axios'
import axios from 'axios'
VuexORM.use(VuexORMAxios, {axios})

// Modules
import version from '@/store/version'
import snackbar from '@/store/snackbar'
import board from '@/store/board'
import list from '@/store/list'
import loadingProgress from '@/store/loadingProgress'

// Models registration
import Board from '@/models/Board'
import List from '@/models/List'
import Item from '@/models/Item'

const database = new VuexORM.Database()
database.register(Board)
database.register(List)
database.register(Item)

const vuexPersistence = new VuexPersistence({
  key: process.env.LOCALSTORAGE_KEY || 'OurShoppingList',
  storage: window.localStorage,
  reducer: (state) => {
    let persistedState = Object.assign({}, state)
    persistedState.board = {
      currentBoardId: board.currentBoardId,
      lastBoardId: board.lastBoardId
    }
    persistedState.list = {
      currentListId: list.currentListId,
      lastListId: list.lastListId
    }
    return persistedState
  }
})

// Create Vuex Store and register database through Vuex ORM
const store = new Vuex.Store({
  //strict: true,
  modules: {
    version,
    snackbar,
    board: board.module(),
    list: list.module(),
    loadingProgress
  },
  plugins: [
    VuexORM.install(database),
    vuexPersistence.plugin
  ],
})

// Unset board from store on deletion
Query.on('afterDelete', function (model) {
  if (model instanceof Board
    && model._id === store.state.board.currentBoardId
  ) {
    store.dispatch('list/reset')
    if (model._id === store.state.board.lastBoardId) {
      store.dispatch('board/reset')
    } else {
      store.commit('board/setCurrentBoard', null)
    }
  }
})

// Trigger init for the "loadingProgress" module here
store.dispatch('loadingProgress/init')

export default store
