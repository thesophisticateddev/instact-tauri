import React from "react";

const FormattedNames = ({ textString, nameList }) => {
  const listOfNames = nameList
    .filter((x) => x.name === "PERSON")
    .map((x) => x.span_text);
  listOfNames.forEach((name) => {
    const indexOfName = textString.indexOf(name);
    textString =
      textString.substring(0, indexOfName) +
      `<span class=greenBadge><strong>PERSON</strong>:</span> ${name} ` +
      textString.substring(indexOfName + name.length + 1, textString.length);
  });
  return textString;
};
export default FormattedNames;
