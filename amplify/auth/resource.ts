import { defineAuth } from "@aws-amplify/backend";
import { postConfirmation } from './post-confirmation/resource';

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  //groups: ["doctors", "patients"],
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
    phoneNumber: {
      required: false,
      mutable: true,
    }
  },
  triggers: {
    postConfirmation
  }
});
