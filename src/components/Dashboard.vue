<template>
    <div>
        <h2>Dashboard</h2>
        <p>Name: {{ test }}</p>
    </div>
</template>

<script>
import axios from "axios";
export default {
    data () {
        return {
            test: "dashboard text"
        };
    },
    methods: {
        daneUzytkownika: () => {
            axios.get("/api/login")
                .then((response) => {
                    console.log(response);
                })
                .catch((errors) => {
                    console.log(errors);
                });
        }
    },
    mounted () {
        this.daneUzytkownika();
    }
};
</script>

<style lang="scss" scoped>
</style>
