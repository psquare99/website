export type JournalTextNode = {
  type: "text";
  text: string;
};

export type JournalTextBlock = {
  type: "paragraph";
  content: JournalTextNode[];
};

export type JournalDocument = {
  type: "doc";
  content: JournalTextBlock[];
};