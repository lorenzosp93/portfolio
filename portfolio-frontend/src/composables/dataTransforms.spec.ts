import { describe, expect, it } from "vitest";
import { ref } from "vue";
import { groupBy } from "./utilities/groupBy";
import { flattenNested } from "./utilities/flattenNested";
import { useGroupedData } from "./GroupedData";
import type { Experience } from "@/models/models.interface";

describe("data transformations", () => {
  it("groups records without changing their order", () => {
    const records = [
      { id: 1, group: "a" },
      { id: 2, group: "b" },
      { id: 3, group: "a" },
    ];

    expect(groupBy(records, ({ group }) => group)).toEqual({
      a: [records[0], records[2]],
      b: [records[1]],
    });
  });

  it("flattens duplicate nested values", () => {
    const records = [
      { entity: { uuid: "one", name: "One" } },
      { entity: { uuid: "one", name: "One" } },
      { entity: { uuid: "two", name: "Two" } },
    ];

    expect(flattenNested(records, ({ entity }) => entity, 2)).toEqual([
      records[0].entity,
      records[2].entity,
    ]);
  });

  it("attaches each resume entry to its entity", () => {
    const first = {
      uuid: "first",
      entity: { uuid: "company", name: "Company", picture: "company.webp" },
    } as Experience;
    const second = {
      uuid: "second",
      entity: { uuid: "company", name: "Company", picture: "company.webp" },
    } as Experience;
    const { entities } = useGroupedData(ref([first, second]));

    expect(entities.value).toHaveLength(1);
    expect(entities.value[0].childs).toEqual([first, second]);
  });
});
