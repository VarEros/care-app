import type { CustomMessageTriggerHandler } from "aws-lambda";

export const handler: CustomMessageTriggerHandler = async (event) => {
  if (event.triggerSource === "CustomMessage_SignUp" || event.triggerSource === "CustomMessage_ResendCode") {
    event.response.emailMessage = `Gracias por registrarte en Care App. Tu código de verificación es ${event.request.codeParameter}`;
    event.response.emailSubject = "Care App - Verifica tu correo electrónico";
  }

  if (event.triggerSource === "CustomMessage_ForgotPassword") {
    event.response.emailMessage = `Tu nuevo código de un solo uso es ${event.request.codeParameter}`;
    event.response.emailSubject = "Care App - Restablecer mi contraseña";
  }

  if (event.triggerSource === "CustomMessage_AdminCreateUser") {
    event.response.emailMessage = `Tu usuario es ${event.request.usernameParameter} y tu contraseña temporal es ${event.request.codeParameter}`;
    event.response.emailSubject = 'Care App - Bienvenido Doctor';
  }

  return event;
};