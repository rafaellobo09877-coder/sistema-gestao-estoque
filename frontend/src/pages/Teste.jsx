import { useState } from "react";
import { createMovement } from "../services/movement";

export default function Teste() {
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");

  async function enviar() {
    await createMovement({
      productId: Number(productId),
      type: "entrada",
      quantity: Number(quantity)
    });

    alert("Funcionou 🚀");
  }

  return (
    <div>
      <h2>Teste API</h2>

      <input
        placeholder="Produto ID"
        onChange={e => setProductId(e.target.value)}
      />

      <input
        placeholder="Quantidade"
        onChange={e => setQuantity(e.target.value)}
      />

      <button onClick={enviar}>Enviar</button>
    </div>
  );
}