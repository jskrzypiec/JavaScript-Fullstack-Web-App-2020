const express = require("express");
const session = require("express-session");
const SessionStore = require("memorystore")(session);
const cors = require("cors");
const cookieParser = require("cookie-parser");
const passportSocketIo = require("passport.socketio");

// drobiazgi do sprawnego i czytelnego logowania
const logger = require("morgan");
const errorHandler = require("errorhandler");

// modele bazy danych
const User = require("./model/user");
const Message = require("./model/message");
const Auction = require("./model/auction");

const secret = process.env.SECRET || "t4jn3 b4rdz0";
const key = "express.sid";
const sessionStorage = new SessionStore({
    checkPeriod: 86400000
});
const env = process.env.NODE_ENV || "development";
const port = process.env.PORT || 3000;

const app = express();

// Middleware
// app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(session({
    key: key,
    secret: secret,
    resave: false,
    saveUninitialized: false,
    store: sessionStorage
}));

app.use(cors());
app.use(cookieParser());

if (env === "development") {
    app.use(logger("dev"));
    app.use(errorHandler());
} else {
    app.use(logger("short"));
}

// używamy Passport.js do obł. autoryzacji
const passport = require("./passport");
app.use(passport.initialize());
app.use(passport.session());

// routing
const routes = require("./routes/index");
app.use("/", routes);

// vue js build for production
app.use(express.static("dist"));
// app.use("/", routes);

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use((req, res) => {
    res.status(404).json({
        error: `Niepoprawne żądanie: ${req.method} ${req.originalUrl}`
    });
});
app.set("trust proxy", 1);

// https
const server = require("./https")(app);
server.listen(port, () => console.log(`Server started on port :${port}`));

// // // // //
//  Socket  //
// // // // //
const socket = require("socket.io");
const io = socket(server);

const onAuthorizeSuccess = (data, accept) => {
    console.log("UDAŁO się połączyć z socketIo (passport).");
    accept();
};

const onAuthorizeFail = (data, message, error, accept) => {
    if (error) {
        throw new Error(message);
    }
    console.log("NIE UDAŁO się połączyć z socketIo (passport).");
    accept(new Error("Brak autoryzacji"));
};

io.use(passportSocketIo.authorize({
    cookieParser: cookieParser,
    key: key,
    secret: secret,
    store: sessionStorage,
    success: onAuthorizeSuccess,
    fail: onAuthorizeFail
}));

// do wysyłania danych aukcji - interval
let czyWysylacAukcje = false;
let aukcjeArray = [];
let aukcjeInterval = null;
// let i = 0;
setInterval(() => {
    // i++;
    // console.log("i:" + i);
    // pobranie aukcji z DB
    Auction.find({}).sort({ czyZakonczona: 1, czasDoKonca: 1 }).exec((err, auctions) => {
        if (err) {
            console.log(err);
        } else {
            aukcjeArray = auctions;
            // zmiana czasu aukcji (o ile nie są zakończone)
            aukcjeArray.forEach(aukcja => {
                if (aukcja.czasDoKonca < 1 && aukcja.czyZakonczona === false) {
                    // jeżeli czas aukcji typu "licytacja" się skończył - ustawienie kto zwyciężył (o ile ktoś licytował)
                    if (aukcja.typ === "licytacja") {
                        if (aukcja.ofertaKto !== "") {
                            aukcja.kupiec = aukcja.ofertaKto;
                        }
                    }
                    aukcja.czyZakonczona = true;
                }
                if (aukcja.czasDoKonca > 0) {
                    aukcja.czasDoKonca--;
                }
                aukcja.save();
            });
        }
    });
}, 1000);
// Lista użytkowników podłączonych do czatu
let connectedUsers = [];
io.on("connection", (socket) => {
    // dodanie użytkownika do listy zalogowanych (o ile go tam nie ma)
    /* let czyDodacDoConnected = true;
    connectedUsers.forEach(el => {
        if (el.userName === socket.request.user.username) {
            czyDodacDoConnected = false;
        }
    }); */
    // if (czyDodacDoConnected) {
    connectedUsers.push({ userId: socket.request.user.id, userName: socket.request.user.username, socketId: socket.id });
    // }
    let zarejestrowaniUzytkownicy = [];

    socket.on("zarejestrowaniUzytkownicy_req", (data) => {
        User.find({}, (err, users) => {
            if (err) {
                console.log(err);
            } else {
                users.forEach((user) => {
                    zarejestrowaniUzytkownicy.push(user.username);
                });
                io.sockets.emit("zarejestrowaniUzytkownicy_res", zarejestrowaniUzytkownicy);
            }
        });
    });

    socket.on("cntUsersPrint", (data) => {
        console.log("connected:", connectedUsers);
    });

    socket.on("prywatneWiadomosci_req", (data) => {
        Message.find({}, (err, messages) => {
            if (err) {
                console.log(err);
            } else {
                io.sockets.emit("prywatneWiadomosci_res", messages);
            }
        });
    });

    // wysłanie wiadomości na chacie dla wszystkich
    socket.on("chatGlobalnyKlient", (data) => {
        let globalMsg = {
            messageFrom: socket.request.user.username,
            message: data.message
        };
        io.sockets.emit("chatGlobalnySerwer", globalMsg.messageFrom + " (do wszystkich): " + globalMsg.message);
    });

    // wysyłanie wiadomości do konkretnego użytkownika
    socket.on("chattPrywatny", (data) => {
        let message = new Message({
            messageFrom: socket.request.user.username,
            message: data.message,
            messageTo: data.sendMessageTo
        });
        connectedUsers.forEach(connectedUser => {
            if (connectedUser.userName === data.sendMessageTo) {
                // wysłanie do pojedynczego
                // console.log("wysylanie do: ", connectedUser.socketId);
                socket.broadcast.to(connectedUser.socketId).emit("chat", {
                    od: socket.request.user.username,
                    wiad: data.message,
                    do: data.sendMessageTo
                });
            }
        });
        message.save();
    });

    socket.on("disconnectFromChat", () => {
        connectedUsers = connectedUsers.filter(item => item.socketId !== socket.id);
        if (connectedUsers.length < 1) {
            czyWysylacAukcje = false;
            clearInterval(aukcjeInterval);
            aukcjeInterval = null;
        }
    });

    // // // // //
    //  AUKCJE  //
    // // // // //
    socket.on("wysylacAukcjeStart", () => {
        if (!czyWysylacAukcje) {
            czyWysylacAukcje = true;
        }
        // let j = 0;
        if (czyWysylacAukcje && aukcjeInterval === null) {
            aukcjeInterval = setInterval(() => {
                // j++;
                // console.log("j:" + j);
                io.sockets.emit("wyslaneAukcjeServer", aukcjeArray);
            }, 1000);
        }
    });

    socket.on("licytacja", (data) => {
        // wysłanie innym użytkownikom informacji o licytacji aukcji
        // console.log(data);
        socket.broadcast.emit("licytacja_ToUsers", {
            aukcjaId: data.aukcjaId,
            oferta: data.oferta,
            i: data.i
        });
        Auction.findById(data.aukcjaId, (err, aukcja) => {
            if (err) {
                console.log(err);
            } else {
                // jeżeli licytuje ktoś inny już sprzedawca (i aukcja nie jest zakonczona)
                if (aukcja.ofertaKto !== aukcja.sprzedawca && !aukcja.czyZakonczona) {
                    // zmiana nowej oferty (kto, ile) i zapisanie w DB
                    aukcja.cena = data.oferta;
                    aukcja.ofertaKto = socket.request.user.username;
                    if (!aukcja.ktoLicytowal.includes(aukcja.ofertaKto)) {
                        aukcja.ktoLicytowal.push(aukcja.ofertaKto);
                    }
                    aukcja.save();
                }
            }
        });
    });

    socket.on("kupTeraz", (data) => {
        // wysłanie innym użytkownikom informacji o kupnie aukcji - aby można było im szybciej 'zablokować'
        // możliwość kupowania tej samej aukcji
        socket.broadcast.emit("kupTeraz_ToUsers", {
            aukcjaId: data.aukcjaId,
            i: data.i
        });
        Auction.findById(data.aukcjaId, (err, aukcja) => {
            if (err) {
                console.log(err);
            } else {
                // jeżeli kupuje ktoś inny niż sprzedawca (i aukcja nie jest zakonczona)
                if (aukcja.sprzedawca !== socket.request.user.username && !aukcja.czyZakonczona) {
                    // zmiana aukcji w DB - (czyZakonczona=true, czasDoKonca=0 i kto kupił)
                    aukcja.czyZakonczona = true;
                    aukcja.czasDoKonca = 0;
                    aukcja.kupiec = socket.request.user.username;
                    aukcja.save();
                }
            }
        });
    });
});
