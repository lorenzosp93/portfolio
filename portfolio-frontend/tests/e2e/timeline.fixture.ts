export function timelineResponse(entries: Record<string, unknown>[]) {
  return {
    copy: {
      heading: "Experience leading products and teams.",
      intro: "From engineering foundations to leading products and people.",
      closing_heading: "Still building.",
      closing_body: "New problems, the same curiosity.",
    },
    entries: entries.map((entry) => ({
      kind: "experience",
      end_date: null,
      timeline_summary: "",
      narrative_heading: "",
      narrative_body: "",
      transition_motif: "none",
      ...entry,
    })),
  };
}
