<template>
    <div class="mainDiv">
        <div class="logowanie">
            <h2>Logowanie</h2>
            <input type="text" v-model="username" placeholder="Login"><br/>
            Podaj login<br/>
            <input type="password" v-model="password" placeholder="Hasło"><br/>
            Podaj hasło<br/>
            <button @click="login">Zaloguj</button>
            <h3 v-if="logowanieMsg!==''" class="komunikat">{{logowanieMsg}}</h3>
        </div>
    </div>
</template>

<script>
import axios from "axios";
export default {
    data () {
        return {
            username: "",
            password: ""
        };
    },
    methods: {
        login () {
            const data = {
                username: this.username,
                password: this.password
            };
            // console.log("-logowanie");
            axios.post("/api/login", data)
                .then((response) => {
                    // console.log("Zalogowano");
                    // console.log(response.data);
                    this.$store.state.czyZalogowany = true;
                    this.$store.state.logowanieMsg = "Poprawnie zalogowano";
                    this.$store.state.user = this.username;
                    // wyczyszczenie pól
                    this.username = "";
                    this.password = "";
                    // wyczyszczenie 'ostatniaWiadChatu' po zalogowaniu
                    this.$store.state.ostatniaWiadChatu = "";
                    // redirect
                    this.$router.push("/");
                })
                .catch((errors) => { // 401- unauthorized
                    // console.log("Nie zalogowano");
                    this.$store.state.logowanieMsg = "BŁĄD - niepoprawny login lub/i hasło";
                    this.$store.state.czyZalogowany = false;
                });
        }
    },
    computed: {
        logowanieMsg () {
            return this.$store.state.logowanieMsg;
        }
    }
};
</script>

<style lang="scss" scoped>
    .mainDiv{
        margin: 2vh;
        background-color:white;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        overflow: auto;
    }
    .logowanie{
        width: 50%;
        h2{
            margin: 0;
        }
        input{
            text-align: center;
            width:100%;
            margin-top: 2vh;
            padding: 0.5vh;
        }
        button{
            margin-top: 2vh;
        }
        .komunikat{
            font-style: italic;
            font-weight: bold;
            color: darkred;
        }
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
</style>
