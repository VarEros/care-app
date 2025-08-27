import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource.js';
import { data } from './data/resource.js';
import { createDoctorDynamo } from './lambdas/resource.js'

defineBackend({
  auth,
  data,
  createDoctorDynamo
});
