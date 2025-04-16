const functions = require("firebase-functions/v1");
const {MercadoPagoConfig, Payment} = require("mercadopago");

const client = new MercadoPagoConfig({
  accessToken: "{your acces token mercadopago}",
});

const payment = new Payment(client);

exports.webhookPayment = functions.https.onRequest(async (req, res) => {
  const {type, data} = req.body;

  if (type === "payment") {
    const paymentId = data.id;

    try {
      const paymentData = await payment.get({id: paymentId});

      console.log("✅ Pago recibido");

      // important payment data
      const externalReference = paymentData.external_reference;
      const status = paymentData.status;
      const title = paymentData.description;
      const price = paymentData.transaction_details.total_paid_amount;

      const admin = require("firebase-admin");
      const db = admin.firestore();

      if (status === "approved") {
        // connect to database and update user
        const {uid} = JSON.parse(externalReference);
        try {
          const userRef = db.collection("users").doc(uid);
          const userSnap = await userRef.get();
          if (
            !userSnap.exists ||
            !userSnap.data().mercadoPago?.estaAutorizado
          ) {
            console.error(
              "❌ Usuario no encontrado o no autorizado con MP: ",
              uid,
            );
          } else {
            // update saldo
            const currentSaldo = userSnap.data().saldo || 0;
            const newSaldo = currentSaldo + price;
            await userRef.update({
              saldo: newSaldo,
            });
            console.log("✅ Saldo actualizado con éxito");

            // create payment history
            const newPayment = {
              descripcion: title,
              fecha: new Date().toLocaleString("es-AR", {
                timeZone: "America/Argentina/Buenos_Aires",
              }),
              fuePorMP: true,
              idPagoMP: paymentId,
              monto: price,
              tipo: "tasaServicio",
              userID_emisor: uid,
              userID_receptor: "",
              viajeRef: "",
            };

            await db.collection("historialPagos").add(newPayment);
            console.log("✅ Historial de pago agregado con éxito");
          }
        } catch (err) {
          console.error("❌ Error al buscar el usuario:", err);
        }
      }
    } catch (err) {
      console.error("❌ Error al consultar el pago:", err);
    }
  }

  res.sendStatus(200);
});
