<template>
    <div class="cont">
        <h2>Kupione przedmioty:</h2>
        <button @click="$router.push('/aukcje')">Wszystkie</button>
        <button class="thisButton" @click="aukcjeKupioneAction">Moje kupione</button>
        <button v-bind:class="{powiadomienieButton: this.$store.state.aukcjePowiadomienie === true}"
            @click="$router.push('/aukcjeLicytowane')">Moje licytowane</button>
        <button @click="$router.push('/aukcjeWystawione')">Moje wystawione</button>
        <div>
            <button @click="$router.push('/dodajAukcje')">Dodaj nową aukcję</button>
        </div>
        <div class="aukcja" v-for="(aukcja, i) in aukcje" v-bind:key="aukcja + i">
            <h3>Przedmiot aukcji: {{ aukcja.nazwa }}</h3>
            <p>ID aukcji: <b>{{ aukcja._id }}</b>, Sprzedawca: <b>{{ aukcja.sprzedawca }}</b></p>
            <!-- kupiec temp -->
            <!-- <p>Kupiec: {{ aukcja.kupiec }}</p> -->
            <p v-if="aukcja.czyZakonczona">Zakończona (przedmiot kupiony przez {{ aukcja.kupiec }})</p>
            <p>Cena: {{ aukcja.cena }}</p>
        </div>
    </div>
</template>

<script>
import axios from "axios";

export default {
    data () {
        return {
            aukcje: []
        };
    },
    computed: {
        user () {
            return this.$store.state.user;
        }
    },
    methods: {
        aukcjeKupioneAction () {
            if (this.$router.currentRoute.path !== "/aukcjeKupione") {
                this.$router.push("/aukcjeKupione");
            }
        }
    },
    created () {
        axios.get("/api/aukcje")
            .then(response => {
                this.aukcje = response.data;
                // następnie wybrane spośród aukcji tych, które dany użytkownik wygrał (oba typy - kup teraz/licytacje)
                this.aukcje = this.aukcje.filter(el => this.user === el.kupiec);
            })
            .catch(err => console.log(err));
    }
};
</script>

<style lang="scss" scoped>
    .cont{
        overflow: auto;
        text-align: center;
        h2{
            margin: 1vh 0;
        }
        button{
            margin: 0.5vh;
        }
        .thisButton{
            background-color:darkred;
        }
        .aukcja{
            background-color: white;
            border: 1px solid black;
            margin: 2vh;
            padding: 1vh;
            text-align: center;
            overflow:hidden;
        }
    }
</style>
