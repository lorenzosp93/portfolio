import { LimitOffsetResult } from "@/models/models.interface";
import { RemovableRef } from "@vueuse/shared";

function isLimitOffsetResult<T>(obj: any): obj is LimitOffsetResult<T> {
  return obj.results !== undefined;
}

export function cacheInvalidation<T>(
  data: RemovableRef<T[] | LimitOffsetResult<T>>,
  expiry: RemovableRef<number>
) {
  return () => {
    if (Date.now() > expiry.value) {
      if (isLimitOffsetResult<T>(data.value)) {
        data.value.results = [];
      } else {
        data.value = [];
      }
    }
  };
}
