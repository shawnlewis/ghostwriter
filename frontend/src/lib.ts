export const nextTabComplete = (text: string) => {
  const result = text.match(/([^\w]*[\w]+)/);
  if (result == null) {
    return ["", text];
  }
  const tabComplete = result[1];
  return [tabComplete, text.slice(tabComplete.length)];
};
