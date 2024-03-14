// TO GENERATE RANDOM PUBLIC & PRIVATE KEYS

const secp = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { utf8ToBytes, toHex } = require("ethereum-cryptography/utils");

(async () => {

    const privateKey = secp.secp256k1.utils.randomPrivateKey();
    const publickey = secp.secp256k1.getPublicKey(privateKey)
    const msgHash = await utf8ToBytes("Hello World")
    const signature = await secp.secp256k1.sign(msgHash, privateKey)
    const recoverPublicKey = signature.recoverPublicKey(msgHash)
    const isValid = secp.secp256k1.verify(signature, msgHash, recoverPublicKey.toHex())

    console.log("Private Key:", toHex(privateKey))
    console.log("Public Key:", toHex(publickey))
    console.log("Hashed Message:", toHex(msgHash))
    console.log("Signature:", signature)
    console.log("Public Key Recovered:", recoverPublicKey.toHex())
    console.log(isValid)
})();
