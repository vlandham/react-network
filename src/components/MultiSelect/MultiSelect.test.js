import React from 'react';
import ReactDOM from 'react-dom';
import MultiSelect from './MultiSelect';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<MultiSelect />, div);
});
