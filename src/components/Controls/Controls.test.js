import React from 'react';
import ReactDOM from 'react-dom';
import Controls from './Controls';

it('renders without crashing', () => {
  const controlsConfig = {
    view: [],

    filter: {
      display: false,
    },
  };

  const div = document.createElement('div');
  ReactDOM.render(<Controls controlsConfig={controlsConfig} dataDefs={[]} />, div);
});
