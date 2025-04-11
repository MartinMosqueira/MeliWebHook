const express = require("express");
const path = require("path");
const { MercadoPagoConfig, Preference, Payment } = require("mercadopago");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));


const client = new MercadoPagoConfig({
  accessToken: "APP_USR-3574098269162249-040816-701d222d34f57029c2d0325cd437f07f-315320402" //acces token de produccion de la cuenta de mercadopago
});

const preference = new Preference(client);
const payment = new Payment(client);

//=======Primera Cloud Function=======
//Esta función crea un link de pago y lo devuelve al cliente
app.post("/crear-link", async (req, res) => {
  try {
    const body = {
      auto_return: "approved", //redireccionar al usuario a la url de success de back_urls si el pago es aprobado
      back_urls: {  //url de redireccionamiento
        success: "https://www.google.com", //en caso de que el pago sea aprobado
        failure: "https://github.com", //en caso de que el pago sea rechazado
        pending: "https://hackthebox.com"  //en caso de que el pago quede pendiente
      },
      statement_descriptor: "CityPooling", //texto que aparece en el resumen de la tarjeta del comprador
      binary_mode: true, //Si lo ponés en true, el pago solo puede ser aprobado o rechazado, sin estados intermedios como pendiente.
      external_reference: "user info backend", //datos que puedo traerme del backend para identificar al usuario.
      items: [ //pago que el usuario va a realizar
        {
          title: "Comision por viaje CityPooling", //que esta pagando
          quantity: 1,
          currency_id: "ARS", //moneda
          unit_price: 100
        }
      ],
      payer: { //sirve para los test ya que con la integarcion de mercadopago checkoutPRO el usuario lo autocompleta
        email: "test_user_12398378192@testuser.com",
        name: "Juan",
        surname: "Lopez",
        phone: {
            area_code: "11",
            number: "1523164589"
        },
        identification:{
            type: "DNI",
            number: "12345678"
        },
        address: {
            street_name: "Street",
            street_number: 123,
            zip_code: "1406"
        }
    },
    payment_methods: {
        excluded_payment_types: [{ id: "ticket" },{ id: "atm" }], //excluye tipos de pago (por ej., "ticket" para efectivos como pago facil y rapipago).
        excluded_payment_methods: [], //excluye métodos específicos (por ej., "visa").
        installments: 6, //maximo de cuotas permitidas
        default_payment_method_id: "account_money" //método de pago por defecto en este caso dinero de mercadopago
    },
      notification_url: "https://1d1a-201-190-175-59.ngrok-free.app/api/webhook", //url a la que se envian los webhooks
      expires: false, //el link va a expirar si es true
      //expiration_date_from: "2024-01-01T12:00:00.000-04:00", //fecha de inicio de validez del link
      //expiration_date_to: "2024-12-31T12:00:00.000-04:00" //fecha de fin de validez del link
    };

    const result = await preference.create({ body });
    res.json({ init_point: result.init_point }); //url de pago

  } catch (err) {
    console.error("❌ Error al crear preferencia:", err);
    res.status(500).send("Error al crear preferencia");
  }
});

//=======Segunda Cloud Function=======
//Esta función es la que recibe el webhook y lo procesa
app.post("/api/webhook", async (req, res) => {
  const { type, data } = req.body;

  if (type === "payment") {
    const paymentId = data.id;

    try {
      const paymentData = await payment.get({ id: paymentId }); //esto es lo mismo que ejecutar el endpoint de mercado pago: GET /v1/payments/:id

      console.log("✅ Pago recibido:", paymentData);

      // Datos que me parecieron importantes para extraer del pago relizado o link de pago
      const externalReference = paymentData.external_reference; //referencia externa o datos de la db o backend
      const status = paymentData.status; //estado del pago (approved, pending, rejected)
      const payerEmail = paymentData.payer.email;

      console.log("Referencia externa:", externalReference);
      console.log("Estado del pago:", status);
      console.log("Email del pagador:", payerEmail);

    } catch (err) {
      console.error("❌ Error al consultar el pago:", err);
    }
  }

  res.sendStatus(200); //esto hay que devolverlo simpre te lo pide el webhook de mercadopago
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
