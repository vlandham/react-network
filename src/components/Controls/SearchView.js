import React, { Component } from 'react';
import PropTypes from 'prop-types';

import VirtualizedSelect from 'react-virtualized-select';
import createFilterOptions from 'react-select-fast-filter-options';
import { PrefixIndexStrategy } from 'js-search';
import isEmpty from 'lodash.isempty';

import 'react-virtualized/styles.css';
import 'react-virtualized-select/styles.css';

import './SearchView.scss';

/**
 * Helper to make options from app data
 */
function makeOptions(values) {
  return values.map(v => {
    return Object.assign({}, v, {
      label: v.label,
      value: v.value,
    });
  });
}

/**
 * This view displays a control for searching for nodes in the network.
 */
class SearchView extends Component {
  static propTypes = {
    handleChange: PropTypes.func.isRequired,
    search: PropTypes.array,
    searchConfig: PropTypes.shape({
      id: PropTypes.string,
      label: PropTypes.string,
      description: PropTypes.string,
      values: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string,
          value: PropTypes.string,
        }),
      ),
    }),
  };

  static defaultProps = {
    handleChange: () => {},
    searchConfig: {},
  };

  constructor(props) {
    super(props);
    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.renderOption = this.renderOption.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  componentWillUpdate(nextProps) {
    // We only expect this to change once.
    if (this.props.searchConfig.values !== nextProps.searchConfig.values) {
      this.options = makeOptions(nextProps.searchConfig.values);

      // We create a indexer that allows us to search for an application based on multiple
      // properties.
      const searchable = nextProps.searchConfig.searchProps.map(p => p.id);
      const indexStrategy = new PrefixIndexStrategy();

      this.filterOptions = createFilterOptions({
        indexes: searchable,
        options: this.options,
        indexStrategy,
      });
    }
  }

  handleSearchChange(newValue) {
    let newVal;
    if (isEmpty(newValue)) {
      newVal = [];
    } else if (newValue instanceof Array) {
      newVal = newValue.map(d => d.value);
    }
    this.currentInput = undefined;
    this.props.handleChange(newVal);
  }

  handleInputChange(val) {
    this.currentInput = val;
  }

  renderOption(opts) {
    const { key, option, selectValue, focusOption, focusedOption, style } = opts;

    const classNames = ['SearchOption'];
    if (option === focusedOption) {
      classNames.push('SearchOptionFocused');
    }

    return (
      <div
        className={classNames.join(' ')}
        key={key}
        onClick={() => selectValue(option)}
        onMouseOver={() => focusOption(option)}
        style={style}
      >
        {option.label}
      </div>
    );
  }

  render() {
    const { search, searchConfig } = this.props;

    const filterOptions = this.filterOptions;
    const options = this.options;

    return (
      <div className="SearchView">
        <div className="section-head">Search</div>

        <div className="control-item">
          <VirtualizedSelect
            name="app-search"
            options={options}
            filterOptions={filterOptions}
            value={search}
            onChange={this.handleSearchChange}
            noResultsText="No Results Found"
            placeholder={searchConfig.description}
            multi
            optionRenderer={this.renderOption}
            onInputChange={this.handleInputChange}
          />
        </div>
        <hr />
      </div>
    );
  }
}

export default SearchView;
