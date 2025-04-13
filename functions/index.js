const functions = require('firebase-functions/v1');
const { MercadoPagoConfig, Preference, Payment} = require("mercadopago");

const client = new MercadoPagoConfig({
    accessToken: "{your acces token mercadopago}"
  });
  
const preference = new Preference(client);
const payment = new Payment(client);

exports.crearLinkDePago = functions.https.onRequest(async (req, res) => {
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
          external_reference: "dato desde la db",
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
          notification_url: "https:{your url cloud funtion webhookPago}/api/webhook",
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

      console.log("✅ Pago recibido:");

      const externalReference = paymentData.external_reference;
      const status = paymentData.status;
      const payerEmail = paymentData.payer.email;

      console.log("Referencia externa:", externalReference);
      console.log("Estado del pago:", status);
      console.log("Email del pagador:", payerEmail);

    } catch (err) {
      console.error("❌ Error al consultar el pago:", err);
    }
  }

  res.sendStatus(200);
});
