<template>
    <div class="cont">
        <h2>Licytowane aukcje:</h2>
        <button @click="$router.push('/aukcje')">Wszystkie</button>
        <button @click="$router.push('/aukcjeKupione')">Moje kupione</button>
        <button class="thisButton" @click="aukcjeLicytowaneAction">Moje licytowane</button>
        <button @click="$router.push('/aukcjeWystawione')">Moje wystawione</button>
        <div>
            <button @click="$router.push('/dodajAukcje')">Dodaj nową aukcję</button>
        </div>
        <div class="aukcja" v-bind:class="{powiadomienieAukcja: aukcja.ofertaKto !== user}"
            v-for="(aukcja, i) in aukcje" v-bind:key="aukcja + i">
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
            komunikat: []
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
        aukcjeLicytowaneAction () {
            if (this.$router.currentRoute.path !== "/aukcjeLicytowane") {
                this.$router.push("/aukcjeLicytowane");
            }
        }
    },
    created () {
        this.socket = io();
        this.socket.emit("wysylacAukcjeStart");
        axios.get("/api/aukcje")
            .then(response => {
                this.aukcje = response.data;
                // następnie wybrane spośród aukcji tych, które dany użytkownik licytował
                this.aukcje = this.aukcje.filter(el => el.ktoLicytowal.includes(this.user));
            })
            .catch(err => console.log(err));
    },
    mounted () {
        const _this = this;
        // otrzymanie listy aukcji od serwera
        this.socket.on("wyslaneAukcjeServer", (data) => {
            data = data.filter(el => el.ktoLicytowal.includes(_this.user));
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
                let aktualizowanaAukcjaIndex = _this.aukcje.findIndex((element) => {
                    if (element._id === data.aukcjaId) {
                        return true;
                    }
                });
                // console.log("licytowaneIndex:" + aktualizowanaAukcjaIndex);
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
            .komunikat{
                font-weight: bold;
                color: darkred;
                font-style: italic;
            }
        }
    }
</style>
