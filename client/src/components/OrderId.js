import React, { Component } from "react";
import ChatBot, { Loading } from "react-simple-chatbot";
import PropTypes from "prop-types";
class Orderid extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      result: null,
      trigger: false,
    };

    this.triggetNext = this.triggetNext.bind(this);
  }

  async componentWillMount() {
    const self = this;
    const { previousStep } = this.props;
    const url = "https://yo-yo-pizza.herokuapp.com/chat";
    const data = {
      sessionId: "foo",
      queryInput: {
        text: {
          text: previousStep.value,
          languageCode: "en-US",
        },
      },
    };

    try {
      // Default options are marked with *
      const response = await fetch(url, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, *cors, same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        headers: {
          "Content-Type": "application/json",
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer", // no-referrer, *client
        body: JSON.stringify(data), // body data type must match "Content-Type" header
      });
      const result = await response.json();
      console.log(JSON.stringify(result));
      const responseAnswer = result.fulfillmentMessages[0].text.text[0];
      console.log("order", responseAnswer);
      if (responseAnswer) {
        self.setState(
          {
            loading: false,
            result: responseAnswer,
            trigger: true,
          },
          () => self.triggetNext(responseAnswer)
        );
      } else {
        self.setState(
          {
            loading: false,
            result: "Error with the info you have given.Please check",
          },
          () => self.triggetNext("Thank you")
        );
      }
    } catch (error) {
      self.setState({ loading: false, result: `Error ${error}` }, () =>
        self.triggetNext("Thank you")
      );
    }
  }

  componentDidMount() {}

  triggetNext(response) {
    if (response.includes("Thank you")) {
      this.props.triggerNextStep({ value: null, trigger: "Greet" });
    } else {
      this.props.triggerNextStep();
    }
  }

  render() {
    console.log("props==>", this.props);
    const { trigger, loading, result } = this.state;

    return (
      <div className="Orderid">{loading ? <Loading /> : <p>{result}</p>}</div>
    );
  }
}

Orderid.propTypes = {
  steps: PropTypes.object,
  triggerNextStep: PropTypes.func,
};

Orderid.defaultProps = {
  steps: undefined,
  triggerNextStep: undefined,
};

export default Orderid;
