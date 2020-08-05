import React from "react";
import { HashRouter, withRouter, Switch, Route } from "react-router-dom";
import { Layout } from "./containers";

const Main = withRouter((props) => <Layout {...props} />);

export default () => {
  return (
    <HashRouter>
      <Main>
        <Switch></Switch>
      </Main>
    </HashRouter>
  );
};
