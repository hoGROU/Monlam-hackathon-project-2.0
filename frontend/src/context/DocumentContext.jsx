import { createContext, useContext, useState } from "react";
import { mockDocument } from "../data/mockData";

const DocumentContext = createContext(null);

export function DocumentProvider({ children }) {
  const [file, setFile] = useState(null);
  const [document, setDocument] = useState(mockDocument);

  const uploadFile = (fileMeta) => {
    setFile(fileMeta);
    setDocument({
      ...mockDocument,
      fileName: fileMeta?.name || mockDocument.fileName,
      fileSize: fileMeta?.size || mockDocument.fileSize,
    });
  };

  const reset = () => {
    setFile(null);
    setDocument(mockDocument);
  };

  return (
    <DocumentContext.Provider value={{ file, document, uploadFile, reset }}>
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocument() {
  const ctx = useContext(DocumentContext);
  if (!ctx) throw new Error("useDocument must be used within DocumentProvider");
  return ctx;
}
