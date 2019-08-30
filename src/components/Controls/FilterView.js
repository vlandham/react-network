import React, { PureComponent } from 'react';
import { Button } from 'react-bootstrap';
import PropTypes from 'prop-types';

import MultiSelect from '../MultiSelect/MultiSelect';

import './FilterView.scss';

/**
 * This view displays and manages options for filtering the network view.
 */
class FilterView extends PureComponent {
  static propTypes = {
    filterConfigs: PropTypes.array,
    filters: PropTypes.object,
    handleChange: PropTypes.func.isRequired,
  };

  static defaultProps = {
    filters: {},
  };

  constructor(props) {
    super(props);

    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.handleFilterClear = this.handleFilterClear.bind(this);
  }

  handleFilterClear() {
    this.props.handleChange({});
  }

  handleFilterChange(filterId, filterValue) {
    const filterVals = this.props.filters;
    const newVal = Object.assign({}, filterVals, {
      [filterId]: filterValue,
    });
    this.props.handleChange(newVal);
  }

  renderFilterTitle(filter) {
    return (
      <div className="toggle-area">
        <label htmlFor="toggle-links">{filter.label}</label>
      </div>
    );
  }

  renderFilterSelect(filter) {
    const { filters, focusNode } = this.props;

    const disabled = Boolean(focusNode);

    const filterId = filter.id;
    let filterValue = filters[filterId];

    return (
      <MultiSelect
        key={`filter-control-${filter.id}`}
        id={filter.id}
        label={filter.label}
        addMultipleIds={filter.addMultipleIds}
        description={filter.description}
        values={filter.values}
        value={filterValue}
        handleChange={this.handleFilterChange}
        disabled={disabled}
      />
    );
  }

  render() {
    const { filterConfigs } = this.props;

    return (
      <div className="FilterView">
        <div className="title-area">
          <div className="section-head">Filter</div>
          <div className="clear-link">
            <Button variant="link" onClick={this.handleFilterClear}>
              clear
            </Button>
          </div>
        </div>

        {filterConfigs.map(filterConfig => {
          return (
            <div className="control-item" key={`filter-control-${filterConfig.id}`}>
              {this.renderFilterTitle(filterConfig)}
              {this.renderFilterSelect(filterConfig)}
            </div>
          );
        })}
        <hr />
      </div>
    );
  }
}

export default FilterView;
