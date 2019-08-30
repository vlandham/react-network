import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import VirtualizedSelect from 'react-virtualized-select';
import Select from 'react-select';
import Creatable from 'react-select';
import isEmpty from 'lodash.isempty';

/**
 * Helper to make options from filter data
 */
function makeOptions(values) {
  return values.map(v => {
    return {
      label: v.label,
      value: v.value,
    };
  });
}

class MultiSelect extends PureComponent {
  static propTypes = {
    allowMulti: PropTypes.bool,
    description: PropTypes.string,
    disabled: PropTypes.bool,
    handleChange: PropTypes.func.isRequired,
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    multi: PropTypes.bool,
    placeholder: PropTypes.string,
    value: PropTypes.any,
    values: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      }),
    ),
  };

  static defaultProps = {
    allowMulti: false,
    handleChange: () => {},
    multi: true,
    values: [],
    value: undefined,
    id: '',
    label: '',
    disabled: false,
  };

  constructor() {
    super();
    this.handleChange = this.handleChange.bind(this);
    this.handleAddMultiple = this.handleAddMultiple.bind(this);
  }

  handleChange(newValue) {
    let newVal;
    if (isEmpty(newValue)) {
      newVal = undefined;
    } else if (newValue instanceof Array) {
      newVal = newValue.map(d => d.value);
    } else {
      newVal = newValue.value;
    }

    this.props.handleChange(this.props.id, newVal);
  }

  handleAddMultiple(option) {
    const { values } = this.props;
    const valueMap = {};
    values.forEach(v => (valueMap[v.value] = v));
    const newValues = option.value.split(';').map(v => v.trim());

    // only allow values that exist in current values
    const filteredNewValues = newValues.filter(nValue => valueMap[nValue]);

    if (filteredNewValues.length > 0) {
      this.props.handleChange(this.props.id, filteredNewValues);
    } else {
      console.log('no valid values to add in: ', newValues);
    }
  }

  render() {
    const { addMultipleIds, id, values, multi, placeholder, disabled, value } = this.props;

    const options = makeOptions(values);
    const selectComponent = addMultipleIds ? Creatable : Select;

    return (
      <div className="MultiSelect">
        <VirtualizedSelect
          name={`multi-select-${id}`}
          options={options}
          optionHeight={44}
          value={value}
          onChange={this.handleChange}
          multi={multi}
          placeholder={placeholder}
          disabled={disabled}
          onNewOptionClick={this.handleAddMultiple}
          selectComponent={selectComponent}
          promptTextCreator={() => "Add multiple values with ';'"}
        />
      </div>
    );
  }
}

export default MultiSelect;
