import type { PreSignUpTriggerHandler } from "aws-lambda"

function isOlderThan(date: Date, age: number) {
  const comparison = new Date()
  comparison.setFullYear(comparison.getFullYear() - age)
  return date.getTime() <= comparison.getTime()
}

export const handler: PreSignUpTriggerHandler = async (event) => {
  const birthdate = new Date(event.request.userAttributes["birthdate"])

  // you must be 13 years or older
  if (!isOlderThan(birthdate, 13)) {
    throw new Error("Debes ser mayor a 13 años para crear una cuenta.")
  }

  return event
}