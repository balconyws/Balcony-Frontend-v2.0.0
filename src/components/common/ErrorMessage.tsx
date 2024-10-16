'use client';

import NotFound from 'next/error';

type Props = {
  errorCode: number;
  message: string;
};

const ErrorMessage: React.FC<Props> = ({ errorCode, message }: Props) => (
  <NotFound statusCode={errorCode} title={message} />
);

export default ErrorMessage;
