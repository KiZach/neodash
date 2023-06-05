import React, { useEffect } from 'react';
import { Autocomplete, TextField, MenuItem } from '@mui/material';
import NeoColorPicker from '../../component/field/ColorPicker';
import { IconButton, Button, Dialog, Dropdown, TextInput } from '@neo4j-ndl/react';
import {
  AdjustmentsHorizontalIconOutline,
  XMarkIconOutline,
  PlusIconOutline,
  PlayIconSolid,
} from '@neo4j-ndl/react/icons';
import { withStyles } from '@mui/styles';

// The set of conditional checks that are included in the rule specification.
const RULE_CONDITIONS = [
  {
    value: '=',
    label: '=',
  },
  {
    value: '!=',
    label: '!=',
  },
  {
    value: '>',
    label: '>',
  },
  {
    value: '>=',
    label: '>=',
  },
  {
    value: '<',
    label: '<',
  },
  {
    value: '<=',
    label: '<=',
  },
  {
    value: 'contains',
    label: 'contains',
  },
];

// For each report type, the customizations that can be specified using rules.
export const RULE_BASED_REPORT_CUSTOMIZATIONS = {
  graph: [
    {
      value: 'node color',
      label: 'Node Color',
    },
    {
      value: 'node label color',
      label: 'Node Label Color',
    },
  ],
  map: [
    {
      value: 'marker color',
      label: 'Marker color',
    },
  ],
  bar: [
    {
      value: 'bar color',
      label: 'Bar Color',
    },
  ],
  line: [
    {
      value: 'line color',
      label: 'Line Color',
    },
  ],
  pie: [
    {
      value: 'slice color',
      label: 'Slice Color',
    },
  ],
  value: [
    {
      value: 'text color',
      label: 'Text Color',
    },
  ],
  table: [
    {
      value: 'row color',
      label: 'Row Background Color',
    },
    {
      value: 'row text color',
      label: 'Row Text Color',
    },
    {
      value: 'cell color',
      label: 'Cell Background Color',
    },
    {
      value: 'cell text color',
      label: 'Cell Text Color',
    },
  ],
};

// Get the default rule structure to append when a rule gets added to the list.
const getDefaultRule = (customization) => {
  return {
    field: '',
    condition: '=',
    value: '',
    customization: customization,
    customizationValue: 'black',
  };
};

/**
 * The pop-up window used to build and specify custom styling rules for reports.
 */
export const NeoCustomReportStyleModal = ({
  customReportStyleModalOpen,
  settingName,
  settingValue,
  type,
  fields,
  setCustomReportStyleModalOpen,
  onReportSettingUpdate,
}) => {
  // The rule set defined in this modal is updated whenever the setting value is externally changed.
  const [rules, setRules] = React.useState([]);
  useEffect(() => {
    if (settingValue) {
      setRules(settingValue);
    }
  }, [settingValue]);

  const handleClose = () => {
    // If no rules are specified, clear the special report setting that holds the customization rules.
    if (rules.length == 0) {
      onReportSettingUpdate(settingName, undefined);
    } else {
      onReportSettingUpdate(settingName, rules);
    }
    setCustomReportStyleModalOpen(false);
  };

  // Update a single field in one of the rules in the rule array.
  const updateRuleField = (ruleIndex, ruleField, ruleFieldValue) => {
    let newRules = [...rules]; // Deep copy
    newRules[ruleIndex][ruleField] = ruleFieldValue;
    setRules(newRules);
  };

  /**
   * Create the list of suggestions used in the autocomplete box of the rule specification window.
   * This will be dynamic based on the type of report we are customizing.
   */
  const createFieldVariableSuggestions = () => {
    if (!fields) {
      return [];
    }
    if (type == 'graph' || type == 'map') {
      return fields
        .map((node, index) => {
          if (!Array.isArray(node)) {
            return undefined;
          }
          return fields[index].map((property, propertyIndex) => {
            if (propertyIndex == 0) {
              return undefined;
            }
            return `${fields[index][0]}.${property}`;
          });
        })
        .flat()
        .filter((e) => e !== undefined);
    }
    if (type == 'bar' || type == 'line' || type == 'pie' || type == 'table' || type == 'value') {
      return fields;
    }
    return [];
  };

  return (
    <div>
      {customReportStyleModalOpen ? (
        <Dialog
          className='dialog-xl'
          open={customReportStyleModalOpen == true}
          onClose={handleClose}
          aria-labelledby='form-dialog-title'
        >
          <Dialog.Header id='form-dialog-title'>
            <AdjustmentsHorizontalIconOutline className='icon-base icon-inline text-r' aria-label={'Adjust'} />
            Rule-Based Styling
          </Dialog.Header>
          <Dialog.Content style={{ overflow: 'inherit' }}>
            <p>
              You can define rule-based styling for the report here. <br />
              Style rules are checked in-order and override the default behaviour - if no rules are valid, no style is
              applied.
              <br />
              {type == 'graph' || type == 'map' ? (
                <p>
                  For <b>{type}</b> reports, the field name should be specified in the format <code>label.name</code>,
                  for example: <code>Person.age</code>. This is case-sensitive.
                </p>
              ) : (
                <></>
              )}
              {type == 'line' || type == 'value' || type == 'bar' || type == 'pie' || type == 'table' ? (
                <p>
                  For <b>{type}</b> reports, the field name should be the exact name of the returned field. <br />
                  For example, if your query is <code>MATCH (n:Movie) RETURN n.rating as Rating</code>, your field name
                  is <code>Rating</code>.
                </p>
              ) : (
                <></>
              )}
            </p>
            <div>
              <hr></hr>

              <table>
                <tbody>
                  {rules.map((rule, index) => {
                    const ruleType = RULE_BASED_REPORT_CUSTOMIZATIONS[type].find(
                      (el) => el.value === rule.customization
                    );
                    return (
                      <tr>
                        <td style={{ paddingLeft: '2px', paddingRight: '2px', width: '2.5%' }}>
                          <span style={{ color: 'black' }}>{index + 1}.</span>
                        </td>
                        <td style={{ width: '2.5%' }}>
                          <span style={{ fontWeight: 'bold', color: 'black' }}>IF</span>
                        </td>
                        <td style={{ padding: '5px', width: '40%' }}>
                          <div style={{ border: '2px dashed grey' }} className='n-flex n-flex-row n-flex-wrap n-p-1'>
                            <Autocomplete
                              disableClearable={true}
                              id={`autocomplete-label-type${index}`}
                              noOptionsText='*Specify an exact field name'
                              options={createFieldVariableSuggestions().filter((e) =>
                                e.toLowerCase().includes(rule.field.toLowerCase())
                              )}
                              value={rule.field ? rule.field : ''}
                              inputValue={rule.field ? rule.field : ''}
                              popupIcon={<></>}
                              style={{ display: 'inline-block', width: '38%' }}
                              onInputChange={(event, value) => {
                                updateRuleField(index, 'field', value);
                              }}
                              onChange={(event, newValue) => {
                                updateRuleField(index, 'field', newValue);
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  placeholder='Field name...'
                                  InputLabelProps={{ shrink: true }}
                                  style={{ padding: '6px 0 7px' }}
                                  size={'small'}
                                  variant={'standard'}
                                />
                              )}
                            />
                            <Dropdown
                              type='select'
                              selectProps={{
                                onChange: (newValue) => updateRuleField(index, 'condition', newValue.value),
                                options: RULE_CONDITIONS.map((option) => ({
                                  label: option.label,
                                  value: option.value,
                                })),
                                value: { label: rule.condition, value: rule.condition },
                              }}
                              style={{ marginLeft: '1%', width: '20%', display: 'inline-block' }}
                              fluid
                            />
                            <div style={{ marginLeft: '1%', width: '40%', display: 'inline-block' }}>
                              <TextInput
                                placeholder='Value...'
                                value={rule.value}
                                onChange={(e) => updateRuleField(index, 'value', e.target.value)}
                                fluid
                              ></TextInput>
                            </div>
                          </div>
                        </td>
                        <td style={{ paddingLeft: '20px', paddingRight: '20px', width: '2.5%' }}>
                          <span style={{ fontWeight: 'bold', color: 'black' }}>THEN</span>
                        </td>
                        <td style={{ padding: '5px', width: '40%' }}>
                          <div style={{ border: '2px dashed grey' }} className='n-flex n-flex-row n-flex-wrap n-p-1'>
                            <Dropdown
                              type='select'
                              selectProps={{
                                onChange: (newValue) => updateRuleField(index, 'customization', newValue.value),
                                options: RULE_BASED_REPORT_CUSTOMIZATIONS[type].map((option) => ({
                                  label: option.label,
                                  value: option.value,
                                })),
                                value: {
                                  label: ruleType ? ruleType.label : '',
                                  value: rule.customization,
                                },
                              }}
                              style={{ width: '40%', display: 'inline-block' }}
                              fluid
                            />
                            <div style={{ marginLeft: '1%', width: '13%', display: 'inline-block' }}>
                              <TextInput disabled={true} value={'='} fluid></TextInput>
                            </div>
                            <div style={{ marginLeft: '1%', width: '45%', display: 'inline-block' }}>
                              <NeoColorPicker
                                label=''
                                defaultValue='#ffffff'
                                key={undefined}
                                value={rule.customizationValue}
                                onChange={(value) => updateRuleField(index, 'customizationValue', value)}
                              ></NeoColorPicker>
                            </div>
                          </div>
                        </td>
                        <td style={{ width: '2.5%' }}>
                          <IconButton
                            aria-label='remove rule'
                            size='medium'
                            floating
                            onClick={() => {
                              setRules([...rules.slice(0, index), ...rules.slice(index + 1)]);
                            }}
                          >
                            <XMarkIconOutline />
                          </IconButton>
                        </td>
                      </tr>
                    );
                  })}

                  <tr>
                    <td colSpan={5}>
                      <div style={{ textAlign: 'center', marginBottom: '5px' }}>
                        <IconButton
                          aria-label='add'
                          size='medium'
                          floating
                          onClick={() => {
                            const newRule = getDefaultRule(RULE_BASED_REPORT_CUSTOMIZATIONS[type][0].value);
                            setRules(rules.concat(newRule));
                          }}
                        >
                          <PlusIconOutline />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onClick={() => {
                handleClose();
              }}
              size='large'
              floating
            >
              Save
              <PlayIconSolid className='btn-icon-lg-r' />
            </Button>
          </Dialog.Actions>
        </Dialog>
      ) : (
        <></>
      )}
    </div>
  );
};

export default withStyles({})(NeoCustomReportStyleModal);
