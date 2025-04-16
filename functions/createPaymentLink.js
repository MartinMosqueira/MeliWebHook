const functions = require("firebase-functions/v1");
const {MercadoPagoConfig, Preference} = require("mercadopago");

const client = new MercadoPagoConfig({
  accessToken: "{your acces token mercadopago}",
});

const preference = new Preference(client);

exports.createPaymentLink = functions.https.onRequest(async (req, res) => {
  const {uid} = req.body;
  const externalReferenceData = JSON.stringify({uid});

  if (!uid) {
    return res.status(400).send("Faltan datos");
  }

  try {
    const body = {
      auto_return: "approved",
      back_urls: {
        success: "https://www.example.com",
        failure: "https://example.com",
        pending: "https://example.com",
      },
      statement_descriptor: "CityPooling",
      binary_mode: true,
      external_reference: externalReferenceData,
      items: [
        {
          title: "Comision por viaje CityPooling",
          quantity: 1,
          currency_id: "ARS",
          unit_price: 100,
        },
      ],
      payment_methods: {
        excluded_payment_types: [
          {id: "ticket"},
          {id: "atm"},
        ],
        excluded_payment_methods: [],
        installments: 6,
        default_payment_method_id: "account_money",
      },
      notification_url:
        "https:{your url cloud funtion webhookPago}/facupoolingfirebase-test/" +
        "us-central1/webhookPayment",
      expires: false,
    };

    const result = await preference.create({body});
    res.json({init_point: result.init_point});
  } catch (err) {
    console.error("❌ Error al crear preferencia:", err);
    res.status(500).send("Error al crear preferencia");
  }
});
