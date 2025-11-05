import { FormFieldComponents, FormFieldOptions } from '@aws-amplify/ui';
import { I18n } from 'aws-amplify/utils';

I18n.putVocabularies({
  es: {
    // UI actions
    "Sign In": "Iniciar sesión",
    "Sign in": "Iniciar sesión",
    "Signing in": "Iniciando sesión",
    "Sign Up": "Registrarse",
    "Sign Out": "Cerrar sesión",
    "Forgot your password?": "¿Olvidaste tu contraseña?",
    "Reset your password": "Restablecer tu contraseña",
    "Reset Password": "Restablecer Contraseña",
    "Send Code": "Enviar código",
    "Send code": "Enviar código",
    "Sending": "Enviando",
    "Submitting": "Subiendo",
    "Back to Sign In": "Volver a iniciar sesión",
    "Confirm Sign Up": "Confirmar registro",
    "Create Account": "Crear cuenta",
    "Submit": "Enviar",
    "Incorrect username or password.": "Usuario o contraseña incorrecta.",
    "Your passwords must match": "Tus contraseñas deben coincidir",
    "We Emailed You": "Te mandamos un correo",
    "Confirm": "Confirmar",
    "Confirming": "Confirmando",
    "Changing": "Cambiando",
    "Password must have at least 8 characters": "La contraseña debe tener al menos 8 caracteres",
    "Password must have lower case letters": "La contraseña debe tener letras minúsculas",
    "Password must have upper case letters": "La contraseña debe tener letras mayúsculas",
    "Password must have numbers": "La contraseña debe tener números",
    "Password must have special characters": "La contraseña debe tener caracteres especiales",
    "Change Password": "Cambiar Contraseña",
    "Invalid session for the user, session is expired.": "Sesión inválida para el usuario, la sesión ha expirado.",
    "Invalid verification code provided, please try again.": "Codigo de verificación invalido, por favor intetar otra vez.",
    
    "Resend Code": "Reenviar Codigo",
    "Your code is on the way. To log in, enter the code we emailed to": "Tu codigo esta en camino. Para iniciar sesión, introduce el codigo que mandamos al correo electronico",
    "It may take a minute to arrive": "Talvez tome un minuto en llegar"
  },
});

I18n.setLanguage("es");

interface ReactFormFieldOptions extends FormFieldOptions {
    /** Desired HTML defaultValue type */
    defaultValue?: string;
    /** isReadOnly maps to readonly HTML type */
    isReadOnly?: boolean;
    /** Desired HTML pattern type */
    pattern?: string | undefined;
    /** Desired HTML minLength type */
    minLength?: number;
    /** Desired HTML maxLength type */
    maxLength?: number;
}

export const formFields: {
        [key in FormFieldComponents]?: {
            [field_name: string]: ReactFormFieldOptions;
        };
    } = {
  signIn: {
    username: {
      placeholder: "Introduce tu correo electrónico",
      label: "Correo electrónico",
      isRequired: true,
    },
    password: {
      placeholder: "Introduce tu contraseña",
      label: "Contraseña",
      isRequired: true,
    },
  },
  signUp: {
    email: {
      placeholder: "Introduce tu correo electrónico",
      label: "Correo electrónico",
      isRequired: true,
    },
    password: {
      placeholder: "Crea una contraseña",
      label: "Contraseña",
      isRequired: true,
    },
    confirm_password: {
      placeholder: "Confirma tu contraseña",
      label: "Confirmar contraseña",
      isRequired: true,
    },
    name: {
      placeholder: "Introduce tus nombres y apellidos",
      label: "Nombre Completo",
      isRequired: true
    },
    "custom:cedula": {
      placeholder: "Ej: 001-010199-1234A",
      label: "Cedula",
      isRequired: true,
      maxLength: 16,
      pattern: "[0-9]{3}-[0-9]{6}-[0-9]{4}[A-Z]"
    },
    birthdate: {
      label: "Fecha de nacimiento",
      isRequired: true,
    },
  },

  forgotPassword: {
    username: {
      placeholder: "Introduce tu correo electrónico",
      label: "Correo electrónico",
      isRequired: true,
    },
  },

  confirmResetPassword: {
    confirmation_code: {
      placeholder: "Introduce el código de verificación",
      label: "Código de verificación",
      isRequired: true,
    },
    password: {
      placeholder: "Nueva contraseña",
      label: "Nueva contraseña",
      isRequired: true,
    },
    confirm_password: {
      placeholder: "Confirma tu nueva contraseña",
      label: "Confirmar contraseña",
      isRequired: true,
    },
  },

  confirmSignUp: {
    confirmation_code: {
      placeholder: "Introduce el código de verificación",
      label: "Código de verificación",
      isRequired: true,
    },
  },
  forceNewPassword: {
    password: {
      placeholder: "Nueva contraseña",
      label: "Nueva contraseña",
      isRequired: true,
    },
    confirm_password: {
      placeholder: "Confirma tu nueva contraseña",
      label: "Confirmar contraseña",
      isRequired: true,
    },
    name: {
      placeholder: "Introduce tus nombres y apellidos",
      label: "Nombre Completo",
      isRequired: true
    },
  }
};
