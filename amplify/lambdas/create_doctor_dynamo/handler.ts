import type { Handler } from 'aws-lambda';

export const handler: Handler = async (event) => {
  return "Hello from my first function!";
};