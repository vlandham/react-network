import React, { Component } from 'react';
import PropTypes from 'prop-types';

import SearchView from './SearchView';
import FilterView from './FilterView';
import DisplayView from './DisplayView';
import { uniqueValues } from '../../utils/collection';
import { removeEmptyKeys } from '../../utils/object';
import { capitalize } from '../../utils/string';

import './Controls.scss';

/**
 * Pull out an array of {value, label} objects for
 * a given property in the dataDefs
 */
function extractProperties(dataDefs, propertyName) {
  const properties = dataDefs
    .filter(d => d[propertyName])
    .map(def => {
      return { value: def.id, label: def.label };
    });

  return properties;
}

/**
 * Side panel controls display. Powered by controlsConfig and dataDefs.
 * A Control is composed of a Search, Display, and Filter sections,
 * all implemented as separate components. Each section is optional
 * in the Control display and it is up to teh controlsConfig to configure
 * which sections are displayed.
 */
class Controls extends Component {
  static propTypes = {
    /**
     * Configuration of different controls sections.
     * Provides details on how the controls should be displayed.
     */
    controlsConfig: PropTypes.object.isRequired,

    /**
     * Array of data definitions.
     */
    dataDefs: PropTypes.array.isRequired,

    /**
     * Filters object
     */
    filters: PropTypes.object,

    /**
     * Filters change callback
     */
    onChangeFilters: PropTypes.func,

    /**
     * Search change callback
     */
    onChangeSearch: PropTypes.func,

    /**
     * Search values
     */
    search: PropTypes.array,

    /**
     * Should the controls be displayed?
     */
    shouldDisplayControls: PropTypes.bool,
  };

  static defaultProps = {
    shouldDisplayControls: true,
    onChangeSearch: () => {},
    onChangeFilters: () => {},
    footer: null,
  };

  /**
   * Create configuration object for filter section
   */
  static generateFilterConfig(dataDefs, data) {
    // We generate filter options based on data defs.
    const filterData = data || [];
    const filterValues = dataDefs
      .filter(d => d.filterBy)
      .map(filterDef => {
        const level = filterDef.level;
        switch (level) {
          case 'Categorical':
          case 'Nominal': {
            const id = filterDef.id;
            const label = filterDef.label;
            const description = filterDef.description;
            const addMultipleIds = filterDef.addMultipleIds;
            const values = uniqueValues(filterData, id).map(d => {
              return { value: d, label: d };
            });
            return { id, level, values, label, description, addMultipleIds };
          }
          default:
            return undefined;
        }
      });

    return filterValues.filter(d => d !== undefined);
  }

  /**
   * Create configuration object for view section
   */
  static generateViewConfig(viewConfig, dataDefs) {
    let values = [];
    if (viewConfig.values) {
      values = viewConfig.values;
    } else {
      values = extractProperties(dataDefs, viewConfig.id);
    }
    return Object.assign({}, viewConfig, { values });
  }

  /**
   * Create configuration object for search section
   */
  static generateSearchConfig(dataDefs, data, searchConfig = {}) {
    // We generate filter options based on data defs.
    const searchProps = dataDefs.filter(d => d.searchBy);

    const desc = searchConfig.description || 'Search';

    let items = [];
    if (searchProps.length > 0) {
      items = data.map(node => {
        const item = {};
        searchProps.forEach(prop => {
          item[prop.id] = node[prop.id];
        });
        // TODO: Fix hardcoded label / id
        item.value = node.id;
        item.label = node.name;
        return item;
      });
    }

    return {
      id: 'search',
      label: 'Search',
      description: desc,
      values: items,
      searchProps,
    };
  }

  /**
   * Constructor
   */
  constructor(props) {
    super(props);
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.handleDisplayChange = this.handleDisplayChange.bind(this);
    this.handleSearchChange = this.handleSearchChange.bind(this);

    this.state = {
      filterConfigs: [],
      viewConfigs: [],
    };
  }

  /**
   * React Lifecycle method
   */
  componentDidMount() {
    this.updateConfigs(this.props);
  }

  /**
   * React Lifecycle method
   */
  componentWillReceiveProps(nextProps) {
    let update = false;

    if (this.props.data !== nextProps.data) {
      update = true;
    }

    if (update) {
      this.updateConfigs(nextProps);
    }
  }

  /**
   * React Lifecycle method
   */
  shouldComponentUpdate(nextProps, nextState) {
    const propKeys = Object.keys(nextProps);
    let updated = [];
    propKeys.forEach(k => {
      if (!this.props[k] || !(this.props[k] === nextProps[k])) {
        updated.push(k);
      }
    });

    const stateKeys = Object.keys(nextState);
    stateKeys.forEach(k => {
      if (!this.state[k] || !(this.state[k] === nextState[k])) {
        updated.push(k);
      }
    });

    const ignoreProps = ['children'];
    ignoreProps.forEach(p => {
      const ignoreIndex = updated.indexOf(p);
      if (ignoreIndex >= 0) {
        updated.splice(ignoreIndex, 1);
      }
    });

    return updated.length > 0;
  }

  /**
   * Callback for filter section control change
   */
  handleFilterChange(newVal) {
    const noEmpty = removeEmptyKeys(newVal);
    this.props.onChangeFilters(noEmpty);
  }

  /**
   * Callback for search section change
   */
  handleSearchChange(newVal) {
    const { onChangeSearch } = this.props;

    if (onChangeSearch) {
      onChangeSearch(newVal);
    }
  }

  /**
   * Callback for display section control change
   */
  handleDisplayChange(propertyId, value) {
    const handler = `onChange${capitalize(propertyId)}`;
    if (this.props[handler]) {
      this.props[handler](value);
    } else {
      console.error('WARNING: No on change for: ' + handler);
    }
  }

  /**
   * Regenerate the configurations for the different control sections
   *
   * @param {Object} props Props
   */
  updateConfigs(props) {
    const { data, dataDefs, controlsConfig } = props;

    const filterConfigs = Controls.generateFilterConfig(dataDefs, data);

    const searchConfig = Controls.generateSearchConfig(dataDefs, data, controlsConfig.search);

    const viewConfigs = [];
    controlsConfig.view.forEach(view => {
      viewConfigs.push(Controls.generateViewConfig(view, dataDefs));
    });

    this.setState({
      filterConfigs,
      viewConfigs,
      searchConfig,
      ...viewConfigs,
    });
  }

  /**
   * Render filter section
   */
  renderFilterView() {
    const { controlsConfig, filters } = this.props;
    const { filterConfigs } = this.state;

    if (controlsConfig.filter && !controlsConfig.filter.display) {
      return null;
    }

    return (
      <FilterView
        key={'filter'}
        filterConfigs={filterConfigs}
        filters={filters}
        handleChange={this.handleFilterChange}
      />
    );
  }

  /**
   * Render search section.
   */
  renderSearchView() {
    const { controlsConfig, search } = this.props;
    const { searchConfig } = this.state;

    // don't show search if we haven't enabled it
    if (!controlsConfig.search || (controlsConfig.search && !controlsConfig.search.display)) {
      return null;
    }

    return (
      <SearchView
        key={'search'}
        search={search}
        searchConfig={searchConfig}
        handleChange={this.handleSearchChange}
      />
    );
  }

  /**
   * Render display section
   */
  renderDisplayView() {
    const { filters, controlsConfig, ...others } = this.props;

    const { viewConfigs } = this.state;

    if (!viewConfigs || viewConfigs.length === 0) {
      return null;
    }

    return (
      <DisplayView
        key={'display'}
        viewConfigs={viewConfigs}
        handleChange={this.handleDisplayChange}
        {...others}
      />
    );
  }

  /**
   * Render footer.
   */
  renderFooter() {
    const { footer } = this.props;

    return <div className="footer">{footer}</div>;
  }

  /**
   * React render method.
   */
  render() {
    const { shouldDisplayControls, children } = this.props;

    let controls = [];

    if (shouldDisplayControls) {
      controls = [this.renderSearchView(), this.renderDisplayView(), this.renderFilterView()];
    }

    return (
      <div className="Controls">
        {children}
        <hr />
        {controls}
        {this.renderFooter()}
      </div>
    );
  }
}

export default Controls;
