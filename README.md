Mirar unicamente el index.js 🚧

### Requisitos 📄
- Crearse una integracion en meradopago de tipo checkout PRO, ya que la checkout API te pide que crees todo vos, hasta el formulario de pago.

### Pasos que hice yo para que funcionara todo 🚀
1-  Me cree una integracion en meradopago de tipo checkout PRO con mi cuenta personal.
2- Me cree mis credenciales de produccion.
3- Copie el token de produccion en mi codigo.
4- Use [Ngrok](https://ngrok.com) para que mi proyecto en local tenga una ip publica momentanea ya que le webhook de mercadopago nescesita encontrar esa funcion.
5- Cree el webhook en mercadopago con la ip publica completa es decir: ip Ngrok + /api/webhook.
6- Copie esa misma ip completa en mi codigo en la primera funcion del link de pago para que encuentre el webhook:
```javascript
notification_url: "Ip completa aca"
```
7- Instalar dependenias:
```shell
npm install
```
8- Levante el back:
```shell
node index.js
```
9- Acceder a localhost:3000, precionar pagar, y colocar una cuenta real para efectuar el pago.

10- Ver que larga la consola.

### ✅ Pasos que necesitas hacer o tener de lo anterior:
1 - 2 - 3 - 4: esto se deberia solucionar con las cloud functions? - 5 - 6 - 7: solo la de mercadopago.

### 👷 Que hay que hacer?
- La idea es generar dos cloud functions en firebase para las dos funciones del codigo.
- La primera funcion del link de pago guardaria el init point que retorna esta funcion, esta funcion almacena en si datos del pago y referencias que le queramos agregar como un userId, ordenId asociado a la base de datos del usuario que paga en `external_reference` por ejemplo. Todos estos datos se recuperan automaticamente despues con la segunda funcion del webhook. Esta funcion se ejecutaria al hacer click en algun boton de pago.
- La segunda funcion se traeria todos los datos de pago y referencias de la db en caso de haberlas, en esta cloud funcion se ejecutaria la logica de la db para actualizar el pago del usuario si esta aprobado o no.

### 💡 Datos y Links de ayuda

#### Como se que datos puedo poner en el link de pago de la primera funcion?
Mercado pago publico sus endpoints de su [API](https://documenter.getpostman.com/view/15366798/2sAXjKasp4#087c5319-6b99-4338-bec6-3dbfac4039be).

#### Lo que me largo la segunda funcion luego de ser ejecutada por el webhook despues de probar de realizar un pago de verdad con otra cuenta:

```javascript
Pago recibido: {
  accounts_info: null,
  acquirer_reconciliation: [],
  additional_info: {
    ip_address: '201.190.175.59',
    items: [ [Object] ],
    payer: {
      address: [Object],
      first_name: 'Juan',
      last_name: 'Lopez',
      phone: [Object]
    },
    tracking_id: 'platform:v1-blacklabel,so:ALL,type:N/A,security:none'
  },
  authorization_code: null,
  binary_mode: true,
  brand_id: null,
  build_version: '3.100.0-rc-15',
  call_for_authorize_id: null,
  captured: true,
  card: {},
  charges_details: [
    {
      accounts: [Object],
      amounts: [Object],
      client_id: 0,
      date_created: '2025-04-10T12:07:32.000-04:00',
      id: '107543285879-001',
      last_updated: '2025-04-10T12:07:32.000-04:00',
      metadata: [Object],
      name: 'mercadopago_fee',
      refund_charges: [],
      reserve_id: null,
      type: 'fee'
    }
  ],
  charges_execution_info: {
    internal_execution: {
      date: '2025-04-10T12:07:32.127-04:00',
      execution_id: '01JRG79QDYDXM1GP0VKTW8A5CD'
    }
  },
  collector_id: 315320401,
  corporation_id: null,
  counter_currency: null,
  coupon_amount: 0,
  currency_id: 'ARS',
  date_approved: '2025-04-10T12:07:32.000-04:00',
  date_created: '2025-04-10T12:07:32.000-04:00',
  date_last_updated: '2025-04-10T12:07:32.000-04:00',
  date_of_expiration: null,
  deduction_schema: null,
  description: 'Comision por viaje CityPooling',
  differential_pricing_id: null,
  external_reference: 'user info backend',
  fee_details: [ { amount: 4.1, fee_payer: 'collector', type: 'mercadopago_fee' } ],
  financing_group: null,
  id: 107543285879,
  installments: 1,
  integrator_id: null,
  issuer_id: '2005',
  live_mode: true,
  marketplace_owner: null,
  merchant_account_id: null,
  merchant_number: null,
  metadata: {},
  money_release_date: '2025-04-28T12:07:32.000-04:00',
  money_release_schema: null,
  money_release_status: 'pending',
  notification_url: 'https://1d1a-201-190-175-59.ngrok-free.app/api/webhook',
  operation_type: 'regular_payment',
  order: { id: '30222005573', type: 'mercadopago' },
  payer: {
    email: 'matiasmosqueira00@gmail.com',
    entity_type: null,
    first_name: null,
    id: '376621995',
    identification: { number: '20439349817', type: 'CUIL' },
    last_name: null,
    operator_id: null,
    phone: { number: null, extension: null, area_code: null },
    type: null
  },
  payment_method: { id: 'account_money', issuer_id: '2005', type: 'account_money' },
  payment_method_id: 'account_money',
  payment_type_id: 'account_money',
  platform_id: null,
  point_of_interaction: {
    business_info: {
      branch: 'Merchant Services',
      sub_unit: 'checkout_pro',
      unit: 'online_payments'
    },
    transaction_data: { e2e_id: null },
    type: 'CHECKOUT'
  },
  pos_id: null,
  processing_mode: 'aggregator',
  refunds: [],
  release_info: null,
  shipping_amount: 0,
  sponsor_id: null,
  statement_descriptor: null,
  status: 'approved',
  status_detail: 'accredited',
  store_id: null,
  tags: null,
  taxes_amount: 0,
  transaction_amount: 100,
  transaction_amount_refunded: 0,
  transaction_details: {
    acquirer_reference: null,
    external_resource_url: null,
    financial_institution: null,
    installment_amount: 0,
    net_received_amount: 95.9,
    overpaid_amount: 0,
    payable_deferral_period: null,
    payment_method_reference_id: null,
    total_paid_amount: 100
  },
  api_response: {
    status: 200,
    headers: [Object: null prototype] {
      date: [Array],
      'content-type': [Array],
      'transfer-encoding': [Array],
      connection: [Array],
      vary: [Array],
      'cache-control': [Array],
      'x-content-type-options': [Array],
      'x-request-id': [Array],
      'x-xss-protection': [Array],
      'strict-transport-security': [Array],
      'access-control-allow-origin': [Array],
      'access-control-allow-headers': [Array],
      'access-control-allow-methods': [Array],
      'access-control-max-age': [Array],
      'timing-allow-origin': [Array],
      'content-encoding': [Array]
    }
  }
}
Referencia externa: user info backend
Estado del pago: approved
Email del pagador: matiasmosqueira00@gmail.com
```
