import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'care-app-storage',
  isDefault: true,
  access: (allow) => ({
    'patients/*': [
      allow.groups(['Doctors', 'Patients']).to(['read', 'write', 'delete'])
    ]
  })
});