export const FULL_REPORT_PRICE = "£5.99 incl. VAT";

export const reportFeatures = [
  ["Vehicle details", "DVLA registration information", true],
  ["MOT history", "Test results, failures and advisories", true],
  ["Mileage records", "Recorded readings and a mileage timeline", true],
  ["Tax status", "Current status and renewal date", true],
  [
    "Stolen vehicle check",
    "A separate check against stolen vehicle records",
    false,
  ],
  ["Outstanding finance", "Recorded finance agreements", false],
  ["Insurance write-off", "Recorded write-off categories", false],
  [
    "Plate changes and valuation",
    "Registration history and an estimated value",
    false,
  ],
  ["PDF report", "A copy to keep with your purchase records", false],
] as const;

export const faqs = [
  {
    question: "What can I check for free?",
    answer:
      "Enter a UK registration to see available DVLA vehicle details, tax status, MOT test history and recorded mileage. You do not need an account to run a free check.",
  },
  {
    question: "What is included in the full report?",
    answer:
      "The full report is priced at £5.99 incl. VAT, as a one-time payment. The planned checks cover stolen records, outstanding finance, insurance write-offs, mileage analysis, plate changes and valuation, with a PDF copy. Paid checks and checkout are not available yet; the sample shows the proposed report layout.",
  },
  {
    question: "Where does the information come from?",
    answer:
      "Free vehicle information comes from the DVLA Vehicle Enquiry Service and MOT records from the DVSA MOT History API. Catalogue specifications are possible matches, rather than confirmed details of an individual vehicle. Each result identifies its sources.",
  },
  {
    question: "Does an MOT pass mean a car is safe to buy?",
    answer:
      "An MOT records the vehicle’s condition at the time of the test. It is not a warranty or a mechanical inspection. Read the advisories, check the documents and arrange an independent inspection where appropriate.",
  },
  {
    question: "Will a free check tell me about finance or a write-off?",
    answer:
      "No. Those checks use separate data sources and are not included in the free DVLA or MOT results. A section marked ‘Not checked’ must not be read as a clear result.",
  },
  {
    question: "Are you affiliated with the DVLA or DVSA?",
    answer:
      "No. RevVeal is an independent vehicle information service and is not affiliated with the DVLA or DVSA.",
  },
];
