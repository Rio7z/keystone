import React, { Component } from 'react';
import styled from 'react-emotion';
import { ChevronDownIcon, ChevronUpIcon } from '@voussoir/icons';
import { OptionPrimitive } from '@voussoir/ui/src/primitives/filters';
import { colors } from '@voussoir/ui/src/theme';
import { OptionRenderer } from '@voussoir/ui/src/primitives/filters';

import { POPOUT_GUTTER } from '../../components/Popout';

export const SortButton = styled.button(({ isActive }) => {
  const overStyles = {
    color: colors.primary,
    borderBottomColor: colors.primary,
  };
  const activeStyles = isActive ? overStyles : null;
  return {
    background: 0,
    border: 0,
    borderBottom: `1px solid ${colors.N20}`,
    outline: 0,
    color: 'inherit',
    cursor: 'pointer',
    display: 'inline-block',
    fontSize: 'inherit',
    fontWeight: 'inherit',
    marginLeft: '0.5ex',
    padding: 0,
    verticalAlign: 'baseline',

    ':hover, :focus': overStyles,
    ...activeStyles,
  };
});

export const SortOption = ({ altIsDown, children, isFocused, isSelected, ...props }) => {
  const Icon = isSelected ? ChevronUpIcon : altIsDown ? ChevronUpIcon : ChevronDownIcon;
  const iconColor = !isFocused && !isSelected ? colors.N40 : 'currentColor';

  return (
    <OptionPrimitive isFocused={isFocused} isSelected={isSelected} {...props}>
      <span>{children}</span>
      <Icon css={{ color: iconColor }} />
    </OptionPrimitive>
  );
};

function invertDirection(direction) {
  const inverted = { ASC: 'DESC', DESC: 'ASC' };
  return inverted[direction] || direction;
}
function isOptionSelected(opt, selected) {
  return opt.path === selected[0].field.path;
}

type FieldType = Object;
type Props = {
  fields: Array<FieldType>,
  onChange: FieldType => void,
  value: FieldType,
};
type State = { altIsDown: boolean };

export default class SortSelect extends Component<Props, State> {
  state = { altIsDown: false };
  componentDidMount() {
    document.body.addEventListener('keydown', this.handleKeyDown, false);
    document.body.addEventListener('keyup', this.handleKeyUp, false);
  }
  componentWillUnmount() {
    document.body.removeEventListener('keydown', this.handleKeyDown);
    document.body.removeEventListener('keyup', this.handleKeyUp);
  }
  handleKeyDown = e => {
    if (e.key !== 'Alt') return;
    this.setState({ altIsDown: true });
  };
  handleKeyUp = e => {
    if (e.key !== 'Alt') return;
    this.setState({ altIsDown: false });
  };
  handleChange = field => {
    const { onChange, popoutRef, value } = this.props;
    const { altIsDown } = this.state;
    const isSelected = field.path === value.field.path;

    let direction = 'ASC';
    if (isSelected) {
      direction = invertDirection(value.direction);
    } else if (altIsDown) {
      direction = 'DESC';
    }

    onChange({ field, direction });
    popoutRef.current.close();
  };
  enhancedOption = props => <SortOption altIsDown={this.state.altIsDown} {...props} />;
  getOptions = () => {
    const { fields } = this.props;
    return fields.map(({ options, ...field }) => field);
  };

  render() {
    const { value } = this.props;

    return (
      <div css={{ padding: POPOUT_GUTTER }}>
        <OptionRenderer
          components={{ Option: this.enhancedOption }}
          isOptionSelected={isOptionSelected}
          onChange={this.handleChange}
          options={this.getOptions()}
          placeholder="Find a field..."
          value={value}
        />
      </div>
    );
  }
}