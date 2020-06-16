<template>
    <div class="mainDiv">
        <div class="logowanie">
            <h2>Rejestracja</h2>
            <input type="text" v-model="username" placeholder="Login"><br/>
            To będzie Twoja nazwa użytkownika<br/>
            <input type="password" v-model="password" placeholder="Hasło"><br/>
            Hasło musi składać się z przynajmniej 3 znaków<br/>
            <button @click="register">Załóż konto</button>
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
        register () {
            const data = {
                username: this.username,
                password: this.password
            };
            // wyszczyszczenie pól
            this.username = "";
            this.password = "";
            // console.log("-rejestracja");
            axios.post("/api/register", data)
                .then((response) => {
                    // console.log("Rejestracja - sukces");
                    this.$store.state.logowanieMsg = "Poprawnie zarejestrowano, teraz możesz się zalogować";
                    this.$router.push("/login");
                })
                .catch((errors) => {
                    if (errors.response) {
                        // console.log("Error msg:", errors.response.data);
                        if (errors.response.status === 400 && errors.response.data === "za krótkie hasło") {
                            this.$store.state.logowanieMsg = "BŁĄD! Nie udało się zarejestrować - hasło zbyt krótkie (min. 3 znaki)";
                        } else if (errors.response.data.username) {
                            this.$store.state.logowanieMsg = "BŁĄD! Nie udało się zarejestrować - taki użytkownik już istnieje";
                        }
                    } else {
                        this.$store.state.logowanieMsg = "BŁĄD! Nie udało się zarejestrować";
                    }
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
            text-align:center;
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
