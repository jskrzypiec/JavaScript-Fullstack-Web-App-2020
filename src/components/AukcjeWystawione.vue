<template>
    <div class="cont">
        <h2>Wystawione przedmioty:</h2>
        <button @click="$router.push('/aukcje')">Wszystkie</button>
        <button @click="$router.push('/aukcjeKupione')">Moje kupione</button>
        <button v-bind:class="{powiadomienieButton: this.$store.state.aukcjePowiadomienie === true}"
            @click="$router.push('/aukcjeLicytowane')">Moje licytowane</button>
        <button class="thisButton" @click="aukcjeWystawioneAction">Moje wystawione</button>
        <div>
            <button @click="$router.push('/dodajAukcje')">Dodaj nową aukcję</button>
        </div>
        <div class="aukcja" v-for="(aukcja, i) in aukcje" v-bind:key="aukcja + i">
            <h3>Przedmiot aukcji: {{ aukcja.nazwa }}</h3>
            <p>ID aukcji: <b>{{ aukcja._id }}</b>, Sprzedawca: <b>{{ aukcja.sprzedawca }}</b></p>
            <p v-if="aukcja.czasDoKonca>0">Czas do zakończenia: {{ parseInt(aukcja.czasDoKonca/(24*3600)) }}d
                {{ parseInt((aukcja.czasDoKonca/(3600))%24) }}h
                {{ parseInt((aukcja.czasDoKonca/(60))%(60)) }}m
                {{ parseInt(aukcja.czasDoKonca%(60)) }}s</p>
            <!-- kupiec temp -->
            <!-- <p>Kupiec: {{ aukcja.kupiec }}</p> -->
            <p v-if="aukcja.czyZakonczona">Zakończona (przedmiot kupiony przez {{ aukcja.kupiec }})</p>
            <div v-if="aukcja.typ==='kup teraz'">
                <p>Cena: {{ aukcja.cena }}</p>
                <button v-bind:disabled="aukcja.czyZakonczona || aukcja.sprzedawca === user"
                    v-bind:title="aukcja.czyZakonczona ? 'Aukcja jest już zakończona' :
                            aukcja.sprzedawca === user ? 'Nie kupować swoich przedmiotów' : ''"
                    @click="kupAukcje(aukcja, i)">Kup teraz</button>
            </div>
            <div v-else>
                <p v-if="aukcja.ofertaKto === ''">Nikt jeszcze nie licytuje, cena początkowa: {{ aukcja.cena+1 }}</p>
                <p v-if="aukcja.ofertaKto !== ''">Najwyższa oferta: {{ aukcja.cena }} ({{ aukcja.ofertaKto }})</p>
                <div>
                    Twoja oferta
                    <input v-bind:disabled="aukcja.czyZakonczona || aukcja.sprzedawca === user"
                        v-bind:title="aukcja.czyZakonczona ? 'Licytacja jest już zakończona' :
                            aukcja.sprzedawca === user ? 'Nie możesz licytować swoich przedmiotów' : ''"
                        type="text" />
                    <button v-bind:disabled="aukcja.czyZakonczona || aukcja.sprzedawca === user"
                        v-bind:title="aukcja.czyZakonczona ? 'Licytacja jest już zakończona' :
                            aukcja.sprzedawca === user ? 'Nie możesz licytować swoich przedmiotów' : ''"
                        @click="licytujAukcje(aukcja, i)">Licytuj</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import io from "socket.io-client";
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
        aukcjeWystawioneAction () {
            if (this.$router.currentRoute.path !== "/aukcjeWystawione") {
                this.$router.push("/aukcjeWystawione");
            }
        }
    },
    created () {
        this.socket = io();
        this.socket.emit("wysylacAukcjeStart");
        axios.get("/api/aukcje")
            .then(response => {
                this.aukcje = response.data;
                // wybranie spośród aukcji tych, które sami wystawiamy
                this.aukcje = this.aukcje.filter(el => this.user === el.sprzedawca);
            })
            .catch(err => console.log(err));
    },
    mounted () {
        const _this = this;
        // otrzymanie listy aukcji od serwera
        this.socket.on("wyslaneAukcjeServer", (data) => {
            data = data.filter(el => el.sprzedawca === _this.user);
            // filtorwanie danych otrzymanych od serera na temat aukcji
            // jeżeli cena otrzymanej od serwera AUKCJI jest niższa od obecnie posiadanej (otrzymanej przez socket)
            // to nie zmieniamy tej aukcji - bo ma stare dane o cenie
            for (let k = 0; k < data.length; k++) {
                // jeżeli cena otrzymanej od serwera AUKCJI jest niższa od obecnie posiadanej (otrzymanej przez socket)
                // to nie zmieniamy tej aukcji - bo ma stare dane o cenie
                if (data[k].cena < _this.aukcje[k].cena) {
                    data[k] = _this.aukcje[k];
                }
                // jeżeli otrzymana od serwera AUKCJA jeszcze trwa, a aukcja posiadana juz nie, bo
                // np. poprzez socketio został wysłany sygnał o jej zakończniu - to jej tutaj nie zmieniamy
                if (data[k].czasDoKonca > 0 && _this.aukcje[k].czasDoKonca === 0) {
                    data[k] = _this.aukcje[k];
                }
            }
            _this.aukcje = data;
        });
    },
    beforeDestroy () {
        this.socket.emit("disconnectFromChat");
        this.socket.disconnect();
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
            button{
                padding: 1vh;
            }
            input{
                padding: 1vh 0;
                margin-right: 1vh;
                text-align: center;
            }
        }
    }
</style>
