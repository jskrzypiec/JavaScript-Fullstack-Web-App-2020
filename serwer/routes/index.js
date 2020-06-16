const express = require("express");

const router = express.Router();
const User = require("../model/user");
const Auction = require("../model/auction");

// Passport.js i narzędzie do szyfrowania haseł
const passport = require("../passport");
const bcrypt = require("../bcrypt");

router
    .route("/api/login")
    .get((req, res) => {
        // console.log(req.session);
        if (req.session.passport === undefined || req.session.passport.user === undefined) {
            res.send({
                isAuthenticated: false
            });
        } else {
            // console.log(req.session.passport.user);
            // console.log(req.isAuthenticated());
            res.send({
                isAuthenticated: true
            });
        }
    })
    .post(passport.authenticate("local"), async (req, res) => {
        res.send(true);
    });

router
    .route("/api/logout")
    .get((req, res) => {
        req.logout();
        res.send({
            isAuthenticated: false
        });
    });

router
    .route("/api/register")
    .post(async (req, res) => {
        try {
            if (req.body.password.length > 2) {
                const passwordHash = bcrypt.hash(req.body.password);
                const user = new User({
                    username: req.body.username,
                    password: passwordHash,
                    hasUnreadedMessages: false
                });
                const doc = await user.save();
                res.json(doc);
            } else {
                res.status(400).send("za krótkie hasło");
            }
        } catch (err) {
            if (!req.body.password) {
                // Unprocessable Entity
                res.status(422).json({
                    password: "Error – password must not be empty!"
                });
            } else {
                res.status(422).json(User.processErrors(err));
            }
        }
    });

// ile jest aukcji w serwisie
router
    .route("/api/aukcje/ile")
    .get((req, res) => {
        Auction.countDocuments({}).exec((err, result) => {
            if (err) {
                console.log(err);
                res.send(1);
            } else {
                res.send(result.toString());
            }
        });
    });

router
    .route("/api/aukcje/:skip/:limit")
    .get((req, res) => {
        let skip = parseInt(req.params.skip);
        let limit = parseInt(req.params.limit);
        Auction.find({}).sort({ czyZakonczona: 1, czasDoKonca: 1 }).skip(skip).limit(limit).exec((err, auctions) => {
            let auctionArray = [];
            if (err) {
                console.log(err);
                res.send(auctionArray); // pusta
            } else {
                auctions.forEach((auction) => {
                    auctionArray.push(auction);
                });
                res.send(auctionArray);
            }
        });
    });

router
    .route("/api/aukcje")
    .get((req, res) => {
        // sortowanie, aby te, które kończą się szybciej były wyżej
        // oraz żeby te, które się już skończyły były najniżej
        Auction.find({}).sort({ czyZakonczona: 1, czasDoKonca: 1 }).exec((err, auctions) => {
            let auctionArray = [];
            if (err) {
                console.log(err);
                res.send(auctionArray); // pusta
            } else {
                auctions.forEach((auction) => {
                    auctionArray.push(auction);
                });
                res.send(auctionArray);
            }
        });
    })
    .post(async (req, res) => {
        // console.log(req);
        const aukcja = new Auction({
            nazwa: req.body.nazwa,
            czasDoKonca: req.body.czasDoKonca,
            typ: req.body.typ,
            cena: req.body.cena,
            sprzedawca: req.user.username,
            kupiec: "",
            czyZakonczona: false
        });
        if (aukcja.typ === "licytacja") {
            aukcja.ofertaKto = "";
            aukcja.ktoLicytowal = [];
        }
        // console.log(aukcja);
        const auc = await aukcja.save();
        res.json(auc);
    });

router
    .route("/api/wyszukajAukcje/:tekstWysz")
    .get((req, res) => {
        let tekstWysz = req.params.tekstWysz;
        // $or: [{ nazwa: /zzz/ }, { sprzedawca: /zzz/ }]
        // { nazwa: { $regex: req.params.tekstWysz } }
        Auction.find({ $or: [{ nazwa: { $regex: tekstWysz } }, { sprzedawca: { $regex: tekstWysz } }] }).exec((err, auctions) => {
            let auctionArray = [];
            if (err) {
                console.log("errrrr");
                console.log(err);
                res.send(auctionArray); // pusta
            } else {
                auctions.forEach((auction) => {
                    auctionArray.push(auction);
                });
                res.send(auctionArray);
            }
        });
    });

module.exports = router;
