import React, { Component } from 'react';

import AutoWidth from '../AutoWidth/AutoWidth';
import Controls from '../Controls/Controls';
import SidebarPage from '../SidebarPage/SidebarPage';
import Network from '../NetworkView/Network';

import dataDefs from './dataDefs.json';
import controlsConfig from './controlsConfig.json';

const FAKE_GRAPH = {
  nodes: [{ id: 'a' }, { id: 'b' }],
  edges: [{ source: 'a', target: 'b' }],
};

class App extends Component {
  renderSidebar() {
    return (
      <Controls data={[]} dataDefs={dataDefs} controlsConfig={controlsConfig}>
        <h2>Network Exploration</h2>
      </Controls>
    );
  }
  render() {
    return (
      <SidebarPage name="App" sidebar={this.renderSidebar()}>
        <h1>Network Exploration</h1>
        <AutoWidth>
          <Network graph={FAKE_GRAPH} />
        </AutoWidth>
      </SidebarPage>
    );
  }
}

export default App;
