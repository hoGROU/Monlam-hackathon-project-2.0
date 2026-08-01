export const mockDocument = {
  fileName: "lam-rim-chen-mo_folio-12.pdf",
  fileSize: "3.4 MB",
  pages: 6,
  wordCount: 2148,
  ocrConfidence: 96.4,
  language: "Classical Tibetan (Bod skad)",
  processingTime: "18.2s",

  originalText: `བྱང་ཆུབ་ལམ་གྱི་རིམ་པ་ནི། སྐྱེས་བུ་གསུམ་གྱི་ལམ་དུ་བགྲངས་ཏེ། སྐྱེས་བུ་ཆུང་ངུ་དང་། སྐྱེས་བུ་འབྲིང་། སྐྱེས་བུ་ཆེན་པོའི་ལམ་གསུམ་ལ་བརྟེན་ནས་ཐར་པ་དང་ཐམས་ཅད་མཁྱེན་པའི་གོ་འཕང་ཐོབ་པར་བྱ་བའི་ཐབས་སུ་བསྟན་པ་ཡིན། དེ་ལ་དང་པོར་བླ་མ་བསྟེན་པའི་ཚུལ་ནི་ལམ་གྱི་རྩ་བ་ཡིན་པས། ཀུན་ནས་བསླང་བ་དང་བྱ་བ་གཉིས་ཀྱིས་ཡིད་ཆེས་པ་བསྐྱེད་དགོས་སོ། །

དལ་འབྱོར་རྙེད་དཀའ་བ་བསམ་པ་ནི་སྐྱེས་བུ་གསུམ་གྱི་ལམ་ཐམས་ཅད་ཀྱི་གཞི་རྩ་ཡིན་ཏེ། མི་ལུས་རིན་པོ་ཆེ་འདི་ནི་ནམ་ཞིག་ཐོབ་ཀྱང་ཡང་བསྐྱར་རྙེད་པར་དཀའ་བས། དེའི་དོན་ཡོད་པར་བྱ་བའི་ཕྱིར་ནས་ཆོས་ལ་འབད་པར་བྱའོ། །`,

  translation: `The stages of the path to enlightenment are taught as a method for attaining liberation and omniscience, organized around the paths of three types of persons: the person of small scope, the person of middling scope, and the person of great scope.

Among these, properly relying on a spiritual teacher comes first, since it is the root of the entire path; one must cultivate conviction through both the motivation and the conduct of correct reliance.

Contemplating the difficulty of obtaining the leisures and endowments is the foundation for all three scopes of the path, for this precious human existence, once attained, is exceedingly difficult to find again. One should therefore strive diligently in the Dharma in order to make it meaningful.`,

  summary: `This folio introduces the "graduated path" (lam rim) framework central to Tibetan Buddhist practice, structuring spiritual development around three progressively broader motivations: the small-scope person seeking a favorable rebirth, the middling-scope person seeking personal liberation, and the great-scope person seeking full enlightenment for the benefit of all beings.

The text opens by establishing correct reliance on a qualified spiritual teacher as the indispensable root of the entire path, arguing that without genuine conviction in the teacher, later stages cannot take hold. It then turns to the classic contemplation on the rarity and value of a human rebirth endowed with the "leisures and endowments" (dal 'byor) necessary for practice, framing this reflection as the shared foundation underlying all three scopes rather than a preliminary aside.

Overall, the passage functions as a structural preface: it names the threefold division that will organize the remainder of the treatise and sets the two opening topics — reliance on the teacher, and the preciousness of human life — that traditionally begin every lam rim exposition.`,

  keywords: [
    { term: "byang chub lam rim", translation: "stages of the path to enlightenment", type: "concept" },
    { term: "skyes bu gsum", translation: "three types of persons", type: "concept" },
    { term: "dal 'byor", translation: "leisures and endowments", type: "concept" },
    { term: "bla ma bsten pa", translation: "reliance on the teacher", type: "practice" },
    { term: "thams cad mkhyen pa", translation: "omniscience", type: "concept" },
    { term: "thar pa", translation: "liberation", type: "concept" },
    { term: "mi lus rin po che", translation: "precious human life", type: "concept" },
    { term: "Lam Rim Chen Mo", translation: "The Great Treatise", type: "text" },
  ],

  chatSuggestions: [
    "Summarize this document.",
    "Explain difficult words.",
    "What is the main topic?",
    "List important dates.",
  ],

  chatSeed: [
    {
      role: "assistant",
      text: "I've read through this folio of the Lam Rim Chen Mo. Ask me anything about the text, its terminology, or its place in the wider treatise — I can also cross-reference the OCR output against the translation if something looks off.",
    },
  ],
};

export const processingSteps = [
  { key: "upload", label: "Upload" },
  { key: "ocr", label: "OCR" },
  { key: "translation", label: "Translation" },
  { key: "summary", label: "Summary" },
  { key: "ready", label: "Ready" },
];

export const featureCards = [
  {
    key: "ocr",
    title: "Tibetan OCR",
    description:
      "Recognizes u-chen and u-med scripts from scans and photos with folio-level accuracy tracking.",
  },
  {
    key: "translate",
    title: "Tibetan → English Translation",
    description:
      "Context-aware translation that preserves technical Buddhist terminology and transliteration.",
  },
  {
    key: "summary",
    title: "AI Summary",
    description:
      "Condenses long treatises into structured summaries you can cite with confidence.",
  },
  {
    key: "ask",
    title: "Ask AI Questions",
    description:
      "Chat with your document — clarify terms, trace arguments, or list names and dates.",
  },
  {
    key: "export",
    title: "Export PDF",
    description:
      "Export a clean, formatted PDF with original text, translation, and summary side by side.",
  },
];
