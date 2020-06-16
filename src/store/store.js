import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export const store = new Vuex.Store({
    state: {
        czyZalogowany: false,
        logowanieMsg: "",
        user: "",
        ostatniaWiadChatu: "",
        aukcjePowiadomienie: false,
        chatPowiadomienie: false,
        chatPowiadomienieOdKogo: []
    },
    mutations: {
    },
    actions: {
    },
    modules: {
    }
});
