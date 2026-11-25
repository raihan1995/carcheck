import type { IconName } from "@/app/components/ui/Icon";
export const guides: {
  slug: string;
  category: string;
  title: string;
  description: string;
  icon: IconName;
  sections: { title: string; body: string }[];
  source: string;
  sourceLabel: string;
}[] = [
  {
    slug: "reading-an-mot-history",
    category: "Understanding the records",
    title: "How to read an MOT history",
    description:
      "Look beyond the latest pass. Test dates, repeated advisories and retests all add context.",
    icon: "file",
    sections: [
      {
        title: "Start with the most recent test",
        body: "Read the result and test date together. An MOT pass describes a vehicle at a point in time; it does not tell you its condition today. Open the failure and advisory details rather than relying only on the headline result.",
      },
      {
        title: "Look for patterns",
        body: "The same tyre, brake or corrosion advisory appearing across several tests is a useful question to raise with the seller. A later pass does not provide an invoice or confirm exactly what work was carried out. Ask for the supporting service and repair records.",
      },
      {
        title: "Keep the limitations in mind",
        body: "An empty history does not automatically mean a problem. The vehicle may not yet have required a test, may be exempt, or the service may not have returned its history. Check the official record when the details are unclear.",
      },
    ],
    source: "https://www.gov.uk/check-mot-history",
    sourceLabel: "GOV.UK MOT history service",
  },
  {
    slug: "checking-mileage",
    category: "A closer look",
    title: "Make sense of the mileage records",
    description:
      "Use the timeline as a starting point, then compare the readings with the paperwork.",
    icon: "chart",
    sections: [
      {
        title: "Check the units first",
        body: "MOT readings can be recorded in miles or kilometres. RevVeal converts recognised kilometre readings into miles for its chart and keeps the original unit in the test history. A change of unit can otherwise look like a drop in mileage.",
      },
      {
        title: "A lower reading needs an explanation",
        body: "A lower recorded figure deserves a closer look, but is not proof of deliberate alteration. Recording mistakes, replacement instruments and changes of units can all affect the history. Ask the seller for evidence that explains the difference.",
      },
      {
        title: "Compare more than one source",
        body: "Compare test records with service invoices, inspection reports and the number displayed in the car. A smooth upward line only means there is no decrease in the available records. It cannot establish what happened between those records.",
      },
    ],
    source: "https://www.gov.uk/check-mot-history",
    sourceLabel: "GOV.UK MOT history service",
  },
  {
    slug: "before-you-buy",
    category: "Buying a used car",
    title: "A useful checklist before you buy",
    description:
      "Bring the vehicle, its documents and its recorded history together before making a decision.",
    icon: "car",
    sections: [
      {
        title: "Confirm you are looking at the right car",
        body: "Compare the registration, make, colour and vehicle details with the car in front of you. Ask to see the relevant documents. A registration search is a useful first step, rather than a substitute for checking the vehicle’s identity.",
      },
      {
        title: "Separate missing data from a clear result",
        body: "A free MOT or tax result does not include a stolen, finance or write-off check. If a section says ‘Not checked’, no conclusion has been reached. Ask which data sources any additional report uses, and when they were checked.",
      },
      {
        title: "Leave room for an independent inspection",
        body: "Service records and a physical inspection can add information that an online report cannot provide. If the history raises questions, get them answered before making a commitment. Keep copies of the advert, correspondence and documents for your records.",
      },
    ],
    source: "https://www.gov.uk/checks-when-buying-a-used-car",
    sourceLabel: "GOV.UK checks when buying a used car",
  },
];
