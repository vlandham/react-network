import React, { PureComponent } from 'react';
import { Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import Slider from 'rc-slider';
import Tooltip from 'rc-tooltip';
import * as d3 from 'd3';

import HelpIcon from '../HelpIcon/HelpIcon';
import MultiSelect from '../MultiSelect/MultiSelect';

import 'rc-slider/assets/index.css';
import './DisplayView.scss';

const createSliderWithTooltip = Slider.createSliderWithTooltip;
const Range = createSliderWithTooltip(Slider.Range);
const Handle = Slider.Handle;

const handle = props => {
  const { value, dragging, index, ...restProps } = props;
  return (
    <Tooltip
      prefixCls="rc-slider-tooltip"
      overlay={value}
      visible={dragging}
      placement="top"
      key={index}
    >
      <Handle value={value} {...restProps} />
    </Tooltip>
  );
};

const configShape = PropTypes.shape({
  description: PropTypes.string,
  id: PropTypes.string,
  label: PropTypes.string,
  type: PropTypes.string,
  values: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.string,
    }),
  ),
});

/**
 * This view displays and manages options for filtering the network view.
 */
class DisplayView extends PureComponent {
  static propTypes = {
    handleChange: PropTypes.func.isRequired,
    showCount: PropTypes.number,
    sortByConfig: configShape,
    viewConfigs: PropTypes.array.isRequired,
  };

  static defaultProps = {
    handleChange: () => {},
    viewConfigs: [],
  };

  /**
   *
   */
  constructor(props) {
    super(props);
    this.handleDisplayChange = this.handleDisplayChange.bind(this);
    this.handleDisplayClear = this.handleDisplayClear.bind(this);
    this.handleSelectAll = this.handleSelectAll.bind(this);
  }

  /**
   * handle change callbackc
   *
   * @param {String} id Id of option to change
   * @param {Any} value New Value
   */
  handleDisplayChange(id, value) {
    this.props.handleChange(id, value);
  }

  /**
   * Handle clear callback
   */
  handleDisplayClear() {
    const { viewConfigs } = this.props;

    viewConfigs.forEach(c => {
      this.props.handleChange(c.id, undefined);
    });
  }

  /**
   * Handle select all callback
   *
   * @param {Object} config The config for the option to select all of
   */
  handleSelectAll(config) {
    const values = config.values.map(v => v.value);
    this.props.handleChange(config.id, values);
  }

  /**
   * Renders dropdown
   *
   * @param {Object} config Config object for option
   */
  renderDropDown(config) {
    const currentValue = this.props[config.id];

    let help = null;

    if (config.description) {
      help = <HelpIcon text={config.description} />;
    }

    const multi = !!config.multi;

    let selectAll = null;
    if (config.selectAll) {
      selectAll = (
        <Button
          className="select-all"
          variant="link"
          onClick={this.handleSelectAll.bind(this, config)}
        >
          select all
        </Button>
      );
    }

    return (
      <div className="control-item" key={config.id}>
        <label htmlFor={config.id}>{config.label}</label>
        {help}
        <MultiSelect
          id={config.id}
          description={config.description}
          values={config.values}
          value={currentValue}
          label={config.label}
          handleChange={this.handleDisplayChange}
          multi={multi}
        />
        {selectAll}
      </div>
    );
  }

  /**
   *
   * @param {Object} config
   */
  renderSlider(config) {
    const [min, max] = config.range;

    let currentValue = this.props[config.id];
    if (currentValue === undefined || currentValue === null) {
      currentValue = config.default;
    }

    const step = config.step;

    const range = d3.range(min, max + 1, step);
    let marks = config.marks;

    if (!marks) {
      marks = range.reduce((memo, i) => {
        memo[i] = i;
        return memo;
      }, {});
    }

    return (
      <div className="control-item slider-option" key={config.id}>
        <label>
          {config.label}: {currentValue} {config.unit}
        </label>
        <Slider
          min={min}
          max={max}
          value={currentValue}
          marks={marks}
          step={step}
          onChange={value => {
            console.log('change value', value);
            this.handleDisplayChange(config.id, value);
          }}
          disabled={false}
          handle={handle}
        />
      </div>
    );
  }

  /**
   *
   * @param {Object} config
   */
  renderRange(config) {
    const [min, max] = config.range;

    const currentValue = this.props[config.id] || config.default;
    const step = config.step;

    const range = d3.range(min, max + 1, step);
    let marks = config.marks;

    if (!marks) {
      marks = range.reduce((memo, i) => {
        memo[i] = i;
        return memo;
      }, {});
    }

    return (
      <div className="control-item slider-option" key={config.id}>
        <label>
          {config.label}: {currentValue[0]} - {currentValue[1]} {config.unit}
        </label>
        <Range
          min={min}
          max={max}
          value={currentValue}
          marks={marks}
          step={step}
          onChange={value => {
            this.handleDisplayChange(config.id, value);
          }}
          disabled={false}
          handle={handle}
        />
      </div>
    );
  }

  /**
   *
   * @param {Object} config
   */
  renderTitle(config) {
    let reset = null;
    if (config.reset) {
      reset = (
        <div className="clear-link">
          <Button variant="link" onClick={this.handleDisplayClear}>
            clear
          </Button>
        </div>
      );
    }

    return (
      <div key={config.id} className="title-area">
        <div key={config.id} className="section-head">
          {config.label}
        </div>
        {reset}
      </div>
    );
  }

  /**
   *
   * @param {Obect} config
   */
  renderViewControl(config) {
    switch (config.type) {
      case 'slider': {
        return this.renderSlider(config);
      }
      case 'range': {
        return this.renderRange(config);
      }
      case 'title': {
        return this.renderTitle(config);
      }
      default: {
        return this.renderDropDown(config);
      }
    }
  }

  /**
   *
   */
  render() {
    const { viewConfigs } = this.props;

    return (
      <div className="DisplayOptions">
        <div className="title-area">
          <div className="section-head">View</div>
          <div className="clear-link">
            <Button variant="link" onClick={this.handleDisplayClear}>
              clear
            </Button>
          </div>
        </div>

        {viewConfigs.map(this.renderViewControl.bind(this))}
        <hr />
      </div>
    );
  }
}

export default DisplayView;
