import { React, useState, useEffect } from "react";
import {
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Divider,
  Text,
  Container,
  Heading,
  Tooltip,
} from "@chakra-ui/react";
import moment from "moment/moment";

const ContentAccordion = ({
  id,
  text,
  source,
  process,
  dates,
  names,
  currentTheme,
}) => {
  const [finalText, setFinalText] = useState(text);

  const getTitle = (str) => {
    const limit = 40;
    if (str.length > limit) {
      return str.slice(0, limit).concat("....");
    }
    return str;
  };

  useEffect(() => {
    const formattedNames = getFormattedNamesText(text, names);
    const formattedLocations = getFormattedLocationsText(formattedNames, names);
    const formattedDates = getFormattedDatesText(formattedLocations, dates);

    setFinalText(formattedDates);
  });

  const getFormattedNamesText = (textString, nameList) => {
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

  const getFormattedLocationsText = (textString, locationList) => {
    const listOfNames = locationList
      .filter((x) => x.name === "GEO" || x.name === "LOCATION")
      .map((x) => x.value);
    const data = textString.split(" ").map((word) => {
      let string = word;
      listOfNames.map((name) => {
        if (word.includes(name)) {
          string = `<span class=purpleBadge locationToolTip><strong>LOCATION:</strong></span> ${word} `;
        }
      });

      return string;
    });

    return data.join(" ");
  };

  const getFormattedDatesText = (textString, datesList) => {
    datesList.forEach((eachItem) => {
      const indexOfDate = textString.indexOf(eachItem.span_text);
      textString =
        textString.substring(0, indexOfDate) +
        `<span class="orangeBadge">
            <span class=toolTipText>${moment(eachItem.value).format(
              "MMM DD, YYYY hh:mm A"
            )}
            </span>
          <strong> Date & Time </strong></span> ${
            eachItem.span_text
          } </Tooltip>` +
        textString.substring(
          indexOfDate + eachItem.span_text.length + 1,
          textString.length
        );
    });

    return textString;
  };

  return (
    <AccordionItem mt={8} mb={8}>
      <AccordionButton fontSize={"small"} fontWeight={"bold"}>
        <Box flex="1" textAlign="left">
          {getTitle(text)}
        </Box>
        <AccordionIcon />
      </AccordionButton>

      <AccordionPanel pb={5}>
        <Container padding={8}>
          {/* <Text fontSize={"small"}>{text}</Text> */}
          <Text fontSize={"small"}>
            <div dangerouslySetInnerHTML={{ __html: finalText }}></div>
          </Text>
          <Divider border="1px solid gray" />
          <Box borderBottom="2px" borderColor="gray.500">
            <Heading fontSize={"small"}>Capture Source & Time:</Heading>
            <Text fontSize={"small"}>{`${source},  ${new Date()}`}</Text>
            <Text fontSize={"small"} fontStyle={"italic"}>
              {process}
            </Text>
          </Box>
          <Divider border="1px solid gray" />
        </Container>
      </AccordionPanel>
    </AccordionItem>
  );
};

export default ContentAccordion;
