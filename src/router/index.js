import Vue from "vue";
import VueRouter from "vue-router";

import Home from "../components/Home.vue";
import Login from "../components/Login.vue";
import Register from "../components/Register.vue";
import Dashboard from "../components/Dashboard.vue";
import Chat from "../components/Chat.vue";
import Aukcje from "../components/Aukcje.vue";
import DodajAukcje from "../components/DodajAukcje.vue";
import AukcjeGosc from "../components/AukcjeGosc.vue";
import AukcjeKupione from "../components/AukcjeKupione.vue";
import AukcjeLicytowane from "../components/AukcjeLicytowane.vue";
import AukcjeWystawione from "../components/AukcjeWystawione.vue";

Vue.use(VueRouter);

const routes = [
    {
        path: "/",
        name: "Home",
        component: Home
    },
    {
        path: "/login",
        name: "Login",
        component: Login
    },
    {
        path: "/register",
        name: "Register",
        component: Register
    },
    {
        path: "/dashboard",
        name: "Dashboard",
        component: Dashboard
    },
    {
        path: "/chat",
        name: "Chat",
        component: Chat
    },
    {
        path: "/aukcje",
        name: "Aukcje",
        component: Aukcje
    },
    {
        path: "/dodajAukcje",
        name: "DodajAukcje",
        component: DodajAukcje
    },
    {
        path: "/aukcjeGosc",
        name: "AukcjeGosc",
        component: AukcjeGosc
    },
    {
        path: "/aukcjeKupione",
        name: "AukcjeKupione",
        component: AukcjeKupione
    },
    {
        path: "/aukcjeLicytowane",
        name: "AukcjeLicytowane",
        component: AukcjeLicytowane
    },
    {
        path: "/aukcjeWystawione",
        name: "AukcjeWystawione",
        component: AukcjeWystawione
    }
];

export default new VueRouter({ mode: "history", routes });
