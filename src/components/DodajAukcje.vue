<template>
    <div class="mainDiv">
        <div class="powrot">
            <button @click="$router.push('/aukcje')">Powrót do listy aukcji</button>
        </div>
        <div class="dodawanieAukcji">
             <!-- Edycja: {{czyEdycja}} -->
            <div v-if="this.czyEdycja" class="edycjaAukcji">
                <div class="wiersz" title="od 3 do 50 znaków">
                    Nazwa przedmiotu:
                    <input v-model="nazwa" type="text" />
                </div>
                <div class="wiersz" title="od 1 do 30 dni">
                    Czas trwania aukcji (w dniach):
                    <input v-model="czasDni" type="text" />
                </div>
                <div class="wiersz">
                    Typ aukcji:
                    <button @click="typAukcji = 'kup teraz'" class="typAukcjiBtn" v-bind:class="{selectedBtn: this.czyKupTeraz}">Kup teraz</button>
                    <button @click="typAukcji = 'licytacja'" class="typAukcjiBtn" v-bind:class="{selectedBtn: !this.czyKupTeraz}">Licytacja</button>
                </div>
                <div v-if="typAukcji === 'kup teraz'" class="wiersz">
                    Cena przedmiotu:
                    <input v-model="cena" type="text" />
                </div>
                <div v-else-if="typAukcji === 'licytacja'" class="wiersz">
                    Cena startowa licytacji:
                    <input v-model="cena" type="text" />
                </div>
                <button @click="przejdzDoPodsumowania" class="wiersz dodaj">Dodaj nową aukcję</button>
            </div>
            <div v-if="!this.czyEdycja" class="podsumowanie">
                <div class="wiersz"><b>Wprowadzone dane</b></div>
                <p>Nazwa przedmiotu: <b>{{ nazwa }}</b></p>
                <p>Czas trwania aukcji: <b>{{ czasDni }} dni</b> <!--({{ czasSekundy }} sekund)--></p>
                <p>Typ aukcji: <b>{{ typAukcji }}</b></p>
                <p v-if="typAukcji === 'kup teraz'">Cena: <b>{{ cena }}</b></p>
                <p v-else-if="typAukcji === 'licytacja'">Cena początkowa licytacji: <b>{{ cena }}</b></p>
                <div class="wiersz">
                    <button @click="wrocDoEdycji">Wróc do edycji</button>
                    <button @click="dodajAukcje">Zatwierdź i dodaj aukcję</button>
                </div>
            </div>
        </div>
        <h3 v-if="komunikat!==''">{{komunikat}}</h3>
    </div>
</template>

<script>
import axios from "axios";
export default {
    data () {
        return {
            czyEdycja: true,
            nazwa: "",
            czasDni: "",
            cena: "",
            typAukcji: "kup teraz",
            komunikat: ""
        };
    },
    computed: {
        czasSekundy () {
            return this.czasDni * 24 * 3600;
        },
        czyKupTeraz () {
            if (this.typAukcji === "kup teraz") {
                return true;
            }
            return false;
        }
    },
    methods: {
        dodajAukcje () {
            const aukcja = {
                nazwa: this.nazwa,
                czasDoKonca: this.czasSekundy,
                typ: this.typAukcji,
                cena: this.cena,
                sprzedawca: "",
                kupiec: "",
                czyZakonczona: false
            };
            // console.log("Dodana aukcja:", aukcja);
            axios.post("/api/aukcje", aukcja)
                .then(response => {
                    this.$store.state.logowanieMsg = "Dodano nową aukcję";
                    this.$router.push("/");
                })
                .catch(err => {
                    console.log(err);
                });
        },
        przejdzDoPodsumowania () {
            if (this.czyNazwa(this.nazwa) && this.czyCzas(this.czasDni) && this.czyCena(this.cena)) {
                this.czasDni = parseInt(this.czasDni);
                this.czyEdycja = false;
                this.komunikat = "";
            } else {
                if (!this.czyNazwa(this.nazwa)) {
                    this.komunikat = "BŁĄD - Błędna nazwa aukcji";
                } else if (!this.czyCzas(this.czasDni)) {
                    this.komunikat = "BŁĄD - Błędny czas aukcji";
                } else if (!this.czyCena(this.cena)) {
                    this.komunikat = "BŁĄD - Błędna cena aukcji";
                } else {
                    this.komunikat = "BŁĄD";
                }
            }
        },
        wrocDoEdycji () {
            this.czyEdycja = true;
        },
        czyNazwa (data) {
            const nazwa = /^.{3,50}$/;
            if (data.match(nazwa)) {
                return true;
            } else {
                return false;
            }
        },
        czyCzas (data) {
            if (data >= 1 && data <= 30 && !Number.isNaN(parseInt(data))) {
                return true;
            } else {
                return false;
            }
        },
        czyCena (data) {
            const cena = /^[0-9]{1,10}$/;
            if (data.match(cena)) {
                return true;
            } else {
                return false;
            }
        }
    }
};
</script>

<style lang="scss" scoped>
    .mainDiv{
        h3{
            font-style: italic;
            font-weight: bold;
            color: darkred;
        }
        text-align: center;
        .powrot{
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            margin: 1vh;
        }
        .wiersz{
            margin: 1vh 0.5vh;
            .typAukcjiBtn{
                background-color: gray;
                padding: 1.6vh;
                margin-right: 1vh;
            }
            .selectedBtn{
                background-color: darkred;
                padding: 1.6vh;
                margin-right: 1vh;
            }
            input{
                padding: 1vh 0;
                text-align: center;
            }
        }
        .dodawanieAukcji{
            border: 1px solid black;
            background-color:white;
            display: flex;
            align-content: center;
            justify-content: center;
            .edycjaAukcji, .podsumowanie{
                display: inline-block;
                padding: 2vh;
            }
            .edycjaAukcji{
                text-align: right;
                display: flex;
                flex-direction: column;
            }
            .podsumowanie{
                button{
                    padding: 1.6vh;
                    margin-right: 1vh;
                }
            }
        }
    }
</style>
