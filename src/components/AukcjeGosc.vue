<template>
    <div class="cont">
        <h2>Aukcje dostępne w serwisie ({{ileAukcji}} aukcji):</h2>
        <div class="perPage">
            <span class="perPageText">Aukcji na stronę ({{aukcjeNaStrone}})</span>
            <button @click="aukcjiNaStrone(2)">2</button>
            <button @click="aukcjiNaStrone(5)">5</button>
            <button @click="aukcjiNaStrone(10)">10</button>
            <button @click="aukcjiNaStrone(20)">20</button>
            <button @click="aukcjiNaStrone(50)">50</button>
            <button @click="aukcjiNaStrone(100)">100</button>
        </div>
        <div class="pages">
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
                <button disabled class="kupLic_zaloguj" title="Zaloguj się aby kupić przedmiot">Kup teraz</button>
            </div>
            <div v-else>
                <p v-if="aukcja.ofertaKto === ''">Nikt jeszcze nie licytuje, cena początkowa: {{ aukcja.cena+1 }}</p>
                <p v-if="aukcja.ofertaKto !== ''">Najwyższa oferta: {{ aukcja.cena }} ({{ aukcja.ofertaKto }})</p>
                <div>
                    Twoja oferta
                    <input disabled type="text" title="Zaloguj się aby licytować przedmiot"/>
                    <button disabled title="Zaloguj się aby kupić przedmiot">Licytuj</button>
                </div>
            </div>
        </div>
        <div class="pages">
            <span v-for="(strona, i) in stronyAukcji" v-bind:key="strona+i"
                @click="zmienStroneNa(i+1)"
                v-bind:class="{pageSelected: i+1 === obecnaStrona}"
                >{{i+1}}</span>
        </div>
        <div class="perPage">
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
import axios from "axios";

export default {
    data () {
        return {
            aukcje: [],
            interval: null,
            ileAukcji: 0,
            obecnaStrona: 1,
            stronyAukcji: 0,
            aukcjeNaStrone: 5
        };
    },
    methods: {
        setTimers (data) {
            this.interval = setInterval(() => {
                data.forEach(aukcja => {
                    if (aukcja.czasDoKonca > 1 && !aukcja.czyZakonczona) {
                        aukcja.czasDoKonca--;
                    }
                });
            }, 1000);
        },
        zmienStroneNa (i) {
            this.obecnaStrona = i;
            // pobranie aukcji
            axios.get("/api/aukcje/" + (this.aukcjeNaStrone * (i - 1)) + "/" + this.aukcjeNaStrone)
                .then(response => {
                    // reset interval
                    clearInterval(this.interval);
                    // zmiana aukcji na nowo pobrane - nowa strona
                    this.aukcje = response.data;
                    // interval
                    this.setTimers(this.aukcje);
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
    },
    created () {
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
                // reset interval
                clearInterval(this.interval);
                // ustawienie początkowej wartości aukcji[] - pierwsza strona
                this.aukcje = response.data;
                // interval
                this.setTimers(this.aukcje);
            })
            .catch(err => console.log(err));
    },
    destroyed () {
        clearInterval(this.interval);
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
        overflow: auto;
        text-align: center;
        margin-bottom: 1vh;
        .aukcja{
            background-color: white;
            border: 1px solid black;
            margin: 2vh;
            padding: 1vh;
            text-align: center;
            overflow:hidden;
            h3{
                margin: 0;
            }
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
