export interface IWatchedResource {
  group: string;
  version: string;
  plural: string;
  namespaced: boolean;
  namespace?: string;
}

export class WatchedResource implements IWatchedResource {
  group: string;
  namespace?: string;
  namespaced: boolean;
  plural: string;
  version: string;

  constructor(obj: IWatchedResource) {
    Object.keys(obj).forEach((key) => {
      if (obj != undefined) {
        this[key] = obj[key];
      }
    });
  }
}
