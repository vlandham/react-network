import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import './HelpIcon.scss';

import { Tooltip } from 'react-tippy';
import { HelpIcon as Help } from '../../components/Icons/Icons';

class HelpIcon extends PureComponent {
  static propTypes = {
    text: PropTypes.string,
  };

  static defaultProps = {
    text: '',
  };

  render() {
    const { text } = this.props;

    return (
      <Tooltip
        // options
        title={text}
        position="top"
        trigger="click"
        theme="light"
        className="HelpTooltip"
      >
        <Help className="HelpIcon" />
      </Tooltip>
    );
  }
}

export default HelpIcon;
