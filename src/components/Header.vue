<template>
    <header id="header">
        <ul>
        <li class="home" @click="$store.state.logowanieMsg = ''">
            <router-link to="/">Serwis aukcyjny</router-link>
        </li>
        <li v-if="!czyZalogowany">
            <router-link to="/aukcjeGosc">Aukcje</router-link>
        </li>
        <li v-if="!czyZalogowany" class="right" @click="$store.state.logowanieMsg = ''">
            <router-link to="/login">Login</router-link>
        </li>
        <li v-if="!czyZalogowany" class="right" @click="$store.state.logowanieMsg = ''">
            <router-link to="/register">Register</router-link>
        </li>
        <!--{{ $store.state.chatPowiadomienie }}
        <button @click="$store.state.chatPowiadomienie=true">ON</button>
        <button @click="$store.state.chatPowiadomienie=false">OFF</button>
        <button @click="socket.emit('cntUsersPrint')">connected</button>
        <button @click="wypiszOdKogo">od kogo arr</button>
        -->
        <!-- <li v-if="!czyZalogowany">
            <router-link to="/dashboard">Dashboard</router-link>
        </li> -->
        <!-- zalogowany -->
        <li v-if="czyZalogowany" v-bind:class="{powiadomienieHeaderLi: this.aukcjePowiadomienie === true}">
            <router-link to="/aukcje">Aukcje</router-link>
        </li>
        <li v-if="czyZalogowany" v-bind:class="{powiadomienieHeaderLi: this.chatPowiadomienie === true}">
            <router-link to="/chat">Chat</router-link>
        </li>
        <li class="right" v-if="czyZalogowany">
            <button @click="logout">Logout</button>
        </li>
        </ul>
    </header>
</template>

<script>
import io from "socket.io-client";
import axios from "axios";

export default {
    data () {
        return {
            socket: null
        };
    },
    computed: {
        czyZalogowany () {
            return this.$store.state.czyZalogowany;
        },
        user () {
            return this.$store.state.user;
        },
        aukcjePowiadomienie () {
            return this.$store.state.aukcjePowiadomienie;
        },
        chatPowiadomienie () {
            return this.$store.state.chatPowiadomienie;
        }
    },
    watch: {
        czyZalogowany: function (x) {
            if (x === true) {
                this.socket = io();
                this.socket.emit("wysylacAukcjeStart");
                const _this = this;
                // otrzymanie listy aukcji od serwera
                this.socket.on("wyslaneAukcjeServer", (data) => {
                    data = data.filter(el => el.ktoLicytowal.includes(_this.user));
                    // powiadomienie wył.
                    _this.$store.state.aukcjePowiadomienie = false;
                    data.forEach(el => {
                        if (el.ofertaKto !== _this.user) {
                            // wł. powiadomienia, jeżeli przegrywamy jakąś aukcję
                            _this.$store.state.aukcjePowiadomienie = true;
                        }
                    });
                });
                // chat - gdy będąc zalogowanym dostaniemy nową wiadomość
                this.socket.on("chat", (data) => {
                    if (data.do === _this.user) {
                        _this.$store.state.chatPowiadomienie = true;
                        if (!_this.$store.state.chatPowiadomienieOdKogo.includes(data.od)) {
                            _this.$store.state.chatPowiadomienieOdKogo.push(data.od);
                        }
                    }
                });
            }
        }
    },
    methods: {
        logout () {
            axios.get("/api/logout")
                .then(response => {
                    this.$store.state.czyZalogowany = response.data.isAuthenticated;
                })
                .catch(err => {
                    console.log(err);
                });
            this.$store.state.logowanieMsg = "Wylogowno";
            this.$store.state.user = "";
            if (this.$router.currentRoute.path !== "/") {
                this.$router.push("/");
            }
            this.socket.emit("disconnectFromChat");
            this.socket.disconnect();
        },
        wypiszOdKogo () {
            console.log(this.$store.state.chatPowiadomienieOdKogo);
        }
    },
    created () {
    },
    mounted () {
        axios.get("/api/login")
            .then(response => {
                this.$store.state.czyZalogowany = response.data.isAuthenticated;
            })
            .catch(err => {
                console.log(err);
            });
    }
};
</script>

<style lang="scss" scoped>
#header {
    border-bottom: 2px solid #F0F0F0;
    min-height: 1em;
    background-color: white;
    margin: 0;
    padding: 0;
    ul{
        margin: 0;
        padding: 0;
        height: 100%;
        list-style-type: none;
        overflow: hidden;
        .home{
            margin: 0;
            background-color: paleturquoise;
            font-weight: bold;
            &:hover{
                background-color: turquoise;
            }
            &:active{
                background-color: crimson;
            }
        }
        li{
            margin-left: 1vh;
            &:hover{
                background-color: lightgray;
            }
            &:active{
                background-color: crimson;
            }
            background-color: #f6f6f6;
            height: 100%;
            float: left;
            padding: 0 2vh;
            a{
                outline: none;
                display: flex;
                justify-content: center;
                align-items: center;
                width: 100%;
                height: 100%;
                text-decoration: none;
                color: black;
            }
            button{
                outline: none;
                height: 100%;
                background-color: inherit;
                color: black;
                font-weight: bold;
                font-size:inherit;
                padding: 0;
                margin: 0;
            }
        }
        .right{
            float:right;
        }
    }
}
</style>
