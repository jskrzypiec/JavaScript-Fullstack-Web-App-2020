<template>
    <div class="cont">
        <div class="home">
            <div>
                <h2>Strona główna serwisu aukcyjnego</h2>
                <h3 v-if="logowanieMsg!==''" class="komunikat">{{logowanieMsg}}</h3>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data () {
        return {
        };
    },
    computed: {
        logowanieMsg () {
            return this.$store.state.logowanieMsg;
        }
    },
    methods: {
    }
};
</script>

<style lang="scss" scoped>
    .cont{
        margin: 2vh;
        background-color:white;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        overflow: auto;
        .home{
            div{
                text-align: center;
                .komunikat{
                    font-style: italic;
                    font-weight: bold;
                    color: darkblue;
                }
            }
        }
    }
</style>
