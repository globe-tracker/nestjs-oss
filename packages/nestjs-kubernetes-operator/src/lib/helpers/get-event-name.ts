import { RECONCILE_EVENT_TYPE } from "../enums/reconcile-event-type.enum";
import { RECONCILE_EVENT_PREFIX } from "../constants";

export const getEventName = (
  plural: string,
  type: RECONCILE_EVENT_TYPE
): string => {
  return `${RECONCILE_EVENT_PREFIX}.${plural}.${RECONCILE_EVENT_TYPE[type]}`;
};
