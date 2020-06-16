<template>
  <div class="cont">
    <h2>Czaty</h2>
    <!-- <div class="wiersz">
        <button @click="czyPokazacCzatPubliczny=true; sendToUser='a'"
            v-bind:class="{selectedBtn: czyPokazacCzatPubliczny}">Chat publiczny</button>
        <button @click="czyPokazacCzatPubliczny=false; sendToUser=zarejestrowaniUzytkownicy[0]"
            v-bind:class="{selectedBtn: !czyPokazacCzatPubliczny}">Chaty indywidualne</button>
    </div>
    <div v-if="czyPokazacCzatPubliczny">
        <div class="wiersz">Czat publiczny</div>
        <div class="chatWindow">
            <p v-for="(wiad, i) in wiadomosciPubliczne" v-bind:key="i + wiad">
                {{ wiad }}
            </p>
        </div>
    </div> -->
    <div class="wiersz">
        Czaty prywatne
        <button class="userBtn"
            v-bind:class="{selectedUserBtn: user === sendToUser, powiadomienieButton2: chatPowiadomienieOdKogo.includes(user)}"
            v-for="(user, index) in zarejestrowaniUzytkownicy" v-bind:key="index + user" @click="sendToUserFn(user)">
            {{ user }}
        </button>
    </div>
    <div class="chatWindow_container">
        <div class="chatWindow">
            <p v-for="(wiad, i) in wiadomosciZDanymUzytk" v-bind:key="i + wiad"
                v-bind:class="{wiadOdeMnie: wiad.od === user, wiadDoMnie: wiad.od !== user}">
                <!--{{ wiad.od }}: -->{{ wiad.wiad }}
            </p>
        </div>
    </div>
    <div>Wysyłanie do: <span v-if="sendToUser === 'a'">wszystkich</span> <span v-else>({{ sendToUser }})</span></div>
    <input type="text" v-model="text"/>
    <button class="wyslijBtn" @click="sendText">Wyślij</button>
  </div>
</template>

<script>
import io from "socket.io-client";

export default {
    data () {
        return {
            socket: null,
            text: "",
            wiadomosciPubliczne: ["wiadomosci publiczne"],
            wiadomosciPrywatne: ["prywatne wiadomosci"],
            zarejestrowaniUzytkownicy: [],
            sendToUser: ""
            // czyPokazacCzatPubliczny: true
        };
    },
    computed: {
        user () {
            return this.$store.state.user;
        },
        wiadomosciZDanymUzytk () {
            return this.wiadomosciPrywatne.filter(wiad =>
                (wiad.od === this.sendToUser && wiad.do === this.user) ||
                (wiad.od === this.user && wiad.do === this.sendToUser));
        },
        chatPowiadomienieOdKogo () {
            return this.$store.state.chatPowiadomienieOdKogo;
        }
    },
    watch: {
        chatPowiadomienieOdKogo: function (x) {
            if (x.includes(this.sendToUser)) {
                let index = x.indexOf(this.sendToUser);
                if (index !== -1) {
                    x.splice(index, 1);
                }
                if (x.length === 0) {
                    this.$store.state.chatPowiadomienie = false;
                }
            }
        }
    },
    created () {
        this.socket = io();
        this.socket.emit("zarejestrowaniUzytkownicy_req");
        this.socket.emit("prywatneWiadomosci_req");
        // wczytanie ostatniej 'niewysłanej' wiadomości (o ile jakaś jest)
        if (this.$store.state.ostatniaWiadChatu !== "") {
            this.text = this.$store.state.ostatniaWiadChatu;
            // wyczyszczenie 'ostatniaWiadChatu'
            this.$store.state.ostatniaWiadChatu = "";
        }
    },
    mounted () {
        const _this = this;
        // zarejestrowani użytkownicy
        this.socket.on("zarejestrowaniUzytkownicy_res", (data) => {
            _this.zarejestrowaniUzytkownicy = data;
            // skasowanie samego siebie z listy chatów prywatnych - żeby nie pisać wiadomości do siebie
            let jaIndex = _this.zarejestrowaniUzytkownicy.indexOf(_this.user);
            _this.zarejestrowaniUzytkownicy.splice(jaIndex, 1);
            _this.sendToUser = _this.zarejestrowaniUzytkownicy[0];
        });
        // pobranie wiadomosci prywatnych
        this.socket.on("prywatneWiadomosci_res", (data) => {
            _this.wiadomosciPrywatne = [];
            data.forEach(wiad => {
                _this.wiadomosciPrywatne.push({
                    od: wiad.messageFrom,
                    wiad: wiad.message,
                    do: wiad.messageTo
                });
            });
        });
        // pojedyncza wiadmosc prywatna
        this.socket.on("chat", (data) => {
            _this.wiadomosciPrywatne.push(data);
        });
        // pojedynzca wiadomosc publiczna (do wszystkich)
        this.socket.on("chatGlobalnySerwer", (data) => {
            _this.wiadomosciPubliczne.push(data);
        });
    },
    methods: {
        sendText () {
            if (this.sendToUser === "a") { // a - all; wysyłanie do wszystkich
                this.socket.emit("chatGlobalnyKlient", {
                    message: this.text
                });
            } else {
                this.wiadomosciPrywatne.push({
                    od: this.user,
                    wiad: this.text,
                    do: this.sendToUser
                });
                this.socket.emit("chattPrywatny", {
                    message: this.text,
                    sendMessageTo: this.sendToUser
                });
            }
            // wyczyszczenie pola wiadmosci
            this.text = "";
        },
        sendToUserFn (user) {
            this.sendToUser = user;
            if (this.chatPowiadomienieOdKogo.includes(user)) {
                let index = this.chatPowiadomienieOdKogo.indexOf(user);
                if (index !== -1) {
                    this.chatPowiadomienieOdKogo.splice(index, 1);
                }
                if (this.chatPowiadomienieOdKogo.length === 0) {
                    this.$store.state.chatPowiadomienie = false;
                }
            }
        }
    },
    beforeDestroy () {
        this.socket.emit("disconnectFromChat");
        this.socket.disconnect();
        // jeżeli przy wyjściu z chatu pozostanie wpisany jakiś niepusty text wiadomości to zostanie on zapisany
        if (this.text !== "") {
            this.$store.state.ostatniaWiadChatu = this.text;
        }
    }
};
</script>

<style lang="scss" scoped>
    .cont{
        text-align: center;
        .wiersz{
            margin: 1vh 0.5vh;
            button{
                margin-right: 1vh;
            }
            .selectedBtn{
                background-color: darkred;
                margin-right: 1vh;
            }
            .userBtn{
                padding: 1vh;
                background-color: gray;
            }
            .selectedUserBtn{
                padding: 1vh;
                background-color: darkred;
            }
        }
        .chatWindow_container{
            margin-bottom: 0.4vh;
            .chatWindow{
                margin: auto;
                padding: 1.5vh;
                width: 70vw;
                @media only screen and (max-width: 1200px) {
                    width: 96vw;
                }
                text-align: left;
                background-color: white;
                height: 45vh;
                overflow-x: hidden; /* Hide horizontal scrollbar */
                overflow-y: scroll;
                p{
                    margin: 0 0 0.5vh 0;
                    padding: 0.4vh 2vh;
                    border-radius: 12px;
                    display: table;
                }
                .wiadOdeMnie{
                    background-color:CornflowerBlue;

                }
                .wiadDoMnie{
                    background-color:lightgray;
                }
            }
        }
        input{
            display: block;
            text-align: center;
            width: 70vw;
            @media only screen and (max-width: 1200px) {
                width: 98vw;
            }
            margin: auto;
            padding: 1vh 0;
        }
        .wyslijBtn{
            margin-top: 2px;
            padding: 1.2vh;
        }
    }
</style>
