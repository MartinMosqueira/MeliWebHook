const functions = require('firebase-functions/v1');
const { MercadoPagoConfig, Preference, Payment} = require("mercadopago");
const { crearUsuarioDePrueba } = require("./userdb");

const client = new MercadoPagoConfig({
    accessToken: "{your acces token mercadopago}"
  });
  
const preference = new Preference(client);
const payment = new Payment(client);

exports.crearLinkDePago = functions.https.onRequest(async (req, res) => {
    const { userId } = req.body;
    const externalReferenceData = JSON.stringify({ userId }); 

    if(!userId) {
        console.error("❌ Error: userId no proporcionado");
        return;
    }

    //test user db
    await crearUsuarioDePrueba();

    try {
        const body = {
          auto_return: "approved", 
          back_urls: { 
            success: "https://www.google.com",
            failure: "https://github.com",
            pending: "https://hackthebox.com"
          },
          statement_descriptor: "CityPooling",
          binary_mode: true,
          external_reference: externalReferenceData,
          items: [
            {
              title: "Comision por viaje CityPooling",
              quantity: 1,
              currency_id: "ARS",
              unit_price: 100
            }
          ],
        payment_methods: {
            excluded_payment_types: [{ id: "ticket" },{ id: "atm" }],
            excluded_payment_methods: [],
            installments: 6,
            default_payment_method_id: "account_money"
        },
          notification_url: "https://68ad-201-190-175-59.ngrok-free.app/miapppooling/us-central1/webhookPago",
          expires: false,
        };
    
        const result = await preference.create({ body });
        res.json({ init_point: result.init_point });
    
      } catch (err) {
        console.error("❌ Error al crear preferencia:", err);
        res.status(500).send("Error al crear preferencia");
      }

});

exports.webhookPago = functions.https.onRequest(async (req, res) => {
    const { type, data } = req.body;
  
    if (type === "payment") {
      const paymentId = data.id;
  
      try {
        const paymentData = await payment.get({ id: paymentId });
  
        console.log("✅ Pago recibido:", paymentId);
  
        const externalReference = paymentData.external_reference;
        const status = paymentData.status;
        const payerEmail = paymentData.payer.email;
        const price = paymentData.transaction_details.total_paid_amount;
  
        const admin = require("firebase-admin");
        const db = admin.firestore();
  
        if (status === "approved") {
          const { userId } = JSON.parse(externalReference);
  
          try {
            const userRef = db.collection("users").doc(userId);
            const userSnap = await userRef.get();
  
            if (!userSnap.exists) {
              console.error("❌ Usuario no encontrado:", userId);
            } else {
              console.log("✅ Usuario encontrado:", userId);
  
              const userData = userSnap.data();
              const nuevoSaldo = userData.saldo - price;
  
              await userRef.update({ saldo: nuevoSaldo });
  
              const pagoData = {
                fecha: new Date(),
                userID_emisor: userRef,
                userID_receptor: null,
                monto: price,
                idPagoMP: paymentId,
                fuePorMP: true,
                status: status,
                referencePago: externalReference,
              };
  
              await userRef.collection("pagos").add(pagoData);
  
              console.log("✅ Saldo actualizado y pago registrado");
            }
  
          } catch (err) {
            console.error("❌ Error actualizando usuario o guardando pago:", err);
          }
        } else {
          console.log("ℹ️ El pago no está aprobado:", status);
        }
  
      } catch (err) {
        console.error("❌ Error consultando pago:", err);
      }
    } else {
      console.log("📩 Webhook recibido de tipo no relevante:", type);
    }

    return res.status(200).send("OK");
  });
  
