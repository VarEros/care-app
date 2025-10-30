import { dayLabels } from "@/lib/constants";
import { BusinessHoursData, BusinessHoursForm } from "../types";

export const formToData = (form: BusinessHoursForm): BusinessHoursData => {
  return Object.entries(form).reduce<BusinessHoursData>(
    (acc, [day, { enabled, start, end }]) => {
      if (enabled) {
        acc[day] = { start, end };
      }
      return acc;
    },
    {}
  );
};

export const dataToForm = (data: BusinessHoursData): BusinessHoursForm => {
    return Object.keys(dayLabels).reduce<BusinessHoursForm>((acc, day) => {
        const entry = data[day];
        acc[day] = entry
            ? { enabled: true, start: entry.start, end: entry.end }
            : { enabled: false, start: "09:00", end: "17:00" }; // defaults
        return acc;
    }, {});
};
