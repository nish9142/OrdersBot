import Axios from "axios";
import React, { Component } from "react";
import ChatBot, { Loading } from "react-simple-chatbot";
import Orderid from "./OrderId";
export default class OrderBot extends Component {
  constructor(props) {
    super(props);
    this.steps = [
      {
        id: "Greet",
        message: "Hello, Welcome to our shop",
        trigger: "welcomeOptions",
      },
      {
        id: "welcomeOptions",
        options: [
          {
            value: "Can you please place my order?",
            label: "Place an order",
            trigger: "botQ",
          },
          {
            value: "I want to give feedback for my order?",
            label: "Feedback for an order",
            trigger: "botQ",
          },
          {
            value: "What is the status of the order?",
            label: "Status of an order",
            trigger: "botQ",
          },
          {
            value: "Operations",
            label: "Operations(return/exchange/cancellation)",
            trigger: "operations",
          },
        ],
      },
      {
        id: "botQ",
        component: <Orderid></Orderid>,
        asMessage: true,
        replace: false,
        waitAction: true,
        trigger: "userA",
      },
      {
        id: "userA",
        user: true,
        trigger: "botQ",
      },
      {
        id: "operations",
        options: [
          {
            value: "I want a refund",
            label: "refund",
            trigger: "botQ",
          },
          {
            value: "I want to exchange my product",
            label: "exchange",
            trigger: "botQ",
          },
          {
            value: "I want to cancel my order",
            label: "cancellation",
            trigger: "botQ",
          },
        ],
      },
    ];
    this.config = {
      width: "450px",
      height: "550px",
      floating: true,
    };
  }

  dialogFlow = (message) => {
    const url = "https://yo-yo-pizza.herokuapp.com/chat";
    const data = {
      sessionId: "foo",
      queryInput: {
        text: {
          text: message,
          languageCode: "en-US",
        },
      },
    };
    Axios.post(url, data);
  };

  render() {
    return <ChatBot steps={this.steps} {...this.config}></ChatBot>;
  }
}
