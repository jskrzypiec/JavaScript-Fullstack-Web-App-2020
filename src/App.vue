<template>
    <div id="app">
        <app-header />
        <router-view id="mainComponent"/>
        <app-footer />
    </div>
</template>

<script>
import Header from "./components/Header.vue";
import Footer from "./components/Footer.vue";
export default {
    name: "App",
    components: {
        "app-header": Header,
        "app-footer": Footer
    }
};
</script>

<style lang="scss">
  body, html {
    input{
      &:disabled{
        cursor: not-allowed;
      }
    }
    button::-moz-focus-inner {
      border: 0;
    }
    button{
      outline: none;
      &:focus, &:active, &:visited, &:hover{
        outline: none;
      }
      cursor: pointer;
      padding: 1em;
      border-radius: 4px;
      border: none;
      background-color: forestgreen;
      color: white;
      &:hover{
        background-color: darkgreen;
      }
      &:active{
        background-color: crimson;
      }
      &:disabled{
        background-color: gray;
        cursor: not-allowed;
      }
    }
    font-family: Arial, Helvetica, sans-serif;
    margin: 0;
    padding: 0;
    background-color: #F0F0F0;
    display: grid;
    #app {
      height: 100vh;
      display: grid;
      grid-template-rows: 10% 85% 5%;
    }
    .powiadomienieButton{
      animation: blinkingButton 4s infinite;
      @keyframes blinkingButton {
        0%{
          background-color: forestgreen;
          box-shadow:  none;
        }
        50%{
          background-color: #DC1f4f;
          box-shadow: 0px 0px 12px 0px darkred;
        }
        100%{
          background-color: forestgreen;
          box-shadow: none;
        }
      }
    }
    .powiadomienieButton2{
      animation: blinkingButton2 4s infinite;
      @keyframes blinkingButton2 {
        0%{
          background-color: gray;
          box-shadow:  none;
        }
        50%{
          background-color: #DC1f4f;
          box-shadow: 0px 0px 12px 0px darkred;
        }
        100%{
          background-color: gray;
          box-shadow: none;
        }
      }
    }
    .powiadomienieAukcja{
      animation: blinkingAuction 4s infinite;
      @keyframes blinkingAuction {
        0%{
          background-color: white;
          box-shadow: indent 0px 0px 6px 0px darkred;
        }
        50%{
          background-color: #ffbbaa;
          box-shadow: 0px 0px 12px 0px darkred;
        }
        100%{
          background-color: white;
          box-shadow: indent 0px 0px 6px 0px darkred;
        }
      }
    }
    .powiadomienieHeaderLi{
      animation: blinkingHeaderLi 4s infinite;
      @keyframes blinkingHeaderLi {
        0%{
          background-color: white;
          box-shadow: inset 0px 0px 12px 0px darkred;
        }
        50%{
          background-color: crimson;
          box-shadow: inset 0px 0px 18px 0px darkred;
        }
        100%{
          background-color: white;
          box-shadow: inset 0px 0px 12px 0px darkred;
        }
      }
    }
  }
</style>
