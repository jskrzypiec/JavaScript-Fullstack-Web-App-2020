const mongoose = require("../mongoose");
const Schema = mongoose.Schema;

const auctionSchema = new Schema({
    // czy "licytacja" czy "kup teraz"
    typ: {
        type: String
    },
    nazwa: {
        type: String
    },
    sprzedawca: {
        type: String
    },
    kupiec: {
        type: String
    },
    // cena do kupienia w wariancie "kup teraz" lub najwyższa oferta w wariancie "licytacji"
    cena: {
        type: Number
    },
    // kto dał najwyższą ofertę w wariancie "licytacji"
    ofertaKto: {
        type: String
    },
    czasDoKonca: {
        type: Number
    },
    czyZakonczona: {
        type: Boolean
    },
    ktoLicytowal: []
});

const Auction = mongoose.model("Auction", auctionSchema);

module.exports = Auction;
