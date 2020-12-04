const functions = require("firebase-functions");
const cors = require("cors")({ origin: true });
const admin = require("firebase-admin");
const serviceAccount = require("./services.json");
const adminAccount = require("./pizzabotAdmin.json");
const shortid = require("shortid");
const { WebhookClient } = require("dialogflow-fulfillment");
const { SessionsClient } = require("dialogflow");

admin.initializeApp({
  credential: admin.credential.cert(adminAccount),
  databaseURL: "https://pizzabot-dvhugi.firebaseio.com",
});

exports.dialogflowGateway = functions.https.onRequest((request, response) => {
  cors(request, response, async () => {
    try {
      const { queryInput, sessionId } = request.body;

      const sessionClient = new SessionsClient({ credentials: serviceAccount });
      const session = sessionClient.sessionPath("pizzabot-dvhugi", sessionId);

      const responses = await sessionClient.detectIntent({
        session,
        queryInput,
      });

      const result = responses[0].queryResult;

      response.send(result);
    } catch (error) {
      console.log(error);
    }
  });
});

exports.dialogflowWebhook = functions.https.onRequest(
  async (request, response) => {
    const agent = new WebhookClient({ request, response });

    const result = request.body.queryResult;

    async function userOnboardingHandler(agent) {
      // Do backend stuff here
      const db = admin.firestore();
      const orderId = shortid.generate();
      const profile = db.collection("orders").doc(orderId);
      const { name } = result.parameters;
      console.log("method invocked");
      // set status
      let status = "On it's way";
      let feedback = "";
      await profile.set({ name, status, feedback });
      setTimeout(function () {
        profile.update({ status: "Delivered" });
      }, 2 * 60000);
      const response = `Thank you for placing the order.Your order id is ${orderId},please remember it for further queries.`;
      agent.add(response);
    }
    async function orderStaus(agent) {
      const { orderId } = result.parameters;
      console.log(orderId);
      const db = admin.firestore();
      let cityRef = db.collection("orders").doc(orderId);
      let getDoc = await cityRef.get();
      let num = getDoc._fieldsProto.status.stringValue;
      const response = `Your order status: ${num}. Thank you `;
      agent.add(response);
    }

    async function feedBack(agent) {
      const { orderId, feedback } = result.parameters;
      console.log(orderId);
      const db = admin.firestore();
      let order = db.collection("orders").doc(orderId);
      await order.update({ feedback: feedback });
      let getDoc = await order.get();
      let name = getDoc._fieldsProto.name.stringValue;
      const response = `Thank you for the feedback ${name}`;
      agent.add(response);
    }
    async function cancelOrder(agent) {
      const { orderId } = result.parameters;
      console.log(orderId);
      const db = admin.firestore();
      let order = db.collection("orders").doc(orderId);
      await order.update({ status: "Cancellation in progress" });
      setTimeout(function () {
        order.update({ status: "Cancelled" });
      }, 1 * 60000);
      let getDoc = await order.get();
      let name = getDoc._fieldsProto.name.stringValue;
      const response = `Your cancellation is in progress ${name}.Please check back after 1 min.Thank you`;
      agent.add(response);
    }

    async function refund(agent) {
      const { orderId } = result.parameters;
      console.log(orderId);
      const db = admin.firestore();
      let order = db.collection("orders").doc(orderId);
      await order.update({ status: "Refund in progress" });
      setTimeout(function () {
        order.update({ status: "Refunded" });
      }, 1 * 60000);
      let getDoc = await order.get();
      let name = getDoc._fieldsProto.name.stringValue;
      const response = `Your refund is in progress ${name}.Please check back after 1 min.Thank you`;
      agent.add(response);
    }

    async function exchange(agent) {
      const { orderId } = result.parameters;
      console.log(orderId);
      const db = admin.firestore();
      let order = db.collection("orders").doc(orderId);
      await order.update({ status: "Exchange in progress" });
      setTimeout(function () {
        order.update({ status: "Exchange completed" });
      }, 1 * 60000);
      let getDoc = await order.get();
      let name = getDoc._fieldsProto.name.stringValue;
      const response = `Your exchange is in progress ${name}.Please check back after 1 min.Thank you`;
      agent.add(response);
    }

    let intentMap = new Map();
    intentMap.set("placeOrder", userOnboardingHandler);
    intentMap.set("orderStatus", orderStaus);
    intentMap.set("feedback", feedBack);
    intentMap.set("exchange", exchange);
    intentMap.set("refund", refund);
    intentMap.set("cancel", cancelOrder);
    agent.handleRequest(intentMap);
  }
);

exports.getOrderId = () => {};
