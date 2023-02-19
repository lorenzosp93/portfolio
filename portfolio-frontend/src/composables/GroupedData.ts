import { Education, Entity, Experience } from "@/models/models.interface";
import { Ref, computed } from "vue";
import { groupBy } from "./utilities/groupBy";
import { flattenNested } from "./utilities/flattenNested";

interface GroupedEntity extends Entity {
  childs?: Experience[] | Education[];
}

export function useGroupedData(data: Ref<Experience[] | Education[]>) {
  const entities = computed(() => {
    const groups = groupBy([...data.value], (item) => item.entity.uuid);

    const en = flattenNested(data.value, (item) => ({ ...item.entity }), 2);

    en.forEach((entity: GroupedEntity) => {
      entity.childs = groups[entity.uuid];
    });

    return en;
  });

  return { entities };
}
