import { Divider, Grid, Group, Modal, useMantineTheme } from '@mantine/core';
import { Controller, useFieldArray } from 'react-hook-form';
import { FILTER_TO_LABEL, FilterPartTypeEnum } from '@novu/shared';

import { When } from '../../../components/utils/When';
import { Button, colors, Input, Select, shadows, Title } from '../../../design-system';
import { Trash } from '../../../design-system/icons';
import { DeleteStepButton, FilterButton } from './FilterModal.styles';
import { OnlineFiltersForms } from './OnlineFiltersForms';

export function FilterModal({
  isOpen,
  cancel,
  confirm,
  control,
  stepIndex,
}: {
  isOpen: boolean;
  cancel: () => void;
  confirm: () => void;
  control: any;
  stepIndex: number;
}) {
  const theme = useMantineTheme();

  const { fields, append, update, remove } = useFieldArray({
    control,
    name: `steps.${stepIndex}.filters.0.children`,
  });

  function handleOnChildOnChange(index: number) {
    return (data) => {
      const newField = Object.assign({}, fields[index], { on: data });
      update(index, newField);
    };
  }

  return (
    <Modal
      opened={isOpen}
      overlayColor={theme.colorScheme === 'dark' ? colors.BGDark : colors.BGLight}
      overlayOpacity={0.7}
      styles={{
        modal: {
          backgroundColor: theme.colorScheme === 'dark' ? colors.B15 : colors.white,
        },
        body: {
          paddingTop: '5px',
        },
        inner: {
          paddingTop: '180px',
        },
      }}
      title={<Title size={2}>Add filter</Title>}
      sx={{ backdropFilter: 'blur(10px)' }}
      shadow={theme.colorScheme === 'dark' ? shadows.dark : shadows.medium}
      radius="md"
      size="xl"
      onClose={() => {
        cancel();
      }}
    >
      <Grid align="center">
        <Grid.Col span={3}>
          <Controller
            control={control}
            name={`steps.${stepIndex}.filters.0.value`}
            render={({ field }) => {
              return (
                <Select
                  placeholder="How to group rules?"
                  data={[
                    { value: 'AND', label: 'And' },
                    { value: 'OR', label: 'Or' },
                  ]}
                  {...field}
                  data-test-id="group-rules-dropdown"
                />
              );
            }}
          />
        </Grid.Col>
        <Grid.Col span={7} />
        <Grid.Col span={2}>
          <FilterButton
            variant="outline"
            size="md"
            mt={30}
            onClick={() => {
              append({
                operator: 'EQUAL',
                on: 'payload',
              });
            }}
            data-test-id="create-rule-btn"
          >
            Create rule
          </FilterButton>
        </Grid.Col>
      </Grid>
      <Divider
        sx={{
          marginTop: '15px',
          marginBottom: '15px',
        }}
      />
      {fields.map((item, index) => {
        const filterFieldOn = (fields[index] as any).on;

        return (
          <div key={index}>
            <Grid columns={10} key={item.id} align="center" gutter="xs">
              <Grid.Col span={3}>
                <Controller
                  control={control}
                  name={`steps.${stepIndex}.filters.0.children.${index}.on`}
                  render={({ field }) => {
                    return (
                      <Select
                        placeholder="On"
                        data={[
                          { value: FilterPartTypeEnum.PAYLOAD, label: FILTER_TO_LABEL[FilterPartTypeEnum.PAYLOAD] },
                          {
                            value: FilterPartTypeEnum.SUBSCRIBER,
                            label: FILTER_TO_LABEL[FilterPartTypeEnum.SUBSCRIBER],
                          },
                          { value: FilterPartTypeEnum.WEBHOOK, label: FILTER_TO_LABEL[FilterPartTypeEnum.WEBHOOK] },
                          { value: FilterPartTypeEnum.IS_ONLINE, label: FILTER_TO_LABEL[FilterPartTypeEnum.IS_ONLINE] },
                          {
                            value: FilterPartTypeEnum.IS_ONLINE_IN_LAST,
                            label: FILTER_TO_LABEL[FilterPartTypeEnum.IS_ONLINE_IN_LAST],
                          },
                        ]}
                        {...field}
                        onChange={handleOnChildOnChange(index)}
                        data-test-id="filter-on-dropdown"
                      />
                    );
                  }}
                />
              </Grid.Col>

              <When truthy={filterFieldOn === 'webhook'}>
                <WebHookUrlForm control={control} stepIndex={stepIndex} index={index} />
                <EqualityForm
                  fieldOn={filterFieldOn}
                  control={control}
                  stepIndex={stepIndex}
                  index={index}
                  remove={remove}
                />
              </When>

              <When truthy={filterFieldOn === 'isOnline' || filterFieldOn === 'isOnlineInLast'}>
                <OnlineFiltersForms
                  fieldOn={filterFieldOn}
                  control={control}
                  stepIndex={stepIndex}
                  index={index}
                  remove={remove}
                />
              </When>
              <When truthy={filterFieldOn === 'payload' || filterFieldOn === 'subscriber'}>
                <EqualityForm
                  fieldOn={filterFieldOn}
                  control={control}
                  stepIndex={stepIndex}
                  index={index}
                  remove={remove}
                />
              </When>
            </Grid>
            <When truthy={fields.length > index + 1}>
              <Divider style={{ margin: 5 }} />
            </When>
          </div>
        );
      })}
      <div>
        <Group position="right">
          <Button variant="outline" size="md" mt={30} onClick={() => cancel()}>
            Cancel
          </Button>
          <Button mt={30} size="md" onClick={() => confirm()} data-test-id="filter-confirm-btn">
            Add
          </Button>
        </Group>
      </div>
    </Modal>
  );
}

function WebHookUrlForm({ control, stepIndex, index }: { control; stepIndex: number; index: number }) {
  return (
    <>
      <Grid.Col span={6}>
        <Controller
          control={control}
          name={`steps.${stepIndex}.filters.0.children.${index}.webhookUrl`}
          render={({ field, fieldState }) => {
            return (
              <Input
                {...field}
                error={fieldState.error?.message}
                placeholder="Url"
                data-test-id="webhook-filter-url-input"
              />
            );
          }}
        />
      </Grid.Col>
    </>
  );
}

function EqualityForm({
  fieldOn,
  control,
  stepIndex,
  index,
  remove,
}: {
  fieldOn: string;
  control;
  stepIndex: number;
  index: number;
  remove: (index?: number | number[]) => void;
}) {
  const spaSize = fieldOn === 'webhook' ? 3 : 2;

  return (
    <>
      <Grid.Col span={spaSize}>
        <Controller
          control={control}
          name={`steps.${stepIndex}.filters.0.children.${index}.field`}
          render={({ field, fieldState }) => {
            return (
              <Input {...field} error={fieldState.error?.message} placeholder="Key" data-test-id="filter-key-input" />
            );
          }}
        />
      </Grid.Col>
      <Grid.Col span={spaSize}>
        <Controller
          control={control}
          name={`steps.${stepIndex}.filters.0.children.${index}.operator`}
          render={({ field }) => {
            return (
              <Select
                placeholder="Operator"
                data={[
                  { value: 'EQUAL', label: 'Equal' },
                  { value: 'NOT_EQUAL', label: 'Not equal' },
                  { value: 'LARGER', label: 'Larger' },
                  { value: 'SMALLER', label: 'Smaller' },
                  { value: 'LARGER_EQUAL', label: 'Larger or equal' },
                  { value: 'SMALLER_EQUAL', label: 'Smaller or equal' },
                  { value: 'IN', label: 'Contains' },
                  { value: 'NOT_IN', label: 'Not contains' },
                ]}
                {...field}
                data-test-id="filter-operator-dropdown"
              />
            );
          }}
        />
      </Grid.Col>
      <Grid.Col span={spaSize}>
        <Controller
          control={control}
          name={`steps.${stepIndex}.filters.0.children.${index}.value`}
          render={({ field, fieldState }) => {
            return (
              <Input
                {...field}
                error={fieldState.error?.message}
                placeholder="Value"
                data-test-id="filter-value-input"
              />
            );
          }}
        />
      </Grid.Col>
      <Grid.Col span={1}>
        <DeleteStepButton
          variant="outline"
          size="md"
          mt={30}
          onClick={() => {
            remove(index);
          }}
          data-test-id="filter-remove-btn"
        >
          <Trash />
        </DeleteStepButton>
      </Grid.Col>
    </>
  );
}
