async function createKey() {
    var result = "";
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
    var charactersLength = characters.length;
    for ( var i = 0; i < 40; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    };
    return result;
};

module.exports = createKey;