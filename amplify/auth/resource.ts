import { defineAuth } from "@aws-amplify/backend";
import { postConfirmation } from './post-confirmation/resource';
import { createDoctorWithUserHandler } from '../data/resource'
import { preSignUp } from './pre-sign-up/resource';
import { customMessage } from './custom-message/resource';
/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  name: "care-app",
  loginWith: {
    email: true,
  },
  userAttributes: {
    email: {
      required: true,
      mutable: true,
    },
    fullname: {
      required: true,
      mutable: true,
    },
    birthdate: {
      required: true
    },
    "custom:cedula": {
      dataType: "String",
      mutable: false,
      maxLen: 16
    }
  },
  triggers: {
    postConfirmation,
    preSignUp,
    customMessage
  },
  accountRecovery: "EMAIL_ONLY",
  groups: [
    'Admins',
    'Doctors',
    'Patients'
  ],
  access: (allow) => [
    allow.resource(postConfirmation).to(["addUserToGroup"]),
    allow.resource(createDoctorWithUserHandler).to(["addUserToGroup", "createUser"])
  ],
});
