<template>
    <div class="cont">
        <h2>Aukcje dostępne w serwisie ({{ileAukcji}} aukcji):</h2>
        <button class="thisButton" @click="aukcjeAction">Wszystkie</button>
        <button @click="$router.push('/aukcjeKupione')">Moje kupione</button>
        <button v-bind:class="{powiadomienieButton: this.$store.state.aukcjePowiadomienie === true}"
            @click="$router.push('/aukcjeLicytowane')">Moje licytowane</button>
        <button @click="$router.push('/aukcjeWystawione')">Moje wystawione</button>
        <div>
            <button @click="$router.push('/dodajAukcje')" class="addAuction">Dodaj nową aukcję</button>
        </div>
        <div class="wyszukiwanie">
            <input type="text" v-model="tekstWysz" placeholder="wyszukaj">
        </div>
        <div v-if="!czyWyszukiwanie" class="perPage">
            <span class="perPageText">Aukcji na stronę ({{aukcjeNaStrone}})</span>
            <button @click="aukcjiNaStrone(2)">2</button>
            <button @click="aukcjiNaStrone(5)">5</button>
            <button @click="aukcjiNaStrone(10)">10</button>
            <button @click="aukcjiNaStrone(20)">20</button>
            <button @click="aukcjiNaStrone(50)">50</button>
            <button @click="aukcjiNaStrone(100)">100</button>
        </div>
        <div v-if="!czyWyszukiwanie" class="pages">
            <span v-for="(strona, i) in stronyAukcji" v-bind:key="strona+i"
                @click="zmienStroneNa(i+1)"
                v-bind:class="{pageSelected: i+1 === obecnaStrona}"
                >{{i+1}}</span>
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
                        v-model="ofertaLicytacji[i]" type="text" />
                    <button v-bind:disabled="aukcja.czyZakonczona || aukcja.sprzedawca === user"
                        v-bind:title="aukcja.czyZakonczona ? 'Licytacja jest już zakończona' :
                            aukcja.sprzedawca === user ? 'Nie możesz licytować swoich przedmiotów' : ''"
                        @click="licytujAukcje(aukcja, i)">Licytuj</button>
                </div>
            </div>
            <p v-if="komunikat[i]!==''" class="komunikat">{{komunikat[i]}}</p>
        </div>
        <div v-if="!czyWyszukiwanie" class="pages">
            <span v-for="(strona, i) in stronyAukcji" v-bind:key="strona+i"
                @click="zmienStroneNa(i+1)"
                v-bind:class="{pageSelected: i+1 === obecnaStrona}"
                >{{i+1}}</span>
        </div>
        <div v-if="!czyWyszukiwanie" class="perPage">
            <span class="perPageText">Aukcji na stronę ({{aukcjeNaStrone}})</span>
            <button @click="aukcjiNaStrone(2)">2</button>
            <button @click="aukcjiNaStrone(5)">5</button>
            <button @click="aukcjiNaStrone(10)">10</button>
            <button @click="aukcjiNaStrone(20)">20</button>
            <button @click="aukcjiNaStrone(50)">50</button>
            <button @click="aukcjiNaStrone(100)">100</button>
        </div>
    </div>
</template>

<script>
import io from "socket.io-client";
import axios from "axios";

export default {
    data () {
        return {
            socket: null,
            aukcje: [],
            ofertaLicytacji: [],
            ileAukcji: 0,
            obecnaStrona: 1,
            stronyAukcji: 0,
            aukcjeNaStrone: 5,
            komunikat: [],
            czyWyszukiwanie: false,
            tekstWysz: ""
        };
    },
    computed: {
        user () {
            return this.$store.state.user;
        }
    },
    methods: {
        licytujAukcje (data, i) {
            // console.log("lictyuj!");
            // console.log(data._id);
            // console.log(data.cena);
            // console.log(this.ofertaLicytacji[i]);
            let oferta = parseInt(this.ofertaLicytacji[i]);
            if (Number.isNaN(oferta)) {
                this.komunikat[i] = "BŁĄD - nieprawidłowa kwota licytacji!";
                setTimeout(() => {
                    this.komunikat[i] = "";
                }, 10000);
            } else {
                if (oferta <= data.cena) {
                    this.komunikat[i] = "BŁĄD - oferta musi być wyższa od aktualnej";
                    setTimeout(() => {
                        this.komunikat[i] = "";
                    }, 10000);
                // przebicie dotychczasowej oferty
                } else {
                    // console.log("dobra oferta");
                    this.socket.emit("licytacja", {
                        aukcjaId: data._id,
                        oferta: oferta,
                        i: i
                    });
                }
            }
        },
        kupAukcje (data, i) {
            this.socket.emit("kupTeraz", {
                aukcjaId: data._id,
                i: i
            });
        },
        aukcjeAction () {
            if (this.$router.currentRoute.path !== "/aukcje") {
                this.$router.push("/aukcje");
            }
        },
        zmienStroneNa (i) {
            this.obecnaStrona = i;
            // pobranie aukcji
            axios.get("/api/aukcje/" + (this.aukcjeNaStrone * (i - 1)) + "/" + this.aukcjeNaStrone)
                .then(response => {
                    this.aukcje = response.data;
                })
                .catch(err => console.log(err));
        },
        aukcjiNaStrone (ile) {
            this.aukcjeNaStrone = ile;
            this.stronyAukcji = Math.ceil(this.ileAukcji / this.aukcjeNaStrone);
            // wrócenie na 1 stronę, aby unikąć sytuacji opisanej niżej
            // aukcji jest 90, po 10 na stronę co daje 9 stron, użytkownik jest na 9 karcie i zmienia ilość aukcji na strone
            // na np 50 - co da 2 możliwe strony, więc nie można spośród stron [1,2] wybrać strony 9 (taka jaka była poprzednio)
            this.obecnaStrona = 1;
            this.zmienStroneNa(this.obecnaStrona);
        }
        /* szukajAukcji () {
            if (this.tekstWysz !== "") {
                this.czyWyszukiwanie = true;
            } else {
                this.czyWyszukiwanie = false;
            }
            if (this.czyWyszukiwanie === true) {
                console.log(this.tekstWysz);
                axios.get("/api/aukcje/wyszukajAukcje/" + this.tekstWysz)
                    .then(response => {
                        this.aukcje = response.data;
                    })
                    .catch(err => console.log(err));
            } else {
                console.log("nie wyszukuje");
            }
        } */
    },
    created () {
        this.socket = io();
        // this.socket = io("https://localhost:3000"); // dev
        this.socket.emit("wysylacAukcjeStart");
        // ustalenie ile jest aukcji - do stronicowania
        axios.get("/api/aukcje/ile")
            .then(response => {
                this.ileAukcji = response.data;
                this.stronyAukcji = Math.ceil(response.data / this.aukcjeNaStrone);
            })
            .catch(err => console.log(err));
        // początkowe pobranie - 1 strona aukcji
        axios.get("/api/aukcje/0/" + this.aukcjeNaStrone)
            .then(response => {
                this.aukcje = response.data;
            })
            .catch(err => console.log(err));
    },
    mounted () {
        const _this = this;
        // otrzymanie listy aukcji od serwera
        this.socket.on("wyslaneAukcjeServer", (data) => {
            if (_this.tekstWysz !== "") {
                _this.czyWyszukiwanie = true;
            } else {
                _this.czyWyszukiwanie = false;
            }
            // jeżeli wyszukujemy - to filtorwanie po tekście wyszukiwania
            if (_this.czyWyszukiwanie === true) {
                data = data.filter(el => el.nazwa.includes(_this.tekstWysz) || el.sprzedawca.includes(_this.tekstWysz));
                _this.aukcje = data;
                for (let k = 0; k < _this.aukcje.length; k++) {
                    if (data[k].cena < _this.aukcje[k].cena) {
                        data[k] = _this.aukcje[k];
                    }
                }
                _this.aukcje = data;
            } else {
                // odpowiednie aukcje na odpowiedniej stronie
                _this.ileAukcji = data.length;
                data = data.slice((((_this.obecnaStrona - 1) * _this.aukcjeNaStrone)), (_this.aukcjeNaStrone * _this.obecnaStrona));
                // filtorwanie danych otrzymanych od serera na temat aukcji
                for (let k = 0; k < _this.aukcje.length; k++) {
                    // jeżeli cena otrzymanej od serwera AUKCJI jest niższa od obecnie posiadanej (otrzymanej przez socket)
                    // to nie zmieniamy tej aukcji - bo ma stare dane o cenie
                    if (data[k].cena < _this.aukcje[k].cena) {
                        data[k] = _this.aukcje[k];
                    }
                }
                _this.aukcje = data;
            }
        });
        // otrzymanie informacji o kupnie jakiejś aukcji przez innego użytkownik
        this.socket.on("kupTeraz_ToUsers", (data) => {
            // ustawienie wyłącznie 'czyZakonczona', aby zablokować kliknięcie "kup teraz" innym
            // _this.aukcje[data.i].czyZakonczona = true;
            let aktualizowanaAukcjaIndex = _this.aukcje.findIndex((element) => {
                if (element._id === data.aukcjaId) {
                    return true;
                }
            });
            // console.log("kupTerazIndex:" + aktualizowanaAukcjaIndex);
            if (aktualizowanaAukcjaIndex !== -1) {
                _this.aukcje[aktualizowanaAukcjaIndex].czasDoKonca = 0;
                _this.aukcje[aktualizowanaAukcjaIndex].czyZakonczona = true;
            }
        });
        // otrzymanie informacji o licytacji jakiejś aukcji przez innego użytkownik
        this.socket.on("licytacja_ToUsers", (data) => {
            // console.log(data);
            if (data.oferta !== undefined) {
                // ustawienie wyłącznie 'nowej oferty', aby była widoczna szybciej
                // _this.aukcje[data.i].cena = data.oferta;
                let aktualizowanaAukcjaIndex = _this.aukcje.findIndex((element) => {
                    if (element._id === data.aukcjaId) {
                        return true;
                    }
                });
                // console.log("aukcjeIndex:" + aktualizowanaAukcjaIndex);
                if (aktualizowanaAukcjaIndex !== -1) {
                    _this.aukcje[aktualizowanaAukcjaIndex].cena = data.oferta;
                }
            }
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
        .perPage{
            .perPageText{
                margin-right: 1vh;
            }
            margin: 2vh 0;
            button{
                background-color: gray;
                color: black;
                padding: 0.5vh;
                margin: 0.2vh;
            }
        }
        div{
            .addAuction{
                margin-bottom: 8vh;
            }
        }
        .pages{
            span{
                font-weight: bold;
                border: 1px solid black;
                margin: 0 1vh;
                padding: 1vh;
                cursor: pointer;
                background-color: white;
                &:hover{
                    background-color: forestgreen;
                }
            }
            .pageSelected{
                background-color: darkred;
                color: white;
            }
        }
        .pageSelected{
            background-color: darkred;
            color: white;
        }
        overflow: auto;
        text-align: center;
        margin-bottom: 1vh;
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
            .komunikat{
                font-weight: bold;
                color: darkred;
                font-style: italic;
            }
        }
    }
</style>
