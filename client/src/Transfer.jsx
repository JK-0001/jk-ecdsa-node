import { useState } from "react";
import server from "./server";
import * as secp from "ethereum-cryptography/secp256k1";
import { keccak256 } from "ethereum-cryptography/keccak";
import { utf8ToBytes, toHex } from "ethereum-cryptography/utils"

function Transfer({ privateKey, setBalance }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    const msg = `Send ${sendAmount} to ${recipient}`
    let msgByte = utf8ToBytes(msg)
    let msgHash = keccak256(msgByte)

    let signature = secp.secp256k1.sign(msgHash, privateKey)
    let recoveryPublicKey = signature.recoverPublicKey(toHex(msgHash))

    let isValid = secp.secp256k1.verify(signature, toHex(msgHash), recoveryPublicKey.toHex())
    console.log(isValid)

    const replacer = (key, value) => {
      if (typeof value === "bigint") {
        return value.toString();
      }
      return value;
    };
    try {
      const {
        data: { balance },
      } = await server.post(`send`, {
        signature: JSON.stringify(signature, replacer),
        msg: msg,
        amount: parseInt(sendAmount),
        recipient,
      });
      setBalance(balance); 
    } catch (ex) {
      console.log(ex);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
