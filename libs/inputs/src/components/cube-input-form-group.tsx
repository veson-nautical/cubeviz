import { FormGroup } from '@blueprintjs/core';
import { useCubeTheme } from '@cubeviz/core';
import clsx from 'clsx';

export function CubeInputFormGroup({
  children,
  title,
  errorMessage,
}: {
  children: React.ReactNode;
  title: string;
  errorMessage?: string;
}) {
  const theme = useCubeTheme();
  return (
    <FormGroup
      className={clsx({ 'bp4-dark': theme === 'dark' })}
      label={title}
      inline
      intent={errorMessage ? 'danger' : 'none'}
      helperText={errorMessage ? errorMessage : undefined}
    >
      {children}
    </FormGroup>
  );
}
