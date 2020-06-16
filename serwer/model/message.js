const mongoose = require("../mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    messageFrom: {
        type: String
    },
    message: {
        type: String
    },
    messageTo: {
        type: String
    }
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
