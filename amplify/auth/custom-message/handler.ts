import type { CustomMessageTriggerHandler } from "aws-lambda";

export const handler: CustomMessageTriggerHandler = async (event) => {
  if (event.triggerSource === "CustomMessage_ForgotPassword") {
    event.response.emailMessage = `Tu nuevo código de un solo uso es ${event.request.codeParameter}`;
    event.response.emailSubject = "Restablecer mi contraseña";
  }

  if (event.triggerSource === "CustomMessage_AdminCreateUser") {
    event.response.emailMessage = `Tu usuario es ${event.request.usernameParameter} y tu contraseña temporal es ${event.request.codeParameter}`;
    event.response.emailSubject = 'Bienvenido a Care App';
  }

  return event;
};