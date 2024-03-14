const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const secp = require("ethereum-cryptography/secp256k1")
const { keccak256 } = require("ethereum-cryptography/keccak");
const { utf8ToBytes, toHex } = require("ethereum-cryptography/utils");

app.use(cors());
app.use(express.json());

const balances = {
  "03daef2d9cc05369f7a23a665313d9a62cbae210a7f809fc2661e48e1de694f14f": 100,
  "0215b57056a9b78376e78ae1f8abe80ba02784f739a067007ad99057e37efe3289": 50,
  "021f7e1d2645782d29f0fa35b085dede240f1dac329d652fbf3467c162a94e42fe": 75,
};


app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  let { signature, recipient, amount, msg } = req.body;

  let msgByte = utf8ToBytes(msg)
  let msgHash = keccak256(msgByte)

  signature = JSON.parse(signature)
  signature.r = BigInt(signature.r)
  signature.s = BigInt(signature.s)

  const sign = new secp.secp256k1.Signature(
    signature.r,
    signature.s,
    signature.recovery
  );

  const recoverPublicKey = sign.recoverPublicKey(toHex(msgHash));
  const isValid = secp.secp256k1.verify(sign, toHex(msgHash), recoverPublicKey.toHex())

  setInitialBalance(recoverPublicKey.toHex());
  setInitialBalance(recipient);

  if (balances[recoverPublicKey.toHex()] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[recoverPublicKey.toHex()] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[recoverPublicKey.toHex()] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
