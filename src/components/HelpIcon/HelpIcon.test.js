import React from 'react';
import ReactDOM from 'react-dom';
import HelpIcon from './HelpIcon';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<HelpIcon />, div);
});
