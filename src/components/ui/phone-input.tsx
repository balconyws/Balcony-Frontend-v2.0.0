'use client';

import * as React from 'react';
import { PhoneInput as Input, PhoneInputRefType, PhoneInputProps } from 'react-international-phone';

const PhoneInput = React.forwardRef<
  HTMLInputElement,
  PhoneInputProps & {
    readOnly?: boolean;
    disabled?: boolean;
  }
>(({ ...props }, ref) => {
  const innerRef = React.useRef<PhoneInputRefType>(null);

  React.useImperativeHandle(ref, () => innerRef.current as unknown as HTMLInputElement);

  return (
    <Input
      className="w-full !border-none !outline-none"
      defaultCountry={'us'}
      placeholder="phone number"
      hideDropdown={true}
      showDisabledDialCodeAndPrefix={false}
      countrySelectorStyleProps={{
        className: 'hidden overflow-hidden',
      }}
      name={props.name}
      value={props.value}
      ref={innerRef}
      inputProps={{
        readOnly: props.readOnly,
        disabled: props.disabled,
      }}
      onChange={props.onChange}
      {...props}
    />
  );
});
PhoneInput.displayName = 'PhoneInput';

export { PhoneInput };
