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
  "02dee06659453d6acd8475f600a1a73837b56fb69d5871c8fb89c69f348d4fe669": 100,
  "02f999da96295c5d620fc399c2bcce88b1cc6292164b796848ae280e054bd44671": 50,
  "03b715f9eb43bf55b90c4b01c595da4b0f4e33f455d3ce2dc430137241cea11118": 75,
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
  console.log(isValid)
  console.log(recoverPublicKey.toHex())

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
